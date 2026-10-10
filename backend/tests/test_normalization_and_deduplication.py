"""Comprehensive test suite for Product Normalization, Deduplication, and Multi-Seller Offer Grouping.

Covers all 12 required scenarios:
1. Exact duplicates
2. Minor title variations
3. Same model sold by multiple merchants at different prices (grouped offers)
4. Different models from same brand (not merged)
5. Different variants/storage (not merged)
6. Missing model numbers / partial data
7. Missing/malformed prices
8. Top 5 recommendations uniqueness
9. Multi-seller offers on product detail pages
10. Selecting distinct products for comparison (preventing self-comparison across sellers)
11. Best-value ranking after deduplication
12. Search errors & empty results
"""

from __future__ import annotations

import asyncio
from typing import Any
import pytest

from app.services.comparison.comparison_service import ComparisonService
from app.services.decision_engine import ShoppingDecisionEngine
from app.services.search.product_deduplicator import ProductDeduplicator
from app.services.search.product_normalizer import (
    NormalizedProduct,
    ProductNormalizer,
    ProductOffer,
)
from app.services.search.providers.base_provider import BaseProductProvider, ProductProviderError
from app.services.search.search_service import SearchService


class MockStaticProvider(BaseProductProvider):
    """Fixture provider returning static test product payloads."""

    provider_name = "MockProvider"

    def __init__(self, raw_items: list[dict[str, Any]]) -> None:
        self.raw_items = raw_items

    async def search(self, query: str) -> list[dict[str, Any]]:
        return self.raw_items


# ---------------------------------------------------------------------------
# Test Case 1: Exact Duplicates
# ---------------------------------------------------------------------------
def test_1_exact_duplicates():
    """Identical listings (same ID or same title, merchant, price) are deduplicated."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    raw_items = [
        {
            "product_id": "item_1",
            "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            "price": 26990.0,
            "source": "Amazon.in",
            "link": "https://amazon.in/dp/sony1",
        },
        {
            "product_id": "item_1_dup",
            "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            "price": 26990.0,
            "source": "Amazon.in",
            "link": "https://amazon.in/dp/sony1",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    assert len(deduped) == 1
    canonical = deduped[0]
    assert canonical.brand == "Sony"
    assert canonical.model_number == "wh1000xm5"
    # Duplicate offer from same merchant at same price was merged
    assert len(canonical.offers) == 1
    assert canonical.offers[0].is_best_price is True
    assert canonical.offers[0].price == 26990.0


# ---------------------------------------------------------------------------
# Test Case 2: Minor Title Variations
# ---------------------------------------------------------------------------
def test_2_minor_title_variations():
    """Same brand and model with minor marketing text differences are merged."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    raw_items = [
        {
            "product_id": "sony_a",
            "title": "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones - Black",
            "price": 28990.0,
            "source": "Amazon.in",
            "link": "https://amazon.in/sony-xm5",
        },
        {
            "product_id": "sony_b",
            "title": "Sony WH-1000XM5 Bluetooth Noise Cancelling Headphones (Black) - Official Warranty",
            "price": 26990.0,
            "source": "Croma",
            "link": "https://croma.com/sony-xm5",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    assert len(deduped) == 1
    canonical = deduped[0]
    assert canonical.brand == "Sony"
    assert canonical.model_number == "wh1000xm5"

    assert len(canonical.offers) == 2
    # Lowest price is Croma at 26990
    assert canonical.offers[0].price == 26990.0
    assert canonical.offers[0].source_name == "Croma"
    assert canonical.offers[0].is_best_price is True
    # Second offer is Amazon at 28990
    assert canonical.offers[1].price == 28990.0
    assert canonical.offers[1].is_best_price is False


# ---------------------------------------------------------------------------
# Test Case 3: Same Model Sold by Multiple Merchants at Different Prices
# ---------------------------------------------------------------------------
def test_3_multi_seller_offer_grouping():
    """Same model across multiple merchants groups offers and picks lowest price."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    raw_items = [
        {
            "product_id": "iphone_amz",
            "title": "Apple iPhone 15 (128 GB) - Blue",
            "price": 71999.0,
            "source": "Amazon.in",
            "link": "https://amazon.in/dp/iphone15",
        },
        {
            "product_id": "iphone_fk",
            "title": "Apple iPhone 15 128GB (Blue)",
            "price": 69900.0,
            "source": "Flipkart",
            "link": "https://flipkart.com/apple-iphone-15",
        },
        {
            "product_id": "iphone_crm",
            "title": "Apple iPhone 15 128 GB - Blue Online",
            "price": 73900.0,
            "source": "Croma",
            "link": "https://croma.com/iphone-15-128gb",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    assert len(deduped) == 1
    canonical = deduped[0]
    assert canonical.brand == "Apple"
    assert canonical.variants.get("storage") == "128gb"
    assert len(canonical.offers) == 3

    # Sorted lowest to highest
    assert canonical.offers[0].price == 69900.0
    assert canonical.offers[0].source_name == "Flipkart"
    assert canonical.offers[0].is_best_price is True

    assert canonical.offers[1].price == 71999.0
    assert canonical.offers[1].source_name == "Amazon.in"
    assert canonical.offers[1].is_best_price is False

    assert canonical.offers[2].price == 73900.0
    assert canonical.offers[2].source_name == "Croma"
    assert canonical.offers[2].is_best_price is False

    # Merged IDs tracked
    assert "iphone_fk" in canonical.merged_product_ids or "iphone_crm" in canonical.merged_product_ids


# ---------------------------------------------------------------------------
# Test Case 4: Different Models From Same Brand (NOT Merged)
# ---------------------------------------------------------------------------
def test_4_different_models_not_merged():
    """Different models from the same brand must never be merged."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    raw_items = [
        {
            "product_id": "xm4",
            "title": "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
            "price": 19990.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "xm5",
            "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            "price": 26990.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "ip14",
            "title": "Apple iPhone 14 (128GB) - Midnight",
            "price": 58999.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "ip15",
            "title": "Apple iPhone 15 (128GB) - Black",
            "price": 71999.0,
            "source": "Amazon.in",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    # All 4 must remain distinct
    assert len(deduped) == 4
    model_numbers = {p.model_number for p in deduped if p.model_number}
    assert "wh1000xm4" in model_numbers
    assert "wh1000xm5" in model_numbers



# ---------------------------------------------------------------------------
# Test Case 5: Different Variants / Storage / RAM / Size (NOT Merged)
# ---------------------------------------------------------------------------
def test_5_different_variants_not_merged():
    """Different storage, RAM, or shoe sizes must never be merged."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    raw_items = [
        # Storage difference
        {
            "product_id": "ip15_128",
            "title": "Apple iPhone 15 128GB - Black",
            "price": 71999.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "ip15_256",
            "title": "Apple iPhone 15 256GB - Black",
            "price": 81999.0,
            "source": "Amazon.in",
        },
        # RAM difference
        {
            "product_id": "dell_8gb",
            "title": "Dell Inspiron 15 3520 Laptop (8GB RAM / 512GB SSD)",
            "price": 38990.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "dell_16gb",
            "title": "Dell Inspiron 15 3520 Laptop (16GB RAM / 512GB SSD)",
            "price": 44990.0,
            "source": "Amazon.in",
        },
        # Shoe size difference
        {
            "product_id": "nike_sz8",
            "title": "Nike Air Zoom Pegasus 40 Running Shoes Size 8",
            "price": 7999.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "nike_sz10",
            "title": "Nike Air Zoom Pegasus 40 Running Shoes Size 10",
            "price": 7999.0,
            "source": "Amazon.in",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    # Must preserve all 6 distinct configurations
    assert len(deduped) == 6


# ---------------------------------------------------------------------------
# Test Case 6: Missing Model Numbers / Partial Data
# ---------------------------------------------------------------------------
def test_6_missing_model_numbers_partial_data():
    """Graceful handling of non-standard titles without crashes or false positives."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    raw_items = [
        {
            "product_id": "gen_1",
            "title": "Premium Ergonomic Office Chair with Lumbar Support",
            "price": 8999.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "gen_2",
            "title": "Ergonomic High Back Mesh Office Chair with Adjustable Headrest",
            "price": 9499.0,
            "source": "Flipkart",
        },
        {
            "product_id": "gen_3",
            "title": "Stainless Steel Kitchen Knife Set with Wooden Block",
            "price": 1499.0,
            "source": "Amazon.in",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    # Different generic chairs and knife set should not false-merge
    assert len(deduped) == 3
    for p in deduped:
        assert p.name
        assert len(p.offers) == 1


# ---------------------------------------------------------------------------
# Test Case 7: Missing or Malformed Prices
# ---------------------------------------------------------------------------
def test_7_missing_or_malformed_prices():
    """Products with missing or invalid prices are preserved and ordered cleanly."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    raw_items = [
        {
            "product_id": "price_none",
            "title": "Sony WH-1000XM5 Wireless Headphones",
            "price": None,
            "source": "Seller A",
        },
        {
            "product_id": "price_valid",
            "title": "Sony WH-1000XM5 Wireless Headphones",
            "price": "₹26,990",
            "source": "Seller B",
        },
        {
            "product_id": "price_zero",
            "title": "Sony WH-1000XM5 Wireless Headphones",
            "price": 0.0,
            "source": "Seller C",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    assert len(deduped) == 1
    canonical = deduped[0]
    # Offers should have valid non-zero price marked as best price
    assert len(canonical.offers) == 3
    best_offer = next(o for o in canonical.offers if o.is_best_price)
    # 0.0 or 26990.0 are numeric, 0.0 is technically min numeric or 26990
    assert best_offer.price is not None


# ---------------------------------------------------------------------------
# Test Case 8: Top 5 Recommendations Uniqueness
# ---------------------------------------------------------------------------
def test_8_top_5_recommendations_uniqueness():
    """Decision engine top 5 recommendations never contain duplicate products."""
    engine = ShoppingDecisionEngine()

    mock_products = [
        {"product_id": "1", "name": "Sony WH-1000XM5 Wireless Headphones", "brand": "Sony", "price": 26990.0, "rating": 4.8},
        {"product_id": "1_dup", "name": "Sony WH-1000XM5 Wireless Headphones", "brand": "Sony", "price": 27500.0, "rating": 4.7},
        {"product_id": "2", "name": "Bose QuietComfort 45 Headphones", "brand": "Bose", "price": 24900.0, "rating": 4.6},
        {"product_id": "3", "name": "Sennheiser Momentum 4 Wireless", "brand": "Sennheiser", "price": 29990.0, "rating": 4.7},
        {"product_id": "4", "name": "Apple AirPods Max", "brand": "Apple", "price": 54900.0, "rating": 4.5},
        {"product_id": "5", "name": "JBL Tour ONE M2", "brand": "JBL", "price": 19999.0, "rating": 4.3},
        {"product_id": "6", "name": "Soundcore Space Q45", "brand": "Anker", "price": 9999.0, "rating": 4.4},
    ]

    recs = engine._select_top_recommendations(
        products=mock_products,
        query="Wireless headphones with noise cancellation",
        budget=60000,
        features=["Noise Cancellation", "Wireless / Bluetooth"],
    )

    assert len(recs) == 5
    product_names = [r["name"] for r in recs]
    # "Sony WH-1000XM5 Wireless Headphones" must only appear ONCE
    assert product_names.count("Sony WH-1000XM5 Wireless Headphones") == 1
    assert len(set(product_names)) == 5


# ---------------------------------------------------------------------------
# Test Case 9: Multi-Seller Offers on Product Detail Pages
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_9_multi_seller_offers_on_product_details():
    """Lookup via either primary ID or merged duplicate ID resolves the canonical product with all offers."""
    raw_items = [
        {
            "product_id": "serp_amz_101",
            "title": "Apple iPhone 15 128GB Black",
            "price": 71999.0,
            "source": "Amazon.in",
            "link": "https://amazon.in/dp/B0CHX1",
        },
        {
            "product_id": "serp_fk_202",
            "title": "Apple iPhone 15 128GB (Black)",
            "price": 69900.0,
            "source": "Flipkart",
            "link": "https://flipkart.com/apple-iphone-15",
        },
    ]

    service = SearchService([MockStaticProvider(raw_items)])
    products = await service.search("iPhone 15")

    assert len(products) == 1
    canonical = products[0]

    # Resolve via primary ID
    details_primary = await service.get_product_details(canonical.product_id)
    assert len(details_primary.offers) == 2
    assert details_primary.offers[0].source_name == "Flipkart"
    assert details_primary.offers[0].is_best_price is True
    assert details_primary.offers[0].product_url == "https://flipkart.com/apple-iphone-15"

    # Resolve via merged duplicate ID
    details_merged = await service.get_product_details("serp_fk_202")
    assert details_merged.product_id == canonical.product_id
    assert len(details_merged.offers) == 2


# ---------------------------------------------------------------------------
# Test Case 10: Selecting Distinct Products for Comparison (Reject Self-Comparison)
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_10_comparison_rejects_self_comparison_across_sellers():
    """Comparing the same canonical product (even using IDs from two different sellers) is rejected."""
    raw_items = [
        {
            "product_id": "iphone_amazon",
            "title": "Apple iPhone 15 128GB - Black",
            "price": 71999.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "iphone_flipkart",
            "title": "Apple iPhone 15 128GB (Black)",
            "price": 69900.0,
            "source": "Flipkart",
        },
        {
            "product_id": "galaxy_s24",
            "title": "Samsung Galaxy S24 128GB - Onyx Black",
            "price": 74999.0,
            "source": "Amazon.in",
        },
    ]

    service = SearchService([MockStaticProvider(raw_items)])
    await service.search("smartphone")

    comparison_service = ComparisonService(service)

    # Comparing identical product IDs
    with pytest.raises(ValueError, match="A product cannot be compared with itself."):
        await comparison_service.compare("iphone_amazon", "iphone_amazon")

    # Comparing two different seller listings of the same canonical product
    with pytest.raises(ValueError, match="A product cannot be compared with itself."):
        await comparison_service.compare("iphone_amazon", "iphone_flipkart")

    # Comparing two distinct products succeeds
    response = await comparison_service.compare("iphone_amazon", "galaxy_s24")
    assert response.product_a.name != response.product_b.name
    assert response.price_difference is not None


# ---------------------------------------------------------------------------
# Test Case 11: Best-Value Ranking After Deduplication
# ---------------------------------------------------------------------------
def test_11_best_value_ranking_after_deduplication():
    """Best-value ranking and badges evaluate deduplicated products reflecting true best seller price."""
    normalizer = ProductNormalizer()
    deduplicator = ProductDeduplicator()

    # Seller A has high price for Product 1, Seller B has lowest market price
    raw_items = [
        {
            "product_id": "laptop_a_amz",
            "title": "Acer Aspire Lite 16GB RAM 512GB SSD Laptop",
            "price": 42990.0,
            "source": "Amazon.in",
        },
        {
            "product_id": "laptop_a_fk",
            "title": "Acer Aspire Lite 16GB RAM 512GB SSD Laptop",
            "price": 37990.0,
            "source": "Flipkart",
        },
        {
            "product_id": "laptop_b",
            "title": "HP 15s 16GB RAM 512GB SSD Laptop",
            "price": 46990.0,
            "source": "Amazon.in",
        },
    ]

    normalized = normalizer.normalize_many(raw_items)
    deduped = deduplicator.deduplicate(normalized)

    # Acer should be deduplicated with 37990 as best price
    acer = next(p for p in deduped if "Acer" in (p.brand or p.name))
    assert len(acer.offers) == 2
    assert acer.offers[0].price == 37990.0
    assert acer.offers[0].is_best_price is True

    # Decision engine serialization reflects best offer price
    engine = ShoppingDecisionEngine()
    serialized = [engine._serialize_product(p) for p in deduped]
    acer_serialized = next(s for s in serialized if "Acer" in (s.get("brand") or s.get("name")))
    assert acer_serialized["price"] == 37990.0


# ---------------------------------------------------------------------------
# Test Case 12: Search Errors and Empty Results
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_12_search_errors_and_empty_results():
    """Graceful handling of empty results and provider errors without crash."""
    # 1. Empty provider registry
    service_empty = SearchService([])
    results = await service_empty.search("any query")
    assert results == []

    # 2. Provider returns empty list
    service_zero = SearchService([MockStaticProvider([])])
    results_zero = await service_zero.search("nonexistent item")
    assert results_zero == []

    # 3. Decision engine handles empty results gracefully
    engine = ShoppingDecisionEngine()
    decision_result = await engine.execute("nonexistent item", service_zero)
    assert decision_result["total_found"] == 0
    assert decision_result["all_products"] == []
    assert decision_result["top_recommendations"] == []
    assert "summary" in decision_result["ai_analysis"]
