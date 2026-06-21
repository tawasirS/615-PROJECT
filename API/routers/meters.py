from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import Area, Meter
from routers._utils import conflict, no_update_data, not_found
from schemas import MeterCreate, MeterResponse, MeterUpdate

router = APIRouter(prefix="/meters", tags=["Meters"])


async def validate_area(db: AsyncSession, area_uuid: str) -> None:
    if await get_by_uuid(db, Area, area_uuid) is None:
        raise HTTPException(status_code=422, detail="area_uuid does not reference an active Area")


@router.post("", response_model=MeterResponse, status_code=status.HTTP_201_CREATED)
async def create_meter(payload: MeterCreate, db: AsyncSession = Depends(get_db)):
    await validate_area(db, payload.area_uuid)
    try:
        return await create_row(db, Meter, payload.model_dump(mode="json"))
    except IntegrityError as exc:
        raise conflict() from exc


@router.get("", response_model=list[MeterResponse])
async def get_meters(
    area_uuid: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    where = Meter.area_uuid == area_uuid if area_uuid else None
    return await list_rows(
        db,
        Meter,
        skip=skip,
        limit=limit,
        include_deleted=include_deleted,
        where=where,
    )


@router.get("/{meter_uuid}", response_model=MeterResponse)
async def get_meter(meter_uuid: str, db: AsyncSession = Depends(get_db)):
    meter = await get_by_uuid(db, Meter, meter_uuid)
    if meter is None:
        raise not_found("Meter")
    return meter


@router.put("/{meter_uuid}", response_model=MeterResponse)
async def update_meter(
    meter_uuid: str,
    payload: MeterUpdate,
    db: AsyncSession = Depends(get_db),
):
    meter = await get_by_uuid(db, Meter, meter_uuid)
    if meter is None:
        raise not_found("Meter")

    data = payload.model_dump(exclude_unset=True, mode="json")
    if not data:
        raise no_update_data()

    if "area_uuid" in data:
        await validate_area(db, data["area_uuid"])

    try:
        return await update_row(db, meter, data)
    except IntegrityError as exc:
        raise conflict() from exc


@router.delete("/{meter_uuid}")
async def delete_meter(meter_uuid: str, db: AsyncSession = Depends(get_db)):
    meter = await get_by_uuid(db, Meter, meter_uuid)
    if meter is None:
        raise not_found("Meter")

    await soft_delete_row(db, meter)
    return {"message": "Meter deleted successfully"}
