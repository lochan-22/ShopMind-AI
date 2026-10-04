from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.ai.chat_service import chat_service
from app.schemas.agent import ChatStreamRequest
from app.services.agent_service import chat, search, recommend
from app.routes.products import search_service

router = APIRouter(prefix="/agent", tags=["Agent"])


class ChatRequest(BaseModel):
    message: str


class SearchRequest(BaseModel):
    query: str


@router.post("/chat")
async def agent_chat(payload: ChatRequest):
    """Keep legacy chat callers live-search grounded when applicable."""
    product_response = await chat_service.product_reply(payload.message, search_service)
    if product_response is not None:
        return {**product_response, "reply": product_response["message"]}
    return chat(payload.message)


@router.post("/chat/stream")
async def agent_chat_stream(payload: ChatStreamRequest):
    return StreamingResponse(
        chat_service.stream_reply(payload.message, payload.history, search_service),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/search")
def agent_search(payload: SearchRequest):
    return search(payload.query)


@router.post("/recommend")
def agent_recommend():
    return recommend()
