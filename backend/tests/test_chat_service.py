import asyncio

from app.ai.chat_service import ChatService
from app.schemas.agent import ChatMessage


class FakeStreamingProvider:
    def __init__(self) -> None:
        self.messages: list[dict[str, str]] = []

    def is_configured(self) -> bool:
        return True

    async def stream_chat(self, messages: list[dict[str, str]]):
        self.messages = messages
        yield "Hello"
        yield " there"


def test_chat_service_streams_sse_tokens_with_history() -> None:
    provider = FakeStreamingProvider()
    service = ChatService(provider=provider)  # type: ignore[arg-type]

    async def collect_events() -> list[str]:
        return [event async for event in service.stream_reply(
            "What headphones should I buy?",
            [ChatMessage(role="user", content="I need wireless headphones")],
        )]

    events = asyncio.run(collect_events())

    assert events == [
        'event: token\ndata: {"content": "Hello"}\n\n',
        'event: token\ndata: {"content": " there"}\n\n',
        "event: done\ndata: {}\n\n",
    ]
    assert provider.messages[-2:] == [
        {"role": "user", "content": "I need wireless headphones"},
        {"role": "user", "content": "What headphones should I buy?"},
    ]
