"""Focused tests for live product comparison normalization and decisions."""

from __future__ import annotations

import asyncio

import pytest

from app.services.comparison import ComparisonService
from app.services.search.product_normalizer import NormalizedProduct, ProductOffer


class StubSearchService:
    """Minimal external-details source used to test comparison behavior."""

    def __init__(self, products: dict[str, NormalizedProduct]) -> None:
        self._products = products

    async def get_product_details(self, product_id: str) -> NormalizedProduct:
        return self._products[product_id]


def test_comparison_uses_numeric_offers_and_multiple_wins_for_pick() -> None:
    """The cheapest valid offer and deterministic category winners are retained."""
    product_a = NormalizedProduct(
        product_id="a",
        name="Product A",
        rating=4.1,
        offers=[ProductOffer(price=1_999, source_name="Store A")],
    )
    product_b = NormalizedProduct(
        product_id="b",
        name="Product B",
        rating=4.5,
        specifications={"Brand": "Example"},
        offers=[
            ProductOffer(price=1_899, source_name="Store B", is_best_price=True),
            ProductOffer(price=2_199, source_name="Store C"),
            ProductOffer(price=None, source_name="Store D"),
        ],
    )
    service = ComparisonService(StubSearchService({"a": product_a, "b": product_b}))  # type: ignore[arg-type]

    comparison = asyncio.run(service.compare("a", "b"))

    assert comparison.price_difference == 100
    assert comparison.product_b.best_price == 1_899
    assert comparison.product_b.offer_count == 2
    assert comparison.product_b.specifications == {"Brand": "Example"}
    assert comparison.shopmind_pick_product_id == "b"


def test_comparison_rejects_the_same_product() -> None:
    """A product cannot be selected in both comparison positions."""
    service = ComparisonService(StubSearchService({}))  # type: ignore[arg-type]

    with pytest.raises(ValueError, match="cannot be compared with itself"):
        asyncio.run(service.compare("same", "same"))


def test_comparison_resolves_a_local_catalog_product() -> None:
    """Local catalog IDs remain valid comparison inputs alongside live IDs."""
    external_product = NormalizedProduct(
        product_id="external-id",
        name="Live Product",
        offers=[ProductOffer(price=2_000)],
    )
    service = ComparisonService(StubSearchService({"external-id": external_product}))  # type: ignore[arg-type]

    comparison = asyncio.run(service.compare("1", "external-id"))

    assert comparison.product_a.product_id == "1"
    assert comparison.product_a.name == "Sony WH-CH520 Wireless Headphones"
    assert comparison.product_b.product_id == "external-id"
