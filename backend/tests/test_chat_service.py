import asyncio

from app.ai.chat_service import ChatService
from app.schemas.agent import ChatMessage
from app.services.search.product_normalizer import NormalizedProduct, ProductOffer


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


class LiveSearchStub:
    def __init__(self) -> None:
        self.calls = 0

    async def search(self, query: str) -> list[NormalizedProduct]:
        self.calls += 1
        return [
            NormalizedProduct(
                product_id="live-1",
                name="Live Headphones",
                rating=4.4,
                image_url="https://images.example/headphones.jpg",
                offers=[
                    ProductOffer(
                        price=1_999,
                        currency="INR",
                        source_name="Live retailer",
                        product_url="https://shop.example/live-1",
                    )
                ],
            )
        ]


def test_product_chat_stream_emits_safe_markdown_and_real_cards() -> None:
    provider = FakeStreamingProvider()
    service = ChatService(provider=provider)  # type: ignore[arg-type]

    async def collect_events() -> list[str]:
        return [event async for event in service.stream_reply(
            "top headphones under 2000", [], LiveSearchStub()  # type: ignore[arg-type]
        )]

    events = asyncio.run(collect_events())

    assert '# \\ud83c\\udfa7 Headphones Under \\u20b92,000' in events[0]
    assert "### Quick Take" in events[0]
    assert 'event: products\ndata: {"products": [{"id": "live-1"' in events[1]
    assert '"price": 1999' in events[1]
    assert '"product_url": "https://shop.example/live-1"' in events[1]
    assert '"shopmind_url": "/products/external/live-1"' in events[1]
    assert all("LIVE_RESULTS" not in event for event in events)
    assert provider.messages == []
    assert events[-1] == "event: done\ndata: {}\n\n"


def test_normal_chat_does_not_search_products() -> None:
    provider = FakeStreamingProvider()
    service = ChatService(provider=provider)  # type: ignore[arg-type]
    search = LiveSearchStub()

    async def collect_events() -> list[str]:
        return [event async for event in service.stream_reply("Hello", [], search)]  # type: ignore[arg-type]

    events = asyncio.run(collect_events())

    assert search.calls == 0
    assert all("event: products" not in event for event in events)


def test_tell_product_request_uses_live_search_branch() -> None:
    provider = FakeStreamingProvider()
    service = ChatService(provider=provider)  # type: ignore[arg-type]
    search = LiveSearchStub()

    async def collect_events() -> list[str]:
        return [event async for event in service.stream_reply(
            "tell best high quality headphones for gaming under 2k", [], search  # type: ignore[arg-type]
        )]

    events = asyncio.run(collect_events())

    assert search.calls == 1
    assert any(event.startswith("event: products") for event in events)
    assert provider.messages == []
