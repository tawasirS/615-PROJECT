# Rental API starter

ชุดนี้อิงตาม ERD ที่มี table:

- area
- renter
- contract
- invoice
- payment
- meter
- document
- user

## วิธีวางไฟล์

วางเนื้อหาในโฟลเดอร์เดียวกับ `alembic.ini`:

```text
API/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── security.py
├── crud/
├── routers/
├── alembic/
└── alembic.ini
```

## ติดตั้ง package

```powershell
pip install -r requirements.txt
```

## ตั้งค่า Alembic

ใน `alembic.ini`:

```ini
sqlalchemy.url = postgresql+asyncpg://postgres:P%%40ssw0rd@127.0.0.1:5432/615-Project
```

ใน `alembic/env.py` ให้มี:

```python
from database import Base
import models

target_metadata = Base.metadata
```

## Migration

```powershell
alembic revision --autogenerate -m "create rental system tables"
alembic upgrade head
```

## Run API

```powershell
uvicorn main:app --reload
```

เปิด `http://127.0.0.1:8000/docs`

## หมายเหตุ

- DELETE ทุก table เป็น **soft delete**: set ค่า `deleted_at` ไม่ได้ลบ row จริง
- API `GET` จะไม่คืน record ที่ `deleted_at` มีค่า เว้นแต่ส่ง `?include_deleted=true`
- API ใช้ชื่อ `area_uuid`, `renter_uuid`, `contract_uuid` เพื่อให้ชัดว่าเป็น Foreign Key แต่ column ใน database ยังใช้ชื่อ `area`, `renter`, `contract` ตาม ERD
- field `user.password` เก็บ password hash เท่านั้น และไม่มี API ไหนส่ง password/hash กลับ
- `document.ref_table + document.ref_uuid` เป็น generic reference จึงไม่ใช่ Foreign Key ปกติ


# เพิ่ม Table ใหม่ใน FastAPI + SQLAlchemy + Alembic

ตัวอย่าง: เพิ่มตาราง `room` โดย `room.area` อ้างอิง `area.uuid`

## ไฟล์ที่ต้องทำ

1. `models.py`  
   เพิ่ม class `Room`, column, `ForeignKey`, และ `relationship()` ถ้าต้อง JOIN

2. `schemas.py`  
   เพิ่ม:
   - `RoomCreate` สำหรับ POST
   - `RoomUpdate` สำหรับ PUT
   - `RoomResponse` สำหรับ response

3. `routers/rooms.py`  
   สร้าง CRUD:
   - `POST /rooms`
   - `GET /rooms`
   - `GET /rooms/{uuid}`
   - `PUT /rooms/{uuid}`
   - `DELETE /rooms/{uuid}`

4. `main.py`  
   เพิ่ม router:
   ```python
   from routers import rooms

   app.include_router(rooms.router)
   ```

## สร้าง Table จริงใน PostgreSQL

หลังแก้ `models.py` แล้ว:

```powershell
alembic revision --autogenerate -m "add room table"
```

เปิดไฟล์ใน `alembic/versions/` ตรวจว่า table, column และ Foreign Key ถูกต้อง

จากนั้น apply migration:

```powershell
alembic upgrade head
```

> Table/column จะถูกสร้างจริงตอน `alembic upgrade head` ไม่ใช่ตอนเขียน `models.py`

## หน้าที่แต่ละส่วน

```txt
models.py       = table / column / FK / relationship
schemas.py      = JSON request / response
routers/*.py    = API endpoint + validation
main.py         = รวม router
Alembic         = สร้างหรือแก้ Database จริง
```

## ทุกครั้งก่อนเพิ่ม Table

- ชื่อตารางและ column คืออะไร
- data type อะไร
- nullable ได้ไหม
- unique ไหม
- foreign key ไป table ไหน
- ต้อง soft delete ไหม
- ต้องมี validation อะไรเพิ่มไหม
