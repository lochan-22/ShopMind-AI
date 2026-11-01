import json
import logging
from collections.abc import AsyncIterator
from typing import Any
from urllib.parse import quote

from app.ai.prompts import SHOPPING_ASSISTANT_PROMPT
from app.ai.providers.openrouter import OpenRouterClient, OpenRouterError
from app.schemas.agent import ChatMessage
from app.services.llm_service import parse_user_query
from app.services.search.product_normalizer import NormalizedProduct
from app.services.search.providers.base_provider import ProductProviderError
from app.services.search.search_service import SearchService

logger = logging.getLogger(__name__)

# Shown to shoppers when the language model fails. Provider error details can
# include account identifiers, so they are logged server-side only.
_MODEL_UNAVAILABLE_MESSAGE = (
    "The AI assistant is temporarily unavailable. Product searches that mention "
    "a brand, category or budget still return live results — please try one of those."
)
_EMPTY_REPLY_MESSAGE = "I couldn't put together a reply that time. Please send your message again."


def _event(event_type: str, payload: dict[str, Any] | None = None) -> str:
    return f"event: {event_type}\ndata: {json.dumps(payload or {})}\n\n"


class ChatService:
    _MAX_AGENT_PRODUCTS = 6

    def __init__(self, provider: OpenRouterClient | None = None) -> None:
        self.provider = provider or OpenRouterClient()

    def is_configured(self) -> bool:
        return self.provider.is_configured()

    async def product_reply(
        self, message: str, search_service: SearchService
    ) -> dict[str, Any] | None:
        """Return live, structured product data or ``None`` for normal chat."""
        parsed = parse_user_query(message)
        if not self._is_product_search(message):
            return None
        try:
            live_products = await search_service.search(message)
        except ProductProviderError:
            return {
                "message": "I couldn't retrieve live product results right now. Please try again shortly.",
                "products": [],
            }

        # SerpApi commonly returns dozens of results. Keep the chat panel
        # useful while retaining only the provider's relevance-ordered data.
        products = [
            self._serialize_product(product)
            for product in live_products[: self._MAX_AGENT_PRODUCTS]
        ]
        if not products:
            return {
                "message": "I couldn't find live product results for that request. Try adjusting the brand, category, or budget.",
                "products": [],
            }
        return {
            "message": self._format_live_product_message(message, parsed, len(products)),
            "products": products,
        }

    async def stream_reply(
        self,
        message: str,
        history: list[ChatMessage],
        search_service: SearchService | None = None,
    ) -> AsyncIterator[str]:
        """Stream a chat reply, grounding product requests in live results."""
        products: list[dict[str, Any]] | None = None
        if search_service is not None:
            product_response = await self.product_reply(message, search_service)
            if product_response is not None:
                products = product_response["products"]
                if not products:
                    yield _event("token", {"content": product_response["message"]})
                    yield _event("done")
                    return
                yield _event("token", {"content": product_response["message"]})
                # Cards are delivered separately from prose so the UI never has
                # to extract product facts from LLM-generated text.
                yield _event("products", {"products": products})
                # The product response is intentionally composed from trusted
                # search metadata. Do not stream a second model response here:
                # that is how model scratchpad text could reach customers.
                yield _event("done")
                return

        messages = [{"role": "system", "content": SHOPPING_ASSISTANT_PROMPT}]
        if products is not None:
            messages.append(
                {
                    "role": "system",
                    "content": (
                        "Live Google Shopping results for the user's request are below. "
                        "Use only these records. Do not invent or alter a product name, "
                        "price, rating, seller, availability, image, or URL. Give a concise "
                        "one- or two-sentence recommendation after the product cards; if a "
                        "fact is absent, do not mention it.\n"
                        f"LIVE_RESULTS={json.dumps(products, ensure_ascii=False)}"
                    ),
                }
            )
        messages.extend({"role": item.role, "content": item.content} for item in history)
        messages.append({"role": "user", "content": message})

        try:
            replied = False
            async for content in self.provider.stream_chat(messages):
                replied = True
                yield _event("token", {"content": content})
            if not replied:
                # Reasoning models can occasionally finish without visible text.
                yield _event("error", {"message": _EMPTY_REPLY_MESSAGE})
                return
            yield _event("done")
        except OpenRouterError as error:
            logger.warning("Agent chat model request failed: %s", error)
            yield _event("error", {"message": _MODEL_UNAVAILABLE_MESSAGE})

    @staticmethod
    def _is_product_search(message: str) -> bool:
        """Recognize requests that contain actual product-search criteria."""
        parsed = parse_user_query(message)
        return (
            parsed["intent"] not in {"greeting", "unknown"}
            and any(parsed[key] is not None for key in ("brand", "category", "budget"))
        )

    @staticmethod
    def _format_live_product_message(
        message: str, parsed: dict[str, Any], product_count: int
    ) -> str:
        """Create safe Markdown that complements, rather than repeats, cards."""
        category = parsed.get("category") or "Products"
        emoji = {
            "Headphones": "🎧",
            "Laptop": "💻",
            "Mouse": "🖱️",
            "Smartphone": "📱",
        }.get(category, "🛍️")
        qualifier = "Gaming " if "gaming" in message.lower() and category == "Headphones" else ""
        budget = parsed.get("budget")
        budget_text = f" Under ₹{budget:,}" if isinstance(budget, int) else ""
        noun = "result" if product_count == 1 else "results"
        return (
            f"# {emoji} {qualifier}{category}{budget_text}\n\n"
            f"I found {product_count} live {noun} matching your request. "
            "The cards below contain the current provider details.\n\n"
            "### Quick Take\n\n"
            "Compare the current price, seller, rating, and product link shown on each card to choose the best fit."
        )

    @staticmethod
    def _serialize_product(product: NormalizedProduct) -> dict[str, Any]:
        """Expose only real normalized fields in the agent-card payload."""
        primary_offer = product.offers[0] if product.offers else None
        return {
            "id": product.product_id,
            "product_id": product.product_id,
            "shopmind_url": f"/products/external/{quote(product.product_id, safe='')}",
            "name": product.name,
            "brand": product.brand,
            "category": product.category,
            "price": primary_offer.price if primary_offer else None,
            "currency": primary_offer.currency if primary_offer else None,
            "rating": product.rating,
            "review_count": product.review_count,
            "description": product.description,
            "stock": primary_offer.stock_status if primary_offer else None,
            "image": product.image_url,
            "source": primary_offer.source_name if primary_offer else None,
            "retailer": primary_offer.source_name if primary_offer else None,
            "url": primary_offer.product_url if primary_offer else None,
            "product_url": primary_offer.product_url if primary_offer else None,
            "offers": [
                {
                    "price": offer.price,
                    "currency": offer.currency,
                    "stock_status": offer.stock_status,
                    "source_name": offer.source_name,
                    "product_url": offer.product_url,
                    "is_best_price": offer.is_best_price,
                }
                for offer in product.offers
            ],
        }


chat_service = ChatService()
