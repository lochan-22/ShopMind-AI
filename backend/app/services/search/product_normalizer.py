"""Normalized, provider-independent product search data structures."""

from __future__ import annotations

from dataclasses import dataclass, field
import math
import re
from typing import Any, Mapping


@dataclass(slots=True)
class ProductOffer:
    """A purchasable offer for a normalized product.

    Offer fields intentionally live separately from product details so several
    retailers or sources can later be represented for the same product.
    """

    price: float | None = None
    currency: str | None = None
    stock_status: str | None = None
    source_name: str | None = None
    product_url: str | None = None
    is_best_price: bool = False


@dataclass(slots=True)
class NormalizedProduct:
    """A source-neutral product with zero or more available offers."""

    product_id: str
    name: str
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    image_url: str | None = None
    rating: float | None = None
    review_count: int | None = None
    specifications: dict[str, str] = field(default_factory=dict)
    external_details_token: str | None = None
    offers: list[ProductOffer] = field(default_factory=list)


class ProductNormalizer:
    """Convert provider records into the shared product-search model.

    Providers may return the canonical field names or the common aliases
    documented in ``normalize``. No retailer-specific fields are assumed.
    """

    def normalize(self, product: Mapping[str, Any] | NormalizedProduct) -> NormalizedProduct:
        """Return one normalized product record.

        A raw record must provide ``product_id`` (or ``id``) and ``name`` (or
        ``product_name``). It may supply offers as an ``offers`` list, or use
        the direct offer fields: ``price``, ``currency``, ``stock_status``,
        ``source_name``, and ``product_url``. Common neutral aliases such as
        ``image``, ``url``, and ``source`` are also accepted.

        Raises:
            ValueError: If an identifier or name is absent.
            TypeError: If the input or its offers are not mapping-like.
        """
        if isinstance(product, NormalizedProduct):
            self._sort_offers(product.offers)
            return product
        if not isinstance(product, Mapping):
            raise TypeError("Product records must be mappings or NormalizedProduct instances.")

        product_id = self._first_value(product, "product_id", "id")
        name = self._first_value(product, "name", "product_name", "title")
        if product_id is None or str(product_id).strip() == "":
            raise ValueError("Product records must include a product_id or id.")
        if name is None or str(name).strip() == "":
            raise ValueError("Product records must include a name or product_name.")

        offers_value = product.get("offers")
        if offers_value is None:
            offers = [self._normalize_offer(product)]
        else:
            if isinstance(offers_value, (str, bytes)) or not isinstance(offers_value, list):
                raise TypeError("Product offers must be provided as a list of mappings.")
            offers = [self._normalize_offer(offer) for offer in offers_value]

        normalized_product = NormalizedProduct(
            product_id=str(product_id),
            name=str(name),
            brand=self._optional_text(product.get("brand")),
            category=self._optional_text(product.get("category")),
            description=self._optional_text(product.get("description")),
            image_url=self._optional_text(self._first_value(product, "image_url", "image")),
            rating=self._optional_float(product.get("rating")),
            review_count=self._optional_int(product.get("review_count")),
            specifications=self._specifications(product.get("specifications")),
            external_details_token=self._optional_text(product.get("external_details_token")),
            offers=offers,
        )
        self._sort_offers(normalized_product.offers)
        return normalized_product

    def normalize_many(
        self, products: list[Mapping[str, Any] | NormalizedProduct]
    ) -> list[NormalizedProduct]:
        """Normalize every product in a provider result list."""
        return [self.normalize(product) for product in products]

    def _normalize_offer(self, offer: Mapping[str, Any]) -> ProductOffer:
        """Convert an individual raw offer mapping to ``ProductOffer``."""
        if not isinstance(offer, Mapping):
            raise TypeError("Each product offer must be a mapping.")

        return ProductOffer(
            price=self._optional_float(offer.get("price")),
            currency=self._optional_text(offer.get("currency")),
            stock_status=self._stock_status(offer.get("stock_status", offer.get("stock"))),
            source_name=self._optional_text(
                self._first_value(offer, "source_name", "source", "retailer", "retailer_name")
            ),
            product_url=self._optional_text(self._first_value(offer, "product_url", "url", "link")),
        )

    @staticmethod
    def _sort_offers(offers: list[ProductOffer]) -> None:
        """Order valid numeric prices first and mark exactly one lowest offer."""
        offers.sort(
            key=lambda offer: (
                offer.price is None,
                offer.price if offer.price is not None else 0.0,
            )
        )
        for offer in offers:
            offer.is_best_price = False
        for offer in offers:
            if offer.price is not None:
                offer.is_best_price = True
                break

    @staticmethod
    def _first_value(values: Mapping[str, Any], *keys: str) -> Any:
        """Return the first non-``None`` value found for *keys*."""
        for key in keys:
            value = values.get(key)
            if value is not None:
                return value
        return None

    @staticmethod
    def _optional_text(value: Any) -> str | None:
        """Return a stripped string, preserving absent values as ``None``."""
        if value is None:
            return None
        text = str(value).strip()
        return text or None

    @staticmethod
    def _optional_float(value: Any) -> float | None:
        """Return a float from a numeric value or a displayed price string."""
        if value is None:
            return None
        try:
            converted_value = float(value)
            return converted_value if math.isfinite(converted_value) and converted_value >= 0 else None
        except (TypeError, ValueError):
            match = re.search(r"-?[\d,]+(?:\.\d+)?", str(value))
            if match is None:
                return None
            try:
                converted_value = float(match.group().replace(",", ""))
                return converted_value if math.isfinite(converted_value) and converted_value >= 0 else None
            except ValueError:
                return None

    @staticmethod
    def _optional_int(value: Any) -> int | None:
        """Return an integer from a numeric value or a displayed count string."""
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            match = re.search(r"([\d,.]+)\s*([kKmM])?", str(value))
            if match is None:
                return None
            try:
                amount = float(match.group(1).replace(",", ""))
            except ValueError:
                return None
            multiplier = {"k": 1_000, "m": 1_000_000}.get(
                (match.group(2) or "").lower(), 1
            )
            return int(amount * multiplier)

    @staticmethod
    def _stock_status(value: Any) -> str | None:
        """Normalize boolean stock flags while preserving source status text."""
        if isinstance(value, bool):
            return "in_stock" if value else "out_of_stock"
        return ProductNormalizer._optional_text(value)

    @staticmethod
    def _specifications(value: Any) -> dict[str, str]:
        """Keep only source-provided, non-empty specification pairs."""
        if not isinstance(value, Mapping):
            return {}
        return {
            str(key).strip(): str(item).strip()
            for key, item in value.items()
            if str(key).strip() and item is not None and str(item).strip()
        }
