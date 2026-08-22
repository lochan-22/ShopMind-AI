"""Abstract contract for product-search providers."""

from abc import ABC, abstractmethod
from typing import Any, Protocol, runtime_checkable


class BaseProductProvider(ABC):
    """Interface implemented by a source of product search results.

    Providers are responsible only for obtaining source-specific result data.
    ``SearchService`` normalizes that data, which keeps provider details out of
    the rest of the application.
    """

    @abstractmethod
    async def search(self, query: str) -> list[dict[str, Any]]:
        """Return source-specific product records for *query*.

        Each returned dictionary is normalized by ``ProductNormalizer`` before
        it is returned to callers of the search service.
        """

        raise NotImplementedError


class ProductProviderError(Exception):
    """A safe, provider-neutral error raised when a search provider fails."""

    def __init__(self, provider_name: str) -> None:
        """Create an error without retaining provider response details."""
        self.provider_name = provider_name
        super().__init__(f"{provider_name} is temporarily unavailable.")


@runtime_checkable
class ProductDetailsProvider(Protocol):
    """Optional capability for providers that can retrieve product details."""

    async def get_product_details(
        self, product_id: str, details_token: str
    ) -> dict[str, Any]:
        """Return a provider-neutral detail record for an external product."""
