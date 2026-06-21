from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import Area, Contract, Renter
from routers._utils import conflict, no_update_data, not_found
from schemas import ContractCreate, ContractDetailResponse, ContractResponse, ContractUpdate

router = APIRouter(prefix="/contracts", tags=["Contracts"])


async def validate_contract_references(
    db: AsyncSession,
    *,
    area_uuid: str | None = None,
    renter_uuid: str | None = None,
    ref_contract_uuid: str | None = None,
    current_contract_uuid: str | None = None,
) -> None:
    if area_uuid is not None and await get_by_uuid(db, Area, area_uuid) is None:
        raise HTTPException(status_code=422, detail="area_uuid does not reference an active Area")

    if renter_uuid is not None and await get_by_uuid(db, Renter, renter_uuid) is None:
        raise HTTPException(status_code=422, detail="renter_uuid does not reference an active Renter")

    if ref_contract_uuid is not None:
        if ref_contract_uuid == current_contract_uuid:
            raise HTTPException(status_code=422, detail="ref_contract_uuid cannot reference itself")
        if await get_by_uuid(db, Contract, ref_contract_uuid) is None:
            raise HTTPException(status_code=422, detail="ref_contract_uuid does not reference an active Contract")


def validate_contract_dates(start_date, end_date) -> None:
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="start_date must be earlier than or equal to end_date",
        )


@router.post("", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(payload: ContractCreate, db: AsyncSession = Depends(get_db)):
    validate_contract_dates(payload.start_date, payload.end_date)
    await validate_contract_references(
        db,
        area_uuid=payload.area_uuid,
        renter_uuid=payload.renter_uuid,
        ref_contract_uuid=payload.ref_contract_uuid,
    )

    try:
        return await create_row(db, Contract, payload.model_dump(mode="json"))
    except IntegrityError as exc:
        raise conflict() from exc


@router.get("", response_model=list[ContractResponse])
async def get_contracts(
    area_uuid: str | None = None,
    renter_uuid: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    where = None
    if area_uuid is not None:
        where = Contract.area_uuid == area_uuid
    elif renter_uuid is not None:
        where = Contract.renter_uuid == renter_uuid

    return await list_rows(
        db,
        Contract,
        skip=skip,
        limit=limit,
        include_deleted=include_deleted,
        where=where,
    )


@router.get("/{contract_uuid}", response_model=ContractResponse)
async def get_contract(contract_uuid: str, db: AsyncSession = Depends(get_db)):
    contract = await get_by_uuid(db, Contract, contract_uuid)
    if contract is None:
        raise not_found("Contract")
    return contract


@router.get("/{contract_uuid}/detail", response_model=ContractDetailResponse)
async def get_contract_detail(contract_uuid: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Contract)
        .options(
            selectinload(Contract.area),
            selectinload(Contract.renter),
            selectinload(Contract.invoices),
        )
        .where(Contract.uuid == contract_uuid, Contract.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    contract = result.scalar_one_or_none()

    if contract is None:
        raise not_found("Contract")

    return contract


@router.put("/{contract_uuid}", response_model=ContractResponse)
async def update_contract(
    contract_uuid: str,
    payload: ContractUpdate,
    db: AsyncSession = Depends(get_db),
):
    contract = await get_by_uuid(db, Contract, contract_uuid)
    if contract is None:
        raise not_found("Contract")

    data = payload.model_dump(exclude_unset=True, mode="json")
    if not data:
        raise no_update_data()

    await validate_contract_references(
        db,
        area_uuid=data.get("area_uuid"),
        renter_uuid=data.get("renter_uuid"),
        ref_contract_uuid=data.get("ref_contract_uuid"),
        current_contract_uuid=contract_uuid,
    )

    validate_contract_dates(
        data.get("start_date", contract.start_date),
        data.get("end_date", contract.end_date),
    )

    try:
        return await update_row(db, contract, data)
    except IntegrityError as exc:
        raise conflict() from exc


@router.delete("/{contract_uuid}")
async def delete_contract(contract_uuid: str, db: AsyncSession = Depends(get_db)):
    contract = await get_by_uuid(db, Contract, contract_uuid)
    if contract is None:
        raise not_found("Contract")

    await soft_delete_row(db, contract)
    return {"message": "Contract deleted successfully"}
