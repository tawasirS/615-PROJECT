from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import Area
from routers._utils import conflict, no_update_data, not_found
from schemas import AreaCreate, AreaResponse, AreaUpdate

router = APIRouter(prefix="/areas", tags=["Areas"])


@router.post("", response_model=AreaResponse, status_code=status.HTTP_201_CREATED)
async def create_area(payload: AreaCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await create_row(db, Area, payload.model_dump())
    except IntegrityError as exc:
        raise conflict() from exc


@router.get("", response_model=list[AreaResponse])
async def get_areas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    return await list_rows(
        db,
        Area,
        skip=skip,
        limit=limit,
        include_deleted=include_deleted,
    )


@router.get("/{area_uuid}", response_model=AreaResponse)
async def get_area(area_uuid: str, db: AsyncSession = Depends(get_db)):
    area = await get_by_uuid(db, Area, area_uuid)
    if area is None:
        raise not_found("Area")
    return area


@router.put("/{area_uuid}", response_model=AreaResponse)
async def update_area(
    area_uuid: str,
    payload: AreaUpdate,
    db: AsyncSession = Depends(get_db),
):
    area = await get_by_uuid(db, Area, area_uuid)
    if area is None:
        raise not_found("Area")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise no_update_data()

    try:
        return await update_row(db, area, data)
    except IntegrityError as exc:
        raise conflict() from exc


@router.delete("/{area_uuid}")
async def delete_area(area_uuid: str, db: AsyncSession = Depends(get_db)):
    area = await get_by_uuid(db, Area, area_uuid)
    if area is None:
        raise not_found("Area")

    await soft_delete_row(db, area)
    return {"message": "Area deleted successfully"}
