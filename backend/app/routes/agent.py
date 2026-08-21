from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.ai.chat_service import chat_service
from app.schemas.agent import ChatStreamRequest
from app.services.agent_service import chat, search, recommend

router = APIRouter(prefix="/agent", tags=["Agent"])


class ChatRequest(BaseModel):
    message: str


class SearchRequest(BaseModel):
    query: str


@router.post("/chat")
def agent_chat(payload: ChatRequest):
    return chat(payload.message)


@router.post("/chat/stream")
async def agent_chat_stream(payload: ChatStreamRequest):
    if not chat_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="AI chat is not configured. Set OPENROUTER_API_KEY in backend/.env.",
        )

    return StreamingResponse(
        chat_service.stream_reply(payload.message, payload.history),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/search")
def agent_search(payload: SearchRequest):
    return search(payload.query)


@router.post("/recommend")
def agent_recommend():
    return recommend()
