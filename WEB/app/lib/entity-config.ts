// Entity Configuration — ใช้โดยหน้า data/[type] เพื่อรองรับ CRUD โดยอัตโนมัติ
import {
  areasApi,
  rentersApi,
  contractsApi,
  invoicesApi,
  metersApi,
  paymentsApi,
  documentsApi,
  usersApi,
  AreaResponse,
  RenterResponse,
  ContractResponse,
  InvoiceResponse,
  MeterResponse,
  PaymentResponse,
  DocumentResponse,
  UserResponse,
} from "../api-client";

export type EntityType =
  | "area"
  | "tenant"
  | "contract"
  | "invoice"
  | "meter"
  | "payment"
  | "document"
  | "user";

export type EntityConfig = {
  label: string; // ชื่อภาษาไทย
  labelPlural: string;
  resource: string; // API path
  columns: { key: string; label: string; render?: (val: unknown, row: Record<string, unknown>) => string }[];
  formFields: FormField[];
  api: EntityApi;
};

export type FormField = {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EntityApi = { [key: string]: (...args: any[]) => Promise<any> };

// สถานะทั่วไปที่ใช้หลาย entity
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "PENDING", label: "PENDING" },
];

// formatter วัน
function fmtDate(v: unknown): string {
  if (!v) return "-";
  const d = new Date(String(v));
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function fmtDateTime(v: unknown): string {
  if (!v) return "-";
  const d = new Date(String(v));
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDecimal(v: unknown): string {
  if (v == null) return "-";
  return Number(v).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function fmtMoney(v: unknown): string {
  if (v == null) return "-";
  return Number(v).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  area: {
    label: "พื้นที่",
    labelPlural: "ข้อมูลพื้นที่",
    resource: "areas",
    columns: [
      { key: "code", label: "รหัสพื้นที่" },
      { key: "name", label: "ชื่อ" },
      { key: "status", label: "สถานะ" },
      { key: "details", label: "รายละเอียด" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "code", label: "รหัสพื้นที่", type: "text", required: true, placeholder: "เช่น A001" },
      { name: "name", label: "ชื่อพื้นที่", type: "text", required: true, placeholder: "เช่น อาคาร A" },
      { name: "status", label: "สถานะ", type: "select", options: STATUS_OPTIONS },
      { name: "details", label: "รายละเอียด", type: "textarea", placeholder: "รายละเอียดเพิ่มเติม" },
    ],
    api: areasApi,
  },

  tenant: {
    label: "ผู้เช่า",
    labelPlural: "ข้อมูลผู้เช่า",
    resource: "renters",
    columns: [
      { key: "code", label: "รหัสผู้เช่า" },
      { key: "name", label: "ชื่อ-นามสกุล" },
      { key: "tel", label: "เบอร์โทร" },
      { key: "email", label: "อีเมล" },
      { key: "status", label: "สถานะ" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "code", label: "รหัสผู้เช่า", type: "text", required: true, placeholder: "เช่น R001" },
      { name: "name", label: "ชื่อ-นามสกุล", type: "text", required: true, placeholder: "ชื่อผู้เช่า" },
      { name: "tel", label: "เบอร์โทร", type: "text", placeholder: "เช่น 0812345678" },
      { name: "email", label: "อีเมล", type: "email", placeholder: "example@mail.com" },
      { name: "status", label: "สถานะ", type: "select", options: STATUS_OPTIONS },
      { name: "details", label: "รายละเอียด", type: "textarea" },
    ],
    api: rentersApi,
  },

  contract: {
    label: "สัญญาเช่า",
    labelPlural: "ข้อมูลสัญญาเช่า",
    resource: "contracts",
    columns: [
      { key: "area_uuid", label: "รหัสพื้นที่" },
      { key: "renter_uuid", label: "รหัสผู้เช่า" },
      { key: "start_date", label: "วันที่เริ่ม", render: fmtDate },
      { key: "end_date", label: "วันที่สิ้นสุด", render: fmtDate },
      { key: "payment_date", label: "วันที่ชำระ", render: fmtDate },
      { key: "status", label: "สถานะ" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "area_uuid", label: "รหัสพื้นที่ (UUID)", type: "text", required: true, placeholder: "UUID ของพื้นที่" },
      { name: "renter_uuid", label: "รหัสผู้เช่า (UUID)", type: "text", required: true, placeholder: "UUID ของผู้เช่า" },
      { name: "ref_contract_uuid", label: "สัญญาอ้างอิง (UUID)", type: "text", placeholder: "UUID สัญญาเดิม (ถ้ามี)" },
      { name: "start_date", label: "วันที่เริ่มสัญญา", type: "date" },
      { name: "end_date", label: "วันที่สิ้นสุดสัญญา", type: "date" },
      { name: "payment_date", label: "วันที่ครบกำหนดชำระ", type: "date" },
      { name: "status", label: "สถานะ", type: "select", options: STATUS_OPTIONS },
      { name: "details", label: "รายละเอียด", type: "textarea" },
    ],
    api: contractsApi,
  },

  invoice: {
    label: "ใบแจ้งหนี้",
    labelPlural: "ข้อมูลใบแจ้งหนี้",
    resource: "invoices",
    columns: [
      { key: "contract_uuid", label: "รหัสสัญญา" },
      { key: "invoice_date", label: "วันที่ออกใบแจ้งหนี้", render: fmtDate },
      { key: "payment_date", label: "วันครบกำหนด", render: fmtDate },
      { key: "status", label: "สถานะ" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "contract_uuid", label: "รหัสสัญญา (UUID)", type: "text", required: true, placeholder: "UUID ของสัญญา" },
      { name: "invoice_date", label: "วันที่ออกใบแจ้งหนี้", type: "date" },
      { name: "payment_date", label: "วันครบกำหนดชำระ", type: "date" },
      { name: "status", label: "สถานะ", type: "select", options: [...STATUS_OPTIONS, { value: "OVERDUE", label: "OVERDUE" }, { value: "PAID", label: "PAID" }] },
      { name: "details", label: "รายละเอียด", type: "textarea" },
    ],
    api: invoicesApi,
  },

  meter: {
    label: "มิเตอร์",
    labelPlural: "ข้อมูลมิเตอร์",
    resource: "meters",
    columns: [
      { key: "meter_type", label: "ประเภท" },
      { key: "meter_value", label: "ค่ามิเตอร์", render: fmtDecimal },
      { key: "area_uuid", label: "รหัสพื้นที่" },
      { key: "net_value", label: "ค่าสุทธิ", render: fmtDecimal },
      { key: "status", label: "สถานะ" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "meter_type", label: "ประเภทมิเตอร์", type: "select", options: [{ value: "ELECTRIC", label: "ELECTRIC (ไฟฟ้า)" }, { value: "WATER", label: "WATER (น้ำ)" }], placeholder: "ประเภทมิเตอร์" },
      { name: "meter_value", label: "ค่ามิเตอร์", type: "number", placeholder: "เช่น 1250.50" },
      { name: "area_uuid", label: "รหัสพื้นที่ (UUID)", type: "text", required: true, placeholder: "UUID ของพื้นที่" },
      { name: "net_value", label: "ค่าสุทธิ", type: "number", placeholder: "เช่น 1250.50" },
      { name: "status", label: "สถานะ", type: "select", options: STATUS_OPTIONS },
      { name: "details", label: "รายละเอียด", type: "textarea" },
    ],
    api: metersApi,
  },

  payment: {
    label: "การชำระเงิน",
    labelPlural: "ข้อมูลการชำระเงิน",
    resource: "payments",
    columns: [
      { key: "invoice_uuid", label: "รหัสใบแจ้งหนี้" },
      { key: "amount", label: "จำนวนเงิน", render: fmtMoney },
      { key: "payment_date", label: "วันที่ชำระ", render: fmtDate },
      { key: "payment_type", label: "ประเภทการชำระ" },
      { key: "status", label: "สถานะ" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "invoice_uuid", label: "รหัสใบแจ้งหนี้ (UUID)", type: "text", required: true, placeholder: "UUID ของใบแจ้งหนี้" },
      { name: "amount", label: "จำนวนเงิน", type: "number", placeholder: "เช่น 2500.00" },
      { name: "payment_date", label: "วันที่ชำระ", type: "date" },
      { name: "payment_type", label: "ประเภท", type: "select", options: [{ value: "CASH", label: "CASH (เงินสด)" }, { value: "TRANSFER", label: "TRANSFER (โอน)" }, { value: "CARD", label: "CARD (บัตร)" }] },
      { name: "overdue_amount", label: "ค่าปรับ", type: "number", placeholder: "ค่าปรับ (ถ้ามี)" },
      { name: "meter_uuid", label: "รหัสมิเตอร์ (UUID)", type: "text", placeholder: "UUID ของมิเตอร์ (ถ้ามี)" },
      { name: "status", label: "สถานะ", type: "select", options: [...STATUS_OPTIONS, { value: "PAID", label: "PAID" }] },
      { name: "details", label: "รายละเอียด", type: "textarea" },
    ],
    api: paymentsApi,
  },

  document: {
    label: "เอกสาร",
    labelPlural: "ข้อมูลเอกสาร",
    resource: "documents",
    columns: [
      { key: "name", label: "ชื่อเอกสาร" },
      { key: "ref_table", label: "ตารางอ้างอิง" },
      { key: "ref_uuid", label: "รหัสอ้างอิง" },
      { key: "path", label: "ที่อยู่ไฟล์" },
      { key: "status", label: "สถานะ" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "ref_table", label: "ตารางอ้างอิง", type: "text", required: true, placeholder: "เช่น contract, invoice" },
      { name: "ref_uuid", label: "รหัสอ้างอิง (UUID)", type: "text", required: true, placeholder: "UUID ของ record" },
      { name: "name", label: "ชื่อเอกสาร", type: "text", required: true, placeholder: "ชื่อไฟล์" },
      { name: "path", label: "ที่อยู่ไฟล์", type: "text", required: true, placeholder: "/uploads/..." },
      { name: "status", label: "สถานะ", type: "select", options: STATUS_OPTIONS },
      { name: "details", label: "รายละเอียด", type: "textarea" },
    ],
    api: documentsApi,
  },

  user: {
    label: "ผู้ใช้งาน",
    labelPlural: "ข้อมูลผู้ใช้งาน",
    resource: "users",
    columns: [
      { key: "code", label: "รหัสผู้ใช้" },
      { key: "name", label: "ชื่อ" },
      { key: "last_login", label: "เข้าสู่ระบบล่าสุด", render: fmtDateTime },
      { key: "status", label: "สถานะ" },
      { key: "created_at", label: "สร้างเมื่อ", render: fmtDateTime },
    ],
    formFields: [
      { name: "code", label: "รหัสผู้ใช้", type: "text", required: true, placeholder: "เช่น ADMIN001" },
      { name: "name", label: "ชื่อ-นามสกุล", type: "text", required: true, placeholder: "ชื่อผู้ใช้งาน" },
      { name: "password", label: "รหัสผ่าน", type: "text", required: true, placeholder: "อย่างน้อย 8 ตัวอักษร" },
      { name: "status", label: "สถานะ", type: "select", options: STATUS_OPTIONS },
      { name: "details", label: "รายละเอียด", type: "textarea" },
    ],
    api: usersApi,
  },
};