from pydantic import BaseModel


class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_conversations: int
    total_messages: int
    total_documents: int
    total_workspaces: int


class UserAdminUpdate(BaseModel):
    is_active: bool | None = None
    is_admin: bool | None = None
