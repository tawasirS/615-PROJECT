from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from crud.common import create_row, get_by_uuid, list_rows, soft_delete_row, update_row
from database import get_db
from models import User
from routers._utils import conflict, no_update_data, not_found
from schemas import UserCreate, UserResponse, UserUpdate
from security import hash_password

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # ไม่ส่ง password ลง model ตรง ๆ เพราะ model ใช้ password_hash
    data = payload.model_dump(exclude={"password"})
    data["password_hash"] = hash_password(payload.password)

    try:
        return await create_row(db, User, data)
    except IntegrityError as exc:
        # ถ้าคุณเพิ่ม unique=True ให้ User.code ในอนาคต error นี้จะเข้าทางนี้
        raise conflict("User code already exists or data conflicts with an existing record") from exc


@router.get("", response_model=list[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
):
    # response_model ป้องกันไม่ให้ password/password_hash หลุดออกไป
    return await list_rows(db, User, skip=skip, limit=limit, include_deleted=include_deleted)


@router.get("/{user_uuid}", response_model=UserResponse)
async def get_user(user_uuid: str, db: AsyncSession = Depends(get_db)):
    user = await get_by_uuid(db, User, user_uuid)
    if user is None:
        raise not_found("User")
    return user


@router.put("/{user_uuid}", response_model=UserResponse)
async def update_user(
    user_uuid: str,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    user = await get_by_uuid(db, User, user_uuid)
    if user is None:
        raise not_found("User")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise no_update_data()

    plain_password = data.pop("password", None)
    if plain_password is not None:
        data["password_hash"] = hash_password(plain_password)

    try:
        return await update_row(db, user, data)
    except IntegrityError as exc:
        raise conflict("User code already exists or data conflicts with an existing record") from exc


@router.delete("/{user_uuid}")
async def delete_user(user_uuid: str, db: AsyncSession = Depends(get_db)):
    user = await get_by_uuid(db, User, user_uuid)
    if user is None:
        raise not_found("User")

    await soft_delete_row(db, user)
    return {"message": "User deleted successfully"}
