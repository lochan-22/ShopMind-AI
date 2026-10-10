"""Deterministic comparison of two normalized live external products."""

from __future__ import annotations

import asyncio

from app.services.comparison.models import (
    ComparisonInsight,
    ComparisonOffer,
    ComparisonProduct,
    ComparisonResponse,
)
from app.services.search.product_normalizer import NormalizedProduct, ProductOffer
from app.services.search.search_service import SearchService
from app.services.product_service import get_product_by_id


class ComparisonService:
    """Build a side-by-side comparison using the existing external details flow."""

    def __init__(self, search_service: SearchService) -> None:
        """Use the existing product search service as the external-data source."""
        self._search_service = search_service

    async def compare(self, product_a_id: str, product_b_id: str) -> ComparisonResponse:
        """Retrieve and compare exactly two distinct live external products."""
        if not product_a_id or not product_b_id:
            raise ValueError("Two external product IDs are required for comparison.")
        if product_a_id == product_b_id:
            raise ValueError("A product cannot be compared with itself.")

        product_a, product_b = await asyncio.gather(
            self._resolve_product(product_a_id),
            self._resolve_product(product_b_id),
        )

        if (
            product_a.product_id == product_b.product_id
            or product_b.product_id in product_a.merged_product_ids
            or product_a.product_id in product_b.merged_product_ids
        ):
            raise ValueError("A product cannot be compared with itself.")

        compared_a = self._to_comparison_product(product_a)
        compared_b = self._to_comparison_product(product_b)

        insights = self._build_insights(compared_a, compared_b)
        pick_product_id = self._pick_product(insights)

        return ComparisonResponse(
            product_a=compared_a,
            product_b=compared_b,
            price_difference=self._price_difference(compared_a, compared_b),
            insights=insights,
            recommendation=self._recommendation(compared_a, compared_b, pick_product_id),
            shopmind_pick_product_id=pick_product_id,
        )

    async def _resolve_product(self, product_id: str) -> NormalizedProduct:
        """Resolve a local catalog ID first, otherwise reuse external details."""
        try:
            local_id = int(product_id)
        except ValueError:
            local_id = None

        local_product = get_product_by_id(local_id) if local_id is not None else None
        if local_product is not None:
            return NormalizedProduct(
                product_id=str(local_product["id"]),
                name=local_product["name"],
                brand=local_product.get("brand"),
                category=local_product.get("category"),
                description=local_product.get("description"),
                image_url=local_product.get("image"),
                rating=local_product.get("rating"),
                review_count=local_product.get("review_count"),
                offers=[
                    ProductOffer(
                        price=local_product.get("price"),
                        stock_status=(
                            "in_stock"
                            if local_product.get("stock") is True
                            else "out_of_stock"
                            if local_product.get("stock") is False
                            else None
                        ),
                    )
                ],
            )

        return await self._search_service.get_product_details(product_id)

    @staticmethod
    def _to_comparison_product(product: NormalizedProduct) -> ComparisonProduct:
        """Map normalized external details to the stable comparison schema."""
        offers = [ComparisonService._to_comparison_offer(offer) for offer in product.offers]
        valid_offers = [offer for offer in offers if offer.price is not None]
        best_offer = valid_offers[0] if valid_offers else None
        return ComparisonProduct(
            product_id=product.product_id,
            name=product.name,
            brand=product.brand,
            category=product.category,
            image=product.image_url,
            current_price=best_offer.price if best_offer else None,
            best_price=best_offer.price if best_offer else None,
            rating=product.rating,
            review_count=product.review_count,
            availability=best_offer.availability if best_offer else None,
            offer_count=len(valid_offers),
            best_retailer=best_offer.retailer if best_offer else None,
            product_url=best_offer.product_url if best_offer else None,
            offers=offers,
            specifications=product.specifications,
        )

    @staticmethod
    def _to_comparison_offer(offer: ProductOffer) -> ComparisonOffer:
        """Map a normalized offer while retaining its sorted source order."""
        return ComparisonOffer(
            retailer=offer.source_name,
            price=offer.price,
            currency=offer.currency,
            availability=ComparisonService._availability(offer.stock_status),
            product_url=offer.product_url,
            is_best_price=offer.is_best_price,
        )

    @staticmethod
    def _availability(stock_status: str | None) -> bool | None:
        """Translate only explicit availability values; unknown stays ``None``."""
        if stock_status is None:
            return None
        value = stock_status.lower().replace(" ", "_")
        if value in {"in_stock", "available", "instock"}:
            return True
        if value in {"out_of_stock", "unavailable", "sold_out", "outofstock"}:
            return False
        return None

    @staticmethod
    def _price_difference(
        product_a: ComparisonProduct, product_b: ComparisonProduct
    ) -> float | None:
        """Return an absolute difference only when both best prices are valid."""
        if product_a.best_price is None or product_b.best_price is None:
            return None
        return abs(product_a.best_price - product_b.best_price)

    @staticmethod
    def _build_insights(
        product_a: ComparisonProduct, product_b: ComparisonProduct
    ) -> list[ComparisonInsight]:
        """Produce deterministic outcomes from valid price, rating, and offer data."""
        return [
            ComparisonService._insight(
                "Lower Price", product_a, product_b, "best_price", lower_is_better=True
            ),
            ComparisonService._insight("Better Rated", product_a, product_b, "rating"),
            ComparisonService._insight(
                "More Retailer Options", product_a, product_b, "offer_count"
            ),
        ]

    @staticmethod
    def _insight(
        label: str,
        product_a: ComparisonProduct,
        product_b: ComparisonProduct,
        attribute: str,
        *,
        lower_is_better: bool = False,
    ) -> ComparisonInsight:
        """Compare one numeric attribute without inferring a winner from gaps."""
        value_a = getattr(product_a, attribute)
        value_b = getattr(product_b, attribute)
        if value_a is None or value_b is None or value_a == value_b:
            return ComparisonInsight(label, None, "ShopMind couldn't determine a clear winner.")
        winner = product_a if (value_a < value_b if lower_is_better else value_a > value_b) else product_b
        return ComparisonInsight(label, winner.product_id, f"{winner.name} leads in {label.lower()}.")

    @staticmethod
    def _pick_product(insights: list[ComparisonInsight]) -> str | None:
        """Select a ShopMind Pick only when one product wins multiple categories."""
        scores: dict[str, int] = {}
        for insight in insights:
            if insight.winner_product_id:
                scores[insight.winner_product_id] = scores.get(insight.winner_product_id, 0) + 1
        if not scores:
            return None
        product_id, wins = max(scores.items(), key=lambda item: item[1])
        return product_id if wins >= 2 else None

    @staticmethod
    def _recommendation(
        product_a: ComparisonProduct,
        product_b: ComparisonProduct,
        pick_product_id: str | None,
    ) -> str:
        """Return a restrained, deterministic recommendation statement."""
        if pick_product_id == product_a.product_id:
            return f"ShopMind Pick: {product_a.name} wins multiple available comparison categories."
        if pick_product_id == product_b.product_id:
            return f"ShopMind Pick: {product_b.name} wins multiple available comparison categories."
        return "Both products have different strengths."
