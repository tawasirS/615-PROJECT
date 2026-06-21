from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import Invoice, Meter, Payment
from routers._utils import conflict, no_update_data, not_found
from schemas import PaymentCreate, PaymentResponse, PaymentUpdate

router = APIRouter(prefix="/payments", tags=["Payments"])


async def validate_payment_references(
    db: AsyncSession,
    *,
    invoice_uuid: str | None = None,
    meter_uuid: str | None = None,
    ref_payment_uuid: str | None = None,
    current_payment_uuid: str | None = None,
) -> None:
    if invoice_uuid is not None and await get_by_uuid(db, Invoice, invoice_uuid) is None:
        raise HTTPException(status_code=422, detail="invoice_uuid does not reference an active Invoice")

    if meter_uuid is not None and await get_by_uuid(db, Meter, meter_uuid) is None:
        raise HTTPException(status_code=422, detail="meter_uuid does not reference an active Meter")

    if ref_payment_uuid is not None:
        if ref_payment_uuid == current_payment_uuid:
            raise HTTPException(status_code=422, detail="ref_payment_uuid cannot reference itself")
        if await get_by_uuid(db, Payment, ref_payment_uuid) is None:
            raise HTTPException(status_code=422, detail="ref_payment_uuid does not reference an active Payment")


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(payload: PaymentCreate, db: AsyncSession = Depends(get_db)):
    await validate_payment_references(
        db,
        invoice_uuid=payload.invoice_uuid,
        meter_uuid=payload.meter_uuid,
        ref_payment_uuid=payload.ref_payment_uuid,
    )
    try:
        return await create_row(db, Payment, payload.model_dump(mode="json"))
    except IntegrityError as exc:
        raise conflict() from exc


@router.get("", response_model=list[PaymentResponse])
async def get_payments(
    invoice_uuid: str | None = None,
    meter_uuid: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    where = None
    if invoice_uuid is not None:
        where = Payment.invoice_uuid == invoice_uuid
    elif meter_uuid is not None:
        where = Payment.meter_uuid == meter_uuid

    return await list_rows(
        db,
        Payment,
        skip=skip,
        limit=limit,
        include_deleted=include_deleted,
        where=where,
    )


@router.get("/{payment_uuid}", response_model=PaymentResponse)
async def get_payment(payment_uuid: str, db: AsyncSession = Depends(get_db)):
    payment = await get_by_uuid(db, Payment, payment_uuid)
    if payment is None:
        raise not_found("Payment")
    return payment


@router.put("/{payment_uuid}", response_model=PaymentResponse)
async def update_payment(
    payment_uuid: str,
    payload: PaymentUpdate,
    db: AsyncSession = Depends(get_db),
):
    payment = await get_by_uuid(db, Payment, payment_uuid)
    if payment is None:
        raise not_found("Payment")

    data = payload.model_dump(exclude_unset=True, mode="json")
    if not data:
        raise no_update_data()

    await validate_payment_references(
        db,
        invoice_uuid=data.get("invoice_uuid"),
        meter_uuid=data.get("meter_uuid"),
        ref_payment_uuid=data.get("ref_payment_uuid"),
        current_payment_uuid=payment_uuid,
    )

    try:
        return await update_row(db, payment, data)
    except IntegrityError as exc:
        raise conflict() from exc


@router.delete("/{payment_uuid}")
async def delete_payment(payment_uuid: str, db: AsyncSession = Depends(get_db)):
    payment = await get_by_uuid(db, Payment, payment_uuid)
    if payment is None:
        raise not_found("Payment")

    await soft_delete_row(db, payment)
    return {"message": "Payment deleted successfully"}
