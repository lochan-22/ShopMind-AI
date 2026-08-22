"""Retry behavior for transient SerpApi Google Shopping failures."""

from __future__ import annotations

import asyncio
from typing import Any

import pytest

from app.services.search.providers.base_provider import ProductProviderError
from app.services.search.providers.serpapi_provider import SerpApiProvider


class TimeoutThenSuccessProvider(SerpApiProvider):
    """Test provider that succeeds after two transient transport failures."""

    def __init__(self) -> None:
        super().__init__(api_key="test-key", retry_base_delay_seconds=0)
        self.calls = 0

    def _request_shopping_results(self, query: str) -> dict[str, Any]:
        self.calls += 1
        if self.calls < 3:
            raise TimeoutError
        return {"shopping_results": [{"title": "Recovered product", "product_id": "1"}]}


class InvalidRequestProvider(SerpApiProvider):
    """Test provider that raises a non-transient failure."""

    def __init__(self) -> None:
        super().__init__(api_key="test-key", retry_base_delay_seconds=0)
        self.calls = 0

    def _request_shopping_results(self, query: str) -> dict[str, Any]:
        self.calls += 1
        raise ValueError


def test_transient_search_timeouts_are_retried_before_success() -> None:
    """A transient timeout retries without changing the normalized response."""
    provider = TimeoutThenSuccessProvider()

    products = asyncio.run(provider.search("sony headphones"))

    assert provider.calls == 3
    assert products[0]["name"] == "Recovered product"


def test_non_transient_search_failure_is_not_retried() -> None:
    """Invalid/permanent failures fail immediately instead of wasting API calls."""
    provider = InvalidRequestProvider()

    with pytest.raises(ProductProviderError):
        asyncio.run(provider.search("sony headphones"))

    assert provider.calls == 1
