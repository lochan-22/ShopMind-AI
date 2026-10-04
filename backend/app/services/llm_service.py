"""
backend/app/services/llm_service.py

ShopMind AI - LLM Service (Rule-Based Placeholder)

This module provides a reusable service for parsing user queries into
structured data (intent, brand, category, budget) using simple rule-based
logic. This is a placeholder implementation and does NOT connect to any
external LLM provider (OpenAI, Gemini, etc.). It is designed so that the
rule-based logic can later be swapped out for an actual LLM call without
changing the public function signatures.
"""

import re
from typing import Optional, Dict, Any, List


# ---------------------------------------------------------------------------
# Static knowledge bases used for rule-based extraction
# ---------------------------------------------------------------------------

KNOWN_BRANDS: List[str] = [
    "Sony", "Samsung", "Apple", "Boat", "JBL", "Bose", "Sennheiser",
    "OnePlus", "Xiaomi", "Redmi", "Realme", "Oppo", "Vivo", "Nokia",
    "Motorola", "Asus", "Acer", "HP", "Dell", "Lenovo", "LG", "Panasonic",
    "Philips", "Skullcandy", "Noise", "Zebronics", "Puma", "Adidas",
    "Nike", "Titan", "Fastrack", "Casio", "Garmin", "Fitbit", "Amazfit",
    "Canon", "Nikon", "GoPro", "Logitech", "HyperX", "Razer", "Corsair",
    "MSI", "Google", "Microsoft", "Amazon", "Anker", "Mi", "Infinix",
    "Tecno", "iQOO",
]

CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Headphones": ["headphone", "headphones", "headset", "earbud", "earbuds",
                   "earphone", "earphones", "tws"],
    "Smartphone": ["smartphone", "smartphones", "phone", "phones", "mobile",
                   "mobiles"],
    "Laptop": ["laptop", "laptops", "notebook", "notebooks", "ultrabook"],
    "Smartwatch": ["smartwatch", "smartwatches", "watch", "watches"],
    "Television": ["television", "televisions", "tv", "tvs", "led tv",
                    "smart tv"],
    "Speaker": ["speaker", "speakers", "soundbar", "soundbars"],
    "Camera": ["camera", "cameras", "dslr", "mirrorless"],
    "Tablet": ["tablet", "tablets", "ipad"],
    "Shoes": ["shoe", "shoes", "sneaker", "sneakers", "footwear"],
    "Refrigerator": ["refrigerator", "refrigerators", "fridge", "fridges"],
    "Washing Machine": ["washing machine", "washing machines", "washer"],
    "Air Conditioner": ["air conditioner", "air conditioners", "ac", "acs"],
    "Keyboard": ["keyboard", "keyboards"],
    "Mouse": ["mouse", "mice"],
    "Monitor": ["monitor", "monitors", "display", "displays"],
}

INTENT_KEYWORDS: Dict[str, List[str]] = {
    "search": ["need", "want", "looking for", "find", "search", "show me",
               "get me", "buy", "purchase", "suggest", "recommend"],
    "compare": ["compare", "comparison", "vs", "versus", "difference between",
                "better than"],
    "review": ["review", "reviews", "rating", "ratings", "feedback",
                "opinion"],
    "price_check": ["price of", "cost of", "how much", "price for"],
    "availability": ["available", "availability", "in stock", "stock"],
    "greeting": ["hi", "hello", "hey", "good morning", "good evening"],
}

# Currency symbols / words considered while extracting budget
CURRENCY_HINTS = ["₹", "rs", "rs.", "inr", "rupees", "$", "usd", "dollars"]


# ---------------------------------------------------------------------------
# Internal helper functions
# ---------------------------------------------------------------------------

def _normalize(text: str) -> str:
    """Lowercase and collapse extra whitespace for easier matching."""
    return re.sub(r"\s+", " ", text.strip().lower())


def _find_first_match(text_lower: str, keyword_map: Dict[str, List[str]]) -> Optional[str]:
    """
    Given a lowercase text and a mapping of {label: [keywords]}, return the
    label whose keyword appears first (earliest match position) in the text.
    Returns None if no keyword is found.
    """
    best_label: Optional[str] = None
    best_pos: int = len(text_lower) + 1

    for label, keywords in keyword_map.items():
        for kw in keywords:
            # Keywords must be complete words/phrases. A substring search
            # incorrectly classifies "tell ... headphones" as a greeting
            # because it contains the characters in "hello".
            match = re.search(
                r"(?<!\w)" + re.escape(kw.lower()) + r"(?!\w)", text_lower
            )
            if match is not None and match.start() < best_pos:
                best_pos = match.start()
                best_label = label

    return best_label


# ---------------------------------------------------------------------------
# Public extraction functions
# ---------------------------------------------------------------------------

def extract_intent(query: str) -> str:
    """
    Determine the user's intent from the query using keyword matching.

    Returns one of: "search", "compare", "review", "price_check",
    "availability", "greeting", or "unknown" as a fallback.
    """
    if not query or not query.strip():
        return "unknown"

    text_lower = _normalize(query)
    intent = _find_first_match(text_lower, INTENT_KEYWORDS)

    return intent if intent else "search"


def extract_brand(query: str) -> Optional[str]:
    """
    Extract a known brand name from the query using a static brand list.
    Matching is case-insensitive; the canonical (properly-cased) brand
    name is returned. Returns None if no known brand is found.
    """
    if not query or not query.strip():
        return None

    text_lower = _normalize(query)

    for brand in KNOWN_BRANDS:
        pattern = r"\b" + re.escape(brand.lower()) + r"\b"
        if re.search(pattern, text_lower):
            return brand

    return None


def extract_category(query: str) -> Optional[str]:
    """
    Extract the product category from the query using keyword matching.
    Returns the canonical category name, or None if no category keyword
    is found.
    """
    if not query or not query.strip():
        return None

    text_lower = _normalize(query)
    return _find_first_match(text_lower, CATEGORY_KEYWORDS)


def extract_budget(query: str) -> Optional[int]:
    """
    Extract a numeric budget value from the query.

    Handles patterns such as:
        "under ₹5000", "under 5000", "below Rs 3000", "less than 20000",
        "within 10k", "budget of 15000", "$500", "under 2k"

    Returns the budget as an integer, or None if no budget is found.
    """
    if not query or not query.strip():
        return None

    text = query.strip()
    text_lower = text.lower()

    # Pattern 1: numbers followed by 'k' (e.g., "10k", "5 k") -> multiply by 1000
    k_pattern = re.search(
        r"(?:under|below|less than|within|upto|up to|around|budget of|for)?\s*"
        r"(\d+(?:\.\d+)?)\s*k\b",
        text_lower,
    )
    if k_pattern:
        try:
            value = float(k_pattern.group(1)) * 1000
            return int(value)
        except ValueError:
            pass

    # Pattern 2: currency symbol / word followed by digits (with optional commas)
    currency_pattern = re.search(
        r"(?:₹|rs\.?|inr|\$|usd)\s*(\d[\d,]*(?:\.\d+)?)",
        text_lower,
    )
    if currency_pattern:
        raw_number = currency_pattern.group(1).replace(",", "")
        try:
            return int(float(raw_number))
        except ValueError:
            pass

    # Pattern 3: digits followed by currency word (e.g., "5000 rupees")
    number_then_currency = re.search(
        r"(\d[\d,]*(?:\.\d+)?)\s*(?:₹|rs\.?|inr|rupees|\$|usd|dollars)",
        text_lower,
    )
    if number_then_currency:
        raw_number = number_then_currency.group(1).replace(",", "")
        try:
            return int(float(raw_number))
        except ValueError:
            pass

    # Pattern 4: generic budget-related phrasing followed by plain digits
    generic_pattern = re.search(
        r"(?:under|below|less than|within|upto|up to|around|budget of|budget|for)\s*"
        r"(\d[\d,]*(?:\.\d+)?)",
        text_lower,
    )
    if generic_pattern:
        raw_number = generic_pattern.group(1).replace(",", "")
        try:
            return int(float(raw_number))
        except ValueError:
            pass

    # Pattern 5: fallback - any standalone number with 3+ digits (likely a price)
    fallback_pattern = re.search(r"\b(\d{3,}(?:,\d{3})*)\b", text_lower)
    if fallback_pattern:
        raw_number = fallback_pattern.group(1).replace(",", "")
        try:
            return int(raw_number)
        except ValueError:
            pass

    return None


# ---------------------------------------------------------------------------
# Main reusable service function
# ---------------------------------------------------------------------------

def parse_user_query(query: str) -> Dict[str, Any]:
    """
    Parse a raw user query into a structured dictionary containing intent,
    brand, category, and budget. Uses rule-based logic only (no external
    LLM calls).

    Example:
        Input:  "I need Sony headphones under ₹5000"
        Output: {
            "intent": "search",
            "brand": "Sony",
            "category": "Headphones",
            "budget": 5000
        }
    """
    return {
        "intent": extract_intent(query),
        "brand": extract_brand(query),
        "category": extract_category(query),
        "budget": extract_budget(query),
    }
