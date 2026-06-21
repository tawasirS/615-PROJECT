from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar("ModelT")


async def get_by_uuid(
    db: AsyncSession,
    model: type[ModelT],
    row_uuid: str,
    *,
    include_deleted: bool = False,
) -> ModelT | None:
    stmt = select(model).where(model.uuid == row_uuid)  # type: ignore[attr-defined]

    if not include_deleted:
        stmt = stmt.where(model.deleted_at.is_(None))  # type: ignore[attr-defined]

    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_rows(
    db: AsyncSession,
    model: type[ModelT],
    *,
    skip: int = 0,
    limit: int = 100,
    include_deleted: bool = False,
    where: Any | None = None,
) -> list[ModelT]:
    stmt = select(model)

    if not include_deleted:
        stmt = stmt.where(model.deleted_at.is_(None))  # type: ignore[attr-defined]

    if where is not None:
        stmt = stmt.where(where)

    stmt = (
        stmt.order_by(model.created_at.desc())  # type: ignore[attr-defined]
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_row(
    db: AsyncSession,
    model: type[ModelT],
    data: dict[str, Any],
) -> ModelT:
    row = model(**data)
    db.add(row)
    return await commit_and_refresh(db, row)


async def update_row(
    db: AsyncSession,
    row: ModelT,
    data: dict[str, Any],
) -> ModelT:
    for field, value in data.items():
        setattr(row, field, value)

    return await commit_and_refresh(db, row)


async def soft_delete_row(
    db: AsyncSession,
    row: ModelT,
) -> ModelT:
    # ทุก table ใน ERD มี deleted_at จึงใช้ soft delete
    setattr(row, "deleted_at", datetime.now(timezone.utc))
    return await commit_and_refresh(db, row)


async def commit_and_refresh(
    db: AsyncSession,
    row: ModelT,
) -> ModelT:
    try:
        await db.commit()
        await db.refresh(row)
        return row
    except IntegrityError:
        await db.rollback()
        raise
