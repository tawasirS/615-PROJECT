# 615 Project Rental API — API Documentation

**Version:** 1.0.0  
**Framework:** FastAPI + PostgreSQL + SQLAlchemy + Alembic  
**Base URL (local example):** `http://127.0.0.1:56152`  
**Interactive Swagger:** `http://127.0.0.1:56152/docs`  
**OpenAPI JSON:** `http://127.0.0.1:56152/openapi.json`

> เอกสารนี้อ้างอิงจากโค้ด API ปัจจุบันในโปรเจค `615 Project Rental API`  
> ปัจจุบันยัง **ไม่มี Authentication / Authorization** ดังนั้นทุก endpoint เรียกได้โดยไม่ต้องส่ง token

---

## 1. ภาพรวม Module

| Module | Base Path | หน้าที่ |
|---|---|---|
| Health | `/` | ตรวจว่า API ทำงานอยู่ |
| Areas | `/areas` | จัดการพื้นที่เช่า |
| Renters | `/renters` | จัดการผู้เช่า |
| Contracts | `/contracts` | จัดการสัญญาเช่า |
| Invoices | `/invoices` | จัดการใบแจ้งหนี้ |
| Meters | `/meters` | จัดการมิเตอร์ |
| Payments | `/payments` | จัดการรายการชำระเงิน |
| Documents | `/documents` | จัดการ metadata ของไฟล์เอกสาร |
| Users | `/users` | จัดการผู้ใช้งานระบบ |

---

## 2. Response และ Convention กลาง

### 2.1 Content Type

Request body ทุก endpoint ที่รับข้อมูลใช้:

```http
Content-Type: application/json
```

### 2.2 UUID

Primary key ของทุกตารางเป็น string UUID เช่น:

```txt
b416afce-a69b-4875-99d3-0eb2e3c55ca6
```

### 2.3 Field กลางของทุก Resource

Response ของทุก resource มี field กลุ่มนี้:

| Field | Type | ความหมาย |
|---|---|---|
| `uuid` | string | Primary key |
| `status` | string \| null | สถานะของ record เช่น `ACTIVE`, `PENDING`, `INACTIVE` |
| `created_at` | datetime | วันที่สร้าง |
| `updated_at` | datetime | วันที่แก้ไขล่าสุด |
| `deleted_at` | datetime \| null | วันที่ soft delete; `null` หมายถึงยังใช้งานอยู่ |
| `details` | string \| null | รายละเอียดเพิ่มเติม |

ตัวอย่าง response:

```json
{
  "uuid": "b416afce-a69b-4875-99d3-0eb2e3c55ca6",
  "status": "ACTIVE",
  "created_at": "2026-06-21T10:20:30.000000Z",
  "updated_at": "2026-06-21T10:20:30.000000Z",
  "deleted_at": null,
  "details": "ตัวอย่างข้อมูล"
}
```

### 2.4 Date และ Decimal

| ข้อมูล | รูปแบบ JSON | ตัวอย่าง |
|---|---|---|
| Date | `YYYY-MM-DD` | `"2026-06-30"` |
| Datetime | ISO 8601 | `"2026-06-30T08:30:00Z"` |
| Amount / Meter value | number หรือ string ที่แปลงเป็น Decimal ได้ | `1500.50` |

### 2.5 Pagination สำหรับ List Endpoint

List endpoint ทุกตัวใช้ query parameter ชุดนี้:

| Parameter | Type | Default | รายละเอียด |
|---|---:|---:|---|
| `skip` | integer | `0` | จำนวน record ที่ข้าม |
| `limit` | integer | `100` | จำนวนสูงสุดที่ส่งกลับ; ใช้ได้ `1-500` |
| `include_deleted` | boolean | `false` | `true` เพื่อรวมข้อมูล soft deleted |

ตัวอย่าง:

```http
GET /areas?skip=0&limit=20
GET /renters?include_deleted=true
```

### 2.6 Soft Delete

`DELETE` ทุก resource เป็น **soft delete**:

- ไม่ลบ row ออกจาก PostgreSQL จริง
- ระบบจะ set ค่า `deleted_at`
- endpoint `GET` ปกติจะไม่แสดง row ที่ถูกลบ
- ส่ง `include_deleted=true` หากต้องการค้นหาข้อมูลที่ถูกลบ

ตัวอย่าง response หลัง delete:

```json
{
  "message": "Area deleted successfully"
}
```

### 2.7 HTTP Status Code ที่พบ

| Status | ความหมาย |
|---:|---|
| `200 OK` | อ่าน/แก้ไข/ลบสำเร็จ |
| `201 Created` | สร้างข้อมูลสำเร็จ |
| `400 Bad Request` | ส่ง PUT body ว่าง หรือ request ไม่ถูกต้อง |
| `404 Not Found` | ไม่พบ resource หรือ resource ถูก soft delete แล้ว |
| `409 Conflict` | ชนกับ unique constraint หรือ database constraint |
| `422 Unprocessable Entity` | Validation ไม่ผ่าน หรือ Foreign Key ที่อ้างอิงไม่มีอยู่ |

---

## 3. Health

### `GET /`

ตรวจว่า API ทำงานอยู่

**Response `200`**

```json
{
  "message": "API is running"
}
```

---

# 4. Areas

Base path: `/areas`

## 4.1 Create Area

### `POST /areas`

**Request Body**

| Field | Type | Required | Validation |
|---|---|---:|---|
| `code` | string | Yes | 1-100 characters |
| `name` | string | Yes | 1-255 characters |
| `status` | string \| null | No | Default: `ACTIVE` |
| `details` | string \| null | No | - |

```json
{
  "code": "A001",
  "name": "Building A",
  "status": "ACTIVE",
  "details": "พื้นที่อาคาร A"
}
```

**Response `201`**

```json
{
  "uuid": "AREA-UUID",
  "code": "A001",
  "name": "Building A",
  "status": "ACTIVE",
  "created_at": "2026-06-21T10:00:00Z",
  "updated_at": "2026-06-21T10:00:00Z",
  "deleted_at": null,
  "details": "พื้นที่อาคาร A"
}
```

## 4.2 List Areas

### `GET /areas`

Query parameter: `skip`, `limit`, `include_deleted`

## 4.3 Get Area by UUID

### `GET /areas/{area_uuid}`

## 4.4 Update Area

### `PUT /areas/{area_uuid}`

ส่งเฉพาะ field ที่ต้องการแก้ได้

```json
{
  "name": "Building A - Updated",
  "status": "INACTIVE"
}
```

## 4.5 Delete Area

### `DELETE /areas/{area_uuid}`

เป็น soft delete

---

# 5. Renters

Base path: `/renters`

## 5.1 Create Renter

### `POST /renters`

**Request Body**

| Field | Type | Required | Validation |
|---|---|---:|---|
| `code` | string | Yes | 1-100 characters |
| `name` | string | Yes | 1-255 characters |
| `tel` | string \| null | No | Maximum 50 characters |
| `email` | email \| null | No | ต้องเป็น email format |
| `status` | string \| null | No | Default: `ACTIVE` |
| `details` | string \| null | No | - |

```json
{
  "code": "R001",
  "name": "Alan Turing",
  "tel": "0812345678",
  "email": "alan@example.com",
  "status": "ACTIVE",
  "details": "ผู้เช่ารายเดือน"
}
```

## 5.2 List Renters

### `GET /renters`

Query parameter: `skip`, `limit`, `include_deleted`

## 5.3 Get Renter

### `GET /renters/{renter_uuid}`

## 5.4 Update Renter

### `PUT /renters/{renter_uuid}`

```json
{
  "tel": "0899999999",
  "email": "new-email@example.com"
}
```

## 5.5 Delete Renter

### `DELETE /renters/{renter_uuid}`

---

# 6. Contracts

Base path: `/contracts`

## 6.1 Create Contract

### `POST /contracts`

**Foreign Key Requirement**

| API Field | ต้องอ้างอิงไปที่ | หมายเหตุ |
|---|---|---|
| `area_uuid` | Area ที่ active | required |
| `renter_uuid` | Renter ที่ active | required |
| `ref_contract_uuid` | Contract ที่ active | optional; ห้ามอ้างถึง contract ตัวเอง |

**Request Body**

| Field | Type | Required | หมายเหตุ |
|---|---|---:|---|
| `area_uuid` | UUID string | Yes | ต้องมี Area ที่ active |
| `renter_uuid` | UUID string | Yes | ต้องมี Renter ที่ active |
| `ref_contract_uuid` | UUID string \| null | No | Contract เดิมที่ใช้ต่อสัญญา |
| `start_date` | date \| null | No | `YYYY-MM-DD` |
| `end_date` | date \| null | No | ต้องไม่ก่อน `start_date` |
| `payment_date` | date \| null | No | วันครบกำหนด/วันชำระ |
| `status` | string \| null | No | Default: `ACTIVE` |
| `details` | string \| null | No | - |

```json
{
  "area_uuid": "AREA-UUID",
  "renter_uuid": "RENTER-UUID",
  "start_date": "2026-07-01",
  "end_date": "2027-06-30",
  "payment_date": "2026-07-05",
  "status": "ACTIVE",
  "details": "สัญญาเช่ารายปี"
}
```

**Validation Error `422` ตัวอย่าง**

```json
{
  "detail": "start_date must be earlier than or equal to end_date"
}
```

หรือ:

```json
{
  "detail": "area_uuid does not reference an active Area"
}
```

## 6.2 List Contracts

### `GET /contracts`

**Query Parameter เพิ่มเติม**

| Parameter | Type | รายละเอียด |
|---|---|---|
| `area_uuid` | UUID string | กรอง Contract ตาม Area |
| `renter_uuid` | UUID string | กรอง Contract ตาม Renter |
| `skip` | integer | Pagination |
| `limit` | integer | Pagination |
| `include_deleted` | boolean | รวม soft deleted |

> หากส่ง `area_uuid` และ `renter_uuid` พร้อมกัน โค้ดปัจจุบันจะใช้ `area_uuid` เป็นเงื่อนไขก่อน

ตัวอย่าง:

```http
GET /contracts?area_uuid=AREA-UUID
GET /contracts?renter_uuid=RENTER-UUID
```

## 6.3 Get Contract

### `GET /contracts/{contract_uuid}`

## 6.4 Get Contract Detail (JOIN)

### `GET /contracts/{contract_uuid}/detail`

ดึง Contract พร้อม Area, Renter และ Invoice ที่เกี่ยวข้อง

**Response `200`**

```json
{
  "uuid": "CONTRACT-UUID",
  "area_uuid": "AREA-UUID",
  "renter_uuid": "RENTER-UUID",
  "ref_contract_uuid": null,
  "start_date": "2026-07-01",
  "end_date": "2027-06-30",
  "payment_date": "2026-07-05",
  "status": "ACTIVE",
  "created_at": "2026-06-21T10:00:00Z",
  "updated_at": "2026-06-21T10:00:00Z",
  "deleted_at": null,
  "details": "สัญญาเช่ารายปี",
  "area": {
    "uuid": "AREA-UUID",
    "code": "A001",
    "name": "Building A",
    "status": "ACTIVE",
    "created_at": "2026-06-21T10:00:00Z",
    "updated_at": "2026-06-21T10:00:00Z",
    "deleted_at": null,
    "details": null
  },
  "renter": {
    "uuid": "RENTER-UUID",
    "code": "R001",
    "name": "Alan Turing",
    "tel": "0812345678",
    "email": "alan@example.com",
    "status": "ACTIVE",
    "created_at": "2026-06-21T10:00:00Z",
    "updated_at": "2026-06-21T10:00:00Z",
    "deleted_at": null,
    "details": null
  },
  "invoices": []
}
```

## 6.5 Update Contract

### `PUT /contracts/{contract_uuid}`

ส่งเฉพาะ field ที่ต้องการแก้

```json
{
  "end_date": "2027-12-31",
  "status": "RENEWED"
}
```

หากแก้ `area_uuid`, `renter_uuid`, หรือ `ref_contract_uuid` ระบบจะตรวจว่า UUID ปลายทางมีอยู่และยัง active

## 6.6 Delete Contract

### `DELETE /contracts/{contract_uuid}`

---

# 7. Invoices

Base path: `/invoices`

## 7.1 Create Invoice

### `POST /invoices`

| Field | Type | Required | หมายเหตุ |
|---|---|---:|---|
| `contract_uuid` | UUID string | Yes | ต้องอ้างอิง Contract ที่ active |
| `invoice_date` | date \| null | No | วันที่ออกใบแจ้งหนี้ |
| `payment_date` | date \| null | No | วันครบกำหนดชำระ |
| `status` | string \| null | No | Default: `PENDING` |
| `details` | string \| null | No | - |

```json
{
  "contract_uuid": "CONTRACT-UUID",
  "invoice_date": "2026-07-01",
  "payment_date": "2026-07-05",
  "status": "PENDING",
  "details": "ค่าเช่าเดือนกรกฎาคม"
}
```

## 7.2 List Invoices

### `GET /invoices`

**Query Parameter เพิ่มเติม**

| Parameter | Type | รายละเอียด |
|---|---|---|
| `contract_uuid` | UUID string | กรองตาม Contract |
| `skip` | integer | Pagination |
| `limit` | integer | Pagination |
| `include_deleted` | boolean | รวม soft deleted |

## 7.3 Get Invoice

### `GET /invoices/{invoice_uuid}`

## 7.4 Update Invoice

### `PUT /invoices/{invoice_uuid}`

```json
{
  "payment_date": "2026-07-10",
  "status": "OVERDUE"
}
```

## 7.5 Delete Invoice

### `DELETE /invoices/{invoice_uuid}`

---

# 8. Meters

Base path: `/meters`

## 8.1 Create Meter

### `POST /meters`

| Field | Type | Required | Validation / หมายเหตุ |
|---|---|---:|---|
| `meter_type` | string \| null | No | เช่น `WATER`, `ELECTRIC` |
| `meter_value` | decimal \| null | No | ต้องไม่น้อยกว่า 0 |
| `area_uuid` | UUID string | Yes | ต้องอ้างอิง Area ที่ active |
| `net_value` | decimal \| null | No | ต้องไม่น้อยกว่า 0 |
| `status` | string \| null | No | Default: `ACTIVE` |
| `details` | string \| null | No | - |

```json
{
  "meter_type": "ELECTRIC",
  "meter_value": 1250.5000,
  "area_uuid": "AREA-UUID",
  "net_value": 1250.5000,
  "status": "ACTIVE",
  "details": "มิเตอร์ไฟฟ้าอาคาร A"
}
```

## 8.2 List Meters

### `GET /meters`

Query parameter เพิ่มเติม: `area_uuid`

```http
GET /meters?area_uuid=AREA-UUID
```

## 8.3 Get Meter

### `GET /meters/{meter_uuid}`

## 8.4 Update Meter

### `PUT /meters/{meter_uuid}`

```json
{
  "meter_value": 1275.2500,
  "net_value": 24.7500
}
```

## 8.5 Delete Meter

### `DELETE /meters/{meter_uuid}`

---

# 9. Payments

Base path: `/payments`

## 9.1 Create Payment

### `POST /payments`

| Field | Type | Required | Validation / หมายเหตุ |
|---|---|---:|---|
| `invoice_uuid` | UUID string | Yes | ต้องอ้างอิง Invoice ที่ active |
| `amount` | decimal \| null | No | ต้องไม่น้อยกว่า 0 |
| `payment_date` | date \| null | No | วันที่ชำระ |
| `payment_type` | string \| null | No | เช่น `CASH`, `TRANSFER`, `CARD` |
| `overdue_amount` | decimal \| null | No | ต้องไม่น้อยกว่า 0 |
| `ref_payment_uuid` | UUID string \| null | No | อ้าง Payment เดิม; ห้ามอ้างตัวเอง |
| `meter_uuid` | UUID string \| null | No | ต้องอ้าง Meter ที่ active |
| `status` | string \| null | No | Default: `PENDING` |
| `details` | string \| null | No | - |

```json
{
  "invoice_uuid": "INVOICE-UUID",
  "amount": 2500.00,
  "payment_date": "2026-07-04",
  "payment_type": "TRANSFER",
  "overdue_amount": 0,
  "meter_uuid": "METER-UUID",
  "status": "PAID",
  "details": "ชำระผ่านธนาคาร"
}
```

## 9.2 List Payments

### `GET /payments`

**Query Parameter เพิ่มเติม**

| Parameter | Type | รายละเอียด |
|---|---|---|
| `invoice_uuid` | UUID string | กรองตาม Invoice |
| `meter_uuid` | UUID string | กรองตาม Meter |
| `skip` | integer | Pagination |
| `limit` | integer | Pagination |
| `include_deleted` | boolean | รวม soft deleted |

> หากส่ง `invoice_uuid` และ `meter_uuid` พร้อมกัน โค้ดปัจจุบันจะใช้ `invoice_uuid` เป็นเงื่อนไขก่อน

## 9.3 Get Payment

### `GET /payments/{payment_uuid}`

## 9.4 Update Payment

### `PUT /payments/{payment_uuid}`

```json
{
  "amount": 2800.00,
  "payment_type": "CASH",
  "status": "PAID"
}
```

## 9.5 Delete Payment

### `DELETE /payments/{payment_uuid}`

---

# 10. Documents

Base path: `/documents`

## 10.1 แนวคิด Document

Document ใช้รูปแบบ generic reference:

| Field | ความหมาย |
|---|---|
| `ref_table` | ชื่อตารางที่ไฟล์นี้เกี่ยวข้อง เช่น `contract`, `invoice`, `payment` |
| `ref_uuid` | UUID ของ record ในตารางนั้น |
| `path` | path หรือ URL ของไฟล์ |

> โค้ดปัจจุบัน **ไม่ได้ตรวจ** ว่า `ref_table` หรือ `ref_uuid` มี record ปลายทางจริงหรือไม่ เพราะ Document อ้างอิงได้หลาย table

## 10.2 Create Document

### `POST /documents`

| Field | Type | Required |
|---|---|---:|
| `ref_table` | string | Yes |
| `ref_uuid` | UUID string | Yes |
| `name` | string | Yes |
| `path` | string | Yes |
| `status` | string \| null | No |
| `details` | string \| null | No |

```json
{
  "ref_table": "contract",
  "ref_uuid": "CONTRACT-UUID",
  "name": "rental-contract.pdf",
  "path": "/uploads/contracts/rental-contract.pdf",
  "status": "ACTIVE",
  "details": "ไฟล์สัญญาฉบับลงนาม"
}
```

## 10.3 List Documents

### `GET /documents`

**Query Parameter เพิ่มเติม**

| Parameter | Type | รายละเอียด |
|---|---|---|
| `ref_table` | string | กรองตามชื่อตารางที่อ้างอิง |
| `ref_uuid` | UUID string | กรองตาม UUID ที่อ้างอิง |
| `skip` | integer | Pagination |
| `limit` | integer | Pagination |
| `include_deleted` | boolean | รวม soft deleted |

ตัวอย่าง:

```http
GET /documents?ref_table=contract&ref_uuid=CONTRACT-UUID
```

## 10.4 Get Document

### `GET /documents/{document_uuid}`

## 10.5 Update Document

### `PUT /documents/{document_uuid}`

```json
{
  "path": "/uploads/contracts/rental-contract-v2.pdf",
  "details": "อัปโหลดเอกสารฉบับแก้ไข"
}
```

## 10.6 Delete Document

### `DELETE /documents/{document_uuid}`

---

# 11. Users

Base path: `/users`

## 11.1 Security Note

- API รับ `password` เป็น plain text เฉพาะใน request
- ระบบ hash password ก่อนบันทึกลง database column `user.password`
- response ของ User จะ **ไม่มี** `password` และ `password_hash`

## 11.2 Create User

### `POST /users`

| Field | Type | Required | Validation |
|---|---|---:|---|
| `code` | string | Yes | 1-100 characters |
| `name` | string | Yes | 1-255 characters |
| `password` | string | Yes | 8-256 characters |
| `status` | string \| null | No | Default: `ACTIVE` |
| `details` | string \| null | No | - |

```json
{
  "code": "ADMIN001",
  "name": "Administrator",
  "password": "MySecurePassword123",
  "status": "ACTIVE",
  "details": "ผู้ดูแลระบบ"
}
```

**Response `201`**

```json
{
  "uuid": "USER-UUID",
  "code": "ADMIN001",
  "name": "Administrator",
  "last_login": null,
  "status": "ACTIVE",
  "created_at": "2026-06-21T10:00:00Z",
  "updated_at": "2026-06-21T10:00:00Z",
  "deleted_at": null,
  "details": "ผู้ดูแลระบบ"
}
```

## 11.3 List Users

### `GET /users`

Query parameter: `skip`, `limit`, `include_deleted`

## 11.4 Get User

### `GET /users/{user_uuid}`

## 11.5 Update User

### `PUT /users/{user_uuid}`

ส่งเฉพาะ field ที่ต้องการแก้ได้

```json
{
  "name": "System Administrator",
  "password": "NewSecurePassword123"
}
```

หากส่ง `password` ระบบจะ hash ใหม่ก่อนบันทึก

## 11.6 Delete User

### `DELETE /users/{user_uuid}`

---

# 12. Suggested Data Creation Order

เนื่องจากมี Foreign Key ควรสร้างข้อมูลตามลำดับนี้:

```txt
1. Area
2. Renter
3. Contract
4. Invoice
5. Meter
6. Payment
7. Document
8. User
```

ตัวอย่าง flow:

```txt
POST /areas
  -> ได้ area_uuid

POST /renters
  -> ได้ renter_uuid

POST /contracts
  -> ใช้ area_uuid + renter_uuid
  -> ได้ contract_uuid

POST /invoices
  -> ใช้ contract_uuid
  -> ได้ invoice_uuid

POST /meters
  -> ใช้ area_uuid
  -> ได้ meter_uuid

POST /payments
  -> ใช้ invoice_uuid และ meter_uuid (ถ้ามี)
```

---

# 13. Database Column Mapping

บาง field ฝั่ง API ใช้ชื่อ `*_uuid` เพื่อให้ชัดว่าเป็น Foreign Key แต่ column จริงใน PostgreSQL ยังคงใช้ชื่อตาม ERD เดิม

| API Field | Table | Database Column |
|---|---|---|
| `area_uuid` | `contract` | `area` |
| `renter_uuid` | `contract` | `renter` |
| `ref_contract_uuid` | `contract` | `ref_contract` |
| `start_date` | `contract` | `start` |
| `end_date` | `contract` | `end` |
| `contract_uuid` | `invoice` | `contract` |
| `meter_type` | `meter` | `type` |
| `meter_value` | `meter` | `value` |
| `area_uuid` | `meter` | `area` |
| `invoice_uuid` | `payment` | `invoice` |
| `payment_type` | `payment` | `type` |
| `ref_payment_uuid` | `payment` | `ref_payment` |
| `meter_uuid` | `payment` | `meter` |
| `password` | `user` | `password` (เก็บ hash) |

---

# 14. cURL Examples

## Create Area

```bash
curl -X POST "http://127.0.0.1:56152/areas" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "A001",
    "name": "Building A",
    "status": "ACTIVE"
  }'
```

## List Areas

```bash
curl "http://127.0.0.1:56152/areas?skip=0&limit=20"
```

## Create Contract

```bash
curl -X POST "http://127.0.0.1:56152/contracts" \
  -H "Content-Type: application/json" \
  -d '{
    "area_uuid": "AREA-UUID",
    "renter_uuid": "RENTER-UUID",
    "start_date": "2026-07-01",
    "end_date": "2027-06-30",
    "status": "ACTIVE"
  }'
```

## Get Contract Detail

```bash
curl "http://127.0.0.1:56152/contracts/CONTRACT-UUID/detail"
```

---

# 15. Notes for Future Development

- เพิ่ม JWT authentication ก่อนเปิดใช้งานจริง
- กำหนด role/permission เช่น `ADMIN`, `STAFF`, `ACCOUNTING`
- พิจารณาเพิ่ม `unique=True` ใน field ที่ควรไม่ซ้ำ เช่น `area.code`, `renter.code`, `user.code`
- เพิ่ม endpoint สำหรับ restore soft-deleted record หาก business ต้องการ
- เพิ่ม validation สำหรับ `document.ref_table` เป็น allow-list
- เพิ่ม invoice line item / rate table หากต้องคำนวณค่าเช่า ค่าน้ำ และค่าไฟ
- เพิ่ม audit log เพื่อบันทึกว่าใครแก้ไขข้อมูลเมื่อไร
