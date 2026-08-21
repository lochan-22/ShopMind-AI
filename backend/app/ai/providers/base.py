"""Shared contracts for AI providers."""

from typing import Protocol, TypedDict


class ChatMessage(TypedDict):
    """A message accepted by chat-completion providers."""

    role: str
    content: str


class ChatProvider(Protocol):
    """Interface implemented by pluggable chat providers."""

    def chat(self, messages: list[ChatMessage]) -> str:
        """Return one complete assistant response for *messages*."""
