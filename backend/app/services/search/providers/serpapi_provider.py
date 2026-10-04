"""SerpApi-backed Google Shopping product-search provider."""

from __future__ import annotations

import asyncio
import logging
import threading
from collections.abc import Mapping
from typing import Any

from app.core.config import settings
from app.services.search.providers.base_provider import (
    BaseProductProvider,
    ProductProviderError,
)

logger = logging.getLogger(__name__)


class SerpApiProvider(BaseProductProvider):
    """Fetch Google Shopping results through the official SerpApi Python SDK."""

    provider_name = "SerpApi Google Shopping"
    # The SDK uses ``requests``. A tuple gives it independent bounds for DNS/
    # TCP connection setup and for waiting for a response from SerpApi.
    _DEFAULT_CONNECT_TIMEOUT_SECONDS = 2.0
    _DEFAULT_READ_TIMEOUT_SECONDS = 6.0
    _DEFAULT_MAX_SEARCH_ATTEMPTS = 2
    _DEFAULT_RETRY_BASE_DELAY_SECONDS = 0.25

    def __init__(
        self,
        api_key: str | None = None,
        timeout_seconds: float = _DEFAULT_READ_TIMEOUT_SECONDS,
        connect_timeout_seconds: float = _DEFAULT_CONNECT_TIMEOUT_SECONDS,
        max_search_attempts: int = _DEFAULT_MAX_SEARCH_ATTEMPTS,
        retry_base_delay_seconds: float = _DEFAULT_RETRY_BASE_DELAY_SECONDS,
    ) -> None:
        """Create a provider using ``SERPAPI_API_KEY`` unless one is supplied.

        ``api_key`` is injectable for tests, but production configuration is
        read from the existing environment-backed application settings.
        """
        self._api_key = api_key if api_key is not None else settings.serpapi_api_key
        self._timeout_seconds = max(0.1, timeout_seconds)
        self._connect_timeout_seconds = max(0.1, connect_timeout_seconds)
        self._max_search_attempts = max(1, max_search_attempts)
        self._retry_base_delay_seconds = max(0.0, retry_base_delay_seconds)
        # requests.Session reuses keep-alive connections but is not documented
        # as thread-safe. One session per asyncio worker thread provides reuse
        # without sharing mutable session state across concurrent searches.
        self._thread_local = threading.local()

    async def search(self, query: str) -> list[dict[str, Any]]:
        """Search Google Shopping and return provider-neutral raw records.

        The official SerpApi client is synchronous, so it is run in a worker
        thread. Its explicit connect/read timeout bounds the HTTP call.
        """
        if not self._api_key:
            logger.warning("SerpApi provider is not configured with an API key")
            raise ProductProviderError(self.provider_name)

        response = await self._search_with_retries(query)

        if response.get("error"):
            logger.error("SerpApi Google Shopping returned an error response")
            raise ProductProviderError(self.provider_name)

        shopping_results = response.get("shopping_results", [])
        if not isinstance(shopping_results, list):
            logger.error("SerpApi Google Shopping returned an invalid results payload")
            raise ProductProviderError(self.provider_name)

        return [
            normalized
            for result in shopping_results
            if isinstance(result, Mapping)
            if (normalized := self._to_provider_record(result)) is not None
        ]

    async def _search_with_retries(self, query: str) -> dict[str, Any]:
        """Retry only transient Google Shopping transport failures."""
        for attempt in range(1, self._max_search_attempts + 1):
            try:
                return await asyncio.to_thread(self._request_shopping_results, query)
            except Exception as error:
                if not self._is_transient_error(error):
                    # Do not log third-party error text: it can include request
                    # parameters and must never expose credentials.
                    logger.error(
                        "SerpApi Google Shopping request failed without retry (%s)",
                        type(error).__name__,
                    )
                    raise ProductProviderError(self.provider_name) from None

                if attempt == self._max_search_attempts:
                    logger.error(
                        "SerpApi Google Shopping request failed after %d attempts "
                        "(error=%s, connect_timeout=%.1fs, read_timeout=%.1fs)",
                        attempt,
                        type(error).__name__,
                        self._connect_timeout_seconds,
                        self._timeout_seconds,
                    )
                    raise ProductProviderError(self.provider_name) from None

                delay = self._retry_base_delay_seconds * (2 ** (attempt - 1))
                logger.warning(
                    "SerpApi Google Shopping attempt %d/%d failed (%s); retrying in %.1f seconds",
                    attempt,
                    self._max_search_attempts,
                    type(error).__name__,
                    delay,
                )
                await asyncio.sleep(delay)

        raise ProductProviderError(self.provider_name)

    @staticmethod
    def _is_transient_error(error: Exception) -> bool:
        """Recognize timeouts and transport failures, not invalid API responses."""
        if isinstance(error, (TimeoutError, ConnectionError, OSError)):
            return True
        return type(error).__name__ in {
            "ConnectError",
            "ConnectionError",
            "NetworkError",
            "ReadTimeout",
            "TimeoutException",
        }

    async def get_product_details(
        self, product_id: str, details_token: str
    ) -> dict[str, Any]:
        """Retrieve product-level details and available stores from SerpApi."""
        if not self._api_key:
            logger.warning("SerpApi provider is not configured with an API key")
            raise ProductProviderError(self.provider_name)

        try:
            response = await asyncio.to_thread(
                self._request_immersive_product, details_token
            )
        except Exception as error:
            logger.error(
                "SerpApi immersive product request failed "
                "(error=%s, connect_timeout=%.1fs, read_timeout=%.1fs)",
                type(error).__name__,
                self._connect_timeout_seconds,
                self._timeout_seconds,
            )
            raise ProductProviderError(self.provider_name) from None

        if response.get("error"):
            logger.error("SerpApi immersive product returned an error response")
            raise ProductProviderError(self.provider_name)

        product_result = response.get("product_results")
        if not isinstance(product_result, Mapping) or not product_result.get("title"):
            logger.error("SerpApi immersive product returned no product details")
            raise ProductProviderError(self.provider_name)

        return self._to_details_provider_record(product_id, product_result, details_token)

    def _request_shopping_results(self, query: str) -> dict[str, Any]:
        """Execute one synchronous Google Shopping request with the official SDK."""
        try:
            import serpapi
        except ImportError:
            logger.error("The SerpApi Python SDK is not installed")
            raise ProductProviderError(self.provider_name) from None

        client = self._get_client(serpapi)
        response = client.search(
            {
                "engine": "google_shopping",
                "q": query,
                "location": "India",
                "hl": "en",
                "gl": "in",
            }
        )
        return dict(response)

    def _request_immersive_product(self, details_token: str) -> dict[str, Any]:
        """Execute a Google Immersive Product request for one product token."""
        try:
            import serpapi
        except ImportError:
            logger.error("The SerpApi Python SDK is not installed")
            raise ProductProviderError(self.provider_name) from None

        client = self._get_client(serpapi)
        response = client.search(
            {
                "engine": "google_immersive_product",
                "page_token": details_token,
                "more_stores": True,
            }
        )
        return dict(response)

    def _get_client(self, serpapi_module: Any) -> Any:
        """Return this worker thread's reusable SDK client.

        Passing a timeout tuple to requests distinguishes a slow connection
        from a slow SerpApi response. Avoid an outer ``wait_for`` here: it
        cannot stop a synchronous request already running in ``to_thread`` and
        would allow a retry to duplicate that in-flight request.
        """
        client = getattr(self._thread_local, "client", None)
        if client is None:
            client = serpapi_module.Client(
                api_key=self._api_key,
                timeout=(self._connect_timeout_seconds, self._timeout_seconds),
            )
            self._thread_local.client = client
        return client

    @staticmethod
    def _to_provider_record(result: Mapping[str, Any]) -> dict[str, Any] | None:
        """Map one SerpApi shopping item to the shared provider record format."""
        title = result.get("title")
        product_id = result.get("product_id") or result.get("product_link")
        if not title or not product_id:
            return None

        return {
            "product_id": product_id,
            "name": title,
            "brand": result.get("brand"),
            "category": result.get("category"),
            "description": result.get("description"),
            "image_url": result.get("thumbnail"),
            "rating": result.get("rating"),
            "review_count": result.get("reviews"),
            "external_details_token": result.get("immersive_product_page_token"),
            "offers": [
                {
                    "price": result.get("extracted_price", result.get("price")),
                    "currency": result.get("currency"),
                    "stock_status": result.get("availability"),
                    "source_name": result.get("source"),
                    "product_url": result.get("product_link"),
                }
            ],
        }

    @staticmethod
    def _to_details_provider_record(
        product_id: str,
        product_result: Mapping[str, Any],
        details_token: str,
    ) -> dict[str, Any]:
        """Map an immersive-product payload into a shared detail record."""
        stores = product_result.get("stores")
        offers = (
            [
                SerpApiProvider._store_to_offer(store)
                for store in stores
                if isinstance(store, Mapping)
            ]
            if isinstance(stores, list)
            else []
        )
        thumbnails = product_result.get("thumbnails")
        image_url = (
            thumbnails[0]
            if isinstance(thumbnails, list) and thumbnails and isinstance(thumbnails[0], str)
            else product_result.get("thumbnail")
        )
        return {
            "product_id": product_id,
            "name": product_result.get("title"),
            "brand": product_result.get("brand"),
            "category": product_result.get("category"),
            "description": product_result.get("description"),
            "image_url": image_url,
            "rating": product_result.get("rating"),
            "review_count": product_result.get("reviews"),
            "specifications": SerpApiProvider._extract_specifications(product_result),
            "external_details_token": details_token,
            "offers": offers,
        }

    @staticmethod
    def _extract_specifications(product_result: Mapping[str, Any]) -> dict[str, str]:
        """Return only named product facts supplied by SerpApi, if present."""
        about_product = product_result.get("about_the_product")
        features = about_product.get("features") if isinstance(about_product, Mapping) else None
        if not isinstance(features, list):
            return {}

        specifications: dict[str, str] = {}
        for feature in features:
            if not isinstance(feature, Mapping):
                continue
            title = feature.get("title")
            value = feature.get("value")
            if title is not None and value is not None and str(title).strip() and str(value).strip():
                specifications[str(title).strip()] = str(value).strip()
        return specifications

    @staticmethod
    def _store_to_offer(store: Mapping[str, Any]) -> dict[str, Any]:
        """Map one Google Shopping store offer without creating missing data."""
        return {
            "price": store.get("extracted_price", store.get("price")),
            "currency": store.get("currency"),
            "stock_status": SerpApiProvider._stock_status_from_details(
                store.get("details_and_offers")
            ),
            "source_name": store.get("name"),
            "product_url": store.get("link"),
        }

    @staticmethod
    def _stock_status_from_details(details: Any) -> str | None:
        """Extract explicit stock wording from a store's supplied offer details."""
        if not isinstance(details, list):
            return None
        text = " ".join(str(item).lower() for item in details)
        if "out of stock" in text or "sold out" in text:
            return "out_of_stock"
        if "in stock" in text:
            return "in_stock"
        return None
