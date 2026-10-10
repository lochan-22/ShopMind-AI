"""Product deduplication and multi-seller offer grouping engine."""

from __future__ import annotations

import difflib
import logging
import re
from typing import Any, Sequence

from app.services.search.product_normalizer import NormalizedProduct, ProductOffer

logger = logging.getLogger(__name__)

STOP_WORDS: set[str] = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "up", "about", "into", "over", "after", "is", "are", "was",
    "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "but", "not", "what", "all", "when", "where", "which", "who", "will",
    "more", "no", "if", "out", "so", "said", "india", "online", "buy", "best",
    "price", "shop", "deals", "offer", "discount", "free", "shipping", "delivery",
}


class ProductDeduplicator:
    """Multi-level product deduplication and offer grouping engine.

    Implements a strict 4-level matching hierarchy:
      1. GTIN / UPC / EAN exact identifier match.
      2. Brand + Model Number + Key Variant match.
      3. Brand + Normalized Model Name + Key Variant match.
      4. Conservative Title Similarity fallback with strict number guards.
    """

    def deduplicate(
        self, products: Sequence[NormalizedProduct]
    ) -> list[NormalizedProduct]:
        """Deduplicate a sequence of normalized products and group multi-seller offers."""
        if not products:
            return []

        canonical_products: list[NormalizedProduct] = []

        for product in products:
            matched = self.find_match(product, canonical_products)
            if matched is not None:
                self.merge_into_canonical(matched, product)
            else:
                self._sort_and_mark_offers(product.offers)
                canonical_products.append(product)

        return canonical_products

    def find_match(
        self,
        candidate: NormalizedProduct,
        existing_products: Sequence[NormalizedProduct],
    ) -> NormalizedProduct | None:
        """Find an existing canonical product that matches the candidate."""
        for existing in existing_products:
            if self.can_merge(existing, candidate):
                return existing
        return None

    def can_merge(self, a: NormalizedProduct, b: NormalizedProduct) -> bool:
        """Evaluate if two products represent the same canonical product."""
        # Fast path: identical product_id or already merged
        if a.product_id == b.product_id:
            return True
        if b.product_id in a.merged_product_ids or a.product_id in b.merged_product_ids:
            return True

        # Safety guards: disqualifying conflicts
        if self._has_conflicting_attributes(a, b):
            return False

        # Level 1: GTIN / UPC / EAN exact match
        if self._match_level_1_gtin(a, b):
            return True

        # Level 2: Brand + Model Number + Key Variants match
        if self._match_level_2_model_number(a, b):
            return True

        # Level 3: Brand + Normalized Model Name + Key Variants match
        if self._match_level_3_model_name(a, b):
            return True

        # Level 4: Conservative Title Similarity Fallback
        if self._match_level_4_title_similarity(a, b):
            return True

        return False

    def merge_into_canonical(
        self, canonical: NormalizedProduct, duplicate: NormalizedProduct
    ) -> NormalizedProduct:
        """Merge a duplicate product into a canonical product, combining offers."""
        # 1. Track merged IDs
        if duplicate.product_id != canonical.product_id and duplicate.product_id not in canonical.merged_product_ids:
            canonical.merged_product_ids.append(duplicate.product_id)
        for pid in duplicate.merged_product_ids:
            if pid != canonical.product_id and pid not in canonical.merged_product_ids:
                canonical.merged_product_ids.append(pid)

        # 2. Merge offers (avoid duplicates from same merchant at same price)
        existing_keys = {
            self._offer_identity_key(offer)
            for offer in canonical.offers
        }
        for offer in duplicate.offers:
            offer_key = self._offer_identity_key(offer)
            if offer_key not in existing_keys:
                canonical.offers.append(offer)
                existing_keys.add(offer_key)

        # 3. Sort offers and mark lowest price
        self._sort_and_mark_offers(canonical.offers)

        # 4. Enrich canonical metadata if duplicate has better/missing info
        if not canonical.image_url and duplicate.image_url:
            canonical.image_url = duplicate.image_url

        if duplicate.description and (not canonical.description or len(duplicate.description) > len(canonical.description)):
            canonical.description = duplicate.description

        if canonical.rating is None and duplicate.rating is not None:
            canonical.rating = duplicate.rating
            canonical.review_count = duplicate.review_count

        if not canonical.external_details_token and duplicate.external_details_token:
            canonical.external_details_token = duplicate.external_details_token

        if not canonical.brand and duplicate.brand:
            canonical.brand = duplicate.brand

        if not canonical.model and duplicate.model:
            canonical.model = duplicate.model

        if not canonical.model_number and duplicate.model_number:
            canonical.model_number = duplicate.model_number

        if not canonical.gtin and duplicate.gtin:
            canonical.gtin = duplicate.gtin

        # Merge specifications
        for key, value in duplicate.specifications.items():
            if key not in canonical.specifications and value:
                canonical.specifications[key] = value

        return canonical

    @staticmethod
    def _offer_identity_key(offer: ProductOffer) -> tuple[Any, ...]:
        """Compute an offer identity key to detect duplicate seller offers."""
        merchant = (offer.merchant_normalized or offer.source_name or "").strip().lower()
        price_rounded = round(offer.price, 2) if offer.price is not None else None
        if merchant:
            return (merchant, price_rounded)
        return (offer.source_name, price_rounded, offer.product_url)

    @staticmethod
    def _sort_and_mark_offers(offers: list[ProductOffer]) -> None:
        """Sort offers by price ascending and mark the lowest valid price offer."""
        offers.sort(
            key=lambda o: (
                o.price is None,
                o.price if o.price is not None else float("inf"),
            )
        )
        for o in offers:
            o.is_best_price = False
        for o in offers:
            if o.price is not None:
                o.is_best_price = True
                break

    def _has_conflicting_attributes(
        self, a: NormalizedProduct, b: NormalizedProduct
    ) -> bool:
        """Check for strict safety conflicts that prevent merging."""
        # 1. Condition conflict (new vs refurbished/used)
        if (a.condition or "new").lower() != (b.condition or "new").lower():
            return True

        # 2. Accessory conflict (accessory vs main product)
        if a.is_accessory != b.is_accessory:
            return True

        # 3. Brand conflict
        if a.brand and b.brand:
            if a.brand.strip().lower() != b.brand.strip().lower():
                return True

        # 4. Variant conflicts (storage, RAM, shoe size, size, screen size)
        for variant_key in ("storage", "ram", "shoe_size", "size", "screen_size"):
            val_a = a.variants.get(variant_key)
            val_b = b.variants.get(variant_key)
            if val_a and val_b and val_a != val_b:
                return True


        # 5. Extracted model numbers conflict
        if a.model_number and b.model_number:
            if a.model_number.strip().lower() != b.model_number.strip().lower():
                return True

        # 6. Extracted model name conflict (e.g. "iPhone 14" vs "iPhone 15")
        if a.model and b.model:
            if a.model.strip().lower() != b.model.strip().lower():
                return True

        return False

    @staticmethod
    def _match_level_1_gtin(a: NormalizedProduct, b: NormalizedProduct) -> bool:
        """Level 1: GTIN / UPC / EAN exact match."""
        if a.gtin and b.gtin:
            clean_a = a.gtin.strip().lower()
            clean_b = b.gtin.strip().lower()
            if clean_a and clean_b and clean_a == clean_b:
                return True
        return False

    def _match_level_2_model_number(
        self, a: NormalizedProduct, b: NormalizedProduct
    ) -> bool:
        """Level 2: Brand + Model Number + Key Variant Match."""
        if not (a.brand and b.brand and a.model_number and b.model_number):
            return False

        if a.brand.strip().lower() != b.brand.strip().lower():
            return False

        if a.model_number.strip().lower() != b.model_number.strip().lower():
            return False

        return True

    def _match_level_3_model_name(
        self, a: NormalizedProduct, b: NormalizedProduct
    ) -> bool:
        """Level 3: Brand + Normalized Model Name + Key Attributes."""
        if not (a.brand and b.brand and a.model and b.model):
            return False

        if a.brand.strip().lower() != b.brand.strip().lower():
            return False

        if a.model.strip().lower() != b.model.strip().lower():
            return False

        return True

    def _match_level_4_title_similarity(
        self, a: NormalizedProduct, b: NormalizedProduct
    ) -> bool:
        """Level 4: Conservative Title Similarity Fallback with strict guards."""
        # Brand alignment
        if a.brand and b.brand:
            if a.brand.strip().lower() != b.brand.strip().lower():
                return False

        title_a = (a.normalized_title or a.name or "").lower()
        title_b = (b.normalized_title or b.name or "").lower()
        if not title_a or not title_b:
            return False

        # Strict number guard: check for conflicting pure numbers
        nums_a = set(re.findall(r"\b\d+\b", title_a))
        nums_b = set(re.findall(r"\b\d+\b", title_b))
        diff_a = nums_a - nums_b
        diff_b = nums_b - nums_a
        # If both titles contain different distinct numbers (e.g. 14 vs 15, 39 vs 40, 10 vs 50)
        if diff_a and diff_b:
            return False

        # Token overlap
        tokens_a = set(re.findall(r"\b[a-z0-9]+\b", title_a)) - STOP_WORDS
        tokens_b = set(re.findall(r"\b[a-z0-9]+\b", title_b)) - STOP_WORDS
        if not tokens_a or not tokens_b:
            return False

        union = tokens_a | tokens_b
        intersection = tokens_a & tokens_b
        jaccard = len(intersection) / len(union) if union else 0.0

        ratio = difflib.SequenceMatcher(None, title_a, title_b).ratio()

        # Strict conservative threshold
        return jaccard >= 0.80 and ratio >= 0.82
