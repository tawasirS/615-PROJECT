from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class UUIDPrimaryKeyMixin:
    uuid: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )


class AuditMixin:
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    details: Mapped[str | None] = mapped_column(String, nullable=True)


class Area(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "area"

    code: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    contracts: Mapped[list["Contract"]] = relationship(
        "Contract",
        back_populates="area",
    )
    meters: Mapped[list["Meter"]] = relationship(
        "Meter",
        back_populates="area",
    )


class Renter(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "renter"

    code: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    tel: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)

    contracts: Mapped[list["Contract"]] = relationship(
        "Contract",
        back_populates="renter",
    )


class Contract(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "contract"

    # ชื่อ column ใน DB ตาม ERD คือ area / renter / ref_contract / start / end
    area_uuid: Mapped[str] = mapped_column(
        "area",
        String(36),
        ForeignKey("area.uuid"),
        nullable=False,
        index=True,
    )
    renter_uuid: Mapped[str] = mapped_column(
        "renter",
        String(36),
        ForeignKey("renter.uuid"),
        nullable=False,
        index=True,
    )
    ref_contract_uuid: Mapped[str | None] = mapped_column(
        "ref_contract",
        String(36),
        ForeignKey("contract.uuid"),
        nullable=True,
        index=True,
    )
    start_date: Mapped[date | None] = mapped_column("start", Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column("end", Date, nullable=True)
    payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    area: Mapped["Area"] = relationship("Area", back_populates="contracts")
    renter: Mapped["Renter"] = relationship("Renter", back_populates="contracts")
    invoices: Mapped[list["Invoice"]] = relationship(
        "Invoice",
        back_populates="contract",
    )

    parent_contract: Mapped["Contract | None"] = relationship(
        "Contract",
        remote_side=lambda: [Contract.uuid],
        foreign_keys=lambda: [Contract.ref_contract_uuid],
        back_populates="child_contracts",
    )
    child_contracts: Mapped[list["Contract"]] = relationship(
        "Contract",
        foreign_keys=lambda: [Contract.ref_contract_uuid],
        back_populates="parent_contract",
    )


class Invoice(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "invoice"

    contract_uuid: Mapped[str] = mapped_column(
        "contract",
        String(36),
        ForeignKey("contract.uuid"),
        nullable=False,
        index=True,
    )
    invoice_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    contract: Mapped["Contract"] = relationship("Contract", back_populates="invoices")
    payments: Mapped[list["Payment"]] = relationship(
        "Payment",
        back_populates="invoice",
    )


class Meter(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "meter"

    meter_type: Mapped[str | None] = mapped_column("type", String, nullable=True)
    meter_value: Mapped[Decimal | None] = mapped_column(
        "value",
        Numeric(14, 4),
        nullable=True,
    )
    area_uuid: Mapped[str] = mapped_column(
        "area",
        String(36),
        ForeignKey("area.uuid"),
        nullable=False,
        index=True,
    )
    net_value: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 4),
        nullable=True,
    )

    area: Mapped["Area"] = relationship("Area", back_populates="meters")
    payments: Mapped[list["Payment"]] = relationship(
        "Payment",
        back_populates="meter",
    )


class Payment(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "payment"

    invoice_uuid: Mapped[str] = mapped_column(
        "invoice",
        String(36),
        ForeignKey("invoice.uuid"),
        nullable=False,
        index=True,
    )
    amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    payment_type: Mapped[str | None] = mapped_column("type", String, nullable=True)
    overdue_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2),
        nullable=True,
    )
    ref_payment_uuid: Mapped[str | None] = mapped_column(
        "ref_payment",
        String(36),
        ForeignKey("payment.uuid"),
        nullable=True,
        index=True,
    )
    meter_uuid: Mapped[str | None] = mapped_column(
        "meter",
        String(36),
        ForeignKey("meter.uuid"),
        nullable=True,
        index=True,
    )

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payments")
    meter: Mapped["Meter | None"] = relationship("Meter", back_populates="payments")

    parent_payment: Mapped["Payment | None"] = relationship(
        "Payment",
        remote_side=lambda: [Payment.uuid],
        foreign_keys=lambda: [Payment.ref_payment_uuid],
        back_populates="child_payments",
    )
    child_payments: Mapped[list["Payment"]] = relationship(
        "Payment",
        foreign_keys=lambda: [Payment.ref_payment_uuid],
        back_populates="parent_payment",
    )


class Document(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "document"

    ref_table: Mapped[str] = mapped_column(String, nullable=False, index=True)
    ref_uuid: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    path: Mapped[str] = mapped_column(String, nullable=False)


class User(UUIDPrimaryKeyMixin, AuditMixin, Base):
    __tablename__ = "user"

    code: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    # Database column ยังชื่อ password ตาม ERD แต่เก็บค่า hash เท่านั้น
    password_hash: Mapped[str] = mapped_column("password", String, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
