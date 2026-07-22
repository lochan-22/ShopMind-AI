from fastapi import APIRouter
from pydantic import BaseModel
from app.services.agent_service import chat, search, recommend

router = APIRouter(prefix="/agent", tags=["Agent"])


class ChatRequest(BaseModel):
    message: str


class SearchRequest(BaseModel):
    query: str


@router.post("/chat")
def agent_chat(payload: ChatRequest):
    return chat(payload.message)


@router.post("/search")
def agent_search(payload: SearchRequest):
    return search(payload.query)


@router.post("/recommend")
def agent_recommend():
    return recommend()