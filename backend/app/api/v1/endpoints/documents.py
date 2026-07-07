import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.services.rag import rag_service

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile,
    workspace_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {list(ALLOWED_TYPES.keys())}",
        )

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    file_id = str(uuid.uuid4())
    ext = ALLOWED_TYPES[file.content_type]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(content)

    document = Document(
        id=file_id,
        filename=file.filename or "unknown",
        file_path=file_path,
        file_size=len(content),
        content_type=file.content_type,
        user_id=current_user.id,
        workspace_id=workspace_id,
    )
    db.add(document)
    await db.flush()

    chunk_count = await rag_service.ingest_document(
        file_path=file_path,
        user_id=current_user.id,
        document_id=file_id,
        workspace_id=workspace_id,
    )
    document.chunk_count = chunk_count
    await db.flush()
    await db.refresh(document)

    return document


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    workspace_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Document).where(Document.user_id == current_user.id)
    if workspace_id:
        query = query.where(Document.workspace_id == workspace_id)
    query = query.order_by(Document.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(
            Document.id == document_id, Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    await rag_service.delete_document(
        document_id=document_id,
        user_id=current_user.id,
        workspace_id=document.workspace_id,
    )

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    await db.delete(document)
