"""Live End-to-End Verification of the AI Shopping Decision Engine.

Calls the real FastAPI application routes with live OpenRouter & SerpApi integrations.
Logs verified structured outputs, Top 5 recommendations, and AI guidance without revealing secrets.
"""

import json
import sys
import os

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_live_verification():
    client = TestClient(app)

    test_queries = [
        ("Query A", "Best gaming laptop under ₹60,000."),
        ("Query B", "I am a computer science student. Recommend a laptop with an NVIDIA GPU within my budget."),
        ("Query D", "Best headphones for travel under ₹2,000."),
        ("Query E", "Recommend a smartphone with a great camera and battery life."),
    ]

    for label, query in test_queries:
        print(f"\n==================================================")
        print(f"RUNNING {label}: \"{query}\"")
        print(f"==================================================")

        response = client.get("/api/products/decision", params={"q": query})
        if response.status_code != 200:
            print(f"FAILED: Status {response.status_code}, Body: {response.text}")
            continue

        data = response.json()
        intent = data.get("intent", {})
        analysis = data.get("ai_analysis", {})
        top_recs = data.get("top_recommendations", [])
        all_products = data.get("all_products", [])

        print(f"[1] Intent Interpretation:")
        print(f"    - Category: {intent.get('category')}")
        print(f"    - Brand: {intent.get('brand')}")
        print(f"    - Budget: ₹{intent.get('budget'):,}" if intent.get('budget') else "    - Budget: None (flexible / unspecified)")
        print(f"    - Missing Info: {intent.get('missing_information')}")
        print(f"    - Search Queries: {intent.get('search_queries')}")

        print(f"\n[2] Live Retrieval & Deduplication:")
        print(f"    - Total Retrieved from Google Shopping: {len(all_products)}")
        print(f"    - Top Recommendations Selected: {len(top_recs)}")

        print(f"\n[3] AI Decision Guidance:")
        print(f"    - Analysis Source: {analysis.get('analysis_source')}")
        print(f"    - Model: {analysis.get('model')}")
        print(f"    - Direct Answer: {analysis.get('direct_answer')}")
        print(f"    - Summary: {analysis.get('summary')}")
        print(f"    - Key Criteria: {analysis.get('key_criteria')}")
        print(f"    - Trade-offs: {analysis.get('trade_offs')}")
        print(f"    - Final Recommendation: {analysis.get('final_recommendation')}")
        print(f"    - Budget Verdict: {analysis.get('budget_verdict')}")
        print(f"    - Limitations: {analysis.get('limitations')}")

        print(f"\n[4] Top Recommendations Details:")
        for i, rec in enumerate(top_recs, 1):
            badge = rec.get('recommendation_badge', 'Pick')
            name = rec.get('name', 'Product')
            price = f"₹{rec.get('price'):,}" if rec.get('price') else "Price N/A"
            why = rec.get('why_recommended', '')
            lim = rec.get('limitation', '')
            specs = rec.get('verified_specs', {})
            print(f"    #{i} [{badge}] {name} - {price}")
            if specs:
                print(f"        Verified Specs: {specs}")
            if why:
                print(f"        Why: {why}")
            if lim:
                print(f"        Limitation: {lim}")

if __name__ == "__main__":
    run_live_verification()

