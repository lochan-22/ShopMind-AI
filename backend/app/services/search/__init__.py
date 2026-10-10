"""Provider-independent product search service primitives."""

from app.services.search.product_deduplicator import ProductDeduplicator
from app.services.search.product_normalizer import (
    NormalizedProduct,
    ProductNormalizer,
    ProductOffer,
)
from app.services.search.search_service import SearchService

__all__ = [
    "NormalizedProduct",
    "ProductDeduplicator",
    "ProductNormalizer",
    "ProductOffer",
    "SearchService",
]

