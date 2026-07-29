"""
backend/app/services/agent_service.py

ShopMind AI - Agent Service

This module exposes the agent-facing service layer for ShopMind AI.
It reuses the rule-based parsing logic from llm_service.py to interpret
raw user queries, filters the mock product catalog via product_service.py,
and returns a structured response containing:
    - matching products
    - a recommended product
    - a confidence score
    - reasoning for the recommendation

Example:
    Input:  "Sony headphones under ₹5000"
    Flow:   llm_service (parse) -> product_service.filter_products() ->
            recommendation + confidence + reasoning
"""

from typing import Optional, List, Dict, Any

from app.services.llm_service import parse_user_query
from app.services.product_service import filter_products, search_products


class AgentService:
    """
    Reusable agent service that orchestrates query understanding and
    product filtering/recommendation.
    """

    def __init__(self) -> None:
        # Placeholder for future dependencies (e.g., real LLM client,
        # persistent product repository, cache, etc.).
        pass

    # -----------------------------------------------------------------
    # Internal helpers
    # -----------------------------------------------------------------

    @staticmethod
    def _calculate_confidence(
        parsed: Dict[str, Any],
        matches: List[Dict[str, Any]],
    ) -> float:
        """
        Compute a simple confidence score (0.0 - 1.0) based on how many
        parsed fields were successfully extracted and whether matches
        were found.
        """
        extracted_fields = [
            parsed.get("intent") not in (None, "unknown"),
            parsed.get("brand") is not None,
            parsed.get("category") is not None,
            parsed.get("budget") is not None,
        ]
        field_score = sum(1 for f in extracted_fields if f) / len(extracted_fields)

        if not matches:
            # Even with well-extracted fields, no matches lowers confidence.
            return round(field_score * 0.4, 2)

        match_bonus = 0.2 if len(matches) <= 5 else 0.1
        confidence = min(field_score + match_bonus, 1.0)
        return round(confidence, 2)

    @staticmethod
    def _pick_recommended_product(
        matches: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """
        Pick the best product from the matches list. Strategy: highest
        rating first, then lowest price as a tiebreaker.
        """
        if not matches:
            return None

        return sorted(
            matches,
            key=lambda p: (-(p.get("rating") or 0), p.get("price") or float("inf")),
        )[0]

    @staticmethod
    def _build_reasoning(
        parsed: Dict[str, Any],
        matches: List[Dict[str, Any]],
        recommended: Optional[Dict[str, Any]],
    ) -> str:
        """
        Build a human-readable explanation for the recommendation.
        """
        if not matches:
            criteria = []
            if parsed.get("brand"):
                criteria.append(f"brand '{parsed['brand']}'")
            if parsed.get("category"):
                criteria.append(f"category '{parsed['category']}'")
            if parsed.get("budget") is not None:
                criteria.append(f"budget under ₹{parsed['budget']}")
            criteria_str = ", ".join(criteria) if criteria else "the given criteria"
            return f"No products matched {criteria_str}. Try relaxing brand, category, or budget filters."

        if not recommended:
            return "Matching products were found, but no recommendation could be determined."

        reasons = []
        if parsed.get("brand"):
            reasons.append(f"matches brand '{recommended.get('brand')}'")
        if parsed.get("category"):
            reasons.append(f"falls under category '{recommended.get('category')}'")
        if parsed.get("budget") is not None:
            reasons.append(f"is priced at ₹{recommended.get('price')}, within the ₹{parsed['budget']} budget")
        reasons.append(f"has a strong rating of {recommended.get('rating')}")

        reasoning = (
            f"Recommended '{recommended.get('name')}' because it "
            + ", ".join(reasons)
            + f". It was selected as the top choice among {len(matches)} matching product(s) "
              "based on highest rating and best price."
        )
        return reasoning

    # -----------------------------------------------------------------
    # Public API
    # -----------------------------------------------------------------

    def search(self, query: str) -> Dict[str, Any]:
        """
        Handle a search request from the user.

        Steps:
            1. Parse the user query using llm_service.
            2. Extract intent, brand, category, and budget.
            3. Call filter_products() from product_service.
            4. Return matching products, a recommended product,
               a confidence score, and reasoning.

        Args:
            query: Raw natural language query from the user.

        Returns:
            A structured JSON-serializable dictionary.
        """
        if query is None or not query.strip():
            return {
                "query": query,
                "parsed": {
                    "intent": "unknown",
                    "brand": None,
                    "category": None,
                    "budget": None,
                },
                "matching_products": [],
                "recommended_product": None,
                "confidence_score": 0.0,
                "reasoning": "Empty query provided. Unable to parse or search.",
                "error": "Empty query provided.",
            }

        # Step 1 & 2: Parse the user query (intent, brand, category, budget)
        parsed_result: Dict[str, Any] = parse_user_query(query)

        brand: Optional[str] = parsed_result.get("brand")
        category: Optional[str] = parsed_result.get("category")
        budget: Optional[int] = parsed_result.get("budget")

        # Step 3: Filter products using the criteria extracted from the query.
        # If no criteria could be extracted, perform a literal catalog search
        # instead of calling filter_products() with no filters (which returns
        # every product).
        if brand is None and category is None and budget is None:
            matching_products = search_products(query)
        else:
            matching_products = filter_products(
                brand=brand,
                category=category,
                budget=budget,
                rating=None,
            )

        # Step 4: Determine recommendation, confidence, and reasoning
        recommended_product = self._pick_recommended_product(matching_products)
        confidence_score = self._calculate_confidence(parsed_result, matching_products)
        reasoning = self._build_reasoning(parsed_result, matching_products, recommended_product)

        return {
            "query": query,
            "parsed": parsed_result,
            "matching_products": matching_products,
            "recommended_product": recommended_product,
            "confidence_score": confidence_score,
            "reasoning": reasoning,
        }

    def chat(self, message: str) -> Dict[str, Any]:
        """
        Handle a conversational chat request from the user.

        This is a MOCK implementation and does NOT connect to any external
        LLM provider yet. It internally reuses search() to ground the mock
        reply in the same rule-based parsing/filtering pipeline, so the
        response stays consistent with what search() would return.

        Args:
            message: Raw natural language message from the user.

        Returns:
            A structured JSON-serializable dictionary containing a mock
            AI-generated reply along with the underlying search context.
        """
        if message is None or not message.strip():
            return {
                "message": message,
                "reply": "I didn't receive any message. Could you please tell me what you're looking for?",
                "search_context": None,
            }

        search_result = self.search(message)
        recommended = search_result.get("recommended_product")
        matches = search_result.get("matching_products") or []

        if recommended:
            reply = (
                f"Based on what you're looking for, I'd suggest '{recommended.get('name')}' "
                f"(₹{recommended.get('price')}, rated {recommended.get('rating')}). "
                f"I found {len(matches)} matching product(s) in total. "
                "[This is a mock AI response — no external LLM is connected yet.]"
            )
        else:
            reply = (
                "I couldn't find any products matching your request right now. "
                "Try adjusting the brand, category, or budget. "
                "[This is a mock AI response — no external LLM is connected yet.]"
            )

        return {
            "message": message,
            "reply": reply,
            "search_context": search_result,
        }

    def recommend(self) -> Dict[str, Any]:
        """
        Return the single highest-rated product across the entire mock
        catalog, using filter_products() with no filters applied.

        Returns:
            A structured JSON-serializable dictionary containing the
            top-rated product (or None if the catalog is empty).
        """
        all_products: List[Dict[str, Any]] = filter_products(
            brand=None,
            category=None,
            budget=None,
            rating=None,
        )

        top_product = self._pick_recommended_product(all_products)

        if not top_product:
            return {
                "recommended_product": None,
                "reasoning": "No products are currently available to recommend.",
            }

        reasoning = (
            f"'{top_product.get('name')}' is the top pick with a rating of "
            f"{top_product.get('rating')}, priced at ₹{top_product.get('price')}."
        )

        return {
            "recommended_product": top_product,
            "reasoning": reasoning,
        }


# Module-level singleton instance for convenient import/use across the app
agent_service = AgentService()


def search(query: str) -> Dict[str, Any]:
    """
    Module-level convenience function that delegates to the shared
    AgentService instance.

        from app.services.agent_service import search
        result = search("Sony headphones under ₹5000")

    Args:
        query: Raw natural language query from the user.

    Returns:
        Structured JSON-serializable dictionary with parsed query,
        matching products, recommendation, confidence score, and reasoning.
    """
    return agent_service.search(query)


def chat(message: str) -> Dict[str, Any]:
    """
    Module-level convenience function that delegates to the shared
    AgentService instance for a mock conversational response.

        from app.services.agent_service import chat
        result = chat("Sony headphones under ₹5000")

    Args:
        message: Raw natural language message from the user.

    Returns:
        Structured JSON-serializable dictionary with a mock AI reply
        and the underlying search context.
    """
    return agent_service.chat(message)


def recommend() -> Dict[str, Any]:
    """
    Module-level convenience function that delegates to the shared
    AgentService instance to fetch the highest-rated product.

        from app.services.agent_service import recommend
        result = recommend()

    Returns:
        Structured JSON-serializable dictionary with the top-rated
        product and reasoning.
    """
    return agent_service.recommend()
