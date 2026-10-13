import pytest
from app.services.decision_engine import (
    decision_engine,
    extract_structured_intent,
    extract_phone_model_key,
    extract_verified_specs,
)
from app.services.search.product_normalizer import NormalizedProduct, ProductOffer


def test_phone_query_intent_and_criteria():
    query = "Recommend a phone with a great camera and battery life under 40000."
    intent = extract_structured_intent(query)
    
    assert intent["category"] == "Smartphone"
    assert intent["budget"] == 40000
    assert "Camera & Photography" in intent["features"]
    assert "Long Battery Life" in intent["features"]
    
    # Check deterministic analysis generated for this query
    det_analysis = decision_engine._build_deterministic_analysis(
        query=query,
        category="Smartphone",
        budget=40000,
        features=intent["features"],
        top_products=[],
        total_count=10,
        brand=None,
        structured_intent=intent,
    )
    
    criteria_text = " ".join(det_analysis["key_criteria"]).lower()
    
    # Must NOT contain DSLR / camera lens mount ecosystem claims
    assert "lens mount" not in criteria_text
    assert "interchangeable" not in criteria_text
    assert "dslr" not in criteria_text
    assert "mirrorless" not in criteria_text
    
    # Must contain smartphone camera and battery specifics
    assert any(term in criteria_text for term in ("ois", "optical image stabilization", "sensor"))
    assert any(term in criteria_text for term in ("battery", "5,000mah", "endurance", "mah"))
    
    # Must NOT have generic AMOLED battery trade-offs
    trade_offs_text = det_analysis["trade_offs"].lower()
    assert "deliver fluid animations but consume more battery" not in trade_offs_text


def test_phone_model_key_deduplication():
    # Galaxy A56 variants must all collapse to the same canonical model key
    a56_v1 = extract_phone_model_key("Samsung Galaxy A56 5G - Awesome Light Gray", "Samsung")
    a56_v2 = extract_phone_model_key("Samsung Galaxy A56 Dual SIM 5G - Pink / 8GB + 128GB", "Samsung")
    a56_v3 = extract_phone_model_key("Refurbished Samsung Galaxy A56 5G (128GB, 6GB RAM)", "Samsung")
    a56_v4 = extract_phone_model_key("Samsung Galaxy A56 5G Mobile (Awesome Midnight Blue, 8GB, 128GB)", "Samsung")
    
    assert a56_v1 == "samsung:galaxy a56"
    assert a56_v2 == "samsung:galaxy a56"
    assert a56_v3 == "samsung:galaxy a56"
    assert a56_v4 == "samsung:galaxy a56"
    
    # Other major competitors must produce distinct model keys
    assert extract_phone_model_key("Motorola Edge 70 Fusion 5G", "Motorola") == "motorola:edge 70 fusion"
    assert extract_phone_model_key("TECNO Camon 50 Ultra 5G", "Tecno") == "tecno:camon 50 ultra"
    assert extract_phone_model_key("Nothing Phone (4a) 5G", "Nothing") == "nothing:phone 4a"
    assert extract_phone_model_key("Google Pixel 9A", "Google") == "google:pixel 9a"
    assert extract_phone_model_key("OnePlus Nord CE6 Lite", "OnePlus") == "oneplus:nord ce6 lite"


def test_phone_spec_extraction():
    prod = {
        "name": "TECNO Camon 50 Ultra 5G (8GB RAM, 256GB Storage) | 6500mAh Battery | 50MP Sony LYTIA 700C Triple Camera",
        "description": "50MP Sony LYTIA 700C with OIS | 6500mAh long battery | 68W fast charging | 120Hz AMOLED display",
        "specifications": {},
        "brand": "Tecno",
    }
    spec_info = extract_verified_specs(prod, "Smartphone")
    verified = spec_info["verified"]
    metrics = spec_info["metrics"]
    
    assert "Sony Lytia 700C" in verified["camera"]
    assert "OIS" in verified["camera"]
    assert metrics["has_ois"] is True
    assert metrics["camera_mp"] == 50
    assert metrics["battery_mah"] == 6500
    assert metrics["charging_watts"] == 68
    assert "6,500mAh Battery" in verified["battery"]
    assert "68W Fast Charging" in verified["charging"]


@pytest.mark.anyio
async def test_recommendation_diversity_and_comparative_verdict():
    # Setup mock search service with multiple A56 variants and competitors
    class MockSearchService:
        async def search(self, q: str):
            prods = [
                NormalizedProduct(
                    product_id="sam-a56-new-1",
                    name="Samsung Galaxy A56 5G 8GB/128GB - Black",
                    brand="Samsung",
                    category="Smartphone",
                    description="50MP Triple Camera, 6 OS Updates, 5000mAh Battery",
                    offers=[ProductOffer(price=38999.0, stock_status="in_stock", condition="new")],
                ),
                NormalizedProduct(
                    product_id="sam-a56-new-2",
                    name="Samsung Galaxy A56 5G 12GB/256GB - Awesome White",
                    brand="Samsung",
                    category="Smartphone",
                    description="50MP Triple Camera, 6 OS Updates, 5000mAh Battery",
                    offers=[ProductOffer(price=39999.0, stock_status="in_stock", condition="new")],
                ),
                NormalizedProduct(
                    product_id="sam-a56-refurb",
                    name="Refurbished Samsung Galaxy A56 5G 128GB",
                    brand="Samsung",
                    category="Smartphone",
                    condition="refurbished",
                    description="50MP Triple Camera, 5000mAh Battery",
                    offers=[ProductOffer(price=24999.0, stock_status="in_stock", condition="refurbished")],
                ),
                NormalizedProduct(
                    product_id="tecno-camon-50",
                    name="TECNO Camon 50 Ultra 5G 6500mAh Sony LYTIA 700C OIS",
                    brand="Tecno",
                    category="Smartphone",
                    description="50MP Sony LYTIA 700C OIS, 6500mAh Battery, 68W charging",
                    offers=[ProductOffer(price=39999.0, stock_status="in_stock", condition="new")],
                ),
                NormalizedProduct(
                    product_id="nothing-phone-4a",
                    name="Nothing Phone (4a) 50MP OIS 120Hz AMOLED",
                    brand="Nothing",
                    category="Smartphone",
                    description="50MP OIS Camera, Clean OS, 5000mAh Battery",
                    offers=[ProductOffer(price=32899.0, stock_status="in_stock", condition="new")],
                ),
                NormalizedProduct(
                    product_id="moto-edge-70",
                    name="Motorola Edge 70 Fusion 5G 50MP OIS 5000mAh 68W",
                    brand="Motorola",
                    category="Smartphone",
                    description="50MP OIS Sony LYTIA, 5000mAh Battery, 68W TurboPower",
                    offers=[ProductOffer(price=34999.0, stock_status="in_stock", condition="new")],
                ),
                NormalizedProduct(
                    product_id="pixel-9a",
                    name="Google Pixel 9A 5G 50MP Camera",
                    brand="Google",
                    category="Smartphone",
                    description="50MP Camera, Pixel AI, 5000mAh Battery",
                    offers=[ProductOffer(price=37999.0, stock_status="in_stock", condition="new")],
                ),
            ]
            return prods

    res = await decision_engine.execute(
        "Recommend a phone with a great camera and battery life under 40000.",
        MockSearchService(),
    )
    
    top_recs = res["top_recommendations"]
    assert len(top_recs) == 5
    
    # Ensure all 5 are distinct phone models
    model_keys = [extract_phone_model_key(p["name"], p.get("brand")) for p in top_recs]
    assert len(set(model_keys)) == 5
    
    # Ensure Galaxy A56 only appears ONCE in Top 5 (no variant duplicates)
    a56_count = sum(1 for k in model_keys if "galaxy a56" in k)
    assert a56_count <= 1
    
    # Ensure refurbished unit does not crowd out new models
    refurb_count = sum(1 for p in top_recs if p.get("condition") == "refurbished")
    assert refurb_count == 0
    
    # Verify final recommendation is comparative
    final_rec = res["ai_analysis"]["final_recommendation"]
    assert len(final_rec) > 50
    assert "recommend" in final_rec.lower()

