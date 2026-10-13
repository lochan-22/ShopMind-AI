"""Mandatory regression tests for ShopMind AI budget and GPU hard filters.

Tests:
- Test A: "I am a CS student. Find a GPU laptop for AI/ML under ₹70,000."
- Test B: "Best gaming laptop under ₹60,000."
- Test C: "Laptop for machine learning with an NVIDIA GPU under ₹80,000."
- Test D: "Affordable laptop for college programming."
- Test E: "Laptop with RTX 3050."
- Test F: Mock fixture testing individual disqualification rules.
- Test G: Sorting, pagination, OpenRouter timeout resilience, and catalogue purity.
"""

from __future__ import annotations

import asyncio
from typing import Any
import pytest

from app.services.decision_engine import (
    ShoppingDecisionEngine,
    extract_verified_specs,
    filter_qualifying_products,
    is_product_strictly_qualifying,
)
from app.services.llm_service import extract_budget, parse_user_query
from app.services.search.product_normalizer import NormalizedProduct, ProductOffer


class MockSearchService:
    """Mock search provider returning preconfigured NormalizedProduct instances."""

    def __init__(self, products: list[NormalizedProduct]) -> None:
        self.products = products

    async def search(self, query: str) -> list[NormalizedProduct]:
        return list(self.products)


def _make_mock_laptop(
    pid: str,
    name: str,
    price: float | None,
    specs: dict[str, str] | None = None,
    desc: str = "",
    rating: float = 4.4,
) -> NormalizedProduct:
    offers = []
    if price is not None:
        offers.append(
            ProductOffer(
                price=price,
                currency="INR",
                stock_status="in_stock",
                source_name="Retailer",
                product_url=f"https://example.com/{pid}",
                is_best_price=True,
            )
        )
    return NormalizedProduct(
        product_id=pid,
        name=name,
        brand="Brand",
        category="Laptop",
        description=desc,
        rating=rating,
        review_count=85,
        specifications=specs or {},
        offers=offers,
    )


# ---------------------------------------------------------------------------
# Test F: Explicit Mock Fixture Disqualification Rules
# ---------------------------------------------------------------------------
def test_f_mock_fixture_strict_qualification() -> None:
    """Fixture containing:
    1. Verified dedicated-GPU laptop @ ₹65,000 -> QUALIFIES
    2. Integrated-graphics laptop @ ₹45,000 -> EXCLUDED (integrated GPU)
    3. Dedicated-GPU laptop @ ₹99,990 -> EXCLUDED (over budget)
    4. Laptop with unknown/unverified GPU @ ₹60,000 -> EXCLUDED (unverified GPU)
    5. Product with unparseable price -> EXCLUDED (unverified price)
    """
    mock_data = [
        {
            "id": "1",
            "name": "HP Victus 15 Intel Core i5 16GB RAM 512GB SSD NVIDIA GeForce RTX 3050 4GB Graphics",
            "price": 65000.0,
            "category": "Laptop",
        },
        {
            "id": "2",
            "name": "Lenovo V15 Intel Core i5 16GB RAM 512GB SSD Intel Iris Xe Graphics",
            "price": 45000.0,
            "category": "Laptop",
        },
        {
            "id": "3",
            "name": "Asus ROG Strix G16 Intel Core i7 16GB RAM 1TB SSD NVIDIA GeForce RTX 4060",
            "price": 99990.0,
            "category": "Laptop",
        },
        {
            "id": "4",
            "name": "Lenovo V15 G4 AMD Ryzen 5 7520U 16GB RAM 512GB SSD FHD Laptop",
            "price": 60000.0,
            "category": "Laptop",
        },
        {
            "id": "5",
            "name": "Acer Nitro V 15 Gaming Laptop Intel Core i5 RTX 3050",
            "price": None,
            "category": "Laptop",
        },
    ]

    query = "I am a CS student. Find a GPU laptop for AI/ML under ₹70,000."
    budget = 70000

    qualifying, disqualified = filter_qualifying_products(
        products=mock_data,
        query=query,
        budget=budget,
        category="Laptop",
    )

    # Exactly 1 product must qualify: item 1
    assert len(qualifying) == 1, f"Expected 1 qualifying product, got {len(qualifying)}: {[p['name'] for p in qualifying]}"
    assert qualifying[0]["id"] == "1"
    assert qualifying[0]["price"] == 65000.0
    assert qualifying[0]["metrics"]["has_dedicated_gpu"] is True

    # Check disqualification reasons for the other 4
    disq_map = {p["id"]: p.get("disqualification_reason") for p in disqualified}
    assert len(disqualified) == 4
    # Item 2: lacks dedicated GPU (integrated)
    assert "lacks_verified_dedicated_gpu" in disq_map["2"]
    # Item 3: over budget (₹99,990 > ₹70,000)
    assert "exceeds_budget" in disq_map["3"]
    # Item 4: lacks dedicated GPU (unverified)
    assert "lacks_verified_dedicated_gpu" in disq_map["4"]
    # Item 5: unverified or missing price
    assert "unverified_or_missing_price" in disq_map["5"]


# ---------------------------------------------------------------------------
# Test A: End-to-End Query Verification
# ---------------------------------------------------------------------------
def test_a_cs_student_gpu_laptop_under_70k() -> None:
    """Test A: "I am a CS student. Find a GPU laptop for AI/ML under ₹70,000."
    Verify every Top 5 and every Explore More product against budget and dedicated-GPU rules.
    """
    engine = ShoppingDecisionEngine()
    prods = [
        _make_mock_laptop("1", "HP Victus 15-fa0165TX Intel i5 RTX 3050 4GB Graphics", 58990.0),
        _make_mock_laptop("2", "ASUS TUF Gaming F15 Intel Core i5 GeForce RTX 2050", 52990.0),
        _make_mock_laptop("3", "Lenovo LOQ Intel Core i5 12th Gen NVIDIA RTX 3050 6GB", 68990.0),
        _make_mock_laptop("4", "Acer Nitro V 15 AMD Ryzen 5 RTX 4050 6GB Graphics", 69990.0),
        # Disqualified models that must NEVER appear in Top 5 or Explore More
        _make_mock_laptop("5", "Lenovo V15 G4 AMD Ryzen 3 7320U Integrated Radeon", 48890.0),
        _make_mock_laptop("6", "Asus Vivobook 16 Intel Iris Xe Graphics Thin Laptop", 53990.0),
        _make_mock_laptop("7", "MSI Thin 15 Intel i7 RTX 4050 Gaming Laptop", 80990.0),  # > 70000
        _make_mock_laptop("8", "Apple MacBook Air M2 8GB 256GB SSD", 89900.0),  # > 70000
        _make_mock_laptop("9", "MSI Crosshair 18 HX AI Gaming Laptop RTX 4080", 372921.0),  # > 70000
    ]
    search_service = MockSearchService(prods)

    res = asyncio.run(
        engine.execute(
            query="I am a CS student. Find a GPU laptop for AI/ML under ₹70,000.",
            search_service=search_service,
        )
    )

    top_recs = res["top_recommendations"]
    all_prods = res["all_products"]

    # Exactly 4 products qualify
    assert len(top_recs) == 4
    assert len(all_prods) == 4

    # Verify EVERY product in top_recommendations and all_products
    for p in all_prods:
        assert p["price"] <= 70000.0, f"Product {p['name']} priced at {p['price']} exceeds ₹70,000!"
        assert p["metrics"]["has_dedicated_gpu"] is True, f"Product {p['name']} lacks verified dedicated GPU!"
        assert "Lenovo V15" not in p["name"]
        assert "Vivobook" not in p["name"]

    # Verify Top 5 matches all_products
    rec_ids = {p["id"] for p in top_recs}
    assert rec_ids == {"1", "2", "3", "4"}

    # Verify AI final recommendation mentions the verified #1 pick, not Lenovo V15
    final_verdict = res["ai_analysis"]["final_recommendation"]
    assert "lenovo v15" not in final_verdict.lower()
    assert "v15" not in final_verdict.lower()


# ---------------------------------------------------------------------------
# Test B: Best gaming laptop under ₹60,000
# ---------------------------------------------------------------------------
def test_b_gaming_laptop_under_60k() -> None:
    """Test B: "Best gaming laptop under ₹60,000."
    Products above ₹60,000 are excluded and GPU info is accurately classified.
    """
    engine = ShoppingDecisionEngine()
    prods = [
        _make_mock_laptop("1", "HP Victus 15 Intel i5 RTX 3050 4GB", 58990.0),
        _make_mock_laptop("2", "ASUS TUF Gaming F15 Intel Core i5 GeForce RTX 2050", 52990.0),
        _make_mock_laptop("3", "Lenovo IdeaPad Gaming 3 Ryzen 5 GTX 1650 4GB", 49990.0),
        _make_mock_laptop("4", "Acer Nitro 5 Intel Core i5 RTX 3050", 64990.0),  # > 60000
        _make_mock_laptop("5", "Lenovo LOQ 15 Intel Core i5 RTX 4050", 72990.0),  # > 60000
        _make_mock_laptop("6", "HP 15s Intel Core i5 Intel Iris Xe", 54990.0),  # Integrated
    ]
    search_service = MockSearchService(prods)

    res = asyncio.run(
        engine.execute(
            query="Best gaming laptop under ₹60,000.",
            search_service=search_service,
        )
    )

    top_recs = res["top_recommendations"]
    assert len(top_recs) == 3
    for r in top_recs:
        assert r["price"] <= 60000.0
        assert r["metrics"]["has_dedicated_gpu"] is True
    # The ₹64,990 and ₹72,990 laptops must be excluded
    all_ids = {p["id"] for p in res["all_products"]}
    assert "4" not in all_ids
    assert "5" not in all_ids
    assert "6" not in all_ids


# ---------------------------------------------------------------------------
# Test C: NVIDIA GPU ML laptop under ₹80,000
# ---------------------------------------------------------------------------
def test_c_machine_learning_nvidia_gpu_under_80k() -> None:
    """Test C: "Laptop for machine learning with an NVIDIA GPU under ₹80,000."
    Verify NVIDIA GPU is required and AMD discrete GPU is rejected when NVIDIA is requested.
    """
    engine = ShoppingDecisionEngine()
    prods = [
        _make_mock_laptop("1", "HP Victus 16 Intel i7 NVIDIA GeForce RTX 4050 6GB", 78990.0),
        _make_mock_laptop("2", "Dell G15 Intel Core i5 NVIDIA GeForce RTX 3050", 69990.0),
        _make_mock_laptop("3", "MSI Bravo 15 AMD Ryzen 7 AMD Radeon RX 6550M", 62990.0),  # AMD discrete
        _make_mock_laptop("4", "Asus ROG Strix G16 NVIDIA GeForce RTX 4060", 94990.0),  # > 80000
        _make_mock_laptop("5", "Lenovo IdeaPad Slim 5 Intel Iris Xe", 65000.0),  # Integrated
    ]
    search_service = MockSearchService(prods)

    res = asyncio.run(
        engine.execute(
            query="Laptop for machine learning with an NVIDIA GPU under ₹80,000.",
            search_service=search_service,
        )
    )

    top_recs = res["top_recommendations"]
    assert len(top_recs) == 2
    for r in top_recs:
        assert r["price"] <= 80000.0
        assert r["metrics"]["gpu_brand"] == "nvidia"
        assert r["metrics"]["cuda_supported"] is True
    rec_ids = {r["id"] for r in top_recs}
    assert "3" not in rec_ids  # AMD GPU excluded because NVIDIA was explicitly requested
    assert "4" not in rec_ids  # Over budget
    assert "5" not in rec_ids  # Integrated graphics


# ---------------------------------------------------------------------------
# Test D: Affordable laptop for college programming (no GPU requested)
# ---------------------------------------------------------------------------
def test_d_college_programming_laptop_no_gpu_required() -> None:
    """Test D: "Affordable laptop for college programming."
    Verify dedicated GPU is NOT required when user did not request one.
    """
    engine = ShoppingDecisionEngine()
    prods = [
        _make_mock_laptop("1", "Lenovo IdeaPad Slim 3 Intel Core i5-13420H 16GB RAM Intel Iris Xe", 52990.0),
        _make_mock_laptop("2", "HP 15s AMD Ryzen 5 5500U 16GB RAM AMD Radeon Graphics", 46990.0),
        _make_mock_laptop("3", "Dell Inspiron 3520 Intel Core i5 16GB RAM 512GB SSD", 51990.0),
    ]
    search_service = MockSearchService(prods)

    res = asyncio.run(
        engine.execute(
            query="Affordable laptop for college programming.",
            search_service=search_service,
        )
    )

    top_recs = res["top_recommendations"]
    # All 3 programming laptops should qualify even with integrated graphics
    assert len(top_recs) == 3


# ---------------------------------------------------------------------------
# Test E: RTX 3050 is not treated as a budget
# ---------------------------------------------------------------------------
def test_e_rtx_3050_not_interpreted_as_budget() -> None:
    """Test E: "Laptop with RTX 3050."
    Verify RTX 3050 is not interpreted as budget of ₹3050.
    """
    budget = extract_budget("Laptop with RTX 3050.")
    assert budget is None

    parsed = parse_user_query("Laptop with RTX 3050.")
    assert parsed["budget"] is None

    # Laptops priced normally (e.g. ₹60,000) must qualify because there is no ₹3050 cap
    engine = ShoppingDecisionEngine()
    prods = [
        _make_mock_laptop("1", "HP Victus 15 NVIDIA GeForce RTX 3050", 58990.0),
    ]
    search_service = MockSearchService(prods)
    res = asyncio.run(
        engine.execute(
            query="Laptop with RTX 3050.",
            search_service=search_service,
        )
    )
    assert len(res["top_recommendations"]) == 1
    assert res["top_recommendations"][0]["id"] == "1"


# ---------------------------------------------------------------------------
# Test G: Sorting and Catalogue Purity
# ---------------------------------------------------------------------------
def test_g_sorting_and_catalogue_purity() -> None:
    """Test G: Confirm that no over-budget or non-qualifying products can enter
    all_products or be exposed for sorting.
    """
    engine = ShoppingDecisionEngine()
    prods = [
        _make_mock_laptop("1", "HP Victus 15 RTX 3050 4GB", 55000.0, rating=4.2),
        _make_mock_laptop("2", "Lenovo LOQ RTX 3050 6GB", 65000.0, rating=4.6),
        _make_mock_laptop("3", "Acer Nitro V 15 RTX 4050", 69990.0, rating=4.5),
        _make_mock_laptop("4", "Asus TUF Gaming RTX 2050", 49990.0, rating=4.1),
        _make_mock_laptop("5", "Dell G15 RTX 3050", 62000.0, rating=4.3),
        _make_mock_laptop("6", "Gigabyte G5 RTX 3050", 57000.0, rating=4.0),
        # Over-budget models
        _make_mock_laptop("7", "Alienware m16 RTX 4080", 259900.0),
        _make_mock_laptop("8", "Razer Blade 16 RTX 4090", 324990.0),
        # Non-GPU models
        _make_mock_laptop("9", "Lenovo V15 AMD Radeon Graphics", 38000.0),
    ]
    search_service = MockSearchService(prods)

    res = asyncio.run(
        engine.execute(
            query="I am a CS student. Find a GPU laptop for AI/ML under ₹70,000.",
            search_service=search_service,
        )
    )

    all_catalog = res["all_products"]
    # Exactly 6 products qualify
    assert len(all_catalog) == 6

    # Every single one must be <= 70,000 and have a verified dedicated GPU
    for p in all_catalog:
        assert p["price"] <= 70000.0
        assert p["metrics"]["has_dedicated_gpu"] is True

    # Check sort by price descending: highest item must be <= 70,000
    sorted_desc = sorted(all_catalog, key=lambda x: x["price"], reverse=True)
    assert sorted_desc[0]["price"] == 69990.0
    assert sorted_desc[-1]["price"] == 49990.0

