from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import Renter
from routers._utils import conflict, no_update_data, not_found
from schemas import RenterCreate, RenterResponse, RenterUpdate

router = APIRouter(prefix="/renters", tags=["Renters"])


@router.post("", response_model=RenterResponse, status_code=status.HTTP_201_CREATED)
async def create_renter(payload: RenterCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await create_row(db, Renter, payload.model_dump(mode="json"))
    except IntegrityError as exc:
        raise conflict() from exc


@router.get("", response_model=list[RenterResponse])
async def get_renters(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    return await list_rows(db, Renter, skip=skip, limit=limit, include_deleted=include_deleted)


@router.get("/{renter_uuid}", response_model=RenterResponse)
async def get_renter(renter_uuid: str, db: AsyncSession = Depends(get_db)):
    renter = await get_by_uuid(db, Renter, renter_uuid)
    if renter is None:
        raise not_found("Renter")
    return renter


@router.put("/{renter_uuid}", response_model=RenterResponse)
async def update_renter(
    renter_uuid: str,
    payload: RenterUpdate,
    db: AsyncSession = Depends(get_db),
):
    renter = await get_by_uuid(db, Renter, renter_uuid)
    if renter is None:
        raise not_found("Renter")

    data = payload.model_dump(exclude_unset=True, mode="json")
    if not data:
        raise no_update_data()

    try:
        return await update_row(db, renter, data)
    except IntegrityError as exc:
        raise conflict() from exc


@router.delete("/{renter_uuid}")
async def delete_renter(renter_uuid: str, db: AsyncSession = Depends(get_db)):
    renter = await get_by_uuid(db, Renter, renter_uuid)
    if renter is None:
        raise not_found("Renter")

    await soft_delete_row(db, renter)
    return {"message": "Renter deleted successfully"}
