"""Tests for ShopMind AI Shopping Decision Engine."""

import re
import pytest

from app.services.decision_engine import (
    ShoppingDecisionEngine,
    extract_features,
    build_google_shopping_query,
)
from app.services.search.product_normalizer import NormalizedProduct


def test_extract_features():
    features = extract_features("Best laptop under ₹60,000 for AI engineering.")
    assert "AI engineering / Data Science" in features

    features_headphones = extract_features("Wireless headphones under ₹5,000 with noise cancellation.")
    assert "Noise Cancellation" in features_headphones
    assert "Wireless / Bluetooth" in features_headphones

    features_camera = extract_features("Camera for photography with excellent image quality.")
    assert "Image Quality / Photography" in features_camera

    features_shoes = extract_features("Running shoes for beginners under ₹3,000.")
    assert "Beginner Running" in features_shoes

    features_phone = extract_features("Best smartphone for gaming.")
    assert "Gaming" in features_phone


def test_build_google_shopping_query():
    q = build_google_shopping_query("Looking for wireless headphones under 5000", {}, ["Wireless / Bluetooth"])
    assert "wireless headphones under 5000" in q.lower()


def test_top_recommendations_respect_budget():
    engine = ShoppingDecisionEngine()
    mock_products = [
        {"id": "1", "name": "Expensive Laptop 64GB RAM", "price": 120000.0, "rating": 4.9},
        {"id": "2", "name": "AI Engineering Laptop 16GB", "price": 58000.0, "rating": 4.5},
        {"id": "3", "name": "Coding Laptop 16GB RAM", "price": 54000.0, "rating": 4.3},
        {"id": "4", "name": "Basic Laptop", "price": 42000.0, "rating": 4.0},
        {"id": "5", "name": "Developer Machine", "price": 59990.0, "rating": 4.6},
        {"id": "6", "name": "Budget Laptop", "price": 35000.0, "rating": 3.8},
        {"id": "7", "name": "Overbudget Monster", "price": 95000.0, "rating": 4.8},
    ]

    recs = engine._select_top_recommendations(
        products=mock_products,
        query="Best laptop under ₹60,000 for AI engineering.",
        budget=60000,
        features=["AI engineering / Data Science"],
    )

    assert len(recs) <= 5
    # All recommendations must respect the stated budget of 60000
    for r in recs:
        assert r["price"] <= 60000.0
        assert "recommendation_badge" in r


def test_fallback_analysis_changes_with_query():
    engine = ShoppingDecisionEngine()

    analysis_laptop = engine._build_deterministic_analysis(
        query="Best laptop under ₹60,000 for AI engineering.",
        category="Laptop",
        budget=60000,
        features=["AI engineering / Data Science"],
        top_products=[{"name": "Lenovo V15", "price": 57690.0}],
        total_count=48,
    )
    assert "AI engineering" in analysis_laptop["summary"]
    assert "60,000" in analysis_laptop["budget_verdict"]

    analysis_headphones = engine._build_deterministic_analysis(
        query="Wireless headphones under ₹5,000 with noise cancellation.",
        category="Headphones",
        budget=5000,
        features=["Noise Cancellation"],
        top_products=[{"name": "boAt Nirvana", "price": 3499.0}],
        total_count=40,
    )
    assert "noise cancellation" in analysis_headphones["summary"].lower()
    assert "5,000" in analysis_headphones["budget_verdict"]

    # The two analyses must be distinct
    assert analysis_laptop["summary"] != analysis_headphones["summary"]


def test_boat_headphones_intent_extraction_no_unrequested_defaults():
    """Verify structured intent extracts boAt, budget 2000, music, gaming, movies, without unrequested criteria."""
    from app.services.decision_engine import extract_structured_intent

    query = "best boat headphones for music, gaming, movies under 2000"
    intent = extract_structured_intent(query)

    assert intent["brand"] == "boAt"
    assert intent["budget"] == 2000
    assert intent["category"] == "Headphones"

    # Requested use cases must be present
    assert "Music / Audio Quality" in intent["features"]
    assert "Gaming" in intent["features"]
    assert "Movies / Extended Comfort" in intent["features"]

    # Unrequested criteria must NOT be in features
    assert "Noise Cancellation" not in intent["features"]
    assert "Long Battery Life" not in intent["features"]

    # Unrequested features explicitly tracked
    assert "Active Noise Cancellation (ANC)" in intent["unrequested_features"]
    assert "20+ Hours Battery Life" in intent["unrequested_features"]


def test_boat_headphones_criteria_and_explanation_grounding():
    """Verify criteria prioritize music, gaming, movies, boAt, and under 2000, without inventing ANC or battery hours."""
    from app.services.decision_engine import extract_structured_intent

    query = "best boat headphones for music, gaming, movies under 2000"
    intent = extract_structured_intent(query)
    engine = ShoppingDecisionEngine()

    mock_top = [
        {"name": "boAt Rockerz 450 Bluetooth On-Ear Headphones", "price": 1499.0, "rating": 4.3, "review_count": 15000},
        {"name": "boAt BassHeads 900 Wired On Ear Headphones", "price": 799.0, "rating": 4.2, "review_count": 22000},
    ]

    analysis = engine._build_deterministic_analysis(
        query=query,
        category=intent["category"] or "Headphones",
        budget=intent["budget"],
        features=intent["features"],
        top_products=mock_top,
        total_count=15,
        brand=intent["brand"],
        structured_intent=intent,
    )

    criteria_text = " ".join(analysis["key_criteria"]).lower()
    summary_text = analysis["summary"].lower()

    # 1. Unrequested criteria must NOT appear
    assert "active noise cancellation" not in criteria_text
    assert not re.search(r"\banc\b", criteria_text)
    assert "20+ hours" not in criteria_text
    assert "active noise cancellation" not in summary_text


    # 2. Requested priorities must be reflected
    assert "music" in criteria_text or "sound quality" in criteria_text
    assert "gaming" in criteria_text
    assert "movie" in criteria_text or "comfort" in criteria_text
    assert "boat" in criteria_text or "boat" in summary_text
    assert "2,000" in criteria_text or "2,000" in analysis["budget_verdict"]

    # 3. Spec limitation acknowledgment for gaming/sound
    assert "spec" in criteria_text or "latency" in criteria_text
    assert "wired" in criteria_text or "aux" in criteria_text or "latency" in criteria_text


def test_priority_aware_ranking_and_evidence_based_badges():
    """Verify boAt under 2000 products rank higher than off-brand/overbudget items, and badges reflect true evidence."""
    engine = ShoppingDecisionEngine()
    query = "best boat headphones for music, gaming, movies under 2000"

    candidates = [
        # Candidate 1: boAt within budget, high rating, sound/gaming/comfort text -> should rank #1
        {
            "id": "b1",
            "name": "boAt Rockerz 550 Over-Ear Wireless Headphone with 50mm Drivers, Ergonomic Cushion",
            "brand": "boAt",
            "price": 1799.0,
            "rating": 4.4,
            "review_count": 8500,
            "description": "Deep bass music playback, physical AUX port for low-latency wired gaming, plush ear cushions for movies",
        },
        # Candidate 2: boAt lowest price within budget -> should earn Best Value
        {
            "id": "b2",
            "name": "boAt BassHeads 900 Wired On-Ear Headphones with Mic",
            "brand": "boAt",
            "price": 799.0,
            "rating": 4.2,
            "review_count": 35000,
            "description": "Punchy sound, zero latency wired connection for gaming and movies",
        },
        # Candidate 3: boAt highest rating -> should earn Editor's Choice or Popular Pick
        {
            "id": "b3",
            "name": "boAt Rockerz 450 On-Ear Bluetooth Headphones",
            "brand": "boAt",
            "price": 1499.0,
            "rating": 4.5,
            "review_count": 45000,
            "description": "Signature sound, cushioned earcups for binge watching movies",
        },
        # Candidate 4: Overbudget boAt (> 2000) -> should be penalized
        {
            "id": "b4",
            "name": "boAt Nirvana 751 ANC Over-Ear Headphone",
            "brand": "boAt",
            "price": 3999.0,
            "rating": 4.5,
            "review_count": 5000,
        },
        # Candidate 5: Off-brand within budget -> should rank lower than matching boAt
        {
            "id": "o1",
            "name": "Zebronics Thunder Wireless Headphones",
            "brand": "Zebronics",
            "price": 699.0,
            "rating": 3.8,
            "review_count": 1200,
        },
    ]

    top_recs = engine._select_top_recommendations(
        products=candidates,
        query=query,
        budget=2000,
        features=["Music / Audio Quality", "Gaming", "Movies / Extended Comfort"],
        brand="boAt",
    )

    # Top recommendations must all be within budget
    for r in top_recs:
        assert r["price"] <= 2000.0

    # Top 1 must be a boAt product matching the requirements
    top_pick = top_recs[0]
    assert "boat" in (top_pick.get("brand") or "").lower() or "boat" in top_pick["name"].lower()
    assert top_pick["recommendation_badge"] == "Top Recommendation"

    # Evidence-grounded badges
    badges = {r["recommendation_badge"] for r in top_recs}
    assert "Top Recommendation" in badges
    assert "Best Value" in badges

    # Best Value badge must be assigned to the lowest price contender (b2 at 799)
    best_val_item = next(r for r in top_recs if r["recommendation_badge"] == "Best Value")
    assert best_val_item["price"] == 799.0


@pytest.mark.anyio
async def test_end_to_end_decision_engine_execute_boat_query():
    """Verify complete decision engine execution flow for the boAt query."""
    from app.services.search.search_service import SearchService
    from app.services.search.providers.base_provider import BaseProductProvider

    class MockSearchProvider(BaseProductProvider):
        async def search(self, query: str):
            return [
                {
                    "product_id": "boat_550",
                    "title": "boAt Rockerz 550 Over-Ear Wireless Headphone",
                    "price": 1799.0,
                    "rating": 4.4,
                    "reviews": 8500,
                    "source": "Amazon.in",
                    "snippet": "50mm drivers for music, physical AUX port for wired gaming, plush cushions for movies",
                },
                {
                    "product_id": "boat_450",
                    "title": "boAt Rockerz 450 Bluetooth On-Ear Headphone",
                    "price": 1499.0,
                    "rating": 4.3,
                    "reviews": 45000,
                    "source": "Flipkart",
                    "snippet": "Signature sound, cushioned earcups for binge watching movies",
                },
                {
                    "product_id": "boat_900",
                    "title": "boAt BassHeads 900 Wired On Ear Headphone",
                    "price": 799.0,
                    "rating": 4.2,
                    "reviews": 32000,
                    "source": "Amazon.in",
                    "snippet": "Punchy sound, low-latency wired connection for movies and games",
                },
                {
                    "product_id": "boat_nirvana",
                    "title": "boAt Nirvana 751 ANC Over-Ear Headphone",
                    "price": 3999.0,
                    "rating": 4.5,
                    "reviews": 5000,
                    "source": "Amazon.in",
                },
            ]

    search_service = SearchService([MockSearchProvider()])
    engine = ShoppingDecisionEngine()

    query = "best boat headphones for music, gaming, movies under 2000"
    result = await engine.execute(query, search_service)

    # 1. Intent verification
    intent = result["intent"]
    assert intent["brand"] == "boAt"
    assert intent["budget"] == 2000
    assert "Active Noise Cancellation (ANC)" in intent["unrequested_features"]

    # 2. Recommendations verification
    top_recs = result["top_recommendations"]
    assert len(top_recs) == 3  # exactly the 3 within-budget options
    for r in top_recs:
        assert r["price"] <= 2000.0
        assert "boat" in (r.get("brand") or "").lower() or "boat" in r["name"].lower()

    # 3. AI Analysis verification
    analysis = result["ai_analysis"]
    criteria_str = " ".join(analysis["key_criteria"]).lower()
    summary_str = analysis["summary"].lower()

    # Absence of unrequested criteria
    assert "active noise cancellation" not in criteria_str
    assert not re.search(r"\banc\b", criteria_str)
    assert "20+ hours" not in criteria_str

    # Presence of requested priorities
    assert "music" in criteria_str or "sound" in criteria_str
    assert "gaming" in criteria_str
    assert "movie" in criteria_str or "comfort" in criteria_str
    assert "boat" in summary_str or "boat" in criteria_str
    assert "2,000" in analysis["budget_verdict"]




# ---------------------------------------------------------------------------
# Additional Final Decision Engine Quality Tests
# ---------------------------------------------------------------------------

def test_mouse_specs_extraction_verified_vs_unknown():
    """Verify gaming-mouse spec extraction distinguishes verified facts from unknown data without guessing."""
    from app.services.decision_engine import extract_verified_specs

    # Product with rich explicit specifications
    rich_mouse = {
        "name": "Razer DeathAdder V2 Gaming Mouse",
        "description": "Ergonomic wired mouse with 20000 DPI Focus+ optical sensor, 1000Hz polling rate, 82g lightweight design, and 8 programmable buttons.",
        "specifications": {
            "DPI": "20000",
            "Polling Rate": "1000Hz",
        },
    }
    extracted = extract_verified_specs(rich_mouse, category="Mouse")
    verified = extracted["verified"]
    metrics = extracted["metrics"]

    assert "dpi" in verified
    assert "20,000 DPI" in verified["dpi"]
    assert metrics["dpi"] == 20000

    assert "polling_rate" in verified
    assert "1000Hz" in verified["polling_rate"]
    assert metrics["polling_rate"] == 1000

    assert "sensor" in verified
    assert "Focus+" in verified["sensor"]

    assert "weight" in verified
    assert "82g" in verified["weight"]
    assert metrics["weight"] == 82

    assert "connection" in verified
    assert "Wired" in verified["connection"]

    assert "buttons" in verified
    assert "8" in verified["buttons"]

    # Product with no explicit technical specs
    bare_mouse = {
        "name": "Generic RGB Gaming Mouse",
        "description": "Cool ergonomic mouse with RGB lights for PC gamers.",
    }
    extracted_bare = extract_verified_specs(bare_mouse, category="Mouse")
    assert "dpi" not in extracted_bare["verified"]
    assert "polling_rate" not in extracted_bare["verified"]
    assert "weight" not in extracted_bare["verified"]

    # Unspecified list must explicitly track what is unknown
    unspecified = extracted_bare["unspecified"]
    assert any("DPI" in u for u in unspecified)
    assert any("polling rate" in u.lower() or "latency" in u.lower() for u in unspecified)
    assert any("weight" in u.lower() for u in unspecified)


def test_price_distribution_and_outlier_detection():
    """Verify price distribution detects unusually high/low outliers and does not favor high prices."""
    from app.services.decision_engine import analyze_price_distribution, assess_product_price

    products = [
        {"id": "m1", "name": "Entry Mouse", "price": 899.0},
        {"id": "m2", "name": "Mid Mouse 1", "price": 1495.0},
        {"id": "m3", "name": "Mid Mouse 2", "price": 1799.0},
        {"id": "m4", "name": "Premium Mouse", "price": 3499.0},
        {"id": "m5", "name": "Outlier High Mouse", "price": 18999.0},  # Unusually expensive
        {"id": "m6", "name": "Mouse Grip Tape", "price": 99.0, "is_accessory": True},  # Low outlier accessory
    ]

    stats = analyze_price_distribution(products)
    assert stats["median"] is not None
    assert stats["median"] < 3000.0

    # High outlier check
    assessment_high = assess_product_price(products[4], stats, budget=None)
    assert assessment_high["outlier"] == "high_outlier"
    assert assessment_high["tier"] == "premium"

    # Low outlier check
    assessment_low = assess_product_price(products[5], stats, budget=None)
    assert assessment_low["outlier"] == "low_outlier"


def test_top_mouse_for_gaming_no_budget_tier_diversity_and_badges():
    """Test 'top mouse for gaming' with no budget: balances tiers, awards evidence-based badges, and explains trade-offs."""
    from app.services.decision_engine import extract_structured_intent

    query = "top mouse for gaming"
    intent = extract_structured_intent(query)
    assert intent["category"] == "Mouse"
    assert intent["budget"] is None
    assert "Gaming" in intent["features"]

    engine = ShoppingDecisionEngine()
    candidates = [
        # Candidate 1: High-end enthusiast mouse with verified specs
        {
            "id": "g1",
            "name": "Razer DeathAdder V2 Wired Gaming Mouse",
            "price": 3499.0,
            "rating": 4.6,
            "review_count": 8200,
            "description": "20000 DPI Focus+ optical sensor, 1000Hz polling rate, 82g lightweight frame",
        },
        # Candidate 2: Best Value mid-range pick with 1000Hz and massive reviews
        {
            "id": "g2",
            "name": "Logitech G102 Lightsync Optical Gaming Mouse",
            "price": 1495.0,
            "rating": 4.4,
            "review_count": 28000,
            "description": "8000 DPI gaming-grade sensor, 1000Hz 1ms response, 85g weight, 6 programmable buttons",
        },
        # Candidate 3: Accessible budget pick
        {
            "id": "g3",
            "name": "Redragon Centrophorus Gaming Mouse",
            "price": 899.0,
            "rating": 4.1,
            "review_count": 3500,
            "description": "3200 DPI optical sensor, wired USB, durable microswitches",
        },
        # Candidate 4: Unusually expensive outlier with missing specs
        {
            "id": "g4",
            "name": "Gold Luxury Desk Mouse",
            "price": 24999.0,
            "rating": 3.9,
            "review_count": 12,
            "description": "Fancy luxury mouse with gold accents",
        },
    ]

    top_recs = engine._select_top_recommendations(
        products=candidates,
        query=query,
        budget=None,
        features=intent["features"],
        category="Mouse",
    )

    # 1. Top pick must NOT be the highest-priced product (g4 at 24999)
    assert top_recs[0]["id"] != "g4"
    assert top_recs[0]["id"] == "g1"  # Highest verified spec composite score
    assert top_recs[0]["recommendation_badge"] in ("Top Recommendation", "Best Overall")

    # 2. Evidence-based badges
    badge_map = {r["id"]: r["recommendation_badge"] for r in top_recs}
    assert badge_map["g3"] == "Best Value"  # Lower price than median with 3200 DPI / 3500 reviews
    assert badge_map["g2"] in ("Editor's Choice", "Popular Pick")  # 4.4 rating, 28000 reviews, 8000 DPI

    # 3. Deterministic market analysis explains affordable vs premium trade-offs
    analysis = engine._build_deterministic_analysis(
        query=query,
        category="Mouse",
        budget=None,
        features=intent["features"],
        top_products=top_recs,
        total_count=len(candidates),
        structured_intent=intent,
    )
    criteria_text = " ".join(analysis["key_criteria"]).lower()
    summary_text = analysis["summary"].lower()

    assert "dpi" in criteria_text or "sensor" in criteria_text
    assert "polling rate" in criteria_text or "1000hz" in criteria_text or "latency" in criteria_text
    assert "trade-off" in criteria_text or "premium" in summary_text or "entry" in summary_text


def test_gaming_mouse_under_2000_low_latency_budget_compliance():
    """Test 'gaming mouse under ₹2,000 with low latency': prioritizes compliant products, low-latency wired/1000Hz, and flags over-budget."""
    from app.services.decision_engine import extract_structured_intent

    query = "gaming mouse under ₹2,000 with low latency"
    intent = extract_structured_intent(query)
    assert intent["category"] == "Mouse"
    assert intent["budget"] == 2000
    assert "Gaming" in intent["features"]
    assert "Low Latency / High Polling Rate" in intent["features"]

    engine = ShoppingDecisionEngine()
    candidates = [
        # Within budget, low latency wired
        {
            "id": "m_budget_1",
            "name": "Logitech G102 Lightsync Gaming Mouse with 1000Hz 1ms Polling",
            "price": 1495.0,
            "rating": 4.4,
            "review_count": 28000,
            "description": "True 1000Hz polling rate (1ms), 8000 DPI, zero latency wired connection",
        },
        # Within budget, lower price
        {
            "id": "m_budget_2",
            "name": "Razer DeathAdder Essential Wired Gaming Mouse with 6400 DPI",
            "price": 1299.0,
            "rating": 4.3,
            "review_count": 19000,
            "description": "6400 DPI optical sensor, Speedflex wired cable for instant response",
        },
        # Over budget (> 2000)
        {
            "id": "m_overbudget",
            "name": "Razer Viper Ultimate Wireless Gaming Mouse",
            "price": 7999.0,
            "rating": 4.7,
            "review_count": 4500,
            "description": "Wireless 20000 DPI sensor",
        },
    ]

    top_recs = engine._select_top_recommendations(
        products=candidates,
        query=query,
        budget=2000,
        features=intent["features"],
        category="Mouse",
    )

    # All top recommendations must respect budget
    for r in top_recs:
        assert r["price"] <= 2000.0

    analysis = engine._build_deterministic_analysis(
        query=query,
        category="Mouse",
        budget=2000,
        features=intent["features"],
        top_products=top_recs,
        total_count=len(candidates),
        structured_intent=intent,
    )

    assert "2,000" in analysis["budget_verdict"]
    criteria_text = " ".join(analysis["key_criteria"]).lower()
    assert "latency" in criteria_text or "1000hz" in criteria_text or "wired" in criteria_text


def test_category_criteria_generalization_across_products():
    """Verify criteria change dynamically per category (mouse vs headphones vs laptop vs camera vs shoes)."""
    engine = ShoppingDecisionEngine()

    # 1. Mouse query
    analysis_mouse = engine._build_deterministic_analysis(
        query="top mouse for gaming",
        category="Mouse",
        budget=None,
        features=["Gaming"],
        top_products=[{"name": "Logitech G102", "price": 1495.0}],
        total_count=20,
    )
    mouse_text = " ".join(analysis_mouse["key_criteria"]).lower()
    assert "dpi" in mouse_text or "sensor" in mouse_text
    assert not re.search(r"\bheadphone\b", mouse_text)
    assert not re.search(r"\bram\b", mouse_text)

    # 2. Headphones query
    analysis_audio = engine._build_deterministic_analysis(
        query="best boat headphones for music, gaming, movies under 2000",
        category="Headphones",
        budget=2000,
        features=["Music / Audio Quality", "Gaming", "Movies / Extended Comfort"],
        top_products=[{"name": "boAt Rockerz 450", "price": 1499.0}],
        total_count=20,
        brand="boAt",
    )
    audio_text = " ".join(analysis_audio["key_criteria"]).lower()
    assert "drivers" in audio_text or "music" in audio_text or "sound" in audio_text
    assert "dpi" not in audio_text
    assert "polling rate" not in audio_text

    # 3. Laptop query
    analysis_laptop = engine._build_deterministic_analysis(
        query="Best laptop under ₹60,000 for AI engineering.",
        category="Laptop",
        budget=60000,
        features=["AI engineering / Data Science"],
        top_products=[{"name": "Lenovo V15", "price": 57690.0}],
        total_count=20,
    )
    laptop_text = " ".join(analysis_laptop["key_criteria"]).lower()
    assert "ram" in laptop_text
    assert "ssd" in laptop_text
    assert "dpi" not in laptop_text

    # 4. Camera query
    analysis_camera = engine._build_deterministic_analysis(
        query="Camera for photography with excellent image quality.",
        category="Camera",
        budget=None,
        features=["Image Quality / Photography"],
        top_products=[{"name": "Sony Alpha", "price": 54990.0}],
        total_count=20,
    )
    camera_text = " ".join(analysis_camera["key_criteria"]).lower()
    assert "sensor" in camera_text
    assert "autofocus" in camera_text or "lens" in camera_text


def test_transparent_scoring_breakdown_and_missing_data():
    """Verify criterion-level score breakdown is exposed, missing specs earn 0 points, and ratings cannot override intent."""
    from app.services.decision_engine import (
        extract_verified_specs,
        analyze_price_distribution,
        assess_product_price,
        compute_transparent_score,
    )

    stats = {"median": 2000.0, "low_threshold": 500.0, "high_threshold": 6000.0}

    # Item with verified specs
    item_with_specs = {
        "name": "Razer DeathAdder Essential 6400 DPI Gaming Mouse",
        "price": 1299.0,
        "rating": 4.3,
        "review_count": 15000,
        "description": "6400 DPI optical sensor, wired USB, 5 buttons",
    }
    spec_info = extract_verified_specs(item_with_specs, "Mouse")
    price_info = assess_product_price(item_with_specs, stats, budget=2000)

    score_1, breakdown_1 = compute_transparent_score(
        p=item_with_specs,
        query="gaming mouse under 2000",
        target_category="Mouse",
        target_brand=None,
        budget=2000,
        features=["Gaming"],
        spec_info=spec_info,
        price_info=price_info,
        price_stats=stats,
    )

    # Score breakdown must have all 5 transparent components
    assert "intent_relevance" in breakdown_1
    assert "budget_and_value" in breakdown_1
    assert "verified_specs" in breakdown_1
    assert "reputation" in breakdown_1
    assert "listing_quality" in breakdown_1
    assert breakdown_1["verified_specs"] > 0.0

    # Item with 5.0 star rating but missing specs and off-category
    item_missing_specs = {
        "name": "Super Fast Awesome RGB Gadget",
        "price": 1999.0,
        "rating": 5.0,  # perfect rating
        "review_count": 2,
        "description": "A very nice gadget with RGB lights",
    }
    spec_info_bare = extract_verified_specs(item_missing_specs, "Mouse")
    price_info_bare = assess_product_price(item_missing_specs, stats, budget=2000)

    score_2, breakdown_2 = compute_transparent_score(
        p=item_missing_specs,
        query="gaming mouse under 2000",
        target_category="Mouse",
        target_brand=None,
        budget=2000,
        features=["Gaming"],
        spec_info=spec_info_bare,
        price_info=price_info_bare,
        price_stats=stats,
    )

    # Missing specs must earn exactly 0.0 points
    assert breakdown_2["verified_specs"] == 0.0

    # Rating alone cannot override feature relevance and verified specs
    assert score_1 > score_2
