from datetime import datetime

from pydantic import BaseModel


class MessageCreate(BaseModel):
    content: str
    model: str | None = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    model: str | None
    tokens_used: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    title: str | None = "New Chat"
    model: str | None = None
    system_prompt: str | None = None
    workspace_id: str | None = None


class ConversationResponse(BaseModel):
    id: str
    title: str
    model: str
    system_prompt: str | None
    workspace_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationWithMessages(ConversationResponse):
    messages: list[MessageResponse] = []


class ChatRequest(BaseModel):
    message: str
    model: str | None = None
    use_rag: bool = False
    workspace_id: str | None = None
