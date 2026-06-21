# 615 Project — Rental Management System

ระบบจัดการข้อมูลการเช่า โดยใช้ **Next.js (Frontend)** + **FastAPI (Backend)** + **PostgreSQL** รันด้วย **Docker Compose**

---

## 📦 Stack

| Service     | Technology                                        | Port |
|-------------|---------------------------------------------------|------|
| **Nginx**   | nginx:1.27-alpine (reverse proxy)                 | 80   |
| **Frontend**| Next.js 16 (standalone output)                    | 3000 |
| **API**     | FastAPI + SQLAlchemy + Alembic + asyncpg          | 8000 |
| **DB**      | PostgreSQL 16-alpine (named volume: `615-pgdata`) | 5432 |

### Architecture

```
Browser ──> Nginx (:80)
                │
                ├── /api/* ──> FastAPI (:8000) ──> PostgreSQL (:5432)
                │
                └── / ──> Next.js (:3000)
```

---

## 🚀 รันครั้งแรกบน Windows Dev

### 1. ติดตั้ง prerequisites

- [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- เปิด WSL 2 backend (Settings → Resources → WSL Integration)
- เปิด **Docker Desktop**

### 2. เตรียม environment variables

```bash
# ใช้ PowerShell หรือ Git Bash
cp .env.example .env
```

แก้ไข `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mysecretpassword
POSTGRES_DB=615-project

DATABASE_URL=postgresql+asyncpg://postgres:mysecretpassword@db:5432/615-project

NEXT_PUBLIC_API_URL=http://localhost/api
```

> **⚠ ข้อควรระวัง:** `DATABASE_URL` ใช้ hostname `db` (ชื่อ service ใน `compose.yaml`) ไม่ใช่ `localhost`

### 3. Build และ Start

```bash
# Build images
docker compose build

# รัน Alembic migration (run-once)
docker compose run --rm migration

# Start ทุก service
docker compose up -d
```

### 4. เปิด browser

| Service        | URL                        |
|----------------|----------------------------|
| Frontend       | http://localhost           |
| API Docs       | http://localhost/api/docs  |
| API Health     | http://localhost/api/      |
| API OpenAPI    | http://localhost/api/openapi.json |

### 5. ดู logs

```bash
# ทั้งหมด
docker compose logs -f

# เฉพาะ service
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f db
```

### 6. หยุดการทำงาน

```bash
# หยุด services (ไม่ลบ volume)
docker compose down

# ⚠ หยุดและลบ database volume! (ข้อมูลหาย)
docker compose down -v
```

---

## 🗄️ Alembic Migration

### สร้าง migration ใหม่ (เมื่อแก้ Models)

Models อยู่ใน `API/models.py` เมื่อแก้ไขแล้วให้สร้าง migration:

```bash
# เข้า shell ใน container api
docker compose exec api sh

# สร้าง migration file อัตโนมัติ
alembic revision --autogenerate -m "description of changes"

# exit container
exit
```

### ตรวจสอบ migration file

```bash
# ดู SQL ที่จะถูก run
docker compose run --rm api alembic upgrade head --sql
```

### รัน migration

```bash
# ผ่าน migration service (แนะนำ)
docker compose run --rm migration

# หรือผ่าน exec
docker compose exec api alembic upgrade head
```

### Rollback (กรณีมีปัญหา)

```bash
# ย้อนกลับ 1 step
docker compose exec api alembic downgrade -1

# ย้อนกลับทั้งหมด
docker compose exec api alembic downgrade base
```

### คำสั่งที่มีประโยชน์

```bash
# ดูประวัติ migration
docker compose exec api alembic history

# ดู current revision
docker compose exec api alembic current

# ดู migration ที่ยังไม่ได้ run
docker compose exec api alembic check
```

---

## 🥧 Deploy บน Raspberry Pi (ARM64)

### 1. เตรียม Raspberry Pi

```bash
# ติดตั้ง Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# ติดตั้ง Git
sudo apt install -y git
```

### 2. Clone project

```bash
git clone <your-repo-url> /home/pi/615-project
cd /home/pi/615-project
```

### 3. ตั้งค่า .env

```bash
cp .env.example .env
nano .env
# ใส่ POSTGRES_PASSWORD และค่าอื่น ๆ
```

### 4. Deploy

```bash
# ใช้ deploy script (แนะนำ)
chmod +x deploy.sh
./deploy.sh

# หรือ manual
docker compose build
docker compose run --rm migration
docker compose up -d
```

### 5. เปิด browser เข้า http://<raspberry-pi-ip>

---

## 💾 Backup PostgreSQL

### Backup ด้วย Docker

```bash
# Backup ไปยังไฟล์
docker compose exec db pg_dump -U postgres 615-project > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup ด้วย compression
docker compose exec db pg_dump -U postgres 615-project | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore

```bash
# Restore จากไฟล์ backup
cat backup_20260101_120000.sql | docker compose exec -T db psql -U postgres -d 615-project

# Restore จาก .gz
gunzip -c backup_20260101_120000.sql.gz | docker compose exec -T db psql -U postgres -d 615-project
```

### คำแนะนำการ backup

```bash
# — ใช้ cron รัน每晚:
# 0 2 * * * cd /home/pi/615-project && docker compose exec db pg_dump -U postgres 615-project | gzip > /home/pi/backups/615_$(date +\%Y\%m\%d).sql.gz

# — เก็บ backups ไว้ 30 วัน แล้วลบของเก่า:
# find /home/pi/backups -name "615_*.sql.gz" -mtime +30 -delete
```

---

## ⚠ ข้อควรระวัง

### `docker compose down -v` จะลบ database volume

```bash
# ❌ ระวัง! คำสั่งนี้ลบ volume pgdata → database หาย
docker compose down -v

# ✅ ใช้แค่ down โดยไม่มี -v เพื่อ preserve volume
docker compose down
```

### อื่น ๆ

| เรื่อง | รายละเอียด |
|--------|------------|
| **DATABASE_URL** | ใช้ hostname `db` เสมอ ไม่ใช่ `localhost` หรือ `127.0.0.1` |
| **`Base.metadata.create_all()`** | ห้ามใช้ใน production ให้ใช้ Alembic migration เท่านั้น |
| **ARM64** | Docker images ใช้ `node:22-alpine` และ `python:3.12-slim` ซึ่งรองรับ ARM64 ตามธรรมชาติ |
| **Nginx** | Nginx container จะ restart เมื่อ config เปลี่ยน ต้อง `docker compose restart nginx` |
| **API docs** | ใช้ path `/api/docs` (ผ่าน Nginx) ไม่ใช่ `localhost:8000/docs` |

---

## 📁 โครงสร้าง Docker Files

```
615-project/
├── compose.yaml              # Docker Compose — 4 services
├── .env.example              # ตัวอย่าง environment variables
├── deploy.sh                 # Deploy script สำหรับ Raspberry Pi
│
├── WEB/
│   ├── Dockerfile            # Multi-stage build for Next.js
│   └── .dockerignore
│
├── API/
│   ├── Dockerfile            # Multi-stage build for FastAPI
│   ├── .dockerignore
│   └── alembic.ini           # ใช้ DATABASE_URL จาก env (รองรับ Docker)
│
└── nginx/
    └── default.conf          # Nginx reverse proxy config
``` 