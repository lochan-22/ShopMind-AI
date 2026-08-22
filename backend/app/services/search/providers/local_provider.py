"""Adapter exposing the existing local catalog through the provider contract."""

from typing import Any

from app.services.product_service import search_products
from app.services.search.providers.base_provider import BaseProductProvider


class LocalProductProvider(BaseProductProvider):
    """Search the existing in-memory ShopMind product catalog."""

    async def search(self, query: str) -> list[dict[str, Any]]:
        """Return local catalog matches in the provider-neutral record shape."""
        products = search_products(query)
        return [
            {
                "product_id": product["id"],
                "name": product["name"],
                "brand": product.get("brand"),
                "category": product.get("category"),
                "description": product.get("description"),
                "image_url": product.get("image"),
                "rating": product.get("rating"),
                "review_count": product.get("review_count"),
                "offers": [
                    {
                        "price": product.get("price"),
                        "stock_status": product.get("stock"),
                        "source_name": "ShopMind local catalog",
                    }
                ],
            }
            for product in products
        ]
