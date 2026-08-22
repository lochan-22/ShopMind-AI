"""Serializable data structures for live product comparisons."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field


@dataclass(slots=True)
class ComparisonOffer:
    """A retailer offer shown in a product comparison."""

    retailer: str | None
    price: float | None
    currency: str | None
    availability: bool | None
    product_url: str | None
    is_best_price: bool


@dataclass(slots=True)
class ComparisonProduct:
    """One normalized external product prepared for comparison."""

    product_id: str
    name: str
    brand: str | None
    category: str | None
    image: str | None
    current_price: float | None
    best_price: float | None
    rating: float | None
    review_count: int | None
    availability: bool | None
    offer_count: int
    best_retailer: str | None
    product_url: str | None
    offers: list[ComparisonOffer] = field(default_factory=list)
    specifications: dict[str, str] = field(default_factory=dict)


@dataclass(slots=True)
class ComparisonInsight:
    """A deterministic, evidence-based comparison outcome."""

    label: str
    winner_product_id: str | None
    message: str


@dataclass(slots=True)
class ComparisonResponse:
    """Complete response returned by the live product comparison endpoint."""

    product_a: ComparisonProduct
    product_b: ComparisonProduct
    price_difference: float | None
    insights: list[ComparisonInsight]
    recommendation: str
    shopmind_pick_product_id: str | None

    def to_dict(self) -> dict[str, object]:
        """Return a JSON-ready representation without provider tokens."""
        return asdict(self)
