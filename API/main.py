import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import areas, contracts, documents, invoices, meters, payments, renters, users

# root_path /api สำหรับ Docker/Nginx, ว่างเปล่าสำหรับ local dev
api_root_path = os.environ.get("API_ROOT_PATH", "")

app = FastAPI(
    title="615 Project Rental API",
    version="1.0.0",
    description="FastAPI + PostgreSQL + SQLAlchemy + Alembic",
    root_path=api_root_path or None,
)

# CORS — อนุญาตให้ Next.js frontend เรียก API ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {"message": "API is running"}


# main.py ทำหน้าที่ประกอบ application เท่านั้น
# CRUD และ business logic อยู่ใน routers/ และ crud/
app.include_router(areas.router)
app.include_router(renters.router)
app.include_router(contracts.router)
app.include_router(invoices.router)
app.include_router(meters.router)
app.include_router(payments.router)
app.include_router(documents.router)
app.include_router(users.router)
