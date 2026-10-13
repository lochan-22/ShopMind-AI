"""OpenRouter chat-completion provider."""

import json
import os
from collections.abc import AsyncIterator
from typing import cast

from dotenv import load_dotenv
import httpx
from openai import OpenAI

from app.ai.providers.base import ChatMessage
from app.core.config import settings


load_dotenv()


class OpenRouterError(RuntimeError):
    """Raised when OpenRouter cannot return a usable chat response."""


class OpenRouterProvider:
    """Stateless OpenRouter provider using its OpenAI-compatible API."""

    base_url = "https://openrouter.ai/api/v1"

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout: float | None = None,
    ) -> None:
        self.api_key = (api_key or settings.openrouter_api_key or os.getenv("OPENROUTER_API_KEY", "")).strip()
        self.model = (model or settings.openrouter_model or os.getenv("OPENROUTER_MODEL", "")).strip()
        self.timeout = (
            timeout
            if timeout is not None
            else getattr(settings, "openrouter_timeout_seconds", 25.0)
        )

    def is_configured(self) -> bool:
        return bool(self.api_key and self.model)

    def chat(self, messages: list[ChatMessage]) -> str:
        """Send messages to OpenRouter and return the completed response text."""
        if not self.is_configured():
            raise OpenRouterError(
                "OpenRouter is not configured. Set OPENROUTER_API_KEY and OPENROUTER_MODEL."
            )
        if not messages:
            raise ValueError("messages must contain at least one message")

        try:
            client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
                timeout=self.timeout,
                default_headers={
                    "HTTP-Referer": settings.openrouter_site_url,
                    "X-Title": settings.openrouter_app_name,
                },
            )
            response = client.chat.completions.create(
                model=self.model,
                messages=cast(list[dict[str, str]], messages),
            )
        except Exception as error:
            raise OpenRouterError(f"Unable to get a response from OpenRouter: {error}") from error

        content = response.choices[0].message.content if response.choices else None
        if not content:
            raise OpenRouterError("OpenRouter returned an empty response.")
        return content


def chat(messages: list[ChatMessage]) -> str:
    """Return a single, non-streaming OpenRouter response for *messages*."""
    return OpenRouterProvider().chat(messages)


class OpenRouterClient(OpenRouterProvider):
    """Legacy streaming client retained for existing application callers."""

    endpoint = "https://openrouter.ai/api/v1/chat/completions"

    def is_configured(self) -> bool:
        return bool(settings.openrouter_api_key.strip())

    async def stream_chat(self, messages: list[dict[str, str]]) -> AsyncIterator[str]:
        """Stream a response for legacy callers that require SSE tokens."""
        if not self.is_configured():
            raise OpenRouterError("OpenRouter is not configured. Set OPENROUTER_API_KEY in backend/.env.")

        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.openrouter_site_url,
            "X-Title": settings.openrouter_app_name,
        }
        payload = {
            "model": settings.openrouter_model,
            "messages": messages,
            "stream": True,
            "temperature": 0.7,
            "max_tokens": 600,
        }

        try:
            timeout = httpx.Timeout(90.0, connect=15.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", self.endpoint, headers=headers, json=payload) as response:
                    if response.is_error:
                        detail = (await response.aread()).decode("utf-8", errors="replace")
                        raise OpenRouterError(f"OpenRouter request failed ({response.status_code}): {detail[:500]}")

                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:]
                        if data == "[DONE]":
                            return
                        try:
                            chunk = json.loads(data)
                            content = chunk["choices"][0].get("delta", {}).get("content")
                        except (IndexError, KeyError, TypeError, json.JSONDecodeError):
                            continue
                        if isinstance(content, str) and content:
                            yield content
        except httpx.HTTPError as error:
            raise OpenRouterError("Unable to reach OpenRouter. Please try again.") from error
