# Docker ใช้งานสำหรับโปรเจกต์นี้

> สรุปขั้นตอนการเริ่มต้น, การรันเซิร์ฟเวอร์, การดูแลรักษา, การ Deploy และการตั้งค่าใหม่สำหรับผู้เริ่มต้น

---

## 1. โครงสร้างไฟล์ Docker ที่สำคัญ

| โฟลเดอร์/ไฟล์ | รายละเอียด |
|---------------|------------|
| `API/Dockerfile` | สร้างภาพหลักสำหรับ **FastAPI** (Backend) |
| `WEB/Dockerfile` | สร้างภาพสำหรับ **Next.js** (Frontend) |
| `compose.yaml` | ตั้งค่า **Docker Compose** เพื่อรันหลายเซอร์วิสพร้อมกัน |
| `.dockerignore` | กำหนดไฟล์/โฟลเดอร์ที่ไม่ต้องส่งไปยัง Docker Build Context |

---

## 2. สร้างภาพ Docker (Build Image)

### 2.1 สำหรับ Backend (FastAPI)

```bash
# ระดับรูทโฟลเดอร์ของโปรเจกต์
cd d:\project\615

# สร้างภาพโดยใช้ Dockerfile ในโฟลเดอร์ API
docker build -t rental-api:latest ./API
```

### 2.2 สำหรับ Frontend (Next.js)

```bash
docker build -t rental-web:latest ./WEB
```

> **เคล็ดลับ**: ใช้ `-t` ตั้งชื่อภาพให้ชัดเจน แล้วสามารถอ้างอิงได้ง่ายใน `docker compose`

---

## 3. รันเซิร์ฟเวอร์ (Run Containers)

### 3.1 ใช้ Docker Compose (แนะนำ)

```bash
docker compose up -d
```

- `-d` รันในโหมดหลังบรรทัด (detached)  
- จะสร้างและเริ่มต้นทั้ง **API** และ **WEB** พร้อมเชื่อมต่อกันตามที่กำหนดใน `compose.yaml`

### 3.2 รันแต่ละเซอร์วิสแยกกัน

#### API (FastAPI)

```bash
docker run -d \
  --name rental-api \
  -p 8000:8000 \
  rental-api:latest
```

#### Web (Next.js)

```bash
docker run -d \
  --name rental-web \
  -p 3000:3000 \
  rental-web:latest
```

> **หมายเหตุ**: ตรวจสอบว่าโพรตที่ใช้ (`8000`, `3000`) ตรงกับที่เปิดใน Dockerfile และ `compose.yaml`

---

## 4. การดูแลรักษา (Maintenance)

| งาน | คำสั่ง | คำอธิบาย |
|-----|--------|-----------|
| ดูล็อกของคอนเทนเนอร์ | `docker logs rental-api` | ดู output ของ API |
| ติดตามการเปลี่ยนแปลงไฟล์ | `docker exec -it rental-api sh` | เข้าสภาพแวดล้อมเพื่อตรวจสอบไฟล์ |
| อัปเดตภาพใหม่หลังแก้ไข Dockerfile | `docker compose up -d --build` | สร้างภาพใหม่โดยไม่ต้องลบคอนเทนเนอร์ |
| ลบคอนเทนเนอร์เก่า | `docker compose down` | หยุดและลบคอนเทนเนอร์ทั้งหมด |
| ทำความสะอาดภาพที่ไม่ใช้ | `docker image prune` | ลบภาพที่ไม่มี container ใช้งาน |

### 4.1 การอัปเดต dependencies

1. แก้ไข `requirements.txt` (หรือ `package.json` สำหรับ Frontend)  
2. สร้างภาพใหม่: `docker compose up -d --build`  
3. ตรวจสอบว่าไม่มี error ใหม่เกิดขึ้น

---

## 5. การ Deploy (Deploy ไปยังเซิร์ฟเวอร์/Cloud)

### 5.1 วิธี Deploy ด้วย Docker Compose บนเครื่องภายนอก

1. คัดลอกโฟลเดอร์โปรเจกต์ (`d:\project\615`) ไปยังเซิร์ฟเวอร์ (SCP, Git, หรือวิธีอื่น)  
2. บนเซิร์ฟเวอร์ ให้ติดตั้ง Docker และ Docker Compose  
3. รัน:

   ```bash
   cd /path/to/615
   docker compose up -d
   ```

### 5.2 Deploy ไปยัง **Azure Container Apps** (ถ้ามี)

> ต้องมีไฟล์ `azure-container-app.yml` หรือใช้ `azd` (Azure Developer CLI)  
> ตัวอย่างขั้นตอน (สรุปสั้น):

```bash
# ติดตั้ง Azure CLI และ Azure Developer CLI (azd)
az extension add --name azure-dev-cli

# เข้าสู่โฟลเดอร์โปรเจกต์
cd d:\project\615

# สร้างแอปพลิเคชันบน Azure
azd up
```

- `azd` จะสร้างทรัพยากร Azure ที่จำเป็น (Container Apps, Database, ฯลฯ)  
- ตามขั้นตอนในไฟล์ `.azure/plan.copilotmd` ที่สร้างโดยเครื่องมือทำแผนการ Deploy

### 5.3 ตัวอย่างการ Deploy ไปยัง **Docker Hub** (สำหรับการดึงภาพจากที่อื่น)

```bash
# ตั้งชื่อภาพที่ต้องการส่ง
docker tag rental-api:latest yourdockerhubuser/rental-api:latest

# ส่งภาพไป Docker Hub
docker push yourdockerhubuser/rental-api:latest
```

จากนั้นบนเครื่องอื่นสามารถดึงภาพได้:

```bash
docker pull yourdockerhubuser/rental-api:latest
```

---

## 6. การตั้งค่าใหม่ (First‑time Setup)

1. **ดึงโครงการ**  
   ```bash
   git clone <repo-url> d:\project\615
   cd d:\project\615
   ```

2. **สร้าง virtual environment (ถ้าต้องการทำงานบนเครื่อง host)**  
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r API/requirements.txt
   ```

3. **สร้างภาพ Docker**  
   ```bash
   docker compose build   # หรือ docker compose up -d --build
   ```

4. **รันแอปพลิเคชัน**  
   ```bash
   docker compose up -d
   ```

5. **ตรวจสอบ**  
   - เปิดเว็บเบราว์เซอร์ที่ `http://localhost:3000` (Frontend)  
   - เปิด `http://localhost:8000/docs` เพื่อดูเอกสาร API ของ FastAPI  

6. **เก็บไฟล์สรุป**  
   - สร้างไฟล์ `DOCKER_USAGE.md` (ไฟล์นี้) เพื่อเป็นแนวทางอ้างอิงต่อไป  

---

## 7. คำแนะนำเพิ่มเติม

- **ใช้ `.dockerignore`** เพื่อลดขนาด Context การ Build (เช่น `node_modules`, `.git`, `__pycache__`)  
- **ตรวจสอบความปลอดภัย** ด้วย `docker scan` หรือ `trivy` ก่อน Deploy  
- **บันทึกเวอร์ชัน** ของภาพด้วย Tag ที่มีเวอร์ชัน (`v1.0.0`) เพื่อให้สามารถ rollback ได้ง่าย  
- **ตรวจสอบพอร์ต** ที่ใช้ใน `compose.yaml` ว่าตรงกับไฟร์วอลล์/เซิร์ฟเวอร์หรือไม่  

---

### ตัวอย่าง `compose.yaml` (สำหรับอ้างอิง)

```yaml
version: "3.8"
services:
  api:
    build: ./API
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/rental
    depends_on:
      - db
  web:
    build: ./WEB
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: rental
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

> คัดลอกไฟล์นี้ไปยังโฟลเดอร์รูท (`d:\project\615`) แล้วรัน `docker compose up -d` เพื่อเริ่มต้นทั้งหมดในครั้งแรก

--- 

**จบ** 🎉  
หากมีคำถามเพิ่มเติมเกี่ยวกับการใช้งาน Docker หรือปัญหาที่พบระหว่างรัน สามารถแจ้งได้เลย!