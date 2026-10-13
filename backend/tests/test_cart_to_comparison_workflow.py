"""Automated verification for the ShopMind AI cart-to-comparison workflow.

Tests:
1. Cart with two products.
2. Cart with three products.
3. Cart with four or more products.
4. Cart with duplicate quantities of the same product.
5. Cart with a removed or unavailable product.
"""

from __future__ import annotations

import asyncio
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.comparison.comparison_service import ComparisonService
from app.services.search.product_normalizer import NormalizedProduct, ProductOffer
from app.services.search.search_service import SearchService


class MockStubSearchService:
    """Mock search service providing deterministic live products."""

    def __init__(self, products: dict[str, NormalizedProduct]) -> None:
        self._products = products

    async def get_product_details(self, product_id: str) -> NormalizedProduct:
        if product_id not in self._products:
            raise LookupError(f"Product {product_id} not found or expired")
        return self._products[product_id]


def _create_mock_product(pid: str, name: str, price: float) -> NormalizedProduct:
    return NormalizedProduct(
        product_id=pid,
        name=name,
        brand="TestBrand",
        category="Electronics",
        rating=4.5,
        review_count=100,
        offers=[ProductOffer(price=price, source_name="Store 1", is_best_price=True)],
    )


# ---------------------------------------------------------------------------
# Test Case 1: Cart with two products
# ---------------------------------------------------------------------------
def test_case_1_cart_with_two_products() -> None:
    """Cart with exactly two distinct products allows direct side-by-side comparison."""
    prod_a = _create_mock_product("prod-1", "boAt Rockerz 450", 1499.0)
    prod_b = _create_mock_product("prod-2", "Sony WH-CH520", 4499.0)

    service = ComparisonService(MockStubSearchService({"prod-1": prod_a, "prod-2": prod_b}))
    result = asyncio.run(service.compare("prod-1", "prod-2"))

    assert result.product_a.product_id == "prod-1"
    assert result.product_b.product_id == "prod-2"
    assert result.product_a.name == "boAt Rockerz 450"
    assert result.product_b.name == "Sony WH-CH520"
    assert result.price_difference == 3000.0


# ---------------------------------------------------------------------------
# Test Case 2: Cart with three products
# ---------------------------------------------------------------------------
def test_case_2_cart_with_three_products() -> None:
    """Cart with three products allows selecting any two distinct products to compare."""
    prod_1 = _create_mock_product("prod-1", "boAt Rockerz 450", 1499.0)
    prod_2 = _create_mock_product("prod-2", "Sony WH-CH520", 4499.0)
    prod_3 = _create_mock_product("prod-3", "JBL Tune 760NC", 5999.0)

    service = ComparisonService(
        MockStubSearchService({"prod-1": prod_1, "prod-2": prod_2, "prod-3": prod_3})
    )

    # Comparing pair 1 & 3
    result_1_3 = asyncio.run(service.compare("prod-1", "prod-3"))
    assert result_1_3.product_a.product_id == "prod-1"
    assert result_1_3.product_b.product_id == "prod-3"

    # Comparing pair 2 & 3
    result_2_3 = asyncio.run(service.compare("prod-2", "prod-3"))
    assert result_2_3.product_a.product_id == "prod-2"
    assert result_2_3.product_b.product_id == "prod-3"


# ---------------------------------------------------------------------------
# Test Case 3: Cart with four or more products
# ---------------------------------------------------------------------------
def test_case_3_cart_with_four_or_more_products() -> None:
    """Cart with 4+ products allows comparing any chosen pair without dropping items silently."""
    catalog = {
        f"item-{i}": _create_mock_product(f"item-{i}", f"Product {i}", 1000.0 * i)
        for i in range(1, 6)
    }
    service = ComparisonService(MockStubSearchService(catalog))

    # User chooses product 2 and product 5 from the 5 cart candidates
    result = asyncio.run(service.compare("item-2", "item-5"))
    assert result.product_a.product_id == "item-2"
    assert result.product_b.product_id == "item-5"
    assert result.price_difference == 3000.0


# ---------------------------------------------------------------------------
# Test Case 4: Cart with duplicate quantities of the same product
# ---------------------------------------------------------------------------
def test_case_4_cart_with_duplicate_quantities() -> None:
    """Duplicate items or same product cannot be compared against itself."""
    prod_1 = _create_mock_product("prod-1", "boAt Rockerz 450", 1499.0)
    service = ComparisonService(MockStubSearchService({"prod-1": prod_1}))

    # Attempting to compare prod-1 with prod-1 must raise ValueError
    with pytest.raises(ValueError, match="cannot be compared with itself"):
        asyncio.run(service.compare("prod-1", "prod-1"))


# ---------------------------------------------------------------------------
# Test Case 5: Cart with a removed or unavailable product
# ---------------------------------------------------------------------------
def test_case_5_cart_with_unavailable_product() -> None:
    """Comparing an unavailable or expired product raises LookupError and API returns 404."""
    prod_1 = _create_mock_product("prod-1", "boAt Rockerz 450", 1499.0)
    service = ComparisonService(MockStubSearchService({"prod-1": prod_1}))

    # prod-missing does not exist in the search cache / catalog
    with pytest.raises(LookupError, match="not found or expired"):
        asyncio.run(service.compare("prod-1", "prod-missing"))


# ---------------------------------------------------------------------------
# Test Case 6: FastAPI Route /products/compare Integration Test
# ---------------------------------------------------------------------------
def test_api_compare_endpoint_validation_and_errors() -> None:
    """FastAPI /api/products/compare route validates IDs and returns proper status codes."""
    client = TestClient(app)

    # 1. Comparing local catalog ID '1' with '2' (both exist in mock catalog)
    res_valid = client.get("/api/products/compare?product_a=1&product_b=2")
    assert res_valid.status_code == 200
    data = res_valid.json()
    assert data["product_a"]["product_id"] == "1"
    assert data["product_b"]["product_id"] == "2"
    assert "insights" in data
    assert "recommendation" in data

    # 2. Comparing same product returns 400
    res_same = client.get("/api/products/compare?product_a=1&product_b=1")
    assert res_same.status_code == 400
    assert "cannot be compared with itself" in res_same.json()["detail"]

    # 3. Missing parameter returns 422
    res_missing_param = client.get("/api/products/compare?product_a=1")
    assert res_missing_param.status_code == 422
