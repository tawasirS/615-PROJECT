from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import Document
from routers._utils import conflict, no_update_data, not_found
from schemas import DocumentCreate, DocumentResponse, DocumentUpdate

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(payload: DocumentCreate, db: AsyncSession = Depends(get_db)):
    # Document ใช้ ref_table + ref_uuid จึงเก็บแบบ generic reference
    # ยังไม่ตรวจ FK ที่ปลายทาง เพราะ ref_table เลือกได้หลาย table
    try:
        return await create_row(db, Document, payload.model_dump(mode="json"))
    except IntegrityError as exc:
        raise conflict() from exc


@router.get("", response_model=list[DocumentResponse])
async def get_documents(
    ref_table: str | None = None,
    ref_uuid: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    conditions = []
    if ref_table is not None:
        conditions.append(Document.ref_table == ref_table)
    if ref_uuid is not None:
        conditions.append(Document.ref_uuid == ref_uuid)

    where = and_(*conditions) if conditions else None
    return await list_rows(
        db,
        Document,
        skip=skip,
        limit=limit,
        include_deleted=include_deleted,
        where=where,
    )


@router.get("/{document_uuid}", response_model=DocumentResponse)
async def get_document(document_uuid: str, db: AsyncSession = Depends(get_db)):
    document = await get_by_uuid(db, Document, document_uuid)
    if document is None:
        raise not_found("Document")
    return document


@router.put("/{document_uuid}", response_model=DocumentResponse)
async def update_document(
    document_uuid: str,
    payload: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
):
    document = await get_by_uuid(db, Document, document_uuid)
    if document is None:
        raise not_found("Document")

    data = payload.model_dump(exclude_unset=True, mode="json")
    if not data:
        raise no_update_data()

    try:
        return await update_row(db, document, data)
    except IntegrityError as exc:
        raise conflict() from exc


@router.delete("/{document_uuid}")
async def delete_document(document_uuid: str, db: AsyncSession = Depends(get_db)):
    document = await get_by_uuid(db, Document, document_uuid)
    if document is None:
        raise not_found("Document")

    await soft_delete_row(db, document)
    return {"message": "Document deleted successfully"}
