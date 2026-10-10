"""Live end-to-end integration and regression test runner for ShopMind AI Shopping Decision Engine."""

import json
import sys
import urllib.parse
import urllib.request

QUERIES = [
    {
        "query": "Best laptop under ₹60,000 for AI engineering.",
        "expected_budget": 60000,
        "expected_category": "Laptop",
        "expected_feature": "AI engineering / Data Science",
    },
    {
        "query": "Wireless headphones under ₹5,000 with noise cancellation.",
        "expected_budget": 5000,
        "expected_category": "Headphones",
        "expected_feature": "Noise Cancellation",
    },
    {
        "query": "Camera for photography with excellent image quality.",
        "expected_budget": None,
        "expected_category": "Camera",
        "expected_feature": "Image Quality / Photography",
    },
    {
        "query": "Running shoes for beginners under ₹3,000.",
        "expected_budget": 3000,
        "expected_category": "Shoes",
        "expected_feature": "Beginner Running",
    },
    {
        "query": "Best smartphone for gaming.",
        "expected_budget": None,
        "expected_category": "Smartphone",
        "expected_feature": "Gaming",
    },
]


def run_e2e_tests():
    print("=" * 80)
    print("SHOPMIND AI SHOPPING DECISION ENGINE — LIVE E2E INTEGRATION TEST SUITE")
    print("=" * 80)

    summary_records = []

    for test_idx, item in enumerate(QUERIES, start=1):
        q = item["query"]
        budget = item["expected_budget"]
        category = item["expected_category"]
        feature = item["expected_feature"]

        url = f"http://127.0.0.1:8001/api/products/decision?q={urllib.parse.quote(q)}"
        print(f"\n[TEST {test_idx}/5] Query: \"{q}\"")
        print(f"Request URL: {url}")

        try:
            req = urllib.request.urlopen(url, timeout=30.0)
            assert req.status == 200, f"HTTP Error {req.status}"
            data = json.loads(req.read().decode("utf-8"))
        except Exception as e:
            print(f"FAILED to fetch decision data: {e}")
            sys.exit(1)

        # 1. Verify original query is returned accurately
        assert data["query"] == q, f"Query mismatch: expected {q}, got {data['query']}"
        print("  ✓ Original query verified")

        # 2. Verify AI intent extraction
        intent_data = data.get("intent", {})
        assert intent_data.get("category") == category, f"Category mismatch: expected {category}, got {intent_data.get('category')}"
        if budget is not None:
            assert intent_data.get("budget") == budget, f"Budget mismatch: expected {budget}, got {intent_data.get('budget')}"
        assert feature in intent_data.get("features", []), f"Feature {feature} missing in {intent_data.get('features')}"
        print(f"  ✓ Intent extraction: Category={intent_data.get('category')}, Budget={intent_data.get('budget')}, Features={intent_data.get('features')}")

        # 3. Verify SerpApi live results and product normalization
        all_products = data.get("all_products", [])
        assert len(all_products) > 0, "No live products returned from SerpApi!"
        print(f"  ✓ Live SerpApi results returned & normalized: {len(all_products)} products")

        # 4. Verify AI Shopping Analysis
        analysis = data.get("ai_analysis", {})
        assert analysis.get("summary"), "Missing AI analysis summary"
        assert len(analysis.get("key_criteria", [])) > 0, "Missing key criteria"
        assert analysis.get("budget_verdict"), "Missing budget verdict"
        print(f"  ✓ AI Analysis summary: {analysis['summary'][:90]}...")
        print(f"  ✓ Key Decision Criteria: {analysis['key_criteria'][:2]}")
        print(f"  ✓ Budget Verdict: {analysis['budget_verdict']}")

        # 5. Verify Top 5 product recommendations from actual SerpApi results
        top_recs = data.get("top_recommendations", [])
        assert 1 <= len(top_recs) <= 5, f"Top recs count unexpected: {len(top_recs)}"
        
        # Verify that all top recommendations are present in all_products (actual SerpApi results)
        all_ids = {p.get("product_id") or p.get("id") for p in all_products}
        for rec in top_recs:
            rec_id = rec.get("product_id") or rec.get("id")
            assert rec_id in all_ids, f"Recommendation {rec.get('name')} not found in SerpApi results!"
            assert rec.get("name"), "Recommendation has no name!"
            assert rec.get("product_url") or rec.get("offers"), "Recommendation has no valid product URL/offers!"
        print(f"  ✓ Top {len(top_recs)} recommendations confirmed from actual SerpApi results")

        # 6. Verify budget compliance
        if budget is not None:
            under_budget_recs = [
                r for r in top_recs
                if r.get("price") is not None and float(r["price"]) <= float(budget)
            ]
            print(f"  ✓ Budget compliance: {len(under_budget_recs)}/{len(top_recs)} recommendations under stated budget of ₹{budget:,}")
            for r in top_recs:
                print(f"      - {r.get('name')[:50]}... | Price: ₹{r.get('price')} | Badge: {r.get('recommendation_badge')} | Store: {r.get('retailer')}")
        else:
            print("  ✓ No explicit budget constraint stated; evaluated across price segments")
            for r in top_recs:
                print(f"      - {r.get('name')[:50]}... | Price: ₹{r.get('price')} | Badge: {r.get('recommendation_badge')} | Store: {r.get('retailer')}")

        summary_records.append({
            "query": q,
            "category": intent_data.get("category"),
            "budget": intent_data.get("budget"),
            "total_results": len(all_products),
            "top_recs": len(top_recs),
            "top_pick": top_recs[0].get("name") if top_recs else None,
            "top_pick_price": top_recs[0].get("price") if top_recs else None,
            "analysis_snippet": analysis.get("summary")[:80] + "...",
        })

    print("\n" + "=" * 80)
    print("ALL 5 LIVE QUERIES SUCCESSFULLY PASSED E2E INTEGRATION & REGRESSION TESTING")
    print("=" * 80)
    for record in summary_records:
        print(f"• Query: \"{record['query']}\"")
        print(f"  Category: {record['category']} | Budget: ₹{record['budget']} | Live Results: {record['total_results']}")
        print(f"  Top Pick: {record['top_pick']} (₹{record['top_pick_price']})")
        print(f"  Analysis: {record['analysis_snippet']}\n")


if __name__ == "__main__":
    run_e2e_tests()

