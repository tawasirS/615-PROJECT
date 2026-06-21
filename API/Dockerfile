# ============================================================
# Dockerfile — Backend (FastAPI + SQLAlchemy + Alembic)
# Multi-stage build รองรับ ARM64 (Raspberry Pi)
# ============================================================

# ---- Stage 1: Dependencies ----
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# สร้าง virtual environment เพื่อให้ portable ระหว่าง stages
RUN python -m venv /venv
ENV PATH=/venv/bin:$PATH

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Stage 2: Runtime ----
FROM python:3.12-slim AS runner

WORKDIR /app

# คัดลอก virtual environment จาก builder
COPY --from=builder /venv /venv
ENV PATH=/venv/bin:$PATH

# สร้าง user ไม่ใช่ root
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --gid 1001 app

# คัดลอก source code
COPY . .

# ให้ ownership กับ user app
RUN chown -R app:app /app

USER app

EXPOSE 8000

# ใช้ uvicorn รอรับจาก 0.0.0.0
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]