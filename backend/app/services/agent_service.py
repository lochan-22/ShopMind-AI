import re
from typing import Optional, Dict, Any, List


# ====================================================================
# Mock Data
# ====================================================================

KNOWN_BRANDS: List[str] = [
    "sony", "apple", "samsung", "jbl", "logitech", "dell", "asus", "noise",
]

KNOWN_CATEGORIES: Dict[str, str] = {
    "headphone": "Headphones",
    "earbud": "Earbuds",
    "mouse": "Accessories",
    "monitor": "Monitors",
    "laptop": "Laptops",
    "phone": "Smartphone",
    "watch": "Smartwatch",
}

MOCK_RECOMMENDED_PRODUCT: Dict[str, Any] = {
    "id": 1,
    "name": "Sony WH-CH520",
    "brand": "Sony",
    "category": "Headphones",
    "price": 4490.00,
    "rating": 4.1,
}


# ====================================================================
# Helper Functions
# ====================================================================

def _extract_brand(query: str) -> Optional[str]:
    """Detect a known brand mentioned in the query."""
    query_lower = query.lower()
    for brand in KNOWN_BRANDS:
        if brand in query_lower:
            return brand.capitalize()
    return None


def _extract_category(query: str) -> Optional[str]:
    """Detect a known product category mentioned in the query."""
    query_lower = query.lower()
    for keyword, category in KNOWN_CATEGORIES.items():
        if keyword in query_lower:
            return category
    return None


def _extract_budget(query: str) -> Optional[float]:
    """Extract a numeric budget value from the query, if present."""
    match = re.search(r"(\d{3,7})", query.replace(",", ""))
    if match:
        return float(match.group(1))
    return None


def _build_reply(message: str) -> str:
    """Construct a mock conversational reply for a given user message."""
    return (
        f"I understood your message: \"{message}\". "
        "I'm analyzing your request and preparing the best shopping recommendations for you."
    )


def _build_recommendation_reason() -> str:
    """Return a mock reasoning string for why a product was recommended."""
    return "Best balance of price, battery life, and customer ratings within budget."


# ====================================================================
# Public Service Functions
# ====================================================================

def chat(message: str) -> Dict[str, str]:
    """Return a mock conversational reply for the given message."""
    return {"reply": _build_reply(message)}


def search(query: str) -> Dict[str, Any]:
    """Analyze the given query and return mock structured search results."""
    brand = _extract_brand(query)
    category = _extract_category(query)
    budget = _extract_budget(query)

    return {
        "intent": "product_search",
        "brand": brand,
        "category": category,
        "budget": budget,
        "products_found": 12,
        "recommended_product": MOCK_RECOMMENDED_PRODUCT,
    }


def recommend() -> Dict[str, Any]:
    """Return a mock top product recommendation with confidence and reasoning."""
    return {
        "top_product": MOCK_RECOMMENDED_PRODUCT,
        "confidence": 0.94,
        "reason": _build_recommendation_reason(),
        "score": 96.0,
    }