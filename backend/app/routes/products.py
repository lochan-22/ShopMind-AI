import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.comparison import ComparisonService
from app.services.product_service import (
    get_all_products,
    get_product_by_id,
)
from app.services.search import NormalizedProduct, SearchService
from app.services.search.providers.base_provider import ProductProviderError
from app.services.search.providers.serpapi_provider import SerpApiProvider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
def list_products():
    return get_all_products()


def _build_search_service() -> SearchService:
    """Create the live product-search registry for website search requests."""
    return SearchService([SerpApiProvider()])


search_service = _build_search_service()
comparison_service = ComparisonService(search_service)


def _legacy_product_id(product_id: str) -> int | str:
    """Preserve numeric local IDs while retaining external provider IDs exactly."""
    try:
        return int(product_id)
    except ValueError:
        return product_id


def _stock_value(status: str | None) -> bool | None:
    """Translate known stock status values without guessing unknown availability."""
    if status is None:
        return None
    normalized_status = status.lower().replace(" ", "_")
    if normalized_status in {"in_stock", "available", "instock"}:
        return True
    if normalized_status in {"out_of_stock", "unavailable", "sold_out", "outofstock"}:
        return False
    return None


def _serialize_search_product(product: NormalizedProduct) -> dict[str, object]:
    """Expose normalized search results in the existing frontend product shape."""
    primary_offer = product.offers[0] if product.offers else None
    return {
        # Existing frontend fields
        "id": _legacy_product_id(product.product_id),
        "name": product.name,
        "brand": product.brand,
        "category": product.category,
        "price": primary_offer.price if primary_offer else None,
        "rating": product.rating,
        "review_count": product.review_count,
        "description": product.description,
        "stock": _stock_value(primary_offer.stock_status) if primary_offer else None,
        "image": product.image_url,
        # Additive source/offer data for future backend consumers.
        "product_id": product.product_id,
        "retailer": primary_offer.source_name if primary_offer else None,
        "product_url": primary_offer.product_url if primary_offer else None,
        "offers": [
            {
                "price": offer.price,
                "currency": offer.currency,
                "stock_status": offer.stock_status,
                "source_name": offer.source_name,
                "product_url": offer.product_url,
                "is_best_price": offer.is_best_price,
            }
            for offer in product.offers
        ],
    }


@router.get("/search")
async def search_products_route(q: Optional[str] = Query(None, min_length=1)):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required.")

    try:
        products = await search_service.search(q)
    except ProductProviderError:
        logger.error("A configured product search provider is unavailable")
        raise HTTPException(
            status_code=503,
            detail="Live product search is temporarily unavailable. Please try again later.",
        ) from None
    except Exception as error:
        logger.error("Product search failed (%s)", type(error).__name__)
        raise HTTPException(
            status_code=500,
            detail="Product search is temporarily unavailable. Please try again later.",
        ) from None

    return [_serialize_search_product(product) for product in products]


@router.get("/external/{product_id}")
async def get_external_product(product_id: str):
    """Return provider-backed details for a live product, never local catalog data."""
    try:
        product = await search_service.get_product_details(product_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None
    except LookupError:
        raise HTTPException(
            status_code=404,
            detail="External product details have expired. Search again to refresh the product.",
        ) from None
    except ProductProviderError:
        logger.error("The external product details provider is unavailable")
        raise HTTPException(
            status_code=503,
            detail="External product details are temporarily unavailable. Please try again later.",
        ) from None
    except Exception as error:
        logger.error("External product details failed (%s)", type(error).__name__)
        raise HTTPException(
            status_code=500,
            detail="External product details are temporarily unavailable. Please try again later.",
        ) from None

    return _serialize_search_product(product)


@router.get("/compare")
async def compare_external_products(
    product_a: str = Query(..., min_length=1),
    product_b: str = Query(..., min_length=1),
):
    """Compare two distinct live external products through the shared search service."""
    try:
        comparison = await comparison_service.compare(product_a, product_b)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None
    except LookupError:
        raise HTTPException(
            status_code=404,
            detail="One or more product details have expired. Search again to refresh them.",
        ) from None
    except ProductProviderError:
        logger.error("The external comparison provider is unavailable")
        raise HTTPException(
            status_code=503,
            detail="Live product comparison is temporarily unavailable. Please try again later.",
        ) from None
    except Exception as error:
        logger.error("Live product comparison failed (%s)", type(error).__name__)
        raise HTTPException(
            status_code=500,
            detail="Live product comparison is temporarily unavailable. Please try again later.",
        ) from None

    return comparison.to_dict()


@router.get("/{product_id}")
def get_product(product_id: int):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
