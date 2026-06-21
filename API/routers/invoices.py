from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import Contract, Invoice
from routers._utils import conflict, no_update_data, not_found
from schemas import InvoiceCreate, InvoiceResponse, InvoiceUpdate

router = APIRouter(prefix="/invoices", tags=["Invoices"])


async def validate_contract(db: AsyncSession, contract_uuid: str) -> None:
    if await get_by_uuid(db, Contract, contract_uuid) is None:
        raise HTTPException(status_code=422, detail="contract_uuid does not reference an active Contract")


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    await validate_contract(db, payload.contract_uuid)
    try:
        return await create_row(db, Invoice, payload.model_dump(mode="json"))
    except IntegrityError as exc:
        raise conflict() from exc


@router.get("", response_model=list[InvoiceResponse])
async def get_invoices(
    contract_uuid: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    where = Invoice.contract_uuid == contract_uuid if contract_uuid else None
    return await list_rows(
        db,
        Invoice,
        skip=skip,
        limit=limit,
        include_deleted=include_deleted,
        where=where,
    )


@router.get("/{invoice_uuid}", response_model=InvoiceResponse)
async def get_invoice(invoice_uuid: str, db: AsyncSession = Depends(get_db)):
    invoice = await get_by_uuid(db, Invoice, invoice_uuid)
    if invoice is None:
        raise not_found("Invoice")
    return invoice


@router.put("/{invoice_uuid}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_uuid: str,
    payload: InvoiceUpdate,
    db: AsyncSession = Depends(get_db),
):
    invoice = await get_by_uuid(db, Invoice, invoice_uuid)
    if invoice is None:
        raise not_found("Invoice")

    data = payload.model_dump(exclude_unset=True, mode="json")
    if not data:
        raise no_update_data()

    if "contract_uuid" in data:
        await validate_contract(db, data["contract_uuid"])

    try:
        return await update_row(db, invoice, data)
    except IntegrityError as exc:
        raise conflict() from exc


@router.delete("/{invoice_uuid}")
async def delete_invoice(invoice_uuid: str, db: AsyncSession = Depends(get_db)):
    invoice = await get_by_uuid(db, Invoice, invoice_uuid)
    if invoice is None:
        raise not_found("Invoice")

    await soft_delete_row(db, invoice)
    return {"message": "Invoice deleted successfully"}
