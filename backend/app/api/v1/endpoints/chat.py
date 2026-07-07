import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ConversationCreate,
    ConversationResponse,
    ConversationWithMessages,
)
from app.services.ollama import ollama_service
from app.services.rag import rag_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    workspace_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Conversation).where(Conversation.user_id == current_user.id)
    if workspace_id:
        query = query.where(Conversation.workspace_id == workspace_id)
    query = query.order_by(Conversation.updated_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.core.config import settings

    conversation = Conversation(
        title=data.title or "New Chat",
        user_id=current_user.id,
        model=data.model or settings.DEFAULT_MODEL,
        system_prompt=data.system_prompt,
        workspace_id=data.workspace_id,
    )
    db.add(conversation)
    await db.flush()
    await db.refresh(conversation)
    return conversation


@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id, Conversation.user_id == current_user.id
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    await db.delete(conversation)


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=data.message,
    )
    db.add(user_message)
    await db.flush()

    model = data.model or conversation.model
    messages = [{"role": m.role, "content": m.content} for m in conversation.messages]
    messages.append({"role": "user", "content": data.message})

    system_prompt = conversation.system_prompt

    if data.use_rag:
        context_docs = await rag_service.query(
            query=data.message,
            user_id=current_user.id,
            workspace_id=data.workspace_id or conversation.workspace_id,
        )
        if context_docs:
            rag_context = "\n\n".join(context_docs)
            rag_prompt = (
                f"Use the following context to answer the question. "
                f"If the context doesn't contain relevant information, "
                f"say so and answer based on your general knowledge.\n\n"
                f"Context:\n{rag_context}"
            )
            system_prompt = f"{system_prompt}\n\n{rag_prompt}" if system_prompt else rag_prompt

    async def stream_response():
        full_response = ""
        try:
            async for chunk in ollama_service.generate_stream(
                model=model,
                messages=messages,
                system_prompt=system_prompt,
            ):
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=full_response,
            model=model,
        )
        db.add(assistant_message)
        await db.commit()

        yield f"data: {json.dumps({'done': True, 'message_id': assistant_message.id})}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
