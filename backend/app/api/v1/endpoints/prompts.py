from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.prompt import Prompt
from app.models.user import User
from app.schemas.prompt import PromptCreate, PromptResponse

router = APIRouter(prefix="/prompts", tags=["Prompts"])


@router.get("", response_model=list[PromptResponse])
async def list_prompts(
    category: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Prompt).where(
        (Prompt.is_public == True) | (Prompt.author_id == current_user.id)  # noqa: E712
    )
    if category:
        query = query.where(Prompt.category == category)
    query = query.order_by(Prompt.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=PromptResponse, status_code=201)
async def create_prompt(
    data: PromptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prompt = Prompt(
        title=data.title,
        content=data.content,
        category=data.category,
        is_public=data.is_public,
        author_id=current_user.id,
    )
    db.add(prompt)
    await db.flush()
    await db.refresh(prompt)
    return prompt


@router.delete("/{prompt_id}", status_code=204)
async def delete_prompt(
    prompt_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id, Prompt.author_id == current_user.id)
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    await db.delete(prompt)
