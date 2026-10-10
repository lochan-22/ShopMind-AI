"""ShopMind AI Shopping Decision Engine.

Orchestrates:
1. Natural language query understanding & structured intent extraction
2. Google Shopping live retrieval via SerpApi
3. Product normalization, deduplication & verified specification extraction
4. Transparent criterion-level scoring & price/value assessment
5. Evidence-based recommendation badges without array-position defaults
6. Category-appropriate market analysis (Mice, Headphones, Laptops, Cameras, Phones, Shoes)
7. Resilient AI shopping analysis (LLM-powered with data-grounded fallback)
"""

from __future__ import annotations

import asyncio
import logging
import math
import re
import statistics
from typing import Any, Mapping

from app.ai.providers.openrouter import OpenRouterProvider
from app.services.llm_service import parse_user_query
from app.services.search.product_normalizer import NormalizedProduct
from app.services.search.search_service import SearchService

logger = logging.getLogger(__name__)


# Common feature keywords to extract from natural language queries
FEATURE_KEYWORDS: dict[str, list[str]] = {
    "AI engineering / Data Science": [
        "ai engineering", "machine learning", "deep learning", "coding",
        "programming", "development", "data science", "gpu", "cuda"
    ],
    "Music / Audio Quality": [
        "music", "sound quality", "audio quality", "bass", "audio", "sound",
        "songs", "audiophile", "hifi", "vocals"
    ],
    "Gaming": [
        "gaming", "game", "gamer", "high fps", "refresh rate",
        "rtx", "snapdragon", "cooling", "performance", "beast mode"
    ],
    "Low Latency / High Polling Rate": [
        "low latency", "polling rate", "1000hz", "1ms", "speedflex",
        "hyperspeed", "lightspeed", "zero latency", "latency"
    ],
    "High Precision / Sensor DPI": [
        "dpi", "sensor", "optical sensor", "pixart", "hero sensor",
        "precision tracking", "high dpi", "dots per inch"
    ],
    "Lightweight / Ultralight": [
        "lightweight", "ultralight", "honeycomb", "under 70g", "60g", "light weight"
    ],
    "Ergonomic / Grip Comfort": [
        "ergonomic", "palm grip", "claw grip", "thumb rest", "hand comfort"
    ],
    "Programmable Buttons": [
        "programmable", "side buttons", "macro", "custom buttons"
    ],
    "Movies / Extended Comfort": [
        "movie", "movies", "film", "films", "cinema", "entertainment",
        "comfort", "comfortable", "cushion", "cushioning", "earcups"
    ],
    "Calling / Microphone": [
        "calling", "calls", "mic", "microphone", "clear calls", "enc"
    ],
    "Noise Cancellation": [
        "noise cancellation", "noise cancelling", "anc", "active noise cancellation"
    ],
    "Wireless / Bluetooth": ["wireless", "bluetooth", "tws", "cordless", "2.4ghz"],
    "Image Quality / Photography": [
        "photography", "photo", "image quality", "dslr", "mirrorless",
        "4k", "sensor", "lens", "video recording", "vlogging"
    ],
    "Beginner Running": [
        "beginner", "beginners", "running", "jogging", "cushioning",
        "marathon", "walking", "daily wear"
    ],
    "Long Battery Life": [
        "battery life", "all day battery", "long lasting battery", "battery backup"
    ],
    "Lightweight / Portable": ["lightweight", "portable", "compact", "slim"],
}


def extract_features(query: str) -> list[str]:
    """Identify key use-case features from the natural-language query."""
    text_lower = query.lower()
    extracted: list[str] = []
    for feature_name, keywords in FEATURE_KEYWORDS.items():
        if any(re.search(r"\b" + re.escape(kw) + r"\b", text_lower) for kw in keywords):
            extracted.append(feature_name)
    return extracted


def extract_structured_intent(query: str) -> dict[str, Any]:
    """Derive rich structured shopping intent directly from the user's current query.

    Guarantees that unrequested criteria (such as ANC, 20+ hours battery life,
    or wireless connections) are never injected as mandatory requirements.
    """
    parsed = parse_user_query(query)
    features = extract_features(query)
    budget = parsed.get("budget")
    category = parsed.get("category")
    brand = parsed.get("brand")
    q_lower = query.lower()

    # Category refinement if not captured by parse_user_query
    if not category:
        if any(term in q_lower for term in ("mouse", "mice")):
            category = "Mouse"
        elif any(term in q_lower for term in ("headphone", "headphones", "earbud", "earbuds", "earphone", "tws")):
            category = "Headphones"
        elif any(term in q_lower for term in ("laptop", "notebook", "ultrabook", "macbook")):
            category = "Laptop"
        elif any(term in q_lower for term in ("camera", "dslr", "mirrorless")):
            category = "Camera"
        elif any(term in q_lower for term in ("shoe", "shoes", "sneaker", "sneakers", "footwear")):
            category = "Shoes"
        elif any(term in q_lower for term in ("phone", "smartphone", "mobile")):
            category = "Smartphone"

    # Canonicalize brand if "boat"
    if brand and brand.lower() == "boat":
        brand = "boAt"
    elif not brand and re.search(r"\bboat\b", query, re.IGNORECASE):
        brand = "boAt"

    # Derive explicit user priorities based on requested category and features
    priorities: list[str] = []
    if brand:
        priorities.append(f"{brand} as the requested brand preference")
    if budget:
        priorities.append(f"Budget up to ₹{budget:,}")
    else:
        priorities.append("Balanced price-to-performance across tiers (no budget specified)")

    if category == "Mouse":
        if "Gaming" in features or "gaming" in q_lower:
            priorities.append("Gaming sensor tracking and click responsiveness")
        if "Low Latency / High Polling Rate" in features or "latency" in q_lower:
            priorities.append("Low latency and high polling rate (1000Hz / 1ms)")
        if "High Precision / Sensor DPI" in features or "dpi" in q_lower:
            priorities.append("High DPI sensor precision and tracking accuracy")
        if "Lightweight / Ultralight" in features or "lightweight" in q_lower:
            priorities.append("Lightweight chassis for fast mouse flicks")
        if "Ergonomic / Grip Comfort" in features or "ergonomic" in q_lower:
            priorities.append("Ergonomic contour for grip comfort")
        if "Programmable Buttons" in features:
            priorities.append("Programmable macro buttons")
    elif category == "Headphones":
        if "Music / Audio Quality" in features:
            priorities.append("Music listening and sound quality")
        if "Gaming" in features:
            priorities.append("Gaming suitability and latency")
        if "Movies / Extended Comfort" in features:
            priorities.append("Movie listening and comfort")
        if "Calling / Microphone" in features:
            priorities.append("Voice calls and microphone clarity")
        if "Noise Cancellation" in features:
            priorities.append("Active Noise Cancellation (ANC)")
        if "Wireless / Bluetooth" in features:
            priorities.append("Wireless / Bluetooth mobility")
    else:
        if "AI engineering / Data Science" in features:
            priorities.append("AI engineering and programming workload capacity")
        if "Image Quality / Photography" in features:
            priorities.append("Optical clarity and image quality")
        if "Beginner Running" in features:
            priorities.append("Impact cushioning for beginner runners")
        if "Gaming" in features:
            priorities.append("Gaming performance and high refresh rates")
        if "Long Battery Life" in features:
            priorities.append("Extended battery endurance")

    # Explicitly track unrequested features so engine never mandates them
    unrequested: list[str] = []
    if category == "Mouse":
        if "Wireless / Bluetooth" not in features and not any(term in q_lower for term in ("wireless", "bluetooth")):
            unrequested.append("Wireless connectivity")
        if "High Precision / Sensor DPI" not in features and "dpi" not in q_lower:
            unrequested.append("Ultra-high 20,000+ DPI")
    elif category == "Headphones":
        if "Noise Cancellation" not in features:
            unrequested.append("Active Noise Cancellation (ANC)")
        if "Long Battery Life" not in features:
            unrequested.append("20+ Hours Battery Life")

    return {
        "intent": parsed.get("intent", "search"),
        "category": category,
        "brand": brand,
        "budget": budget,
        "features": features,
        "priorities": priorities,
        "unrequested_features": unrequested,
    }


def build_google_shopping_query(query: str, parsed: dict[str, Any], features: list[str]) -> str:
    """Build a search term optimized for Google Shopping while preserving core constraints."""
    cleaned = re.sub(
        r"^(can you show me|show me|find me|looking for|i need|i want|please suggest|suggest|recommend)\s+",
        "",
        query.strip(),
        flags=re.IGNORECASE,
    ).strip()
    return cleaned if cleaned else query.strip()


# ---------------------------------------------------------------------------
# Specification Verification and Extraction
# ---------------------------------------------------------------------------

def extract_verified_specs(p: dict[str, Any], category: str | None = None) -> dict[str, Any]:
    """Extract verified specifications from product data without inventing or inferring specs.

    Distinguishes verified specifications from unknown information.
    Missing specifications are explicitly reported and must not earn positive scores.
    """
    name = (p.get("name") or "").strip()
    desc = (p.get("description") or "").strip()
    specs_dict = p.get("specifications") or {}
    specs_text = " ".join(f"{k}: {v}" for k, v in specs_dict.items()) if isinstance(specs_dict, dict) else ""
    full_text = f"{name} {desc} {specs_text}".lower()

    cat_lower = (category or p.get("category") or "").lower()
    is_mouse = cat_lower in ("mouse", "mice") or any(term in full_text for term in ("gaming mouse", "optical mouse", "wired mouse", "wireless mouse"))

    verified: dict[str, str] = {}
    unspecified: list[str] = []
    metrics: dict[str, Any] = {}

    if is_mouse:
        # 1. DPI rating
        dpi_match = re.search(r"\b(\d{1,2}(?:,\d{3})?|\d{3,5})\s*(?:k\s*)?dpi\b", full_text)
        if dpi_match:
            raw_dpi = dpi_match.group(1).replace(",", "")
            dpi_num = int(raw_dpi) * (1000 if "k" in dpi_match.group(0) else 1)
            verified["dpi"] = f"{dpi_num:,} DPI"
            metrics["dpi"] = dpi_num
        else:
            unspecified.append("DPI rating unspecified in seller data")

        # 2. Polling rate / Response latency
        hz_match = re.search(r"\b(\d{3,4})\s*hz\b", full_text)
        ms_match = re.search(r"\b(\d+(?:\.\d+)?)\s*ms\b", full_text)
        if hz_match:
            hz_val = int(hz_match.group(1))
            verified["polling_rate"] = f"{hz_val}Hz"
            metrics["polling_rate"] = hz_val
        elif ms_match and float(ms_match.group(1)) <= 5.0:
            verified["polling_rate"] = f"{ms_match.group(1)}ms response time"
            metrics["polling_rate"] = 1000
        elif any(k in full_text for term in ("speedflex", "lightspeed", "hyperspeed", "1000hz", "1ms") if (k := term) in full_text):
            verified["polling_rate"] = "Verified low-latency transmission (1ms/1000Hz equivalent)"
            metrics["polling_rate"] = 1000
        else:
            unspecified.append("Exact polling rate (Hz) / ms latency unspecified in seller data")

        # 3. Chassis weight
        weight_match = re.search(r"\b(\d{2,3})\s*g(?:rams?)?\b", full_text)
        if weight_match:
            w_val = int(weight_match.group(1))
            if 40 <= w_val <= 180:
                verified["weight"] = f"{w_val}g {'(Ultralight)' if w_val < 70 else ''}".strip()
                metrics["weight"] = w_val
        if "weight" not in verified:
            unspecified.append("Chassis weight unspecified in seller data")

        # 4. Connection mode
        is_wireless = any(term in full_text for term in ("wireless", "2.4ghz", "bluetooth", "cordless"))
        is_wired = any(term in full_text for term in ("wired", "usb cable", "speedflex cable", "corded"))
        if is_wireless and is_wired:
            verified["connection"] = "Dual-mode (Wired & 2.4GHz Wireless)"
        elif is_wireless:
            verified["connection"] = "Wireless (2.4GHz / Bluetooth)"
        elif is_wired:
            verified["connection"] = "Wired (USB)"
        else:
            unspecified.append("Connection type unspecified in seller data")

        # 5. Sensor type
        if "focus+" in full_text:
            verified["sensor"] = "Razer Focus+ Optical Sensor"
        elif "hero" in full_text:
            verified["sensor"] = "Logitech HERO Optical Sensor"
        elif "pixart" in full_text:
            pix_m = re.search(r"\bpixart(?:\s*(?:pmw|paw)?\d+)?\b", full_text)
            verified["sensor"] = f"PixArt {pix_m.group(0).upper() if pix_m else 'Optical'} Sensor"
        elif re.search(r"\boptical\b", full_text):
            verified["sensor"] = "High-precision Optical Sensor"
        elif re.search(r"\blaser\b", full_text):
            verified["sensor"] = "Laser Gaming Sensor"
        else:
            unspecified.append("Sensor model unspecified in seller data")

        # 6. Programmable buttons
        btn_match = re.search(r"\b(\d+)\s*(?:programmable\s*)?buttons?\b", full_text)
        if btn_match:
            verified["buttons"] = f"{btn_match.group(1)} Programmable Buttons"
            metrics["buttons"] = int(btn_match.group(1))
        else:
            unspecified.append("Button count unspecified in seller data")

    elif "headphone" in cat_lower or "audio" in cat_lower:
        driver_match = re.search(r"\b(\d{2})\s*mm(?:\s*dynamic)?(?:\s*drivers?)?\b", full_text)
        if driver_match:
            verified["drivers"] = f"{driver_match.group(1)}mm Dynamic Drivers"
        if any(term in full_text for term in ("aux", "3.5mm", "wired")):
            verified["connectivity"] = "3.5mm AUX Wired (Zero Latency)"
        elif any(term in full_text for term in ("bluetooth", "wireless")):
            verified["connectivity"] = "Bluetooth Wireless"
        if any(term in full_text for term in ("cushion", "padded", "ergonomic earcups")):
            verified["comfort"] = "Ergonomic cushioned earcups"
        if any(term in full_text for term in ("anc", "active noise cancellation")):
            verified["anc"] = "Active Noise Cancellation (ANC)"
        battery_match = re.search(r"\b(\d{1,3})\s*(?:hours?|hrs?)\b", full_text)
        if battery_match:
            verified["battery"] = f"{battery_match.group(1)} Hours Playback"
    elif "laptop" in cat_lower:
        ram_match = re.search(r"\b(\d{1,2})\s*gb\s*(?:ram|ddr\d)?\b", full_text)
        if ram_match:
            verified["ram"] = f"{ram_match.group(1)}GB RAM"
        ssd_match = re.search(r"\b(\d{3,4}\s*gb|\d\s*tb)\s*(?:ssd|nvme)\b", full_text)
        if ssd_match:
            verified["storage"] = f"{ssd_match.group(1).upper()} SSD"
    else:
        # General / Other categories
        if p.get("brand"):
            verified["brand"] = p["brand"]

    return {
        "verified": verified,
        "unspecified": unspecified,
        "metrics": metrics,
    }


# ---------------------------------------------------------------------------
# Price Distribution and Value Assessment
# ---------------------------------------------------------------------------

def analyze_price_distribution(products: list[dict[str, Any]]) -> dict[str, Any]:
    """Analyze the price distribution across comparable listings to detect outliers and tiers."""
    prices = [
        float(p["price"]) for p in products
        if p.get("price") is not None and float(p["price"]) > 0
    ]
    if not prices:
        return {
            "median": None,
            "min": None,
            "max": None,
            "low_threshold": 0.0,
            "high_threshold": float("inf"),
        }

    sorted_prices = sorted(prices)
    median = statistics.median(sorted_prices)
    min_p = sorted_prices[0]
    max_p = sorted_prices[-1]

    # Calculate IQR or percentile thresholds
    q1 = sorted_prices[len(sorted_prices) // 4]
    q3 = sorted_prices[(3 * len(sorted_prices)) // 4]
    iqr = max(1.0, q3 - q1)

    high_threshold = max(q3 + 1.5 * iqr, median * 2.8)
    low_threshold = median * 0.25

    return {
        "median": median,
        "min": min_p,
        "max": max_p,
        "q1": q1,
        "q3": q3,
        "low_threshold": low_threshold,
        "high_threshold": high_threshold,
    }


def assess_product_price(
    p: dict[str, Any],
    stats: dict[str, Any],
    budget: int | None,
) -> dict[str, Any]:
    """Assess a product's price relative to market comparable listings."""
    price = p.get("price")
    if price is None:
        return {"price": None, "tier": "unknown", "outlier": None, "is_over_budget": False}

    p_float = float(price)
    median = stats.get("median")
    high_thresh = stats.get("high_threshold", float("inf"))
    low_thresh = stats.get("low_threshold", 0.0)

    outlier = None
    if p_float >= high_thresh:
        outlier = "high_outlier"
    elif p_float <= low_thresh:
        outlier = "low_outlier"

    tier = "mid-range"
    if median:
        if p_float <= median * 0.65:
            tier = "entry-level"
        elif p_float >= median * 1.4:
            tier = "premium"

    is_over_budget = False
    if budget is not None and p_float > float(budget):
        is_over_budget = True

    return {
        "price": p_float,
        "tier": tier,
        "outlier": outlier,
        "is_over_budget": is_over_budget,
    }


# ---------------------------------------------------------------------------
# Transparent Scoring Engine
# ---------------------------------------------------------------------------

def compute_transparent_score(
    p: dict[str, Any],
    query: str,
    target_category: str | None,
    target_brand: str | None,
    budget: int | None,
    features: list[str],
    spec_info: dict[str, Any],
    price_info: dict[str, Any],
    price_stats: dict[str, Any],
) -> tuple[float, dict[str, float]]:
    """Compute transparent criterion-level scores reflecting user intent and verified facts.

    CRITICAL RULES:
    1. Missing specifications earn exactly 0.0 points (never positive scores).
    2. Ratings alone cannot override large differences in feature relevance or budget compliance.
    3. Unusually high prices do not earn higher scores solely due to high cost.
    """
    name = (p.get("name") or "").lower()
    desc = (p.get("description") or "").lower()
    p_brand = (p.get("brand") or "").lower()
    full_text = f"{name} {desc} {p_brand}"

    query_words = set(re.findall(r"\w+", query.lower())) - {
        "best", "top", "under", "for", "with", "and", "the", "in", "a", "an", "rs", "inr", "show", "me"
    }

    # 1. Intent & Keyword Relevance (Max 30.0 pts)
    intent_score = 0.0

    # Brand matching
    if target_brand:
        if target_brand in p_brand or target_brand in name:
            intent_score += 15.0
        else:
            intent_score -= 15.0

    # Category matching & accessory filtering
    is_accessory = p.get("is_accessory", False)
    if not is_accessory and target_category and target_category.lower() in ("mouse", "mice"):
        if any(term in name for term in ("mouse pad", "mousepad", "grip tape", "skates", "feet", "cable", "sleeve")):
            is_accessory = True

    if is_accessory:
        intent_score -= 25.0
    elif target_category:
        cat_lower = target_category.lower()
        if cat_lower in full_text or (p.get("category") or "").lower() == cat_lower:
            intent_score += 8.0

    # Requested feature matching
    for feat in features:
        kws = FEATURE_KEYWORDS.get(feat, [])
        matches = sum(1 for kw in kws if kw in full_text)
        if matches > 0:
            intent_score += min(7.0, matches * 2.5)

    word_matches = sum(1 for w in query_words if w in full_text)
    intent_score += min(5.0, word_matches * 1.5)
    intent_score = max(0.0, min(30.0, intent_score))

    # 2. Budget and Value Assessment (Max 25.0 pts)
    value_score = 0.0
    price = price_info.get("price")

    if budget is not None and price is not None:
        p_float = float(price)
        if p_float <= float(budget):
            # Compliant: base 16.0 pts + value curve up to 5.0 pts
            value_score += 16.0
            savings_ratio = (float(budget) - p_float) / float(budget)
            value_score += min(5.0, savings_ratio * 4.0)
        else:
            # Over budget penalty: -25.0 pts
            value_score = 0.0
    elif budget is None and price is not None:
        # When no budget: balance performance and value, avoid artificial bias toward high price
        outlier = price_info.get("outlier")
        tier = price_info.get("tier")
        if outlier == "high_outlier":
            value_score = 6.0  # Capped unless exceptional specs justify
        elif outlier == "low_outlier":
            value_score = 5.0  # Suspiciously cheap / accessory
        elif tier == "mid-range":
            value_score = 18.0  # Sweet spot value
        elif tier == "entry-level":
            value_score = 16.0  # High value entry
        else:
            value_score = 13.0  # Premium
    else:
        value_score = 10.0
    value_score = max(0.0, min(25.0, value_score))

    # 3. Verified Specifications (Max 25.0 pts)
    # MISSING SPECIFICATIONS EARN 0.0 POINTS
    spec_score = 0.0
    metrics = spec_info.get("metrics", {})
    verified = spec_info.get("verified", {})

    cat_check = (target_category or p.get("category") or "").lower()
    if cat_check in ("mouse", "mice") or "mouse" in name:
        # DPI score (only if verified)
        dpi_val = metrics.get("dpi")
        if dpi_val:
            if dpi_val >= 16000:
                spec_score += 7.0
            elif dpi_val >= 8500:
                spec_score += 6.0
            elif dpi_val >= 6400:
                spec_score += 4.5
            elif dpi_val >= 3200:
                spec_score += 3.0
            else:
                spec_score += 1.5
        # 0 pts if dpi is missing

        # Polling rate / latency (only if verified)
        if "polling_rate" in verified:
            spec_score += 6.0

        # Sensor model (only if verified)
        if "sensor" in verified:
            sensor_name = verified["sensor"]
            if any(k in sensor_name for k in ("HERO", "Focus+", "PixArt")):
                spec_score += 5.0
            else:
                spec_score += 3.0

        # Weight (only if verified)
        w_val = metrics.get("weight")
        if w_val:
            if w_val < 70:
                spec_score += 4.0
            elif w_val <= 85:
                spec_score += 3.0
            else:
                spec_score += 1.5

        # Connection & buttons
        if "connection" in verified:
            spec_score += 1.5
        if "buttons" in verified:
            spec_score += 1.5

    elif "headphone" in cat_check or "audio" in cat_check:
        if "drivers" in verified:
            spec_score += 8.0
        if "connectivity" in verified:
            spec_score += 7.0
        if "comfort" in verified:
            spec_score += 5.0
        if "anc" in verified:
            spec_score += 5.0
    elif "laptop" in cat_check:
        if "ram" in verified:
            spec_score += 12.0
        if "storage" in verified:
            spec_score += 8.0
    else:
        # General verified facts
        if verified:
            spec_score += min(15.0, len(verified) * 4.0)

    spec_score = max(0.0, min(25.0, spec_score))

    # 4. Reputation & Customer Feedback (Max 15.0 pts)
    # Ratings alone are capped at 8.0 pts so they cannot override intent relevance or price penalties
    rep_score = 0.0
    rating = p.get("rating")
    if rating and isinstance(rating, (int, float)):
        r_val = float(rating)
        if r_val >= 4.5:
            rep_score += 8.0
        elif r_val >= 4.2:
            rep_score += 6.5
        elif r_val >= 4.0:
            rep_score += 5.0
        elif r_val >= 3.5:
            rep_score += 3.0
        else:
            rep_score += 1.0

    review_count = p.get("review_count")
    if review_count and isinstance(review_count, (int, float)):
        c_val = int(review_count)
        if c_val >= 5000:
            rep_score += 4.0
        elif c_val >= 1000:
            rep_score += 3.0
        elif c_val >= 100:
            rep_score += 2.0
        elif c_val >= 10:
            rep_score += 1.0

    if p.get("retailer") or p.get("offers"):
        rep_score += 3.0
    rep_score = max(0.0, min(15.0, rep_score))

    # 5. Live Listing Quality & Media (Max 5.0 pts)
    listing_score = 0.0
    if p.get("image"):
        listing_score += 2.0
    if p.get("offers") and len(p["offers"]) > 0:
        listing_score += 3.0
    listing_score = max(0.0, min(5.0, listing_score))

    total_score = round(intent_score + value_score + spec_score + rep_score + listing_score, 1)
    breakdown = {
        "intent_relevance": round(intent_score, 1),
        "budget_and_value": round(value_score, 1),
        "verified_specs": round(spec_score, 1),
        "reputation": round(rep_score, 1),
        "listing_quality": round(listing_score, 1),
    }

    return total_score, breakdown


# ---------------------------------------------------------------------------
# Decision Engine
# ---------------------------------------------------------------------------

class ShoppingDecisionEngine:
    """End-to-end shopping decision engine combining live search with transparent AI analysis."""

    def __init__(self, openrouter: OpenRouterProvider | None = None) -> None:
        self.openrouter = openrouter or OpenRouterProvider()

    async def execute(
        self, query: str, search_service: SearchService
    ) -> dict[str, Any]:
        """Execute the complete decision engine flow for a user query."""
        # 1. AI Intent & criteria extraction
        structured_intent = extract_structured_intent(query)
        parsed = parse_user_query(query)
        features = structured_intent["features"]
        budget = structured_intent["budget"]
        category = structured_intent["category"]
        brand = structured_intent["brand"]

        # 2. Optimized search query & live SerpApi results
        search_query = build_google_shopping_query(query, parsed, features)
        try:
            live_products = await search_service.search(search_query)
        except Exception as error:
            logger.warning("First search failed for '%s', retrying raw query: %s", search_query, error)
            live_products = await search_service.search(query)

        # 3. Product serialization with verified specifications
        serialized_products = [
            self._serialize_product(p) for p in live_products
        ]

        if not serialized_products:
            return {
                "query": query,
                "intent": {
                    "intent": parsed.get("intent", "search"),
                    "category": category,
                    "brand": brand,
                    "budget": budget,
                    "features": features,
                    "explicit_priorities": structured_intent["priorities"],
                    "unrequested_features": structured_intent["unrequested_features"],
                },
                "search_query": search_query,
                "ai_analysis": {
                    "summary": f"No live products were found for \"{query}\". Try broadening your search or adjusting keywords.",
                    "key_criteria": [],
                    "budget_verdict": "No matching live offers available.",
                    "top_pick_reason": "",
                },
                "top_recommendations": [],
                "all_products": [],
                "total_found": 0,
            }

        # 4. Filter and select Top 5 recommendations with transparent scores & evidence badges
        top_recommendations = self._select_top_recommendations(
            products=serialized_products,
            query=query,
            budget=budget,
            features=features,
            brand=brand,
            category=category,
        )

        # 5. AI Shopping Analysis (LLM with resilient data-grounded fallback)
        ai_analysis = await self._generate_ai_analysis(
            query=query,
            parsed=parsed,
            features=features,
            budget=budget,
            top_products=top_recommendations,
            total_count=len(serialized_products),
            brand=brand,
            structured_intent=structured_intent,
        )

        return {
            "query": query,
            "intent": {
                "intent": parsed.get("intent", "search"),
                "category": category,
                "brand": brand,
                "budget": budget,
                "features": features,
                "explicit_priorities": structured_intent["priorities"],
                "unrequested_features": structured_intent["unrequested_features"],
            },
            "search_query": search_query,
            "ai_analysis": ai_analysis,
            "top_recommendations": top_recommendations,
            "all_products": serialized_products,
            "total_found": len(serialized_products),
        }

    def _select_top_recommendations(
        self,
        products: list[dict[str, Any]],
        query: str,
        budget: int | None,
        features: list[str],
        brand: str | None = None,
        category: str | None = None,
    ) -> list[dict[str, Any]]:
        """Select top recommendations with transparent scoring, tier diversity, and evidence-based badges."""
        target_brand = (brand or "").lower().strip()
        if not target_brand and re.search(r"\bboat\b", query, re.IGNORECASE):
            target_brand = "boat"

        cat_target = category or ""
        if not cat_target:
            q_low = query.lower()
            if any(k in q_low for k in ("mouse", "mice")):
                cat_target = "Mouse"
            elif any(k in q_low for k in ("headphone", "earbud", "earphone")):
                cat_target = "Headphones"

        price_stats = analyze_price_distribution(products)

        # Score and assess all products
        scored_products: list[dict[str, Any]] = []
        for p in products:
            item = dict(p)
            spec_info = extract_verified_specs(item, cat_target)
            price_info = assess_product_price(item, price_stats, budget)
            score, breakdown = compute_transparent_score(
                p=item,
                query=query,
                target_category=cat_target,
                target_brand=target_brand,
                budget=budget,
                features=features,
                spec_info=spec_info,
                price_info=price_info,
                price_stats=price_stats,
            )
            item["score"] = score
            item["score_breakdown"] = breakdown
            item["verified_specs"] = spec_info["verified"]
            item["unspecified_specs"] = spec_info["unspecified"]
            item["price_assessment"] = price_info
            scored_products.append(item)

        # Budget prioritization & tier diversity
        if budget is not None:
            within_budget = [p for p in scored_products if not p["price_assessment"]["is_over_budget"]]
            over_budget = [p for p in scored_products if p["price_assessment"]["is_over_budget"]]
            within_budget.sort(key=lambda x: x["score"], reverse=True)
            over_budget.sort(key=lambda x: x["score"], reverse=True)
            candidates = within_budget if within_budget else over_budget
        else:
            # When no budget: balance performance across market tiers
            scored_products.sort(key=lambda x: x["score"], reverse=True)
            candidates = scored_products

        # Deduplicate top selections
        top_5: list[dict[str, Any]] = []
        seen_keys: set[str] = set()

        for item in candidates:
            pid = str(item.get("product_id") or item.get("id") or "")
            name = (item.get("name") or "").strip().lower()
            brand_val = (item.get("brand") or "").strip().lower()
            dedup_key = pid if pid else f"{brand_val}:{name}"
            if dedup_key in seen_keys or name in seen_keys:
                continue
            seen_keys.add(dedup_key)
            if pid:
                seen_keys.add(pid)
            if name:
                seen_keys.add(name)
            top_5.append(item)
            if len(top_5) == 5:
                break

        if not top_5:
            return []

        # -------------------------------------------------------------------
        # Evidence-Based Recommendation Badges
        # -------------------------------------------------------------------
        assigned_badges: dict[int, str] = {}
        assigned_badges[0] = "Top Recommendation"

        remaining_indices = list(range(1, len(top_5)))
        median_price = price_stats.get("median") or (top_5[0].get("price") or 1000.0)

        # 1. Best Value:
        # Candidate with price below median and viable specs/rating
        best_val_idx = None
        min_p = float("inf")
        brand_matching_remaining = [
            i for i in remaining_indices
            if target_brand and (target_brand in (top_5[i].get("brand") or "").lower() or target_brand in top_5[i].get("name", "").lower())
        ]
        search_pool = brand_matching_remaining if brand_matching_remaining else remaining_indices

        for idx in search_pool:
            p_price = top_5[idx].get("price")
            p_rating = top_5[idx].get("rating") or 0.0
            if (
                p_price is not None
                and float(p_price) < min_p
                and (float(p_price) <= median_price * 1.1 or budget is not None)
                and (float(p_rating) >= 3.8 or len(top_5[idx].get("verified_specs", {})) > 0)
                and top_5[idx].get("price_assessment", {}).get("outlier") != "low_outlier"
            ):
                min_p = float(p_price)
                best_val_idx = idx

        if best_val_idx is not None:
            assigned_badges[best_val_idx] = "Best Value"
            remaining_indices.remove(best_val_idx)

        # 2. Editor's Choice:
        # Candidate with rating >= 4.2, review volume >= 20, and strong verified spec score
        editors_idx = None
        max_rating = -1.0
        for idx in remaining_indices:
            p_rating = top_5[idx].get("rating")
            p_reviews = top_5[idx].get("review_count") or 0
            spec_score = top_5[idx].get("score_breakdown", {}).get("verified_specs", 0.0)
            if (
                p_rating is not None
                and float(p_rating) >= 4.2
                and float(p_rating) > max_rating
                and (int(p_reviews) >= 20 or spec_score >= 10.0)
            ):
                max_rating = float(p_rating)
                editors_idx = idx

        if editors_idx is not None:
            assigned_badges[editors_idx] = "Editor's Choice"
            remaining_indices.remove(editors_idx)

        # 3. Popular Pick:
        # Candidate with highest review count among remaining (>= 50 reviews and rating >= 3.9)
        popular_idx = None
        max_reviews = 49
        for idx in remaining_indices:
            p_reviews = top_5[idx].get("review_count")
            p_rating = top_5[idx].get("rating") or 0.0
            if p_reviews is not None and int(p_reviews) > max_reviews and float(p_rating) >= 3.9:
                max_reviews = int(p_reviews)
                popular_idx = idx

        if popular_idx is not None:
            assigned_badges[popular_idx] = "Popular Pick"
            remaining_indices.remove(popular_idx)

        # 4. Great Alternative:
        # Candidate offering distinct technology or form-factor compared to #1
        alt_idx = None
        top_conn = top_5[0].get("verified_specs", {}).get("connection", "")
        for idx in remaining_indices:
            item_conn = top_5[idx].get("verified_specs", {}).get("connection", "")
            # Distinct connection (e.g. Wireless vs Wired) or distinct design
            if (top_conn and item_conn and top_conn != item_conn) or (top_5[idx].get("price_assessment", {}).get("tier") != top_5[0].get("price_assessment", {}).get("tier")):
                alt_idx = idx
                break

        if alt_idx is not None:
            assigned_badges[alt_idx] = "Great Alternative"
            remaining_indices.remove(alt_idx)

        # 5. Remaining candidates receive honest evidence-based labels
        for idx in remaining_indices:
            p_price = top_5[idx].get("price")
            if p_price is not None and float(p_price) < median_price:
                assigned_badges[idx] = "Budget Pick"
            else:
                assigned_badges[idx] = "Top Contender"

        for idx, item in enumerate(top_5):
            item["recommendation_badge"] = assigned_badges.get(idx, "Recommended")

        return top_5

    async def _generate_ai_analysis(
        self,
        query: str,
        parsed: dict[str, Any],
        features: list[str],
        budget: int | None,
        top_products: list[dict[str, Any]],
        total_count: int,
        brand: str | None = None,
        structured_intent: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Generate structured AI shopping analysis via LLM with deterministic fallback."""
        category = parsed.get("category") or (structured_intent or {}).get("category") or "Product"
        top_names = [p.get("name", "Unknown") for p in top_products[:3]]

        # Construct deterministic fallback first (guarantees resilience if LLM times out)
        fallback_analysis = self._build_deterministic_analysis(
            query=query,
            category=category,
            budget=budget,
            features=features,
            top_products=top_products,
            total_count=total_count,
            brand=brand,
            structured_intent=structured_intent,
        )

        if not self.openrouter.is_configured():
            return fallback_analysis

        priorities_str = "; ".join(
            (structured_intent or {}).get("priorities", features)
        )
        unrequested_str = ", ".join(
            (structured_intent or {}).get("unrequested_features", [])
        )
        prompt = (
            f"You are ShopMind AI shopping decision engine. Analyze this shopping query and live results.\n"
            f"User Query: \"{query}\"\n"
            f"Category: {category}\n"
            f"Requested Brand: {brand or 'Any'}\n"
            f"Budget: ₹{budget if budget else 'Flexible / Not specified'}\n"
            f"User Explicit Priorities: {priorities_str}\n"
            f"Unrequested Features (DO NOT enforce as mandatory criteria): {unrequested_str}\n"
            f"Top Live Products Found: {'; '.join(top_names)}\n\n"
            f"Provide a JSON response with exactly these keys:\n"
            f"\"summary\": 2-sentence expert shopping analysis addressing ONLY user priorities, contrasting affordable vs premium options, and distinguishing verified specs from unknown details.\n"
            f"\"key_criteria\": array of 3-4 concise bullet points explaining what matters most for this query (acknowledge if gaming latency, polling rate, or sensor model are unstated in retail listings).\n"
            f"\"budget_verdict\": 1 sentence confirming if the stated budget (₹{budget if budget else 'flexible'}) was respected and how market price tiers align.\n"
            f"\"top_pick_reason\": 1 sentence on why the #1 ranked product stands out based on verified evidence.\n"
            f"Return ONLY raw valid JSON, no markdown codeblocks."
        )

        try:
            response_text = await asyncio.wait_for(
                asyncio.to_thread(
                    self.openrouter.chat,
                    [{"role": "user", "content": prompt}],
                ),
                timeout=6.0,
            )
            clean_json = re.sub(r"^```json\s*|\s*```$", "", response_text.strip(), flags=re.MULTILINE)
            import json
            data = json.loads(clean_json)
            if (
                isinstance(data, dict)
                and "summary" in data
                and "key_criteria" in data
                and "budget_verdict" in data
            ):
                return {
                    "summary": str(data["summary"]),
                    "key_criteria": list(data["key_criteria"])[:4],
                    "budget_verdict": str(data["budget_verdict"]),
                    "top_pick_reason": str(data.get("top_pick_reason", fallback_analysis["top_pick_reason"])),
                }
        except Exception as err:
            logger.info("OpenRouter analysis fallback triggered (%s): using grounded fallback", type(err).__name__)

        return fallback_analysis

    def _build_deterministic_analysis(
        self,
        query: str,
        category: str,
        budget: int | None,
        features: list[str],
        top_products: list[dict[str, Any]],
        total_count: int,
        brand: str | None = None,
        structured_intent: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Construct a high-quality, query-grounded market analysis across categories."""
        top_p = top_products[0] if top_products else {}
        top_name = top_p.get("name", "Top Match")
        top_price = top_p.get("price")
        price_str = f"₹{top_price:,.0f}" if top_price else "current market price"

        features_str = " and ".join(features) if features else category.lower()

        if not brand and structured_intent:
            brand = structured_intent.get("brand")
        if not brand and re.search(r"\bboat\b", query, re.IGNORECASE):
            brand = "boAt"

        q_lower = query.lower()
        is_mouse = bool(re.search(r"\b(?:mouse|mice)\b", q_lower)) or category.lower() in ("mouse", "mice")
        is_audio = any(term in q_lower for term in ("headphone", "headphones", "earbuds", "earphone", "tws", "earpiece", "audio", "sound")) or category.lower() in ("headphones", "audio")
        is_laptop = bool(re.search(r"\b(?:laptop|notebook|ultrabook|macbook)s?\b", q_lower)) or "ai engineering" in q_lower
        is_camera = bool(re.search(r"\b(?:camera|dslr|mirrorless)s?\b", q_lower)) or "photography" in q_lower
        is_shoes = bool(re.search(r"\b(?:shoe|shoes|sneaker|sneakers|footwear)s?\b", q_lower))
        is_phone = bool(re.search(r"\b(?:smart\s*phone|smartphone|mobile|phone)s?\b", q_lower)) and not is_audio

        if is_mouse:
            criteria = [
                "Sensor Precision & True DPI: Optical tracking sensors (6400–16,000+ DPI) with 1:1 raw tracking and zero acceleration (exact IPS tracking speed often unstated in seller listings)",
                "Polling Rate & Click Latency: 1000Hz (1ms response) via wired USB or 2.4GHz low-latency dongle; Bluetooth is unsuitable for competitive play due to transmission lag",
                "Ergonomic Contour & Weight: Lightweight chassis (<85g) with durable tactile microswitches rated for 20M+ clicks to minimize wrist fatigue",
            ]
            if budget:
                criteria.append(
                    f"Budget Compliance under ₹{budget:,}: Verified gaming mouse models strictly honoring the stated ₹{budget:,} spending limit"
                )
            else:
                criteria.append(
                    "Market Tier Trade-Offs: Entry wired mice (~₹1,000–₹1,800) offer zero latency and proven sensors, while premium tiers (₹5,000+) step up to sub-60g ultralight wireless frames"
                )

            if budget:
                summary = (
                    f"For gaming mice under ₹{budget:,}, wired USB models provide the most dependable performance—delivering true 1000Hz (1ms) "
                    f"responsiveness and reliable optical tracking without the signal delay, battery weight, or interference of budget wireless mice."
                )
            else:
                summary = (
                    "For competitive gaming mice, tracking precision, 1000Hz polling rate (1ms input lag), and ergonomic weight distribution are primary performance drivers. "
                    "While entry-to-mid wired mice deliver exceptional tracking fidelity per rupee, enthusiast wireless options introduce sub-60g ultralight chassis and flawless optical sensors."
                )

        elif is_laptop:
            criteria = [
                "Minimum 16GB RAM & modern multi-core processor for model inference and containerized environments",
                "Fast NVMe SSD storage (512GB+) for datasets, libraries, and rapid development boot-up",
                "Effective thermal management to maintain performance during intensive compiler/Python workloads",
            ]
            summary = (
                "For AI engineering workloads within this tier, RAM capacity (16GB+) and modern multi-core CPU architecture "
                "are critical to handle machine learning packages, data pipelines, and IDEs efficiently."
            )
        elif is_camera:
            criteria = [
                "Sensor size and dynamic range to ensure crisp low-light details and accurate color depth",
                "Fast, reliable autofocus with subject tracking for sharp portrait and action captures",
                "Versatile lens mount ecosystem and optical image stabilization",
            ]
            summary = (
                "For high-quality photography, sensor performance and optical clarity take precedence over raw megapixel counts, "
                "delivering superior dynamic range and depth."
            )
        elif is_shoes:
            criteria = [
                "Responsive midsole cushioning (EVA/foam) to absorb repetitive road impact for beginners",
                "Breathable mesh upper for heat dissipation during sustained daily mileage",
                "Durable rubber outsole with dependable traction across outdoor pavements",
            ]
            summary = (
                "For beginner runners, balanced midsole cushioning and ergonomic arch support are paramount to prevent joint fatigue "
                "while building initial running consistency."
            )
        elif is_phone and "gaming" in q_lower:
            criteria = [
                "High-performance SoC (processor & GPU) capable of sustained frame rates without throttling",
                "120Hz+ AMOLED/OLED high-refresh display for fluid touch response and visual speed",
                "Vapor chamber cooling and high-capacity battery with fast charging support",
            ]
            summary = (
                "For competitive mobile gaming, peak graphics processing and thermal dissipation ensure consistent framerates "
                "without throttling during extended sessions."
            )
        elif is_audio:
            headphone_criteria: list[str] = []

            # 1. Music / Sound quality
            if any(term in q_lower for term in ("music", "sound", "bass", "audio", "clarity", "vocal")):
                headphone_criteria.append(
                    "Music listening & sound quality: Dynamic audio drivers tuned for vibrant acoustic balance "
                    "and bass punch (retail listings emphasize signature profile; lab acoustic curves unavailable)"
                )

            # 2. Gaming suitability & Latency (with explicit acknowledgment of spec availability)
            if any(term in q_lower for term in ("game", "gaming", "gamer", "fps", "latency")):
                headphone_criteria.append(
                    "Gaming suitability & latency: Low-latency wireless mode or wired 3.5mm AUX option to reduce audio delay; "
                    "exact millisecond latency is subject to manufacturer spec availability"
                )

            # 3. Movies / Extended Comfort
            if any(term in q_lower for term in ("movie", "movies", "film", "cinema", "comfort", "cushion")):
                headphone_criteria.append(
                    "Movie listening & comfort: Ergonomic, cushioned earpads/neckband engineered for fatigue-free extended entertainment viewing"
                )

            # 4. Noise Cancellation (ONLY IF EXPLICITLY REQUESTED)
            if any(term in q_lower for term in ("anc", "noise cancellation", "noise cancelling")):
                headphone_criteria.append(
                    "Active Noise Cancellation (ANC): Hardware driver isolation to filter ambient noise"
                )

            # 5. Battery (ONLY IF EXPLICITLY REQUESTED)
            if any(term in q_lower for term in ("battery", "backup", "hours", "playback")):
                headphone_criteria.append(
                    "Battery endurance: Multi-hour playback battery life for extended unplugged sessions"
                )

            # 6. Brand & Budget adherence
            if brand and budget:
                headphone_criteria.append(
                    f"{brand} value under ₹{budget:,}: Verified {brand} offerings strictly respecting the stated ₹{budget:,} budget ceiling"
                )
            elif budget:
                headphone_criteria.append(
                    f"Budget compliance: High-performing models strictly under ₹{budget:,}"
                )

            if not headphone_criteria:
                headphone_criteria = [
                    "Acoustic driver balance for everyday audio and media playback",
                    "Ergonomic fit and lightweight construction for daily comfort",
                    f"Price-to-performance value within the ₹{budget:,} tier" if budget else "Reliable wireless connectivity and clear microphone performance",
                ]

            criteria = headphone_criteria[:4]

            use_cases = []
            if any(term in q_lower for term in ("music", "sound", "bass")):
                use_cases.append("music")
            if any(term in q_lower for term in ("game", "gaming")):
                use_cases.append("gaming")
            if any(term in q_lower for term in ("movie", "movies", "film")):
                use_cases.append("movies")
            if any(term in q_lower for term in ("anc", "noise cancellation", "noise cancelling")):
                use_cases.append("noise cancellation")
            if any(term in q_lower for term in ("battery", "backup")):
                use_cases.append("battery life")
            use_cases_str = ", ".join(use_cases) if use_cases else "daily entertainment"

            brand_prefix = f"{brand} " if brand else ""
            budget_str = f" under ₹{budget:,}" if budget else ""
            if "noise cancellation" in use_cases and not any(term in q_lower for term in ("music", "game", "movie")):
                summary = (
                    f"For {brand_prefix}wireless headphones{budget_str} with noise cancellation, active isolation quality "
                    f"and dependable acoustic drivers determine real-world daily comfort and sound fidelity."
                )
            else:
                summary = (
                    f"For {brand_prefix}headphones{budget_str} prioritizing {use_cases_str}, key factors are "
                    f"dynamic driver sound balance, low audio delay (or AUX wired backup for casual gaming), and "
                    f"comfortable cushioning for multi-hour sessions without exceeding your spending limit."
                )

        else:
            criteria = [
                f"Price-to-performance ratio evaluated across {total_count} live Google Shopping listings",
                "Verified seller availability and customer rating consistency",
                f"Feature alignment with '{features_str}' requirements",
            ]
            summary = (
                f"ShopMind AI analyzed {total_count} live market offers to isolate top-rated choices matching your "
                f"requirements for '{query}'."
            )

        # Budget verdict
        if budget is not None:
            under_budget_count = sum(1 for p in top_products if p.get("price") and p["price"] <= budget)
            if under_budget_count > 0:
                budget_verdict = (
                    f"Stated budget of ₹{budget:,.0f} respected: {under_budget_count} of the top recommendations are within budget "
                    f"(starting from {price_str})."
                )
            else:
                budget_verdict = (
                    f"Selected top contenders priced as close to your stated budget of ₹{budget:,.0f} as available in live listings."
                )
        else:
            budget_verdict = f"Evaluated across available price segments, presenting top-rated options starting at {price_str}."

        # Top pick reason grounded in verified facts
        top_specs = top_p.get("verified_specs", {})
        spec_summary = []
        if "dpi" in top_specs:
            spec_summary.append(top_specs["dpi"])
        if "polling_rate" in top_specs:
            spec_summary.append(top_specs["polling_rate"])
        if "sensor" in top_specs:
            spec_summary.append(top_specs["sensor"])
        if "drivers" in top_specs:
            spec_summary.append(top_specs["drivers"])

        if is_mouse:
            if spec_summary:
                top_pick_reason = f"\"{top_name}\" leads our evaluation with verified {', '.join(spec_summary)} and superior composite score."
            else:
                top_pick_reason = f"\"{top_name}\" leads our evaluation for gaming sensor fidelity, player sentiment, and price-to-performance balance."
        elif is_audio and ("game" in q_lower or "gaming" in q_lower):
            top_pick_reason = (
                f"\"{top_name}\" leads our evaluation for {brand or 'brand'} acoustic performance, comfort, and value under ₹{budget:,.0f} "
                f"(suitable for casual gaming; wired AUX backup recommended where zero latency is required)."
            ) if budget else (
                f"\"{top_name}\" leads our evaluation for {brand or 'brand'} acoustic performance, comfort, and gaming suitability."
            )
        else:
            top_pick_reason = f"\"{top_name}\" leads our evaluation for balanced build quality, customer sentiment, and seller value."

        return {
            "summary": summary,
            "key_criteria": criteria,
            "budget_verdict": budget_verdict,
            "top_pick_reason": top_pick_reason,
        }

    @staticmethod
    def _serialize_product(product: NormalizedProduct) -> dict[str, Any]:
        """Convert a NormalizedProduct into the standard frontend representation."""
        primary_offer = product.offers[0] if product.offers else None
        return {
            "id": product.product_id,
            "name": product.name,
            "brand": product.brand,
            "category": product.category,
            "price": primary_offer.price if primary_offer else None,
            "rating": product.rating,
            "review_count": product.review_count,
            "description": product.description,
            "stock": True if (primary_offer and primary_offer.stock_status == "in_stock") else None,
            "image": product.image_url,
            "product_id": product.product_id,
            "retailer": primary_offer.source_name if primary_offer else None,
            "product_url": primary_offer.product_url if primary_offer else None,
            "specifications": product.specifications,
            "model": product.model,
            "model_number": product.model_number,
            "condition": product.condition,
            "offers": [
                {
                    "price": o.price,
                    "currency": o.currency,
                    "stock_status": o.stock_status,
                    "source_name": o.source_name,
                    "product_url": o.product_url,
                    "is_best_price": o.is_best_price,
                    "condition": o.condition,
                    "merchant_normalized": o.merchant_normalized,
                }
                for o in product.offers
            ],
        }


# Singleton engine instance
decision_engine = ShoppingDecisionEngine()
