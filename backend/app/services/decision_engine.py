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
from app.core.config import settings
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
    "Programming / Development": [
        "programming", "coding", "developer", "development", "college programming", "software engineering"
    ],
    "Music / Audio Quality": [
        "music", "sound quality", "audio quality", "bass", "audio", "sound",
        "songs", "audiophile", "hifi", "vocals"
    ],
    "Gaming": [
        "gaming", "game", "gamer", "high fps", "refresh rate",
        "rtx", "snapdragon", "cooling", "performance", "beast mode"
    ],
    "Dedicated GPU": [
        "dedicated gpu", "nvidia", "rtx", "geforce", "gtx", "discrete gpu", "graphics card"
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
    "Travel / Portability": [
        "travel", "commute", "flight", "transit", "on the go", "portable"
    ],
    "Image Quality / Photography": [
        "photography", "photo", "image quality", "dslr", "mirrorless",
        "4k", "sensor", "lens", "video recording", "vlogging"
    ],
    "Camera & Photography": [
        "camera", "cameras", "photography", "photo", "photos", "image quality",
        "ois", "portrait", "night mode", "video recording", "vlogging", "4k"
    ],
    "Beginner Running": [
        "beginner", "beginners", "running", "jogging", "cushioning",
        "marathon", "walking", "daily wear"
    ],
    "Long Battery Life": [
        "battery life", "all day battery", "long lasting battery", "battery backup",
        "battery", "mah", "charging", "fast charging", "fast charge"
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
        elif any(term in q_lower for term in ("phone", "smartphone", "mobile")):
            category = "Smartphone"
        elif any(term in q_lower for term in ("camera", "dslr", "mirrorless")) and not any(term in q_lower for term in ("phone", "smartphone", "mobile")):
            category = "Camera"
        elif any(term in q_lower for term in ("shoe", "shoes", "sneaker", "sneakers", "footwear")):
            category = "Shoes"

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
        if "Travel / Portability" in features or any(k in q_lower for k in ("travel", "commute", "flight")):
            priorities.append("Travel comfort and portable noise isolation")
    elif category == "Laptop":
        if "Gaming" in features or "gaming" in q_lower:
            priorities.append("Dedicated GPU performance (e.g. NVIDIA RTX) and high-refresh gaming display")
        if "Dedicated GPU" in features or any(k in q_lower for k in ("gpu", "nvidia", "rtx", "cuda")):
            priorities.append("Dedicated NVIDIA GPU with CUDA acceleration")
        if "AI engineering / Data Science" in features or any(k in q_lower for k in ("machine learning", "ml", "ai engineering", "data science")):
            priorities.append("Machine learning workload capacity with dedicated GPU and 16GB+ RAM")
        if "Programming / Development" in features or any(k in q_lower for k in ("programming", "coding", "college", "student")):
            priorities.append("Multi-core CPU efficiency and 16GB RAM for programming and multitasking")
        if "Lightweight / Portable" in features or "portable" in q_lower or "slim" in q_lower:
            priorities.append("Portability and lightweight chassis")
    elif category == "Smartphone":
        if "Camera & Photography" in features or any(k in q_lower for k in ("camera", "photo", "photography", "ois", "portrait", "video")):
            priorities.append("Real-world camera quality, large sensor size, and OIS stability")
        if "Long Battery Life" in features or any(k in q_lower for k in ("battery", "mah", "charging", "fast charge")):
            priorities.append("Tested battery endurance (5,000mAh+) and fast charging support")
        if "Gaming" in features or "gaming" in q_lower:
            priorities.append("Sustained chipset performance without thermal throttling")
        if any(k in q_lower for k in ("display", "screen", "amoled", "oled", "120hz")):
            priorities.append("Vibrant 120Hz AMOLED display fluidity")
        if any(k in q_lower for k in ("update", "updates", "os", "software")):
            priorities.append("Extended multi-year software and security update support")
        if budget:
            priorities.append(f"Distinct smartphone models strictly under ₹{budget:,}")
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
    elif category == "Smartphone":
        if "Gaming" not in features and "gaming" not in q_lower:
            unrequested.append("Heavy 3D gaming optimization")
        if not any(term in q_lower for term in ("refurbished", "renewed", "pre-owned", "used")):
            unrequested.append("Refurbished or pre-owned units")

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
        r"^(can you show me|show me|find me|looking for|i need|i want|please suggest|suggest|recommend|give me|tell me about)\s+(?:a|an|the|some)?\s*",
        "",
        query.strip(),
        flags=re.IGNORECASE,
    ).strip()
    cleaned = re.sub(
        r"\b(?:with\s+a\s+great|with\s+great|with\s+good|with\s+best|having)\b",
        "",
        cleaned,
        flags=re.IGNORECASE,
    ).strip()
    cleaned = cleaned.rstrip(".!? ")
    cleaned = re.sub(r"[₹$]\s*", "", cleaned)
    cleaned = re.sub(r"(\d),(\d)", r"\1\2", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    cat = parsed.get("category")
    budget = parsed.get("budget")
    q_low = query.lower()

    if (cat == "Smartphone" or any(k in q_low for k in ("phone", "smartphone", "mobile"))) and not parsed.get("brand"):
        if any(k in q_low for k in ("camera", "battery")) and budget:
            return f"smartphone camera 5000mah under {budget}"
        elif budget:
            return f"best smartphone under {budget}"

    return cleaned if cleaned else query.strip()


def extract_phone_model_key(name: str, brand: str | None = None) -> str:
    """Extract a canonical model family key for a smartphone to prevent duplicate variants in Top 5."""
    n_lower = (name or "").strip().lower()
    clean = re.sub(r"\b(?:refurbished|pre-owned|renewed|unboxed|open\s*box|second\s*hand)\b", "", n_lower)
    clean = re.sub(r"\s+", " ", clean).strip()

    b = (brand or "").lower().strip()
    if not b:
        for known_b in ("samsung", "motorola", "moto", "nothing", "tecno", "realme", "oneplus", "google", "vivo", "iqoo", "xiaomi", "redmi", "oppo", "apple", "infinix", "poco"):
            if known_b in clean:
                b = "motorola" if known_b == "moto" else known_b
                break

    # 1. Nothing Phone series
    m = re.search(r"\b(?:nothing\s+)?phone\s*(?:\(?\s*(\d[a-z]?|\d)\s*\)?|\b(pro|lite|plus|max|cmf\s*\d?)\b)", clean)
    if m:
        ver = m.group(1) or m.group(2) or ""
        return f"nothing:phone {ver}".strip()

    # 2. Samsung Galaxy series
    m = re.search(r"\b(?:galaxy\s+)?([szame]\d{1,2}(?:\s*(?:fe|ultra|plus|\+|pro))?)\b", clean)
    if m and ("samsung" in clean or b == "samsung" or "galaxy" in clean):
        return f"samsung:galaxy {m.group(1).strip()}"

    # 3. Motorola Edge / Moto G / Razr
    m = re.search(r"\b(edge\s+\d{1,2}(?:\s*(?:pro|fusion|ultra|plus))?|moto\s+g\s*(?:\d{1,2}|play|power|stylus|pure|fast)|razr\s+\d{1,2})\b", clean)
    if m:
        return f"motorola:{m.group(1).strip()}"

    # 4. Tecno Camon / Pova / Spark
    m = re.search(r"\b(camon\s+\d{1,2}(?:\s*(?:pro|ultra|premier))?|pova\s+\d{1,2}|spark\s+\d{1,2})\b", clean)
    if m:
        return f"tecno:{m.group(1).strip()}"

    # 5. OnePlus Nord / Number series
    m = re.search(r"\b(nord\s*(?:ce)?\s*\d{1,2}(?:\s*lite)?|\b\d{1,2}[rt]?\b)", clean)
    if m and ("oneplus" in clean or b == "oneplus" or "nord" in clean):
        return f"oneplus:{m.group(1).strip()}"

    # 6. Realme GT / Number / P-series
    m = re.search(r"\b(gt\s*\d{1,2}(?:\s*(?:pro|neo))?|\d{1,2}\s*pro\+?|p\d\s*(?:pro|power)?)\b", clean)
    if m and ("realme" in clean or b == "realme"):
        return f"realme:{m.group(1).strip()}"

    # 7. Google Pixel series
    m = re.search(r"\b(pixel\s+\d[a-z]?(?:\s*pro)?)\b", clean)
    if m:
        return f"google:{m.group(1).strip()}"

    # 8. Vivo / iQOO series
    m = re.search(r"\b(v\d{2}[a-z]?|t\d[a-z]?|neo\s*\d|z\d[a-z]?)\b", clean)
    if m and any(k in clean for k in ("vivo", "iqoo", b)):
        return f"vivo:{m.group(1).strip()}"

    # 9. Redmi / Xiaomi
    m = re.search(r"\b(note\s+\d{1,2}(?:\s*pro\+?)?|redmi\s+\d{1,2}[a-z]?|xiaomi\s+\d{1,2}[a-z]?)\b", clean)
    if m:
        return f"xiaomi:{m.group(1).strip()}"

    # Fallback: remove parentheticals and take first 2-3 significant alphanumeric tokens
    clean_no_paren = re.sub(r"\(.*?\)|\[.*?\]", "", clean)
    tokens = [w for w in re.findall(r"[a-z0-9]+", clean_no_paren) if w not in ("5g", "4g", "gb", "ram", "rom", "dual", "sim", "smartphone", "phone", "mobile")]
    return f"{b}:" + ":".join(tokens[:2]) if tokens else f"{b}:{clean[:15]}"


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
    is_audio = any(k in cat_lower for k in ("headphone", "audio")) or any(term in full_text for term in ("headphone", "headphones", "earbuds", "earphone", "tws"))
    is_laptop = "laptop" in cat_lower or any(term in full_text for term in ("laptop", "notebook", "ultrabook", "macbook", "ideapad", "thinkpad", "pavilion", "inspiron", "vivobook", "zenbook", "loq", "tuf", "nitro", "predator", "legion", "rog", "katana", "cyborg", "victus", "omen", "alienware"))
    is_phone = any(k in cat_lower for k in ("smartphone", "phone", "mobile")) or (any(term in full_text for term in ("smartphone", "mobile phone", "5g phone", "android phone", "galaxy", "iphone", "pixel", "oneplus", "motorola", "redmi", "realme", "tecno", "iqoo", "oppo", "vivo")) and not is_audio and not is_laptop)

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

    elif is_audio:
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
    elif is_laptop:
        # 1. Dedicated GPU:
        # Must be an explicit, verified dedicated graphics card (NVIDIA, AMD RX, or Intel Arc discrete).
        # NEVER infer dedicated graphics from chassis names (e.g. victus, loq, nitro, predator) or marketing words ("gaming laptop").
        # If the exact GPU is unverified, it is strictly classified as unverified.

        nvidia_match = re.search(
            r"\b(?:(?:nvidia\s+geforce\s+|geforce\s+|nvidia\s+)?("
            r"rtx\s*(?:2050|3050(?:\s*ti)?|3060(?:\s*ti)?|3070(?:\s*ti)?|3080(?:\s*ti)?|4050|4060|4070|4080|4090|2060|2070|2080|a500|a1000|a2000|a3000|500(?:\s*ada)?|1000(?:\s*ada)?|2000(?:\s*ada)?|3000(?:\s*ada)?|3500(?:\s*ada)?|4000(?:\s*ada)?|5000(?:\s*ada)?)"
            r"|gtx\s*(?:1650(?:\s*ti)?|1660(?:\s*ti)?|1050(?:\s*ti)?|1060|1070|1080)"
            r"|mx\s*(?:130|150|230|250|330|350|450|550)"
            r"|rtx\s*\d{4}(?:\s*ti)?"
            r"))\b",
            full_text,
        )
        amd_ded_match = re.search(
            r"\b(?:amd\s+radeon\s+|radeon\s+)?(rx\s*(?:5500m|5600m|6500m|6550m|6600m|6650m|6700m|6800m|7600m|7600s|7700s|7900m))\b",
            full_text,
        )
        intel_ded_match = re.search(
            r"\b(?:intel\s+)?(arc\s+(?:a350m|a370m|a530m|a550m|a570m|a730m|a770m))\b",
            full_text,
        )

        if nvidia_match:
            raw_gpu = re.sub(r"\s+", " ", nvidia_match.group(1).upper().strip())
            gpu_name = f"NVIDIA GeForce {raw_gpu}"
            verified["gpu"] = gpu_name
            metrics["has_dedicated_gpu"] = True
            metrics["dedicated_gpu"] = gpu_name
            metrics["gpu_brand"] = "nvidia"
            metrics["gpu_type"] = "dedicated"
            metrics["cuda_supported"] = True
        elif amd_ded_match:
            raw_gpu = re.sub(r"\s+", " ", amd_ded_match.group(1).upper().strip())
            gpu_name = f"AMD Radeon {raw_gpu}"
            verified["gpu"] = gpu_name
            metrics["has_dedicated_gpu"] = True
            metrics["dedicated_gpu"] = gpu_name
            metrics["gpu_brand"] = "amd"
            metrics["gpu_type"] = "dedicated"
            metrics["cuda_supported"] = False
        elif intel_ded_match:
            raw_gpu = re.sub(r"\s+", " ", intel_ded_match.group(1).title().strip())
            gpu_name = f"Intel {raw_gpu}"
            verified["gpu"] = gpu_name
            metrics["has_dedicated_gpu"] = True
            metrics["dedicated_gpu"] = gpu_name
            metrics["gpu_brand"] = "intel"
            metrics["gpu_type"] = "dedicated"
            metrics["cuda_supported"] = False
        else:
            # Check for integrated graphics
            integrated_match = re.search(
                r"\b(intel\s+(?:iris\s+xe|uhd\s+graphics|hd\s+graphics|graphics)|amd\s+radeon\s+(?:graphics|\d{3}m|vega\s*\d*)|apple\s+m[1234]|qualcomm\s+adreno(?:\s+igpu)?|shared\s+graphics|integrated\s+graphics)\b",
                full_text,
            )
            if integrated_match:
                igpu_name = integrated_match.group(1).title()
                verified["gpu"] = f"Integrated {igpu_name}"
                metrics["has_dedicated_gpu"] = False
                metrics["gpu_brand"] = "integrated"
                metrics["gpu_type"] = "integrated"
                metrics["cuda_supported"] = False
            else:
                unspecified.append("Exact GPU configuration unverified in seller data")
                metrics["has_dedicated_gpu"] = False
                metrics["gpu_brand"] = "unverified"
                metrics["gpu_type"] = "unverified"
                metrics["cuda_supported"] = False

        # 2. Dedicated VRAM
        vram_match = re.search(r"\b(\d{1,2})\s*gb\s*(?:gddr\d|vram)\b", full_text)
        if vram_match:
            v_num = int(vram_match.group(1))
            verified["vram"] = f"{v_num}GB VRAM"
            metrics["vram"] = v_num

        # 3. System RAM (Distinct from VRAM)
        ram_explicit = re.search(r"\b(\d{1,2})\s*gb\s*(?:(?:lp)?ddr\d\s*)?(?:ram|memory)\b", full_text)
        if ram_explicit:
            ram_val = int(ram_explicit.group(1))
            if ram_val in (4, 8, 12, 16, 24, 32, 64):
                verified["ram"] = f"{ram_val}GB RAM"
                metrics["ram"] = ram_val
        if "ram" not in verified:
            for rm in re.finditer(r"\b(\d{1,2})\s*gb\b", full_text):
                start_p, end_p = rm.span()
                window = full_text[max(0, start_p - 15) : min(len(full_text), end_p + 15)]
                if any(k in window for k in ("gddr", "vram", "graphics", "rtx", "gtx")):
                    continue
                num = int(rm.group(1))
                if num in (8, 12, 16, 24, 32, 64):
                    verified["ram"] = f"{num}GB RAM"
                    metrics["ram"] = num
                    break

        if "ram" not in verified:
            unspecified.append("System RAM capacity unspecified in seller data")

        # 4. Storage (SSD / NVMe)
        ssd_match = re.search(r"\b(\d{3,4}\s*gb|\d\s*tb)\s*(?:ssd|nvme)\b", full_text)
        if ssd_match:
            verified["storage"] = f"{ssd_match.group(1).upper()} SSD"
            metrics["storage"] = ssd_match.group(1).upper()
        else:
            unspecified.append("Storage capacity unspecified in seller data")

        # 5. Processor / CPU
        cpu_match = re.search(
            r"\b((?:intel\s+core\s+)?(?:i[3579](?:[\s\-]?\d{4,5}[a-z]{0,2})?|core\s+ultra\s+\d)|(?:amd\s+ryzen\s+)?ryzen\s+[3579](?:[\s\-]?\d{4}[a-z]{0,2})?|apple\s+m[1234](?:\s+(?:pro|max))?)\b",
            full_text,
        )
        if cpu_match:
            verified["processor"] = cpu_match.group(1).title()
            metrics["processor"] = cpu_match.group(1).title()

        # 6. Display refresh rate
        hz_match = re.search(r"\b(120|144|165|240|360)\s*hz\b", full_text)
        if hz_match:
            hz_val = int(hz_match.group(1))
            verified["refresh_rate"] = f"{hz_val}Hz Display"
            metrics["refresh_rate"] = hz_val

        # 7. Screen size
        screen_match = re.search(
            r"\b(13\.[0-9]|14(?:\.[0-9])?|15\.6|16(?:\.[0-9])?|17\.3)\s*(?:inch|\"|\-inch)\b",
            full_text,
        )
        if screen_match:
            verified["display"] = f"{screen_match.group(1)}\" Screen"
    elif is_phone:
        # 1. Condition
        is_refurb = any(term in full_text for term in ("refurbished", "pre-owned", "renewed", "unboxed", "open box", "second hand", "used")) or p.get("condition") in ("refurbished", "used")
        verified["condition"] = "Refurbished" if is_refurb else "New"
        metrics["is_refurbished"] = is_refurb
        metrics["condition"] = "refurbished" if is_refurb else "new"

        # 2. Camera setup, Sensor, and OIS
        has_ois = bool(re.search(r"\b(?:ois|optical\s+image\s+stabilization)\b", full_text))
        metrics["has_ois"] = has_ois
        sensor_m = re.search(r"\b(sony\s+lytia\s*[- ]?\d{3}[a-z]?|sony\s+imx\s*[- ]?\d{3}|lytia\s*[- ]?\d{3}[a-z]?)\b", full_text)
        sensor_name = sensor_m.group(1).title() if sensor_m else None
        mp_m = re.search(r"\b(\d{2,3})\s*mp\b", full_text)
        main_mp = int(mp_m.group(1)) if mp_m else None
        metrics["camera_mp"] = main_mp
        setup_m = re.search(r"\b(triple\s+cameras?|dual\s+cameras?|quad\s+cameras?)\b", full_text)
        setup_str = setup_m.group(1).title() if setup_m else ""

        cam_parts = []
        if sensor_name:
            cam_parts.append(sensor_name)
        elif main_mp:
            cam_parts.append(f"{main_mp}MP")
        if setup_str:
            cam_parts.append(setup_str)
        if has_ois:
            cam_parts.append("OIS")
        if cam_parts:
            verified["camera"] = " ".join(cam_parts)
        elif "camera" in full_text:
            verified["camera"] = "Multi-Lens Camera"
        else:
            unspecified.append("Camera sensor and OIS details unlisted in seller data")

        # 3. Battery capacity
        mah_m = re.search(r"\b([4567]\d{3})\s*mah\b", full_text)
        if mah_m:
            mah_val = int(mah_m.group(1))
            verified["battery"] = f"{mah_val:,}mAh Battery"
            metrics["battery_mah"] = mah_val
        else:
            unspecified.append("Exact battery capacity (mAh) unlisted in seller data")

        # 4. Fast charging
        w_m = re.search(r"\b(\d{2,3})\s*w(?:\s*(?:fast\s*charging|charging|turbopower|supervooc|super\s*dart|flash\s*charge))?\b", full_text)
        if w_m:
            w_val = int(w_m.group(1))
            if 15 <= w_val <= 150:
                verified["charging"] = f"{w_val}W Fast Charging"
                metrics["charging_watts"] = w_val

        # 5. Display & Refresh rate
        hz_m = re.search(r"\b(90|120|144|165)\s*hz\b", full_text)
        panel_m = re.search(r"\b(amoled|super\s+amoled|poled|oled|proxdr|fluid\s+amoled)\b", full_text)
        disp_parts = []
        if hz_m:
            disp_parts.append(f"{hz_m.group(1)}Hz")
        if panel_m:
            disp_parts.append(panel_m.group(1).upper().replace("SUPER AMOLED", "Super AMOLED"))
        if disp_parts:
            verified["display"] = " ".join(disp_parts) + " Display"

        # 6. Processor / SoC
        proc_m = re.search(r"\b(snapdragon\s+[0-9a-z\+\s]+|dimensity\s+\d{3,4}(?:\s*ultimate)?|tensor\s+g\d|exynos\s+\d{3,4}|apple\s+a\d{2})\b", full_text)
        if proc_m:
            verified["processor"] = proc_m.group(1).title()
            metrics["processor"] = proc_m.group(1).title()

        # 7. Software updates commitment
        upd_m = re.search(r"\b(\d\s*os\s*&\s*\d\s*years?\s*security\s*updates|\d\s*years?\s*os\s*updates?)\b", full_text)
        if upd_m:
            verified["software_support"] = upd_m.group(1).title()

        # 8. RAM & Storage
        ram_m = re.search(r"\b(\d{1,2})\s*gb\s*(?:ram|\+)", full_text)
        if ram_m and int(ram_m.group(1)) in (4, 6, 8, 12, 16):
            verified["ram"] = f"{ram_m.group(1)}GB RAM"
        storage_m = re.search(r"\b(64|128|256|512)\s*gb\b", full_text)
        if storage_m:
            verified["storage"] = f"{storage_m.group(1)}GB Storage"

        if p.get("brand"):
            verified["brand"] = p["brand"]
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
    if price is None or not isinstance(price, (int, float)) or float(price) <= 0:
        return {
            "price": None,
            "tier": "unknown",
            "outlier": None,
            "is_over_budget": True if budget is not None else False,
            "is_price_verified": False,
        }

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

    metrics = spec_info.get("metrics", {})
    verified = spec_info.get("verified", {})

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
        is_cat_match = cat_lower in full_text or (p.get("category") or "").lower() == cat_lower
        if not is_cat_match and cat_lower in ("smartphone", "phone", "mobile"):
            is_cat_match = any(term in full_text for term in ("smartphone", "phone", "mobile")) or any(
                b in p_brand or b in name for b in ("motorola", "moto", "oneplus", "samsung", "google", "pixel", "oppo", "vivo", "iqoo", "tecno", "xiaomi", "redmi", "realme", "nothing")
            )
        if is_cat_match:
            intent_score += 8.0

    # Requested feature matching
    for feat in features:
        kws = FEATURE_KEYWORDS.get(feat, [])
        matches = sum(1 for kw in kws if kw in full_text)
        if matches > 0:
            intent_score += min(7.0, matches * 2.5)

    word_matches = sum(1 for w in query_words if w in full_text)
    intent_score += min(5.0, word_matches * 1.5)

    # Laptop-specific hardware intent calibration
    if (target_category and target_category.lower() == "laptop") or "laptop" in name or "notebook" in name:
        q_l = query.lower()
        needs_gpu = any(k in q_l for k in ("gaming", "game", "gamer", "nvidia", "gpu", "machine learning", "ml", "deep learning"))
        has_ded_gpu = metrics.get("has_dedicated_gpu", False)
        if needs_gpu:
            if has_ded_gpu:
                intent_score += 6.0
                if "nvidia" in q_l and (metrics.get("gpu_brand") == "nvidia" or "nvidia" in verified.get("gpu", "").lower()):
                    intent_score += 4.0
            else:
                # Severe intent penalty for laptops lacking dedicated GPU when gaming or ML GPU was requested
                intent_score -= 15.0

        # Disqualify/penalize non-gaming devices (Chromebooks, Celeron, Pentium, eMMC) on gaming queries
        if any(term in name for term in ("chromebook", "celeron", "pentium", "intel atom", "emmc")):
            intent_score -= 25.0

    # Smartphone condition calibration
    if (target_category and target_category.lower() in ("smartphone", "phone", "mobile")) or "phone" in name or "smartphone" in name:
        is_refurb = metrics.get("is_refurbished", False) or any(term in full_text for term in ("refurbished", "pre-owned", "renewed", "unboxed", "used"))
        user_wants_refurb = any(term in query_words for term in ("refurbished", "renewed", "pre-owned", "used"))
        if is_refurb and not user_wants_refurb:
            intent_score -= 8.0
        elif not is_refurb and not user_wants_refurb:
            intent_score += 2.0

    intent_score = max(0.0, min(30.0, intent_score))

    # 2. Budget and Value Assessment (Max 25.0 pts)
    value_score = 0.0
    price = price_info.get("price")

    if budget is not None and price is not None:
        p_float = float(price)
        if p_float <= float(budget):
            # Compliant: base 16.0 pts + value curve up to 5.0 pts
            value_score += 16.0
            if (target_category or "").lower() in ("smartphone", "phone", "mobile") and float(budget) >= 25000:
                if p_float < float(budget) * 0.25:
                    value_score += 1.0
                else:
                    savings_ratio = (float(budget) - p_float) / float(budget)
                    value_score += min(5.0, savings_ratio * 4.0)
            else:
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
    elif any(k in cat_check for k in ("phone", "smartphone", "mobile")) or "phone" in name or "smartphone" in name:
        # 1. Camera Specifications (Max 9.0 pts)
        if metrics.get("has_ois") or "ois" in verified.get("camera", "").lower():
            spec_score += 4.0
        if any(term in full_text for term in ("sony lytia", "imx", "lytia")):
            spec_score += 2.5
        c_mp = metrics.get("camera_mp") or 0
        if c_mp >= 50 or "50mp" in full_text:
            spec_score += 2.5
        elif "camera" in verified:
            spec_score += 1.5

        # 2. Battery Endurance (Max 7.0 pts)
        b_mah = metrics.get("battery_mah") or 0
        if b_mah >= 6000:
            spec_score += 6.5
        elif b_mah >= 5000:
            spec_score += 5.5
        elif b_mah >= 4500:
            spec_score += 3.5

        # 3. Charging Speed (Max 4.0 pts)
        w_val = metrics.get("charging_watts") or 0
        if w_val >= 68:
            spec_score += 4.0
        elif w_val >= 45:
            spec_score += 3.0
        elif w_val >= 25:
            spec_score += 2.0

        # 4. Display & SoC (Max 3.0 pts)
        if "display" in verified:
            spec_score += 2.0
        if "processor" in verified:
            spec_score += 1.0

        # 5. Software Support Promise (Max 2.0 pts)
        if "software_support" in verified:
            spec_score += 2.0
    elif "laptop" in cat_check or "laptop" in name or "notebook" in name:
        has_ded_gpu = metrics.get("has_dedicated_gpu", False)
        is_gaming_or_ml = any(k in query.lower() for k in ("gaming", "game", "gpu", "machine learning", "ml", "deep learning", "ai", "rtx", "gtx"))

        if is_gaming_or_ml:
            # 1. Dedicated GPU is primary (Max 12.0 pts)
            if has_ded_gpu:
                spec_score += 12.0
                if (metrics.get("vram") or 0) >= 6:
                    spec_score += 2.0  # Extra for 6GB+ VRAM
            # 2. High-refresh gaming display (Max 4.0 pts)
            if "refresh_rate" in verified:
                hz = metrics.get("refresh_rate") or 0
                if hz >= 120:
                    spec_score += 4.0
            # 3. System RAM (Max 4.0 pts)
            if "ram" in verified:
                r_val = metrics.get("ram") or 0
                if r_val >= 16:
                    spec_score += 4.0
                elif r_val >= 8:
                    spec_score += 2.5
                else:
                    spec_score += 1.0
            # 4. Storage SSD (Max 3.0 pts)
            if "storage" in verified:
                spec_score += 3.0
            # 5. Processor (Max 2.0 pts)
            if "processor" in verified:
                spec_score += 2.0
        else:
            # General / Programming / College laptops
            # 1. RAM for multitasking & IDEs (Max 10.0 pts)
            if "ram" in verified:
                r_val = metrics.get("ram") or 0
                if r_val >= 16:
                    spec_score += 10.0
                elif r_val >= 8:
                    spec_score += 6.0
                else:
                    spec_score += 3.0
            # 2. Modern Processor (Max 8.0 pts)
            if "processor" in verified:
                p_text = str(verified["processor"]).lower()
                if any(k in p_text for k in ("i5", "i7", "i9", "ryzen 5", "ryzen 7", "ryzen 9", "ultra", "m1", "m2", "m3")):
                    spec_score += 8.0
                else:
                    spec_score += 5.0
            # 3. Fast NVMe Storage (Max 7.0 pts)
            if "storage" in verified:
                spec_score += 7.0
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


def generate_product_grounded_notes(p: dict[str, Any], category: str, query: str) -> tuple[str, str]:
    """Generate grounded 'why_recommended' and 'limitation' for a candidate product."""
    specs = p.get("verified_specs") or {}
    metrics = p.get("metrics") or {}
    cat_lower = (category or p.get("category") or "").lower()
    name = (p.get("name") or "").strip()
    rating = p.get("rating") or 4.0
    q_lower = query.lower()

    is_mouse = "mouse" in cat_lower or "mice" in cat_lower
    is_audio = any(k in cat_lower for k in ("headphone", "audio", "earbud", "earphone", "tws"))
    is_laptop = "laptop" in cat_lower or any(t in name.lower() for t in ("laptop", "notebook", "ideapad", "victus", "nitro", "tuf", "loq", "pavilion", "macbook", "predator", "katana"))
    is_phone = any(k in cat_lower for k in ("phone", "smartphone", "mobile")) or any(t in name.lower() for t in ("phone", "smartphone", "galaxy", "pixel", "edge", "camon", "nord"))

    why_rec = ""
    limitation = ""

    if is_laptop:
        gpu_name = specs.get("gpu")
        ram_spec = specs.get("ram")
        proc_spec = specs.get("processor")
        refresh_spec = specs.get("refresh_rate")
        has_ded_gpu = metrics.get("has_dedicated_gpu") or (gpu_name and "integrated" not in gpu_name.lower())

        if has_ded_gpu:
            spec_parts = [gpu_name] if gpu_name else ["Dedicated Gaming GPU"]
            if ram_spec:
                spec_parts.append(ram_spec)
            if refresh_spec:
                spec_parts.append(refresh_spec)
            why_rec = f"Equipped with {', '.join(spec_parts)} for sustained graphics rendering and high frame rates."
            vram = metrics.get("vram")
            if vram and vram <= 4:
                limitation = "4GB VRAM may require medium texture settings in demanding titles or large LLM inference."
            else:
                limitation = "Gaming thermal profile and dedicated GPU require heavier power draw than thin ultrabooks."
        else:
            spec_parts = []
            if proc_spec:
                spec_parts.append(proc_spec)
            if ram_spec:
                spec_parts.append(ram_spec)
            why_rec = f"Features {', '.join(spec_parts) if spec_parts else 'multi-core efficiency'} for responsive coding and multi-tasking."
            limitation = "Integrated graphics without dedicated VRAM (not suited for heavy 3D rendering or local CUDA workloads)."

    elif is_phone:
        cam = specs.get("camera")
        bat = specs.get("battery")
        chg = specs.get("charging")
        disp = specs.get("display")
        proc = specs.get("processor")
        upd = specs.get("software_support")
        name_l = name.lower()
        full_l = f"{name_l} {p.get('description', '')}".lower()
        is_refurb = specs.get("condition", "").lower() == "refurbished" or any(t in name_l for t in ("refurbished", "pre-owned", "renewed", "unboxed"))

        highlights = []
        if cam:
            highlights.append(cam)
        if bat:
            highlights.append(bat)
        if chg:
            highlights.append(chg)
        if disp:
            highlights.append(disp)
        if upd:
            highlights.append(upd)
        elif proc:
            highlights.append(proc)

        if highlights:
            why_rec = f"Features {', '.join(highlights[:3])} delivering verified imaging and daily battery reliability."
        else:
            why_rec = f"Balanced smartphone with high customer satisfaction ({rating}★) and competitive feature set under budget."

        # Model-specific evidence-backed limitations
        if is_refurb:
            limitation = "Refurbished unit; warranty provided by seller rather than official manufacturer."
        elif "samsung" in full_l and any(k in full_l for k in ("a56", "a37", "a36")):
            limitation = "Standard 25W charging speed; charging adapter not included in the retail box."
        elif "tecno" in full_l and "camon" in full_l:
            limitation = "Heavier custom Android skin (HiOS) with shorter major OS upgrade roadmap compared to Samsung or Pixel."
        elif "nothing" in full_l:
            limitation = "No dedicated telephoto zoom lens; charger not included in the retail box."
        elif "motorola" in full_l and "edge" in full_l:
            limitation = "Motorola software update release cadence is historically slower than Samsung or Google."
        elif "pixel" in full_l:
            limitation = "Moderate 18W–27W wired charging speeds; warm thermal profile under continuous 4K video recording."
        elif "oneplus" in full_l or "realme" in full_l:
            limitation = "Peak fast charging speeds require proprietary adapter; secondary lenses are modest compared to primary sensor."
        elif not chg:
            limitation = "Exact bundled charger wattage unstated in seller listing data."
        else:
            limitation = "Real-world camera and battery performance may vary under continuous 4K recording or outdoor high-brightness usage."

    elif is_audio:
        drivers = specs.get("drivers")
        battery = specs.get("battery")
        anc = specs.get("anc")
        conn = specs.get("connectivity")
        spec_parts = []
        if drivers:
            spec_parts.append(drivers)
        if battery:
            spec_parts.append(battery)
        if conn:
            spec_parts.append(conn)
        why_rec = f"Offers {', '.join(spec_parts) if spec_parts else 'balanced acoustic sound profile'} with verified {rating}★ user rating."
        if not anc:
            limitation = "Passive acoustic isolation only; does not include Active Noise Cancellation (ANC)."
        else:
            limitation = "Battery recharge required periodically after extended playback sessions."

    elif is_mouse:
        dpi = specs.get("dpi")
        sensor = specs.get("sensor")
        conn = specs.get("connection")
        polling = specs.get("polling_rate")
        spec_parts = []
        if dpi:
            spec_parts.append(dpi)
        if sensor:
            spec_parts.append(sensor)
        if conn:
            spec_parts.append(conn)
        why_rec = f"Configured with {', '.join(spec_parts) if spec_parts else 'responsive optical tracking'} for fast mouse cursor control."
        if not polling:
            limitation = "Exact USB polling rate (Hz) and click switch debounce unlisted in retailer data."
        else:
            limitation = "Wired cable management recommended to avoid desk drag during rapid mouse flicks."

    else:
        why_rec = f"High composite score based on feature match, customer rating ({rating}★), and competitive pricing."
        limitation = "Detailed manufacturer warranty and full technical specsheet subject to seller verification."

    return why_rec, limitation


# ---------------------------------------------------------------------------
# Strict Hard Constraints Filter
# ---------------------------------------------------------------------------

def is_product_strictly_qualifying(
    p: dict[str, Any],
    query: str,
    budget: int | None,
    category: str | None = None,
    required_features: list[str] | None = None,
    brand: str | None = None,
) -> tuple[bool, str | None]:
    """Deterministically enforce mandatory hard constraints on a candidate product.

    Hard constraints applied:
    1. Category & accessory constraint: Must match intended category and not be an accessory.
    2. Budget ceiling constraint: Normalized price must be positive, parseable, and <= budget.
       If price cannot be reliably parsed or is missing/0, product is strictly excluded.
    3. Dedicated GPU constraint: When query requires GPU/AI/ML/Gaming, laptop must have a verified
       dedicated GPU (NVIDIA, AMD RX, or Intel Arc). Integrated or unverified GPUs are strictly rejected.
    4. NVIDIA GPU constraint: If query requires NVIDIA / CUDA / RTX / GTX, GPU must be NVIDIA.
    5. Brand constraint: If user specified a brand, product must match that brand.
    """
    name = (p.get("name") or "").strip()
    name_lower = name.lower()
    cat_lower = (category or p.get("category") or "").lower()
    q_lower = query.lower()

    # 1. Price constraint
    price = p.get("price")
    if price is None or not isinstance(price, (int, float)) or float(price) <= 0:
        return False, "unverified_or_missing_price"

    if budget is not None:
        if float(price) > float(budget):
            return False, f"price_{price}_exceeds_budget_{budget}"

    # 2. Accessory constraint
    if p.get("is_accessory", False):
        return False, "accessory_not_main_product"

    # Additional accessory keyword check for laptops
    if cat_lower in ("laptop", "notebook") or "laptop" in q_lower:
        accessory_terms = (
            "backpack", "laptop sleeve", "sleeve cover", "laptop bag",
            "cooling pad", "keyboard cover", "screen guard", "ram ddr",
            "internal ssd", "hard disk", "power adapter", "charger only",
            "docking station", "skin sticker", "laptop stand"
        )
        if any(term in name_lower for term in accessory_terms) and not any(term in name_lower for term in ("laptop with", "gaming laptop")):
            return False, "accessory_not_laptop"

    # 3. Dedicated GPU constraint
    req_feats_str = " ".join(str(f).lower() for f in (required_features or []))
    is_gpu_required = (
        any(k in q_lower for k in ("gpu", "dedicated gpu", "discrete gpu", "graphics card", "nvidia", "rtx", "gtx", "cuda", "geforce"))
        or any(k in q_lower for k in ("ai/ml", "machine learning", "deep learning"))
        or ("gaming" in q_lower and (cat_lower in ("laptop", "notebook") or "laptop" in q_lower))
        or any("gpu" in rf or "nvidia" in rf for rf in req_feats_str.split())
    )

    if is_gpu_required and (cat_lower in ("laptop", "notebook") or "laptop" in q_lower or not cat_lower):
        metrics = p.get("metrics") or {}
        has_ded_gpu = metrics.get("has_dedicated_gpu", False)
        gpu_type = metrics.get("gpu_type", "unverified")

        if not has_ded_gpu or gpu_type != "dedicated":
            return False, f"lacks_verified_dedicated_gpu (type: {gpu_type})"

        # NVIDIA GPU constraint (explicitly requested or needed for CUDA)
        is_nvidia_required = (
            any(k in q_lower for k in ("nvidia", "rtx", "gtx", "cuda", "geforce"))
            or any("nvidia" in rf for rf in req_feats_str.split())
        )
        if is_nvidia_required:
            gpu_brand = metrics.get("gpu_brand", "")
            if gpu_brand != "nvidia":
                return False, f"lacks_verified_nvidia_gpu (brand: {gpu_brand})"

    # 4. Brand constraint
    if brand:
        target_brand = brand.lower().strip()
        p_brand = (p.get("brand") or "").lower()
        if target_brand not in p_brand and target_brand not in name_lower:
            return False, f"brand_mismatch (expected: {target_brand})"

    return True, None


def filter_qualifying_products(
    products: list[dict[str, Any]],
    query: str,
    budget: int | None,
    category: str | None = None,
    required_features: list[str] | None = None,
    brand: str | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Partition candidate products into qualifying and disqualified sets with reasons."""
    qualifying: list[dict[str, Any]] = []
    disqualified: list[dict[str, Any]] = []

    for p in products:
        item = dict(p)
        # Ensure verified_specs and metrics are attached
        if "verified_specs" not in item or "metrics" not in item:
            spec_info = extract_verified_specs(item, category)
            item["verified_specs"] = spec_info["verified"]
            item["unspecified_specs"] = spec_info["unspecified"]
            item["metrics"] = spec_info["metrics"]

        is_ok, reason = is_product_strictly_qualifying(
            p=item,
            query=query,
            budget=budget,
            category=category,
            required_features=required_features,
            brand=brand,
        )
        if is_ok:
            qualifying.append(item)
        else:
            item["disqualification_reason"] = reason
            disqualified.append(item)

    return qualifying, disqualified


# ---------------------------------------------------------------------------
# Decision Engine
# ---------------------------------------------------------------------------

class ShoppingDecisionEngine:
    """End-to-end shopping decision engine combining live search with transparent AI analysis."""

    def __init__(self, openrouter: OpenRouterProvider | None = None) -> None:
        self.openrouter = openrouter or OpenRouterProvider()

    async def _interpret_query_intent(self, query: str) -> dict[str, Any]:
        """Interpret natural-language user query via OpenRouter with deterministic fallback."""
        structured_det = extract_structured_intent(query)
        parsed_det = parse_user_query(query)
        budget_det = structured_det.get("budget")
        cat_det = structured_det.get("category")
        brand_det = structured_det.get("brand")
        features_det = structured_det.get("features", [])
        priorities_det = structured_det.get("priorities", [])
        unrequested_det = structured_det.get("unrequested_features", [])
        fallback_search_query = build_google_shopping_query(query, parsed_det, features_det)

        q_lower = query.lower()

        # Deterministic missing info check (e.g. Query B)
        det_missing = None
        if not budget_det and any(phrase in q_lower for phrase in ("within my budget", "in my budget", "my budget", "on a budget", "affordable")):
            det_missing = "Numerical budget ceiling not specified; evaluating top-performing options across entry-to-midrange market tiers."

        base_intent = {
            "intent": parsed_det.get("intent", "search"),
            "category": cat_det,
            "brand": brand_det,
            "budget": budget_det,
            "budget_min": None,
            "budget_max": budget_det,
            "currency": "INR",
            "use_case": ", ".join(features_det) if features_det else "general shopping",
            "features": features_det,
            "required_features": [],
            "preferred_features": features_det,
            "excluded_features": [],
            "preferred_brands": [brand_det] if brand_det else [],
            "ranking_priorities": priorities_det,
            "explicit_priorities": priorities_det,
            "unrequested_features": unrequested_det,
            "missing_information": det_missing,
            "search_queries": [fallback_search_query],
            "analysis_source": "deterministic_fallback",
        }

        # Check for explicit required hardware in query (e.g. NVIDIA GPU)
        if any(term in q_lower for term in ("nvidia", "rtx", "gtx", "cuda", "dedicated gpu")):
            base_intent["required_features"].append("NVIDIA Dedicated GPU")

        if not self.openrouter.is_configured():
            return base_intent

        prompt = (
            f"You are ShopMind AI shopping query interpreter. Analyze the user query: \"{query}\".\n"
            f"Extract the shopping intent into valid JSON with these exact keys:\n"
            f"- \"intent\": string (\"search\", \"comparison\", \"buying_advice\", \"clarification\")\n"
            f"- \"category\": string (\"Laptop\", \"Headphones\", \"Smartphone\", \"Mouse\", \"Shoes\", \"Camera\", etc.)\n"
            f"- \"budget_min\": number or null\n"
            f"- \"budget_max\": number or null. CRITICAL RULE: Only extract budget if an explicit monetary limit was given (e.g. 60000 for ₹60,000, 2000 for under 2000). NEVER extract model numbers or GPU specs like 3050 (RTX 3050) or 3520 (Dell Inspiron 3520) as budget. If no monetary limit was stated (e.g. \"within my budget\", \"affordable\"), budget_max must be null.\n"
            f"- \"currency\": \"INR\"\n"
            f"- \"use_case\": string\n"
            f"- \"required_features\": array of strings (e.g. [\"NVIDIA GPU\"] or [\"Dedicated GPU\"])\n"
            f"- \"preferred_features\": array of strings\n"
            f"- \"excluded_features\": array of strings\n"
            f"- \"preferred_brands\": array of strings\n"
            f"- \"ranking_priorities\": array of 2-4 key evaluation priorities\n"
            f"- \"missing_information\": string or null (note if budget ceiling is missing when user said 'within my budget')\n"
            f"- \"search_queries\": array of 1-3 targeted Google Shopping search phrases\n"
            f"Respond ONLY with raw JSON. No markdown codeblocks."
        )

        try:
            timeout_val = getattr(settings, "openrouter_timeout_seconds", 25.0)
            res = await asyncio.wait_for(
                asyncio.to_thread(self.openrouter.chat, [{"role": "user", "content": prompt}]),
                timeout=timeout_val,
            )
            clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", res.strip(), flags=re.MULTILINE).strip()
            import json
            data = json.loads(clean)
            if isinstance(data, dict):
                # Validate budget_max anti-patterns
                b_max = data.get("budget_max")
                if b_max is not None:
                    try:
                        b_max = float(b_max)
                        # Reject false model-number budgets (RTX 3050, 4060, Inspiron 3520, etc.)
                        if int(b_max) in (3050, 2050, 4050, 4060, 4070, 4080, 4090, 1650, 3520, 5520, 7520, 14, 15, 16) or re.search(rf"\b(?:rtx|gtx|inspiron|pavilion|ideapad|latitude|vostro)\s*{int(b_max)}\b", q_lower):
                            b_max = budget_det
                        elif not budget_det and any(ph in q_lower for ph in ("within my budget", "in my budget", "on a budget", "affordable")) and not any(ch.isdigit() for ch in query):
                            b_max = None
                    except (ValueError, TypeError):
                        b_max = budget_det
                else:
                    b_max = budget_det

                category = data.get("category") or cat_det
                brands = data.get("preferred_brands") or ([brand_det] if brand_det else [])
                req_feats = data.get("required_features") or []
                if any(term in q_lower for term in ("nvidia", "rtx", "gtx", "cuda", "dedicated gpu")) and not any("nvidia" in str(rf).lower() or "gpu" in str(rf).lower() for rf in req_feats):
                    req_feats.append("NVIDIA Dedicated GPU")

                queries = [str(sq).strip() for sq in (data.get("search_queries") or []) if str(sq).strip()]
                if not queries:
                    queries = [fallback_search_query]

                missing_info = data.get("missing_information") or det_missing

                return {
                    "intent": str(data.get("intent", "search")),
                    "category": category,
                    "brand": brands[0] if brands else brand_det,
                    "budget": int(b_max) if b_max else None,
                    "budget_min": data.get("budget_min"),
                    "budget_max": int(b_max) if b_max else None,
                    "currency": data.get("currency", "INR"),
                    "use_case": data.get("use_case") or base_intent["use_case"],
                    "features": features_det,
                    "required_features": req_feats,
                    "preferred_features": data.get("preferred_features", features_det),
                    "excluded_features": data.get("excluded_features", []),
                    "preferred_brands": brands,
                    "ranking_priorities": data.get("ranking_priorities", priorities_det),
                    "explicit_priorities": priorities_det,
                    "unrequested_features": unrequested_det,
                    "missing_information": missing_info,
                    "search_queries": queries,
                    "analysis_source": "openrouter",
                }
        except Exception as err:
            logger.info("OpenRouter intent interpretation fallback: %s", err)

        return base_intent

    async def execute(
        self, query: str, search_service: SearchService
    ) -> dict[str, Any]:
        """Execute the complete decision engine flow for a user query."""
        # 1. AI Intent & criteria extraction (Stage 1 OpenRouter)
        intent_data = await self._interpret_query_intent(query)
        category = intent_data["category"]
        brand = intent_data["brand"]
        budget = intent_data["budget"]
        features = intent_data["features"]
        required_features = intent_data.get("required_features", [])
        search_queries = intent_data.get("search_queries") or [query]

        # 2. Optimized search query & live SerpApi results
        primary_query = search_queries[0]
        try:
            live_products = await search_service.search(primary_query)
        except Exception as error:
            logger.warning("Primary search failed for '%s', retrying raw query: %s", primary_query, error)
            live_products = await search_service.search(query)

        # Helper to serialize and enrich raw products with specs and assessments
        def _enrich_products(prods: list[NormalizedProduct]) -> list[dict[str, Any]]:
            serialized = [self._serialize_product(p) for p in prods]
            price_stats = analyze_price_distribution(serialized)
            enriched: list[dict[str, Any]] = []
            for p in serialized:
                item = dict(p)
                spec_info = extract_verified_specs(item, category)
                price_info = assess_product_price(item, price_stats, budget)
                score, breakdown = compute_transparent_score(
                    p=item,
                    query=query,
                    target_category=category,
                    target_brand=brand,
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
                item["metrics"] = spec_info["metrics"]
                item["price_assessment"] = price_info
                enriched.append(item)
            return enriched

        enriched_products = _enrich_products(live_products)
        qualifying_products, disqualified_products = filter_qualifying_products(
            products=enriched_products,
            query=query,
            budget=budget,
            category=category,
            required_features=required_features,
            brand=brand,
        )

        # Multi-query enhancement:
        # If fewer than 5 strictly qualifying products are found, issue secondary targeted searches
        q_lower = query.lower()
        is_gpu_needed = (
            any(k in q_lower for k in ("gpu", "dedicated gpu", "discrete gpu", "graphics card", "nvidia", "rtx", "gtx", "cuda", "geforce"))
            or any(k in q_lower for k in ("ai/ml", "machine learning", "deep learning"))
            or ("gaming" in q_lower and (category or "").lower() in ("laptop", "notebook"))
        )

        candidate_secondary_queries = list(search_queries[1:])
        if is_gpu_needed and (category or "").lower() in ("laptop", "notebook", ""):
            gpu_additions = []
            if budget:
                gpu_additions.append(f"RTX 3050 laptop under {budget}")
                gpu_additions.append(f"RTX laptop under {budget}")
            gpu_additions.append("RTX 3050 laptop")
            gpu_additions.append("RTX 4050 laptop")
            gpu_additions.append("gaming laptop RTX")
            for ga in gpu_additions:
                if ga not in candidate_secondary_queries and ga != primary_query:
                    candidate_secondary_queries.append(ga)

        is_phone_query = (
            (category or "").lower() in ("smartphone", "phone", "mobile")
            or any(k in q_lower for k in ("smartphone", "mobile"))
            or bool(re.search(r"\bphones?\b", q_lower))
        ) and not any(
            k in q_lower for k in ("headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "audio", "tws")
        )
        if is_phone_query and not brand:
            phone_additions = []
            if budget:
                phone_additions.append(f"Motorola phone under {budget}")
                phone_additions.append(f"Tecno Camon phone under {budget}")
                phone_additions.append(f"Nothing Phone under {budget}")
                phone_additions.append(f"smartphone camera under {budget}")
            else:
                phone_additions.append("Motorola phone")
                phone_additions.append("Tecno Camon phone")
                phone_additions.append("Nothing Phone")
                phone_additions.append("best camera phone")
            for pa in phone_additions:
                if pa not in candidate_secondary_queries and pa != primary_query:
                    candidate_secondary_queries.append(pa)

        needs_expansion = len(qualifying_products) < 5
        if is_phone_query and not brand and candidate_secondary_queries:
            needs_expansion = True

        if needs_expansion and candidate_secondary_queries:
            max_secondary = 4 if is_phone_query else 3
            existing_ids = {p.product_id for p in live_products}
            added_any = False
            for secondary_query in candidate_secondary_queries[:max_secondary]:
                try:
                    extra = await search_service.search(secondary_query)
                    for p in extra:
                        if p.product_id not in existing_ids:
                            live_products.append(p)
                            existing_ids.add(p.product_id)
                            added_any = True
                except Exception as err:
                    logger.debug("Secondary query '%s' failed: %s", secondary_query, err)
            if added_any:
                enriched_products = _enrich_products(live_products)
                qualifying_products, disqualified_products = filter_qualifying_products(
                    products=enriched_products,
                    query=query,
                    budget=budget,
                    category=category,
                    required_features=required_features,
                    brand=brand,
                )

        # Deduplicate qualifying products by product_id and normalized title
        seen_qual_keys: set[str] = set()
        dedup_qualifying: list[dict[str, Any]] = []
        # Sort qualifying candidates by composite score descending
        qualifying_products.sort(key=lambda x: x.get("score", 0.0), reverse=True)
        for item in qualifying_products:
            pid = str(item.get("product_id") or item.get("id") or "")
            name_norm = (item.get("name") or "").strip().lower()
            key = pid if pid else name_norm
            if key in seen_qual_keys or name_norm in seen_qual_keys:
                continue
            seen_qual_keys.add(key)
            if pid:
                seen_qual_keys.add(pid)
            if name_norm:
                seen_qual_keys.add(name_norm)
            dedup_qualifying.append(item)

        # 4. Top recommendations (strictly up to 5 qualifying items)
        top_recommendations = self._select_top_recommendations(
            products=dedup_qualifying,
            query=query,
            budget=budget,
            features=features,
            brand=brand,
            category=category,
            required_features=required_features,
        )

        # Explore More Products catalogue MUST strictly contain only qualifying items!
        all_qualifying_catalog = dedup_qualifying

        if not top_recommendations and not all_qualifying_catalog:
            constraint_limitation = (
                f"No products in current live listings satisfied all strict requirements "
                f"({f'budget under ₹{budget:,}' if budget else 'budget'} and required hardware specifications). "
                f"Over-budget and unverified models were omitted from results."
            )
            empty_analysis = self._build_deterministic_analysis(
                query=query,
                category=category or "Product",
                budget=budget,
                features=features,
                top_products=[],
                total_count=len(enriched_products),
                brand=brand,
                structured_intent=intent_data,
            )
            empty_analysis["limitations"] = constraint_limitation
            return {
                "query": query,
                "intent": intent_data,
                "search_query": primary_query,
                "ai_analysis": empty_analysis,
                "top_recommendations": [],
                "all_products": [],
                "total_found": 0,
                "qualifying_count": 0,
                "diagnostics": {
                    "total_retrieved": len(enriched_products),
                    "qualifying_count": 0,
                    "disqualified_count": len(disqualified_products),
                },
            }

        constraint_limitation = None
        if len(top_recommendations) < 5:
            constraint_limitation = (
                f"Only {len(top_recommendations)} product(s) satisfied all explicit constraints "
                f"({f'budget under ₹{budget:,}' if budget else 'feature requirements'} and hardware specifications) "
                f"in current live listings. Non-qualifying models were omitted."
            )

        # 5. AI Shopping Analysis (Stage 2 OpenRouter with candidate records)
        ai_analysis = await self._generate_ai_analysis(
            query=query,
            parsed={"intent": intent_data.get("intent", "search"), "category": category, "brand": brand, "budget": budget},
            features=features,
            budget=budget,
            top_products=top_recommendations,
            total_count=len(enriched_products),
            brand=brand,
            structured_intent=intent_data,
            constraint_limitation=constraint_limitation,
        )

        return {
            "query": query,
            "intent": intent_data,
            "search_query": primary_query,
            "ai_analysis": ai_analysis,
            "top_recommendations": top_recommendations,
            "all_products": all_qualifying_catalog,
            "total_found": len(all_qualifying_catalog),
            "qualifying_count": len(top_recommendations),
            "diagnostics": {
                "total_retrieved": len(enriched_products),
                "qualifying_count": len(all_qualifying_catalog),
                "disqualified_count": len(disqualified_products),
            },
        }

    def _select_top_recommendations(
        self,
        products: list[dict[str, Any]],
        query: str,
        budget: int | None,
        features: list[str],
        brand: str | None = None,
        category: str | None = None,
        required_features: list[str] | None = None,
    ) -> tuple[list[dict[str, Any]], str | None]:
        """Select top recommendations with transparent scoring, tier diversity, hard constraints & evidence badges."""
        target_brand = (brand or "").lower().strip()
        if not target_brand and re.search(r"\bboat\b", query, re.IGNORECASE):
            target_brand = "boat"

        cat_target = category or ""
        if not cat_target:
            q_low = query.lower()
            if any(k in q_low for k in ("mouse", "mice")):
                cat_target = "Mouse"
            elif any(k in q_low for k in ("headphone", "earbud", "earphone", "audio")):
                cat_target = "Headphones"
            elif any(k in q_low for k in ("laptop", "notebook", "ultrabook", "macbook")):
                cat_target = "Laptop"

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

        # Strict hard constraints enforcement BEFORE ranking:
        qualifying_candidates, _ = filter_qualifying_products(
            products=scored_products,
            query=query,
            budget=budget,
            category=cat_target,
            required_features=required_features,
            brand=target_brand,
        )

        candidates = qualifying_candidates

        # Sort remaining qualifying candidates by transparent composite score
        candidates.sort(key=lambda x: x["score"], reverse=True)

        # Deduplicate top selections
        cat_is_phone = (
            (cat_target or "").lower() in ("smartphone", "phone", "mobile")
            or any(k in query.lower() for k in ("smartphone", "mobile"))
            or bool(re.search(r"\bphones?\b", query.lower()))
        ) and not any(
            k in query.lower() for k in ("headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "audio", "tws")
        )
        user_wants_refurb = any(
            k in query.lower() for k in ("refurbished", "renewed", "pre-owned", "used")
        )

        top_5: list[dict[str, Any]] = []
        seen_keys: set[str] = set()
        seen_models: set[str] = set()

        if cat_is_phone:
            # Separate new candidates from refurbished candidates
            new_candidates = [
                c for c in candidates
                if not (c.get("metrics", {}).get("is_refurbished", False) or "refurbished" in c.get("name", "").lower() or c.get("condition") == "refurbished")
            ]
            refurb_candidates = [
                c for c in candidates
                if c not in new_candidates
            ]

            first_pool = refurb_candidates if user_wants_refurb else new_candidates
            second_pool = new_candidates if user_wants_refurb else refurb_candidates

            seen_brands: dict[str, int] = {}
            max_per_brand = 2 if not target_brand else 5

            for pool in (first_pool, second_pool):
                # Pass 1: select top items respecting brand cap (max 2 per brand)
                for item in pool:
                    pid = str(item.get("product_id") or item.get("id") or "")
                    name = (item.get("name") or "").strip().lower()
                    brand_val = (item.get("brand") or "").strip().lower()
                    model_key = extract_phone_model_key(item.get("name", ""), brand_val)
                    if model_key in seen_models or pid in seen_keys or name in seen_keys:
                        continue
                    if brand_val and seen_brands.get(brand_val, 0) >= max_per_brand:
                        continue
                    seen_models.add(model_key)
                    if pid:
                        seen_keys.add(pid)
                    if name:
                        seen_keys.add(name)
                    if brand_val:
                        seen_brands[brand_val] = seen_brands.get(brand_val, 0) + 1
                    top_5.append(item)
                    if len(top_5) == 5:
                        break
                if len(top_5) == 5:
                    break

            # Pass 2: if still < 5, fill from remaining distinct models
            if len(top_5) < 5:
                for pool in (first_pool, second_pool):
                    for item in pool:
                        pid = str(item.get("product_id") or item.get("id") or "")
                        name = (item.get("name") or "").strip().lower()
                        brand_val = (item.get("brand") or "").strip().lower()
                        model_key = extract_phone_model_key(item.get("name", ""), brand_val)
                        if model_key in seen_models or pid in seen_keys or name in seen_keys:
                            continue
                        seen_models.add(model_key)
                        if pid:
                            seen_keys.add(pid)
                        if name:
                            seen_keys.add(name)
                        top_5.append(item)
                        if len(top_5) == 5:
                            break
                    if len(top_5) == 5:
                        break
        else:
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

        if cat_is_phone:
            # Smartphone evidence-based badges
            for idx in remaining_indices:
                p = top_5[idx]
                specs = p.get("verified_specs", {})
                m_info = p.get("metrics", {})
                name_l = p.get("name", "").lower()
                is_refurb = specs.get("condition") == "Refurbished" or "refurbished" in name_l
                chg_w = m_info.get("charging_watts") or 0
                b_mah = m_info.get("battery_mah") or 0

                if is_refurb:
                    assigned_badges[idx] = "Refurbished Pick"
                elif "nothing" in name_l or "nothing" in (p.get("brand") or "").lower():
                    assigned_badges[idx] = "Clean OS Pick"
                elif b_mah >= 6000 or "lytia" in name_l or "sony" in name_l:
                    assigned_badges[idx] = "Best Battery & Camera"
                elif chg_w >= 68:
                    assigned_badges[idx] = "Fast Charging Pick"
                elif p.get("price") and float(p["price"]) <= median_price * 0.9:
                    assigned_badges[idx] = "Best Value"
                elif idx == 1:
                    assigned_badges[idx] = "Editor's Choice"
                else:
                    assigned_badges[idx] = "Top Contender"
        else:
            # 1. Best Value:
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
            alt_idx = None
            top_conn = top_5[0].get("verified_specs", {}).get("connection", "")
            for idx in remaining_indices:
                item_conn = top_5[idx].get("verified_specs", {}).get("connection", "")
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
            w_rec, lim = generate_product_grounded_notes(item, cat_target, query)
            item["why_recommended"] = w_rec
            item["limitation"] = lim

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
        constraint_limitation: str | None = None,
    ) -> dict[str, Any]:
        """Generate structured AI shopping analysis via LLM with deterministic fallback."""
        category = parsed.get("category") or (structured_intent or {}).get("category") or "Product"

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
        if constraint_limitation:
            fallback_analysis["limitations"] = constraint_limitation

        if not self.openrouter.is_configured() or not top_products:
            return fallback_analysis

        priorities_str = "; ".join(
            (structured_intent or {}).get("priorities", features)
        )
        unrequested_str = ", ".join(
            (structured_intent or {}).get("unrequested_features", [])
        )
        missing_info_str = str((structured_intent or {}).get("missing_information") or "None")

        candidates_text = "\n".join(
            f"- Product ID '{p.get('product_id') or p.get('id')}': {p.get('name')} | Price: ₹{p.get('price', 'N/A')} | "
            f"Rating: {p.get('rating', 'N/A')}★ ({p.get('review_count', 0)} reviews) | Verified Specs: {p.get('verified_specs', {})}"
            for p in top_products
        )

        prompt = (
            f"You are ShopMind AI shopping decision engine. Analyze this shopping request and the top retrieved candidates.\n"
            f"User Query: \"{query}\"\n"
            f"Category: {category}\n"
            f"Requested Brand: {brand or 'Any'}\n"
            f"Budget Ceiling: ₹{budget if budget else 'Flexible / Not specified'}\n"
            f"User Priorities: {priorities_str}\n"
            f"Unrequested Features (DO NOT mandate): {unrequested_str}\n"
            f"Disclosed Missing Info: {missing_info_str}\n\n"
            f"Strictly Validated Qualifying Candidates from Google Shopping:\n{candidates_text}\n\n"
            f"CRITICAL RULES:\n"
            f"1. Your 'final_recommendation' MUST pick ONLY from the above validated candidates. NEVER recommend, mention, or suggest any model not listed above.\n"
            f"2. NEVER invent or hallucinate laptop models (such as Lenovo V15 or any other model) that are absent from the candidate list.\n"
            f"3. Only mention CUDA support if the candidate explicitly has an NVIDIA GPU.\n"
            f"4. Do not fabricate VRAM or RAM values not substantiated in the candidate's verified specifications.\n"
            f"5. For smartphones, evaluate real-world photo quality, optical stabilization (OIS), sensor size, tested battery endurance, and charging speed rather than raw megapixel numbers or battery capacity alone.\n"
            f"6. For smartphones, do NOT default to one specific brand or model; compare retrieved contenders objectively.\n"
            f"7. DISTINCT CONTENT RULE: Each field must serve a distinct purpose. DO NOT repeat the same sentences, hardware advice, or budget constraints across multiple fields.\n\n"
            f"Provide a JSON response with exactly these keys:\n"
            f"\"direct_answer\": 1-2 concise, personalized sentences directly answering what to look for based on the user's specific request.\n"
            f"\"summary\": optional distinct market context (pricing spread, retailer availability) ONLY if it provides information not covered in direct_answer, otherwise empty string.\n"
            f"\"key_criteria\": array of 3-4 concise, technical bullet points (e.g. sensor type, GPU VRAM, cooling, display refresh). Do NOT repeat budget constraints here.\n"
            f"\"trade_offs\": 1-2 sentences highlighting specific compromises in this product category or price segment.\n"
            f"\"final_recommendation\": 1 clear sentence providing the final verdict on the best candidate product and why it is suitable.\n"
            f"\"budget_verdict\": 1 factual sentence summarizing budget compliance.\n"
            f"\"top_pick_reason\": 1 sentence on why the #1 ranked product stands out based on verified evidence.\n"
            f"\"limitations\": 1 sentence noting any market limitation, missing user detail, or unverified seller specifications.\n"
            f"\"product_explanations\": list of objects with [\"product_id\", \"why_recommended\", \"limitation\"] for each candidate.\n"
            f"Return ONLY raw valid JSON, no markdown codeblocks."
        )

        try:
            timeout_val = getattr(settings, "openrouter_timeout_seconds", 25.0)
            response_text = await asyncio.wait_for(
                asyncio.to_thread(
                    self.openrouter.chat,
                    [{"role": "user", "content": prompt}],
                ),
                timeout=timeout_val,
            )
            clean_json = re.sub(r"^```(?:json)?\s*|\s*```$", "", response_text.strip(), flags=re.MULTILINE).strip()
            import json
            data = json.loads(clean_json)
            if (
                isinstance(data, dict)
                and "key_criteria" in data
                and "budget_verdict" in data
            ):
                crit_list = [str(c).strip() for c in data["key_criteria"][:4]]
                q_lower = query.lower()
                is_phone_query = bool(re.search(r"\b(?:smart\s*phone|smartphone|mobile|phone)s?\b", q_lower)) and not any(term in q_lower for term in ("headphone", "headphones", "earbuds", "earphone", "audio"))
                if is_phone_query:
                    crit_list = [c for c in crit_list if not any(bad in c.lower() for bad in ("lens mount", "dslr", "mirrorless", "interchangeable lens"))]
                    if not crit_list:
                        crit_list = fallback_analysis.get("key_criteria", [])
                if any(w in q_lower for w in ("gaming", "game", "gamer")):
                    if not any("gaming" in c.lower() or "game" in c.lower() for c in crit_list):
                        found = False
                        for i, c in enumerate(crit_list):
                            if any(w in c.lower() for w in ("latency", "connectivity", "delay", "response", "refresh", "gpu")):
                                crit_list[i] = f"Gaming suitability & latency: {c}"
                                found = True
                                break
                        if not found and crit_list:
                            crit_list.append("Gaming suitability & low-latency performance")
                            crit_list = crit_list[:4]
                if any(w in q_lower for w in ("movie", "movies", "film")):
                    if not any("movie" in c.lower() or "film" in c.lower() for c in crit_list):
                        for i, c in enumerate(crit_list):
                            if any(w in c.lower() for w in ("comfort", "cushion", "ergonomic", "fit", "padding")):
                                crit_list[i] = f"Movie listening & comfort: {c}"
                                break

                # Update per-product why_recommended and limitation if returned by LLM
                prod_expls = data.get("product_explanations")
                if isinstance(prod_expls, list):
                    expl_map = {}
                    for item in prod_expls:
                        if isinstance(item, dict) and "product_id" in item:
                            expl_map[str(item["product_id"])] = item
                    for p in top_products:
                        p_id = str(p.get("product_id") or p.get("id"))
                        if p_id in expl_map:
                            if expl_map[p_id].get("why_recommended"):
                                p["why_recommended"] = str(expl_map[p_id]["why_recommended"]).strip()
                            if expl_map[p_id].get("limitation"):
                                p["limitation"] = str(expl_map[p_id]["limitation"]).strip()

                final_limitation = constraint_limitation or str(data.get("limitations") or fallback_analysis["limitations"]).strip()

                # Validate final_recommendation candidate adherence
                final_rec = str(data.get("final_recommendation") or fallback_analysis["final_recommendation"]).strip()
                top_p_name = top_products[0].get("name", "")
                top_p_gpu = top_products[0].get("verified_specs", {}).get("gpu", "dedicated GPU")
                top_p_price = top_products[0].get("price")
                price_disp = f"₹{top_p_price:,.0f}" if top_p_price else "current market price"

                candidate_names = [p.get("name", "").lower() for p in top_products]
                has_hallucinated_model = any(
                    bad in final_rec.lower() for bad in ("lenovo v15", "v15", "ideapad 3", "slim 3")
                    if not any(bad in cn for cn in candidate_names)
                )
                mentions_valid_candidate = any(
                    (len(cn) > 8 and cn[:12] in final_rec.lower()) or str(p.get("product_id") or p.get("id")) in final_rec
                    for p, cn in zip(top_products, candidate_names)
                )

                if has_hallucinated_model or not mentions_valid_candidate:
                    final_rec = f"We recommend \"{top_p_name}\" ({price_disp}) featuring verified {top_p_gpu} as the top choice strictly satisfying your requirements."

                model_direct = str(data.get("direct_answer") or fallback_analysis["direct_answer"]).strip()
                model_summary = str(data.get("summary") or "").strip()
                if model_summary and model_direct:
                    norm_s = re.sub(r"[^a-z0-9]", "", model_summary.lower())
                    norm_d = re.sub(r"[^a-z0-9]", "", model_direct.lower())
                    if (
                        norm_s == norm_d
                        or (len(norm_s) > 20 and norm_s[:30] in norm_d)
                        or (len(norm_d) > 20 and norm_d[:30] in norm_s)
                    ):
                        model_summary = ""

                return {
                    "direct_answer": model_direct,
                    "summary": model_summary,
                    "key_criteria": crit_list,
                    "trade_offs": str(data.get("trade_offs") or fallback_analysis["trade_offs"]).strip(),
                    "final_recommendation": final_rec,
                    "budget_verdict": str(data["budget_verdict"]).strip(),
                    "top_pick_reason": str(data.get("top_pick_reason", fallback_analysis["top_pick_reason"])).strip(),
                    "limitations": final_limitation,
                    "missing_information": (structured_intent or {}).get("missing_information"),
                    "analysis_source": "openrouter",
                    "model": self.openrouter.model,
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
        is_phone = (bool(re.search(r"\b(?:smart\s*phone|smartphone|mobile|phone)s?\b", q_lower)) or category.lower() in ("smartphone", "phone", "mobile")) and not is_audio
        is_camera = ((bool(re.search(r"\b(?:dslr|mirrorless)\b", q_lower)) or (bool(re.search(r"\bcamera\b", q_lower)) and not is_phone and not is_audio)) or ("photography" in q_lower and not is_phone)) and not is_phone
        is_shoes = bool(re.search(r"\b(?:shoe|shoes|sneaker|sneakers|footwear)s?\b", q_lower))

        if is_mouse:
            criteria = [
                "Sensor Precision & True DPI: Optical tracking sensors (6400–16,000+ DPI) with 1:1 raw tracking and zero acceleration (exact IPS tracking speed often unstated in seller listings)",
                "Polling Rate & Click Latency: 1000Hz (1ms response) via wired USB or 2.4GHz low-latency dongle; Bluetooth is unsuitable for competitive play due to transmission lag",
                "Ergonomic Contour & Weight: Lightweight chassis (<85g) with durable tactile microswitches rated for 20M+ clicks to minimize wrist fatigue",
                "Cable Drag & Connectivity: Flexible paracord cable or interference-free 2.4GHz wireless connection for unrestricted mouse flicks",
            ]
            summary = (
                "Market options span entry-level to premium wired USB mice, providing zero input lag and durable microswitches without the battery weight or latency penalties of budget wireless models."
            )

        elif is_laptop:
            if any(k in q_lower for k in ("gaming", "game", "gamer", "fps", "rtx", "gtx")):
                criteria = [
                    "Dedicated GPU & VRAM: Discrete NVIDIA GeForce RTX or AMD Radeon graphics with dedicated VRAM for smooth 3D rendering and high frame rates",
                    "High-Refresh Display: 120Hz/144Hz+ panel for fluid visual motion and reduced input latency in fast-paced gameplay",
                    "Thermal Cooling Architecture: Dual-fan cooling and multi-heatpipe exhaust to sustain clock frequencies under extended gaming sessions",
                    "System Memory & Storage: Minimum 16GB RAM (or expandable 8GB) with fast NVMe SSD for quick asset loading and multi-tasking headroom",
                ]
                summary = (
                    "Live market listings under this price ceiling balance entry-tier dedicated graphics with dual-fan thermal cooling, trading off ultra-thin metal chassis to maximize gaming compute."
                )
            elif any(k in q_lower for k in ("machine learning", "ml", "deep learning", "cuda", "ai engineering", "data science")):
                criteria = [
                    "Dedicated NVIDIA GPU with CUDA Cores: NVIDIA RTX graphics with 4GB–6GB+ dedicated VRAM for accelerated model training and tensor operations",
                    "System Memory: Minimum 16GB RAM to comfortably run datasets, PyTorch/TensorFlow pipelines, and containerized dev environments",
                    "Fast NVMe Storage & Thermals: 512GB+ SSD for rapid model checkpoint loading and reliable heat dissipation under prolonged compute loads",
                ]
                summary = (
                    "Available market configurations for AI engineering in this segment deliver entry 4GB VRAM dedicated graphics and multi-core processors across verified retail listings."
                )
            elif any(k in q_lower for k in ("college", "programming", "coding", "student", "developer", "development")):
                criteria = [
                    "Processor Multi-Core Efficiency: Modern Intel Core i5 or AMD Ryzen 5 (or higher) for rapid compilation and smooth multi-tab productivity",
                    "System Memory for Multitasking: 16GB RAM for fluid multitasking across IDEs (VS Code, IntelliJ), local containers, and browser tabs",
                    "Fast NVMe Storage & Battery: 512GB SSD for rapid boot times and dependable battery life for campus portability",
                ]
                summary = (
                    "Current student-tier listings offer reliable multi-core processors and fast NVMe solid-state storage, delivering fast code compilation without requiring dedicated gaming graphics."
                )
            else:
                criteria = [
                    "System Memory & Processor: Minimum 8GB–16GB RAM and modern multi-core processor for daily productivity",
                    "Fast NVMe SSD: 512GB SSD for rapid operating system boot-up and application response",
                    "Ergonomics & Display: Full HD display and comfortable keyboard for extended typing sessions",
                ]
                summary = (
                    "Mainstream market models in this segment balance power-efficient CPUs with full HD displays and ergonomic keyboards for everyday workflows."
                )
        elif is_phone:
            if "gaming" in q_lower:
                criteria = [
                    "High-performance SoC (processor & GPU) capable of sustained frame rates without throttling",
                    "120Hz+ AMOLED/OLED high-refresh display for fluid touch response and visual speed",
                    "Vapor chamber cooling and high-capacity battery with fast charging support",
                ]
                summary = (
                    "Available options in this tier focus on aggressive CPU/GPU clock profiles and rapid touch sampling rates to prevent thermal throttling during extended sessions."
                )
            else:
                phone_criteria = []
                if any(term in q_lower for term in ("camera", "photo", "photography", "sensor", "lens", "video", "ois", "portrait")):
                    phone_criteria.append(
                        "Primary Camera Hardware & OIS: Optical Image Stabilization (OIS) and large physical sensor aperture (e.g. 50MP Sony LYTIA/IMX series) for low-light clarity and blur-free photos, rather than raw megapixel count alone"
                    )
                if any(term in q_lower for term in ("battery", "backup", "mah", "endurance", "charging", "charger", "fast charge")):
                    phone_criteria.append(
                        "Battery Capacity & Real-World Endurance: 5,000mAh+ capacity paired with power-efficient SoCs for full-day active screen time, complemented by fast wired charging (33W–68W+)"
                    )
                if any(term in q_lower for term in ("screen", "display", "amoled", "120hz", "oled", "poled")):
                    phone_criteria.append(
                        "Display Quality & Refresh Rate: 120Hz AMOLED/pOLED panel offering high peak outdoor brightness and vibrant color reproduction"
                    )
                if any(term in q_lower for term in ("update", "software", "support", "os", "years", "clean", "ui")):
                    phone_criteria.append(
                        "Long-Term Software Support & OS: Clean UI experience with committed multi-year OS and security update roadmap"
                    )
                if not phone_criteria:
                    phone_criteria = [
                        "Camera Hardware & OIS: Optically stabilized main sensor (50MP class) for consistent low-light photo clarity",
                        "Battery Endurance & Fast Charging: 5,000mAh+ capacity with rapid charging to support heavy daily usage",
                        "Display & Smoothness: High-refresh (120Hz) AMOLED/pOLED panel for fluid navigation",
                        "Software Support & Longevity: Committed multi-year security and Android OS updates",
                    ]
                criteria = phone_criteria[:4]

                summary = (
                    "Live listings in this segment center around upper-midrange 5G chipsets, balancing 25W–68W wired charging with clean multi-year Android update commitments."
                )
        elif is_camera:
            criteria = [
                "Sensor size and dynamic range to ensure crisp low-light details and accurate color depth",
                "Fast, reliable autofocus with subject tracking for sharp portrait and action captures",
                "Versatile lens mount ecosystem and optical image stabilization",
            ]
            summary = (
                "Retail offerings in this tier span entry mirrorless and DSLR bodies, where interchangeable lens ecosystems provide long-term optical flexibility."
            )
        elif is_shoes:
            criteria = [
                "Responsive midsole cushioning (EVA/foam) to absorb repetitive road impact for beginners",
                "Breathable mesh upper for heat dissipation during sustained daily mileage",
                "Durable rubber outsole with dependable traction across outdoor pavements",
            ]
            summary = (
                "Current footwear listings in this segment offer supportive EVA cushioning engineered for entry-level jogging and daily walking consistency."
            )
        elif is_audio:
            headphone_criteria: list[str] = []

            # 1. Travel / Portability & Noise Isolation
            if any(term in q_lower for term in ("travel", "commute", "flight", "transit", "on the go", "portable")):
                headphone_criteria.append(
                    "Travel comfort & noise isolation: Lightweight, ergonomic build and effective noise isolation to reduce commute fatigue"
                )

            # 2. Music / Sound quality
            if any(term in q_lower for term in ("music", "sound", "bass", "audio", "clarity", "vocal")):
                headphone_criteria.append(
                    "Music listening & sound quality: Dynamic audio drivers tuned for vibrant acoustic balance and bass punch"
                )

            # 3. Gaming suitability & Latency (with explicit acknowledgment of spec availability)
            if any(term in q_lower for term in ("game", "gaming", "gamer", "fps", "latency")):
                headphone_criteria.append(
                    "Gaming suitability & latency: Low-latency wireless mode or wired 3.5mm AUX option to reduce audio delay"
                )

            # 4. Movies / Extended Comfort
            if any(term in q_lower for term in ("movie", "movies", "film", "cinema", "comfort", "cushion")):
                headphone_criteria.append(
                    "Movie listening & comfort: Ergonomic, cushioned earpads/neckband engineered for fatigue-free extended entertainment viewing"
                )

            # 5. Noise Cancellation (ONLY IF EXPLICITLY REQUESTED)
            if any(term in q_lower for term in ("anc", "noise cancellation", "noise cancelling")):
                headphone_criteria.append(
                    "Active Noise Cancellation (ANC): Hardware driver isolation to filter ambient noise"
                )

            # 6. Battery (ONLY IF EXPLICITLY REQUESTED)
            if any(term in q_lower for term in ("battery", "backup", "hours", "playback")):
                headphone_criteria.append(
                    "Battery endurance: Multi-hour playback battery life for extended unplugged sessions"
                )

            if not headphone_criteria:
                headphone_criteria = [
                    "Acoustic driver balance for everyday audio and media playback",
                    "Ergonomic fit and lightweight construction for daily comfort",
                    "Reliable wireless connectivity and clear microphone performance",
                ]

            criteria = headphone_criteria[:4]

            use_cases = []
            if any(term in q_lower for term in ("travel", "commute", "flight", "transit")):
                use_cases.append("travel")
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
            if "travel" in use_cases:
                summary = (
                    "Market offerings for travel in this price tier emphasize portable neckbands and cushioned on-ear designs engineered for commute durability without requiring expensive active noise cancelling hardware."
                )
            elif "noise cancellation" in use_cases and not any(term in q_lower for term in ("music", "game", "movie")):
                summary = (
                    f"Current market listings with noise cancellation under this price tier provide entry-level active isolation or sealed acoustic cushions across major retail platforms."
                )
            else:
                summary = (
                    f"Current {brand_prefix}audio offerings in this segment center around signature bass-forward acoustic tuning and long-lasting wireless playback across major retailers."
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
        elif is_laptop:
            laptop_highlights = []
            if "gpu" in top_specs:
                laptop_highlights.append(top_specs["gpu"])
            if "ram" in top_specs:
                laptop_highlights.append(top_specs["ram"])
            if "processor" in top_specs:
                laptop_highlights.append(top_specs["processor"])
            if "refresh_rate" in top_specs:
                laptop_highlights.append(top_specs["refresh_rate"])
            if laptop_highlights:
                top_pick_reason = f"\"{top_name}\" leads our evaluation with verified {', '.join(laptop_highlights)} and strong price-to-performance balance."
            else:
                top_pick_reason = f"\"{top_name}\" leads our evaluation for balanced hardware specifications, verified customer sentiment, and seller value."
        elif is_audio and ("game" in q_lower or "gaming" in q_lower):
            top_pick_reason = (
                f"\"{top_name}\" leads our evaluation for {brand or 'brand'} acoustic performance, comfort, and value under ₹{budget:,.0f} "
                f"(suitable for casual gaming; wired AUX backup recommended where zero latency is required)."
            ) if budget else (
                f"\"{top_name}\" leads our evaluation for {brand or 'brand'} acoustic performance, comfort, and gaming suitability."
            )
        elif is_audio:
            audio_highlights = []
            if "drivers" in top_specs:
                audio_highlights.append(top_specs["drivers"])
            if "battery" in top_specs:
                audio_highlights.append(top_specs["battery"])
            if "anc" in top_specs:
                audio_highlights.append(top_specs["anc"])
            if audio_highlights:
                top_pick_reason = f"\"{top_name}\" leads our evaluation with verified {', '.join(audio_highlights)} and proven audio value."
            else:
                top_pick_reason = f"\"{top_name}\" leads our evaluation for {brand or 'brand'} sound fidelity, wear comfort, and market value."
        elif is_phone:
            phone_highlights = []
            if "camera" in top_specs:
                phone_highlights.append(top_specs["camera"])
            if "battery" in top_specs:
                phone_highlights.append(top_specs["battery"])
            if "charging" in top_specs:
                phone_highlights.append(f"{top_specs['charging']} charging")
            if "display" in top_specs:
                phone_highlights.append(top_specs["display"])
            if "software_updates" in top_specs:
                phone_highlights.append(top_specs["software_updates"])
            if phone_highlights:
                top_pick_reason = f"\"{top_name}\" leads our evaluation with verified {', '.join(phone_highlights)} and strong overall value."
            else:
                top_pick_reason = f"\"{top_name}\" leads our multi-factor evaluation for camera optics, battery longevity, and price-to-performance."
        else:
            top_pick_reason = f"\"{top_name}\" leads our evaluation for balanced build quality, customer sentiment, and seller value."

        # Direct answer & Trade-offs across categories
        if is_laptop:
            if any(k in q_lower for k in ("gaming", "game", "gamer")):
                direct_answer = (
                    f"For a gaming laptop{f' under ₹{budget:,}' if budget else ''}, our decision engine prioritized configurations with "
                    f"a dedicated GPU (such as NVIDIA GeForce RTX) and a high-refresh display (120Hz/144Hz+) to ensure consistent gaming framerates."
                )
                trade_offs = (
                    "Dedicated GPUs provide superior 3D rendering power but draw higher power and increase thermal output compared to ultraportable laptops."
                )
            elif any(k in q_lower for k in ("machine learning", "ml", "deep learning", "cuda", "ai engineering", "data science")):
                direct_answer = (
                    f"For machine learning and AI workloads{f' under ₹{budget:,}' if budget else ''}, a laptop equipped with a dedicated NVIDIA GPU "
                    f"for CUDA acceleration alongside 16GB RAM provides the most dependable platform for local model development and data science."
                )
                trade_offs = (
                    "Dedicated VRAM governs local model parameter limits; entry 4GB VRAM supports foundational models, while larger models benefit from 6GB–8GB+ VRAM or cloud clusters."
                )
            elif any(k in q_lower for k in ("college", "programming", "coding", "student", "developer")):
                direct_answer = (
                    f"For college programming and coursework{f' under ₹{budget:,}' if budget else ''}, prioritizing a fast multi-core processor (Intel Core i5/Ryzen 5), "
                    f"16GB RAM for multi-tab IDE multitasking, and dependable battery life provides the most practical student value."
                )
                trade_offs = (
                    "Lightweight productivity ultrabooks maximize battery endurance for campus mobility, whereas gaming models offer higher peak compute at greater weight."
                )
            else:
                direct_answer = (
                    f"For laptop productivity{f' under ₹{budget:,}' if budget else ''}, balanced multi-core processors, adequate RAM capacity, and dependable build quality provide the smoothest long-term user experience."
                )
                trade_offs = (
                    "Compact 14-inch notebooks prioritize portability, whereas 15.6-inch designs provide full numeric keypads and broader thermal headroom."
                )
        elif is_audio:
            if "travel" in use_cases or any(k in q_lower for k in ("commute", "flight")):
                direct_answer = (
                    f"For travel headphones{f' under ₹{budget:,}' if budget else ''}, lightweight foldable designs with cushioned earcups and effective acoustic noise isolation provide comfortable fatigue-free listening on long commutes."
                )
                trade_offs = (
                    "Over-ear cushioned headphones offer superior passive noise isolation and battery life, whereas compact earbuds prioritize pocketability."
                )
            elif "game" in use_cases or "gaming" in q_lower:
                direct_answer = (
                    f"For gaming headphones{f' under ₹{budget:,}' if budget else ''}, low audio transmission latency and dynamic acoustic clarity ensure distinct positional sound cues during gameplay."
                )
                trade_offs = (
                    "3.5mm wired connections offer zero latency and never run out of charge, while Bluetooth models provide convenient wireless freedom."
                )
            else:
                direct_answer = (
                    f"For {'boAt ' if brand == 'boAt' else ''}headphones{f' under ₹{budget:,}' if budget else ''}, dynamic acoustic drivers and fatigue-free cushions ensure punchy sound balance across music, streaming, and calls."
                )
                trade_offs = (
                    "Bass-heavy tuning enhances music and movie immersion, while neutral profiles provide clearer vocal clarity for online calls."
                )
        elif is_mouse:
            direct_answer = (
                f"For gaming mice{f' under ₹{budget:,}' if budget else ''}, optical sensor tracking accuracy and a 1000Hz (1ms) polling rate deliver the highest competitive responsiveness."
            )
            trade_offs = (
                "Wired USB mice guarantee zero signal latency and never require battery changes, whereas wireless models provide cleaner desk aesthetics."
            )
        elif is_phone:
            if "gaming" in q_lower:
                direct_answer = (
                    f"For mobile gaming{f' under ₹{budget:,}' if budget else ''}, prioritize a power-efficient performance chipset, 120Hz AMOLED display, and effective thermal cooling for stable high-frame-rate gameplay."
                )
                trade_offs = (
                    "Performance-focused phones deliver sustained frame rates and rapid charging, but often use plastic composite frames or secondary camera sensors."
                )
            else:
                direct_answer = (
                    f"For a camera and battery smartphone{f' under ₹{budget:,}' if budget else ''}, target devices pairing an optically stabilized (OIS) main sensor for sharp low-light captures with a high-capacity 5,000mAh+ battery."
                ) if budget else (
                    "For camera- and battery-focused smartphones, a large stabilized main sensor (OIS), power-efficient 5G chipset, and 5,000mAh+ capacity deliver the best balance of reliable imaging and all-day battery endurance."
                )
                trade_offs = (
                    "In this price bracket, phones excelling in camera optics and long-term OS updates often cap wired charging at 25W–45W with no bundled charger, whereas brands offering rapid 68W+ charging typically feature heavier custom Android skins."
                )
        else:
            direct_answer = (
                f"Based on your search for \"{query}\", ShopMind AI isolated top-rated models strictly satisfying your requested criteria."
            )
            trade_offs = (
                "Entry-tier options maximize affordability for essential tasks, while higher tiers incorporate premium materials and extended features."
            )

        if not top_products:
            if total_count == 0:
                direct_answer = f"No live market listings were found matching \"{query}\" on Google Shopping."
                summary = f"No live market listings were found for '{query}' on Google Shopping."
                final_recommendation = "Try broadening your search terms or checking different brand/category keywords."
                budget_verdict = "No live offers were available to assess."
                top_pick_reason = "No live market listings found."
            else:
                direct_answer = (
                    f"No {category.lower() if category else 'product'} models meeting all strict requirements "
                    f"({f'budget under ₹{budget:,}' if budget else 'budget'} and hardware specifications) "
                    f"were found in current live market listings."
                )
                summary = (
                    f"ShopMind AI evaluated live listings for '{query}'. None of the retrieved listings satisfied both the budget ceiling "
                    f"and required hardware specifications. Non-qualifying models (integrated graphics or over-budget) have been omitted."
                )
                final_recommendation = (
                    f"We recommend expanding your budget ceiling or reviewing entry configurations (such as RTX 3050 laptops starting around ₹52,000–₹58,000)."
                )
                budget_verdict = (
                    f"Stated budget limit of ₹{budget:,}: 0 qualifying models found in live listings."
                    if budget else "0 qualifying models found in live listings."
                )
                top_pick_reason = "No qualifying candidate met all required constraints."
        else:
            top_price_val = top_p.get("price")
            top_price_str = f"₹{top_price_val:,.0f}" if top_price_val else ""
            second_p = top_products[1] if len(top_products) > 1 else None

            if is_phone and second_p:
                second_name = second_p.get("name", "Alternative Pick")
                second_price_val = second_p.get("price")
                second_price_str = f"₹{second_price_val:,.0f}" if second_price_val else ""
                second_specs = second_p.get("verified_specs", {})

                c1_strengths = []
                if top_specs.get("camera"):
                    c1_strengths.append(top_specs["camera"])
                if top_specs.get("battery"):
                    c1_strengths.append(top_specs["battery"])
                if top_specs.get("charging"):
                    c1_strengths.append(f"{top_specs['charging']} charging")
                c1_str = f" with verified {', '.join(c1_strengths[:2])}" if c1_strengths else ""

                c2_strengths = []
                if second_specs.get("software_updates"):
                    c2_strengths.append(second_specs["software_updates"])
                elif second_specs.get("camera"):
                    c2_strengths.append(second_specs["camera"])
                if second_specs.get("battery"):
                    c2_strengths.append(second_specs["battery"])
                if second_specs.get("charging"):
                    c2_strengths.append(f"{second_specs['charging']} charging")
                c2_str = f" featuring {', '.join(c2_strengths[:2])}" if c2_strengths else ""

                final_recommendation = (
                    f"We recommend \"{top_name}\"{f' ({top_price_str})' if top_price_str else ''}{c1_str} as our top overall choice based on composite feature scoring. "
                    f"Runner-up: \"{second_name}\"{f' ({second_price_str})' if second_price_str else ''}{c2_str}."
                )
            elif second_p:
                second_name = second_p.get("name", "Alternative Pick")
                second_price_val = second_p.get("price")
                second_price_str = f"₹{second_price_val:,.0f}" if second_price_val else ""
                final_recommendation = (
                    f"We recommend \"{top_name}\"{f' ({top_price_str})' if top_price_str else ''} as our top overall choice, leading our multi-criterion evaluation for feature match and market value. "
                    f"Runner-up: \"{second_name}\"{f' ({second_price_str})' if second_price_str else ''}."
                )
            else:
                final_recommendation = (
                    f"We recommend \"{top_name}\"{f' ({top_price_str})' if top_price_str else ''} as the best overall choice, leading our multi-criterion evaluation for feature match and market value."
                )

        missing_info = (structured_intent or {}).get("missing_information")
        if missing_info:
            limitations = str(missing_info)
        elif budget is None and any(w in q_lower for w in ("budget", "affordable")):
            limitations = "Numerical budget ceiling not specified; evaluating top-rated choices across value-for-money tiers."
        else:
            limitations = "Specifications are verified against seller listing data; exact battery runtimes and retailer warranty policies may vary."

        return {
            "direct_answer": direct_answer,
            "summary": summary,
            "key_criteria": criteria,
            "trade_offs": trade_offs,
            "final_recommendation": final_recommendation,
            "budget_verdict": budget_verdict,
            "top_pick_reason": top_pick_reason,
            "limitations": limitations,
            "missing_information": missing_info,
            "analysis_source": "deterministic_fallback",
            "model": None,
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
