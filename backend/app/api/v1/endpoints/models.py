from fastapi import APIRouter

from app.services.ollama import ollama_service

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("")
async def list_models():
    models = await ollama_service.list_models()
    return {
        "models": [
            {
                "name": m.get("name", ""),
                "size": m.get("size", 0),
                "modified_at": m.get("modified_at", ""),
                "digest": m.get("digest", ""),
            }
            for m in models
        ]
    }


@router.get("/health")
async def check_ollama_health():
    healthy = await ollama_service.check_health()
    return {"status": "healthy" if healthy else "unhealthy", "connected": healthy}
