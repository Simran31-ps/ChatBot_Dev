from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_size: int
    content_type: str
    chunk_count: int
    workspace_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
