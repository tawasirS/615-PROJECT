from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# แก้ชื่อ database / password ให้ตรงเครื่องของคุณ
# หาก password จริงคือ P@ssw0rd ให้ใช้ P%40ssw0rd ใน Python URL
DATABASE_URL = (
    "postgresql+asyncpg://postgres:P%40ssw0rd@127.0.0.1:5432/615-Project"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
)

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
