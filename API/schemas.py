from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# -----------------------------------------------------------------
# Common response fields: ทุก table ใน ERD มี field กลุ่มนี้
# -----------------------------------------------------------------
class ORMResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AuditResponse(ORMResponse):
    uuid: str
    status: str | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    details: str | None


# -----------------------------------------------------------------
# Area
# -----------------------------------------------------------------
class AreaCreate(BaseModel):
    code: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    status: str | None = "ACTIVE"
    details: str | None = None


class AreaUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=100)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    status: str | None = None
    details: str | None = None


class AreaResponse(AuditResponse):
    code: str
    name: str


# -----------------------------------------------------------------
# Renter
# -----------------------------------------------------------------
class RenterCreate(BaseModel):
    code: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    tel: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    status: str | None = "ACTIVE"
    details: str | None = None


class RenterUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=100)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    tel: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    status: str | None = None
    details: str | None = None


class RenterResponse(AuditResponse):
    code: str
    name: str
    tel: str | None
    email: EmailStr | None


# -----------------------------------------------------------------
# Contract
# API ใช้ *_uuid เพื่อบอกให้ชัดว่าเป็นค่า Foreign Key
# แต่ Database column จริงยังชื่อ area, renter, ref_contract, start, end
# -----------------------------------------------------------------
class ContractCreate(BaseModel):
    area_uuid: str = Field(min_length=36, max_length=36)
    renter_uuid: str = Field(min_length=36, max_length=36)
    ref_contract_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    start_date: date | None = None
    end_date: date | None = None
    payment_date: date | None = None
    status: str | None = "ACTIVE"
    details: str | None = None


class ContractUpdate(BaseModel):
    area_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    renter_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    ref_contract_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    start_date: date | None = None
    end_date: date | None = None
    payment_date: date | None = None
    status: str | None = None
    details: str | None = None


class ContractResponse(AuditResponse):
    area_uuid: str
    renter_uuid: str
    ref_contract_uuid: str | None
    start_date: date | None
    end_date: date | None
    payment_date: date | None


# -----------------------------------------------------------------
# Invoice
# -----------------------------------------------------------------
class InvoiceCreate(BaseModel):
    contract_uuid: str = Field(min_length=36, max_length=36)
    invoice_date: date | None = None
    payment_date: date | None = None
    status: str | None = "PENDING"
    details: str | None = None


class InvoiceUpdate(BaseModel):
    contract_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    invoice_date: date | None = None
    payment_date: date | None = None
    status: str | None = None
    details: str | None = None


class InvoiceResponse(AuditResponse):
    contract_uuid: str
    invoice_date: date | None
    payment_date: date | None


# -----------------------------------------------------------------
# Meter
# -----------------------------------------------------------------
class MeterCreate(BaseModel):
    meter_type: str | None = Field(default=None, max_length=100)
    meter_value: Decimal | None = Field(default=None, ge=0)
    area_uuid: str = Field(min_length=36, max_length=36)
    net_value: Decimal | None = Field(default=None, ge=0)
    status: str | None = "ACTIVE"
    details: str | None = None


class MeterUpdate(BaseModel):
    meter_type: str | None = Field(default=None, max_length=100)
    meter_value: Decimal | None = Field(default=None, ge=0)
    area_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    net_value: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    details: str | None = None


class MeterResponse(AuditResponse):
    meter_type: str | None
    meter_value: Decimal | None
    area_uuid: str
    net_value: Decimal | None


# -----------------------------------------------------------------
# Payment
# -----------------------------------------------------------------
class PaymentCreate(BaseModel):
    invoice_uuid: str = Field(min_length=36, max_length=36)
    amount: Decimal | None = Field(default=None, ge=0)
    payment_date: date | None = None
    payment_type: str | None = Field(default=None, max_length=100)
    overdue_amount: Decimal | None = Field(default=None, ge=0)
    ref_payment_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    meter_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    status: str | None = "PENDING"
    details: str | None = None


class PaymentUpdate(BaseModel):
    invoice_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    amount: Decimal | None = Field(default=None, ge=0)
    payment_date: date | None = None
    payment_type: str | None = Field(default=None, max_length=100)
    overdue_amount: Decimal | None = Field(default=None, ge=0)
    ref_payment_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    meter_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    status: str | None = None
    details: str | None = None


class PaymentResponse(AuditResponse):
    invoice_uuid: str
    amount: Decimal | None
    payment_date: date | None
    payment_type: str | None
    overdue_amount: Decimal | None
    ref_payment_uuid: str | None
    meter_uuid: str | None


# -----------------------------------------------------------------
# Document
# ref_table + ref_uuid เป็น polymorphic reference จึงไม่มี FK เดียว
# -----------------------------------------------------------------
class DocumentCreate(BaseModel):
    ref_table: str = Field(min_length=1, max_length=100)
    ref_uuid: str = Field(min_length=36, max_length=36)
    name: str = Field(min_length=1, max_length=255)
    path: str = Field(min_length=1, max_length=1000)
    status: str | None = "ACTIVE"
    details: str | None = None


class DocumentUpdate(BaseModel):
    ref_table: str | None = Field(default=None, min_length=1, max_length=100)
    ref_uuid: str | None = Field(default=None, min_length=36, max_length=36)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    path: str | None = Field(default=None, min_length=1, max_length=1000)
    status: str | None = None
    details: str | None = None


class DocumentResponse(AuditResponse):
    ref_table: str
    ref_uuid: str
    name: str
    path: str


# -----------------------------------------------------------------
# User
# Password รับเข้ามาเป็น plain password แค่ชั่วคราว แล้ว hash ก่อนบันทึก
# UserResponse จะไม่มี password/password_hash เสมอ
# -----------------------------------------------------------------
class UserCreate(BaseModel):
    code: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=256)
    status: str | None = "ACTIVE"
    details: str | None = None


class UserUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=100)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=256)
    status: str | None = None
    details: str | None = None


class UserResponse(AuditResponse):
    code: str
    name: str
    last_login: datetime | None


# -----------------------------------------------------------------
# Join / detail response สำหรับ GET /contracts/{uuid}/detail
# -----------------------------------------------------------------
class ContractDetailResponse(ContractResponse):
    area: AreaResponse
    renter: RenterResponse
    invoices: list[InvoiceResponse]
