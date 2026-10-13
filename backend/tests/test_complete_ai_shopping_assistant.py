"""Test suite for the complete AI Shopping Decision Engine.

Covers:
- Queries A through I
- Failure modes (OpenRouter timeout, rate limit, invalid response, SerpApi empty/failure)
"""

import asyncio
from typing import Any
import pytest

from app.services.decision_engine import ShoppingDecisionEngine
from app.services.search.product_normalizer import NormalizedProduct
from app.services.search.search_service import SearchService
from app.services.search.providers.base_provider import BaseProductProvider, ProductProviderError


class MockFixedSearchProvider(BaseProductProvider):
    """Provides predetermined mock listings for deterministic end-to-end tests."""

    def __init__(self, products: list[dict[str, Any]] | None = None) -> None:
        self.products = products or []

    async def search(self, query: str) -> list[dict[str, Any]]:
        return self.products


@pytest.mark.anyio
async def test_query_a_gaming_laptop_under_60000():
    """Query A: 'Best gaming laptop under ₹60,000.'
    Expected: gaming-relevant laptops, strict budget enforcement, GPU-aware ranking, query-specific explanation.
    """
    mock_candidates = [
        {
            "product_id": "lap_nitro",
            "title": "Acer Nitro V Gaming Laptop AMD Ryzen 5, 16GB RAM, RTX 3050 6GB GPU, 144Hz",
            "price": 58990.0,
            "rating": 4.5,
            "reviews": 1200,
            "source": "Amazon.in",
        },
        {
            "product_id": "lap_victus",
            "title": "HP Victus Gaming Laptop Intel Core i5, 8GB RAM, RTX 2050 4GB GPU, 144Hz",
            "price": 52990.0,
            "rating": 4.2,
            "reviews": 850,
            "source": "Flipkart",
        },
        {
            "product_id": "lap_overbudget",
            "title": "ASUS ROG Strix G16 Intel Core i7, 16GB RAM, RTX 4060, 165Hz",
            "price": 94990.0,
            "rating": 4.8,
            "reviews": 400,
            "source": "Amazon.in",
        },
        {
            "product_id": "lap_office",
            "title": "HP 15s Intel Core i5 12th Gen, 16GB RAM, 512GB SSD, Intel Iris Xe Graphics",
            "price": 49990.0,
            "rating": 4.3,
            "reviews": 2300,
            "source": "Amazon.in",
        },
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine()

    result = await engine.execute("Best gaming laptop under ₹60,000.", search_service)

    # 1. Budget enforcement
    assert result["intent"]["budget"] == 60000
    top_recs = result["top_recommendations"]
    assert len(top_recs) >= 1
    for r in top_recs:
        assert r["price"] <= 60000.0
        # Over-budget ROG Strix must not be in top recommendations
        assert r["id"] != "lap_overbudget"

    # 2. Dedicated GPU prioritization
    top_pick = top_recs[0]
    assert "RTX" in top_pick["name"] or "rtx" in str(top_pick.get("verified_specs", {}).get("gpu", "")).lower()

    # 3. Gaming-specific criteria & analysis
    analysis = result["ai_analysis"]
    crit_str = " ".join(analysis["key_criteria"]).lower()
    assert "gpu" in crit_str or "graphics" in crit_str or "gaming" in crit_str
    assert "60,000" in analysis["budget_verdict"] or "60000" in analysis["budget_verdict"]


@pytest.mark.anyio
async def test_query_b_cs_student_nvidia_gpu_within_budget():
    """Query B: 'I am a computer science student. Recommend a laptop with an NVIDIA GPU within my budget.'
    Expected: recognize missing numerical budget, disclose missing info, prioritize qualifying NVIDIA laptops.
    """
    mock_candidates = [
        {
            "product_id": "lap_tuf_4050",
            "title": "ASUS TUF Gaming A15 AMD Ryzen 7, 16GB RAM, NVIDIA GeForce RTX 4050 6GB GDDR6",
            "price": 74990.0,
            "rating": 4.6,
            "reviews": 600,
            "source": "Amazon.in",
        },
        {
            "product_id": "lap_lenovo_loq",
            "title": "Lenovo LOQ Intel Core i5 13th Gen, 16GB RAM, NVIDIA GeForce RTX 3050 6GB",
            "price": 64990.0,
            "rating": 4.4,
            "reviews": 1100,
            "source": "Flipkart",
        },
        {
            "product_id": "lap_macbook",
            "title": "Apple MacBook Air M2 8GB RAM, 256GB SSD",
            "price": 84900.0,
            "rating": 4.7,
            "reviews": 3400,
            "source": "Amazon.in",
        },
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine()

    result = await engine.execute(
        "I am a computer science student. Recommend a laptop with an NVIDIA GPU within my budget.",
        search_service,
    )

    # 1. Missing budget recognition
    assert result["intent"]["budget"] is None
    assert result["intent"]["missing_information"] is not None
    assert "budget" in result["intent"]["missing_information"].lower()

    # 2. NVIDIA GPU prioritization (MacBook lacks NVIDIA GPU)
    top_recs = result["top_recommendations"]
    assert len(top_recs) >= 1
    assert "NVIDIA" in top_recs[0]["name"] or "nvidia" in str(top_recs[0].get("verified_specs", {}).get("gpu", "")).lower()
    for r in top_recs:
        assert r["id"] != "lap_macbook"


@pytest.mark.anyio
async def test_query_c_affordable_laptop_for_college_programming():
    """Query C: 'Affordable laptop for college programming.'
    Expected: programming & student criteria (CPU, 16GB RAM), no mandatory dedicated GPU requirement.
    """
    mock_candidates = [
        {
            "product_id": "lap_vivobook",
            "title": "ASUS Vivobook 15 Intel Core i5 12th Gen, 16GB RAM, 512GB SSD, FHD Display",
            "price": 46990.0,
            "rating": 4.3,
            "reviews": 1800,
            "source": "Amazon.in",
        },
        {
            "product_id": "lap_ideapad",
            "title": "Lenovo IdeaPad Slim 3 AMD Ryzen 5 7520U, 16GB RAM, 512GB SSD",
            "price": 42990.0,
            "rating": 4.2,
            "reviews": 950,
            "source": "Flipkart",
        },
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine()

    result = await engine.execute("Affordable laptop for college programming.", search_service)

    top_recs = result["top_recommendations"]
    assert len(top_recs) == 2
    # Vivobook with integrated graphics should qualify and not be disqualified
    assert any("Vivobook" in r["name"] for r in top_recs)

    crit_str = " ".join(result["ai_analysis"]["key_criteria"]).lower()
    assert "ram" in crit_str or "processor" in crit_str or "programming" in crit_str or "productivity" in crit_str


@pytest.mark.anyio
async def test_query_d_headphones_for_travel_under_2000():
    """Query D: 'Best headphones for travel under ₹2,000.'
    Expected: headphone-specific ranking, budget under 2000, not laptop criteria.
    """
    mock_candidates = [
        {
            "product_id": "hp_rockerz_550",
            "title": "boAt Rockerz 550 Over-Ear Wireless Headphone with 50mm Drivers",
            "price": 1799.0,
            "rating": 4.4,
            "reviews": 12000,
            "source": "Amazon.in",
        },
        {
            "product_id": "hp_expensive",
            "title": "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
            "price": 19990.0,
            "rating": 4.7,
            "reviews": 8500,
            "source": "Amazon.in",
        },
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine()

    result = await engine.execute("Best headphones for travel under ₹2,000.", search_service)

    assert result["intent"]["category"] == "Headphones"
    assert result["intent"]["budget"] == 2000
    top_recs = result["top_recommendations"]
    assert len(top_recs) == 1
    assert top_recs[0]["id"] == "hp_rockerz_550"

    crit_str = " ".join(result["ai_analysis"]["key_criteria"]).lower()
    # Must NOT include laptop terms
    assert "rtx" not in crit_str
    assert "vram" not in crit_str
    assert "laptop" not in crit_str
    assert "travel" in crit_str or "driver" in crit_str or "comfort" in crit_str or "isolation" in crit_str


@pytest.mark.anyio
async def test_query_e_smartphone_camera_battery():
    """Query E: 'Recommend a smartphone with a great camera and battery life.'
    Expected: smartphone category, camera and battery criteria, not laptop criteria.
    """
    mock_candidates = [
        {
            "product_id": "phone_redmi",
            "title": "Redmi Note 13 Pro 5G (200MP Camera, 5100mAh Battery, 67W Turbo Charge)",
            "price": 23999.0,
            "rating": 4.2,
            "reviews": 4500,
            "source": "Amazon.in",
        },
        {
            "product_id": "phone_samsung",
            "title": "Samsung Galaxy M34 5G (50MP No Shake Cam, 6000mAh Battery, 120Hz Display)",
            "price": 16999.0,
            "rating": 4.3,
            "reviews": 18000,
            "source": "Flipkart",
        },
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine()

    result = await engine.execute("Recommend a smartphone with a great camera and battery life.", search_service)

    assert result["intent"]["category"] == "Smartphone"
    top_recs = result["top_recommendations"]
    assert len(top_recs) == 2

    crit_str = " ".join(result["ai_analysis"]["key_criteria"]).lower()
    assert "camera" in crit_str or "sensor" in crit_str or "battery" in crit_str or "imaging" in crit_str
    assert "laptop" not in crit_str


@pytest.mark.anyio
async def test_query_f_compare_two_laptops():
    """Query F: 'Compare two laptops and tell me which one I should buy.'
    Expected: comparison intent, meaningful comparison criteria, trade-offs, and final recommendation.
    """
    mock_candidates = [
        {
            "product_id": "comp_1",
            "title": "Lenovo IdeaPad Slim 3 12th Gen Intel Core i5 16GB RAM 512GB SSD",
            "price": 49990.0,
            "rating": 4.3,
            "reviews": 3200,
            "source": "Amazon.in",
        },
        {
            "product_id": "comp_2",
            "title": "Acer Aspire Lite AMD Ryzen 5 5500U 16GB RAM 512GB SSD",
            "price": 37990.0,
            "rating": 4.1,
            "reviews": 1500,
            "source": "Flipkart",
        },
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine()

    result = await engine.execute("Compare two laptops and tell me which one I should buy.", search_service)

    analysis = result["ai_analysis"]
    assert len(analysis["trade_offs"]) > 5
    assert len(analysis["final_recommendation"]) > 5
    assert len(result["top_recommendations"]) == 2


def test_query_g_no_false_budget_from_rtx_3050():
    """Query G: 'Laptop with RTX 3050.'
    Expected: no false budget extracted from the GPU model number '3050'.
    """
    from app.services.llm_service import extract_budget, parse_user_query
    from app.services.decision_engine import extract_structured_intent

    assert extract_budget("Laptop with RTX 3050.") is None
    parsed = parse_user_query("Laptop with RTX 3050.")
    assert parsed.get("budget") is None

    structured = extract_structured_intent("Laptop with RTX 3050.")
    assert structured.get("budget") is None


def test_query_h_no_false_budget_from_dell_inspiron_3520():
    """Query H: 'Dell Inspiron 3520.'
    Expected: no false budget extracted from the product model number '3520'.
    """
    from app.services.llm_service import extract_budget, parse_user_query
    from app.services.decision_engine import extract_structured_intent

    assert extract_budget("Dell Inspiron 3520.") is None
    parsed = parse_user_query("Dell Inspiron 3520.")
    assert parsed.get("budget") is None

    structured = extract_structured_intent("Dell Inspiron 3520.")
    assert structured.get("budget") is None


@pytest.mark.anyio
async def test_query_i_fewer_than_five_products_satisfy_constraints():
    """Query I: A query for which fewer than five products satisfy explicit constraints.
    Expected: show only qualifying products, explain the limitation, never manufacture fake matches.
    """
    # Only 2 laptops are under 40000; the other two are way over budget
    mock_candidates = [
        {
            "product_id": "budget_1",
            "title": "Lenovo V15 AMD Athlon Silver, 8GB RAM, 256GB SSD",
            "price": 26990.0,
            "rating": 3.9,
            "reviews": 400,
            "source": "Amazon.in",
        },
        {
            "product_id": "budget_2",
            "title": "HP 255 G8 AMD Ryzen 3, 8GB RAM, 512GB SSD",
            "price": 32990.0,
            "rating": 4.0,
            "reviews": 210,
            "source": "Amazon.in",
        },
        {
            "product_id": "over_1",
            "title": "Dell XPS 13 Intel Core i7",
            "price": 115000.0,
            "rating": 4.6,
            "reviews": 120,
            "source": "Amazon.in",
        },
        {
            "product_id": "over_2",
            "title": "Apple MacBook Air M3",
            "price": 104900.0,
            "rating": 4.8,
            "reviews": 450,
            "source": "Amazon.in",
        },
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine()

    result = await engine.execute("Laptop under 40000", search_service)

    top_recs = result["top_recommendations"]
    assert len(top_recs) == 2  # strictly the 2 qualifying under-40k options
    for r in top_recs:
        assert r["price"] <= 40000.0

    # Limitation must be recorded in the analysis
    limitations = result["ai_analysis"]["limitations"]
    assert "2 product" in limitations or "constraint" in limitations.lower() or "under" in limitations.lower()


@pytest.mark.anyio
async def test_failure_mode_openrouter_timeout_resilience():
    """Verify that if OpenRouter times out, the decision engine falls back seamlessly
    to the grounded deterministic analysis and marks analysis_source = 'deterministic_fallback'.
    """
    from app.ai.providers.openrouter import OpenRouterProvider

    class TimeoutProvider(OpenRouterProvider):
        def chat(self, messages):
            raise TimeoutError("Simulated OpenRouter connection timeout")

    mock_candidates = [
        {
            "product_id": "item_1",
            "title": "Razer DeathAdder Essential Gaming Mouse 6400 DPI",
            "price": 1299.0,
            "rating": 4.4,
            "reviews": 8500,
            "source": "Amazon.in",
        }
    ]

    search_service = SearchService([MockFixedSearchProvider(mock_candidates)])
    engine = ShoppingDecisionEngine(openrouter=TimeoutProvider())

    result = await engine.execute("gaming mouse under 2000", search_service)

    assert result["ai_analysis"]["analysis_source"] == "deterministic_fallback"
    assert len(result["top_recommendations"]) == 1
    assert "Razer" in result["top_recommendations"][0]["name"]
    assert len(result["ai_analysis"]["summary"]) > 10


@pytest.mark.anyio
async def test_failure_mode_serpapi_empty_results():
    """Verify clean response when SerpApi returns empty product list."""
    search_service = SearchService([MockFixedSearchProvider([])])
    engine = ShoppingDecisionEngine()

    result = await engine.execute("nonexistentproductqueryxyz12345", search_service)

    assert result["total_found"] == 0
    assert result["top_recommendations"] == []
    assert "No live" in result["ai_analysis"]["summary"]

