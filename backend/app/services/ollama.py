from collections.abc import AsyncGenerator

import httpx

from app.core.config import settings


class OllamaService:
    def __init__(self) -> None:
        self.base_url = settings.OLLAMA_BASE_URL

    async def list_models(self) -> list[dict]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return data.get("models", [])
            except httpx.HTTPError:
                return []

    async def generate_stream(
        self,
        model: str,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        payload: dict = {
            "model": model,
            "messages": messages,
            "stream": True,
        }
        if system_prompt:
            payload["messages"] = [{"role": "system", "content": system_prompt}, *messages]

        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        import json

                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            yield data["message"]["content"]
                        if data.get("done", False):
                            break

    async def generate(
        self,
        model: str,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> str:
        payload: dict = {
            "model": model,
            "messages": messages,
            "stream": False,
        }
        if system_prompt:
            payload["messages"] = [{"role": "system", "content": system_prompt}, *messages]

        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"]

    async def check_health(self) -> bool:
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(self.base_url)
                return response.status_code == 200
            except httpx.HTTPError:
                return False


ollama_service = OllamaService()
