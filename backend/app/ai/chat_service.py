import json
from collections.abc import AsyncIterator

from app.ai.prompts import SHOPPING_ASSISTANT_PROMPT
from app.ai.providers.openrouter import OpenRouterClient, OpenRouterError
from app.schemas.agent import ChatMessage


def _event(event_type: str, payload: dict[str, str] | None = None) -> str:
    return f"event: {event_type}\ndata: {json.dumps(payload or {})}\n\n"


class ChatService:
    def __init__(self, provider: OpenRouterClient | None = None) -> None:
        self.provider = provider or OpenRouterClient()

    def is_configured(self) -> bool:
        return self.provider.is_configured()

    async def stream_reply(self, message: str, history: list[ChatMessage]) -> AsyncIterator[str]:
        messages = [{"role": "system", "content": SHOPPING_ASSISTANT_PROMPT}]
        messages.extend({"role": item.role, "content": item.content} for item in history)
        messages.append({"role": "user", "content": message})

        try:
            async for content in self.provider.stream_chat(messages):
                yield _event("token", {"content": content})
            yield _event("done")
        except OpenRouterError as error:
            yield _event("error", {"message": str(error)})


chat_service = ChatService()
