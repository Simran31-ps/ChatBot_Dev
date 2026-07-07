from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, chat, documents, models, prompts, workspaces

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(models.router)
api_router.include_router(documents.router)
api_router.include_router(workspaces.router)
api_router.include_router(prompts.router)
api_router.include_router(admin.router)
