"""Tests for preserving external search metadata needed by comparison."""

from __future__ import annotations

import asyncio
from typing import Any

from app.services.search.search_service import SearchService
from app.services.search.providers.base_provider import ProductProviderError


class TokenlessExternalProvider:
    """Provider fixture representing a valid result without detail metadata."""

    async def search(self, query: str) -> list[dict[str, Any]]:
        return [
            {
                "product_id": "live-product",
                "name": "Live Product",
                "offers": [{"price": 1_999, "source_name": "Live retailer"}],
            }
        ]


def test_external_search_result_remains_resolvable_without_a_details_token() -> None:
    """Comparison can use real search data when immersive metadata is absent."""
    service = SearchService([TokenlessExternalProvider()])  # type: ignore[list-item]

    asyncio.run(service.search("live product"))
    product = asyncio.run(service.get_product_details("live-product"))

    assert product.name == "Live Product"
    assert product.offers[0].price == 1_999


class DetailsFailureProvider(TokenlessExternalProvider):
    """Provider fixture whose optional immersive lookup is unavailable."""

    provider_name = "Test provider"

    async def search(self, query: str) -> list[dict[str, Any]]:
        products = await super().search(query)
        products[0]["external_details_token"] = "opaque-token"
        return products

    async def get_product_details(
        self, product_id: str, details_token: str
    ) -> dict[str, Any]:
        raise ProductProviderError(self.provider_name)


def test_immersive_details_failure_preserves_cached_shopping_result() -> None:
    """Optional detail failures must not discard a valid Shopping search hit."""
    service = SearchService([DetailsFailureProvider()])  # type: ignore[list-item]

    asyncio.run(service.search("live product"))
    product = asyncio.run(service.get_product_details("live-product"))

    assert product.name == "Live Product"
    assert product.offers[0].price == 1_999
