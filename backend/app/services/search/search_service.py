"""Provider-independent orchestration for product searches."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from time import monotonic

from app.services.search.product_deduplicator import ProductDeduplicator
from app.services.search.product_normalizer import (
    NormalizedProduct,
    ProductNormalizer,
)
from app.services.search.providers.base_provider import (
    BaseProductProvider,
    ProductDetailsProvider,
    ProductProviderError,
)

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class _ExternalProductCacheEntry:
    """Server-only metadata needed to resolve one external search result."""

    product: NormalizedProduct
    details_token: str | None
    expires_at: float


class SearchService:
    """Run registered product providers and return unified product results."""

    # Google Shopping result IDs alone cannot retrieve immersive details. Keep
    # the matching server-only token and source result together long enough for
    # a user to select two products and open their comparison.
    _EXTERNAL_PRODUCT_CACHE_TTL_SECONDS = 24 * 60 * 60

    def __init__(
        self,
        providers: list[BaseProductProvider] | None = None,
        normalizer: ProductNormalizer | None = None,
        deduplicator: ProductDeduplicator | None = None,
    ) -> None:
        """Create a service with optional provider implementations.

        No providers are registered by default. This allows the service to be
        introduced safely before any external source is connected.
        """
        self._providers = list(providers or [])
        self._normalizer = normalizer or ProductNormalizer()
        self._deduplicator = deduplicator or ProductDeduplicator()
        self._external_products: dict[str, _ExternalProductCacheEntry] = {}


    @property
    def providers(self) -> tuple[BaseProductProvider, ...]:
        """Return the currently registered providers in registration order."""
        return tuple(self._providers)

    def register_provider(self, provider: BaseProductProvider) -> None:
        """Register a provider unless that instance is already registered."""
        if provider not in self._providers:
            self._providers.append(provider)

    def unregister_provider(self, provider: BaseProductProvider) -> None:
        """Remove a previously registered provider, if present."""
        if provider in self._providers:
            self._providers.remove(provider)

    async def search(self, query: str) -> list[NormalizedProduct]:
        """Search every registered provider and return normalized products.

        Providers run concurrently. Products with the same ``product_id`` are
        combined, preserving their distinct offers for later multi-source use.
        An empty provider registry returns an empty list.

        Raises:
            ValueError: If *query* is empty or whitespace-only.
            TypeError: If *query* is not a string.
        """
        if not isinstance(query, str):
            raise TypeError("Search query must be a string.")
        if not query.strip():
            raise ValueError("Search query cannot be empty.")
        if not self._providers:
            return []

        provider_results = await asyncio.gather(
            *(provider.search(query) for provider in self._providers)
        )
        normalized_products: list[NormalizedProduct] = []
        for products in provider_results:
            if not isinstance(products, list):
                raise TypeError("Product providers must return a list of product records.")
            normalized_products.extend(self._normalizer.normalize_many(products))

        merged_products = self._deduplicator.deduplicate(normalized_products)
        self._cache_external_details_tokens(merged_products)
        return merged_products

    async def get_product_details(self, product_id: str) -> NormalizedProduct:
        """Retrieve a normalized external product from a capable provider.

        Providers can opt into this capability independently of their search
        implementation, keeping the service free of provider-specific logic.
        """
        if not product_id:
            raise ValueError("An external product ID is required.")
        cached_product = self._get_cached_external_product(product_id)
        if cached_product is None:
            raise LookupError("External product details are no longer available.")

        if cached_product.details_token:
            for provider in self._providers:
                if isinstance(provider, ProductDetailsProvider):
                    try:
                        raw_product = await provider.get_product_details(
                            product_id, cached_product.details_token
                        )
                    except ProductProviderError:
                        # Immersive details enrich a real Shopping hit; they
                        # must not make that already-returned hit unusable.
                        logger.warning(
                            "Optional external product details unavailable; "
                            "using cached search result (provider=%s)",
                            getattr(provider, "provider_name", type(provider).__name__),
                        )
                        break
                    return self._normalizer.normalize(raw_product)

        # A source result without an immersive token is still a real, normalized
        # product. Returning it prevents a comparison from failing solely because
        # SerpApi omitted optional detail metadata; no fields are fabricated.
        if cached_product.product:
            return cached_product.product

        raise LookupError("External product details are no longer available.")

    def _cache_external_details_tokens(self, products: list[NormalizedProduct]) -> None:
        """Store provider detail tokens server-side for the current search session."""
        now = monotonic()
        self._external_products = {
            product_id: cached
            for product_id, cached in self._external_products.items()
            if cached.expires_at > now
        }
        expiry = now + self._EXTERNAL_PRODUCT_CACHE_TTL_SECONDS
        for product in products:
            entry = _ExternalProductCacheEntry(
                product=product,
                details_token=product.external_details_token,
                expires_at=expiry,
            )
            self._external_products[product.product_id] = entry
            for merged_id in product.merged_product_ids:
                self._external_products[merged_id] = entry

    def _get_cached_external_product(
        self, product_id: str
    ) -> _ExternalProductCacheEntry | None:
        """Return unexpired source metadata without exposing its details token."""
        cached = self._external_products.get(product_id)
        if cached is None:
            return None
        if cached.expires_at <= monotonic():
            self._external_products.pop(product_id, None)
            return None
        return cached

    @classmethod
    def _merge_products(cls, products: list[NormalizedProduct]) -> list[NormalizedProduct]:
        """Merge products using the multi-level product deduplicator."""
        deduplicator = ProductDeduplicator()
        return deduplicator.deduplicate(products)


    @staticmethod
    def _fill_missing_product_fields(
        target: NormalizedProduct, source: NormalizedProduct
    ) -> None:
        """Use non-empty duplicate metadata only when the first value is absent."""
        for field_name in (
            "brand",
            "category",
            "description",
            "image_url",
            "rating",
            "review_count",
        ):
            if getattr(target, field_name) is None:
                setattr(target, field_name, getattr(source, field_name))
