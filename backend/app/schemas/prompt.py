from datetime import datetime

from pydantic import BaseModel


class PromptCreate(BaseModel):
    title: str
    content: str
    category: str = "general"
    is_public: bool = True


class PromptResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    is_public: bool
    author_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
