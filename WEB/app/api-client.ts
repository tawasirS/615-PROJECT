// API Client สำหรับเชื่อมต่อ FastAPI Backend (พอร์ต 8000)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers } as Record<string, string>,
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail || `HTTP ${res.status}`, res.status);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ---- Generic CRUD ----
export function listRows<T>(
  resource: string,
  params?: Record<string, string | number | boolean>
): Promise<T[]> {
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  return request<T[]>(`/${resource}${qs}`);
}

export function getRow<T>(resource: string, uuid: string): Promise<T> {
  return request<T>(`/${resource}/${uuid}`);
}

export function createRow<T>(resource: string, data: Record<string, unknown>): Promise<T> {
  return request<T>(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRow<T>(
  resource: string,
  uuid: string,
  data: Record<string, unknown>
): Promise<T> {
  return request<T>(`/${resource}/${uuid}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRow<T = { message: string }>(
  resource: string,
  uuid: string
): Promise<T> {
  return request<T>(`/${resource}/${uuid}`, { method: "DELETE" });
}

// ---- Health Check ----
export function healthCheck(): Promise<{ message: string }> {
  return request("/");
}

// ---- Entity-specific helpers for easy access ----

// Areas
export type AreaResponse = {
  uuid: string;
  code: string;
  name: string;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const areasApi = {
  list: (params?: { skip?: number; limit?: number; include_deleted?: boolean }) =>
    listRows<AreaResponse>("areas", params),
  get: (uuid: string) => getRow<AreaResponse>("areas", uuid),
  create: (data: { code: string; name: string; status?: string; details?: string }) =>
    createRow<AreaResponse>("areas", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<AreaResponse>("areas", uuid, data),
  delete: (uuid: string) => deleteRow("areas", uuid),
};

// Renters
export type RenterResponse = {
  uuid: string;
  code: string;
  name: string;
  tel: string | null;
  email: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const rentersApi = {
  list: (params?: { skip?: number; limit?: number; include_deleted?: boolean }) =>
    listRows<RenterResponse>("renters", params),
  get: (uuid: string) => getRow<RenterResponse>("renters", uuid),
  create: (data: {
    code: string;
    name: string;
    tel?: string;
    email?: string;
    status?: string;
    details?: string;
  }) => createRow<RenterResponse>("renters", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<RenterResponse>("renters", uuid, data),
  delete: (uuid: string) => deleteRow("renters", uuid),
};

// Contracts
export type ContractResponse = {
  uuid: string;
  area_uuid: string;
  renter_uuid: string;
  ref_contract_uuid: string | null;
  start_date: string | null;
  end_date: string | null;
  payment_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const contractsApi = {
  list: (params?: {
    area_uuid?: string;
    renter_uuid?: string;
    skip?: number;
    limit?: number;
    include_deleted?: boolean;
  }) => listRows<ContractResponse>("contracts", params),
  get: (uuid: string) => getRow<ContractResponse>("contracts", uuid),
  getDetail: (uuid: string) =>
    request<ContractDetailResponse>(`/contracts/${uuid}/detail`),
  create: (data: {
    area_uuid: string;
    renter_uuid: string;
    ref_contract_uuid?: string;
    start_date?: string;
    end_date?: string;
    payment_date?: string;
    status?: string;
    details?: string;
  }) => createRow<ContractResponse>("contracts", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<ContractResponse>("contracts", uuid, data),
  delete: (uuid: string) => deleteRow("contracts", uuid),
};

// Invoices
export type InvoiceResponse = {
  uuid: string;
  contract_uuid: string;
  invoice_date: string | null;
  payment_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const invoicesApi = {
  list: (params?: {
    contract_uuid?: string;
    skip?: number;
    limit?: number;
    include_deleted?: boolean;
  }) => listRows<InvoiceResponse>("invoices", params),
  get: (uuid: string) => getRow<InvoiceResponse>("invoices", uuid),
  create: (data: {
    contract_uuid: string;
    invoice_date?: string;
    payment_date?: string;
    status?: string;
    details?: string;
  }) => createRow<InvoiceResponse>("invoices", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<InvoiceResponse>("invoices", uuid, data),
  delete: (uuid: string) => deleteRow("invoices", uuid),
};

// Meters
export type MeterResponse = {
  uuid: string;
  meter_type: string | null;
  meter_value: number | null;
  area_uuid: string;
  net_value: number | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const metersApi = {
  list: (params?: {
    area_uuid?: string;
    skip?: number;
    limit?: number;
    include_deleted?: boolean;
  }) => listRows<MeterResponse>("meters", params),
  get: (uuid: string) => getRow<MeterResponse>("meters", uuid),
  create: (data: {
    meter_type?: string;
    meter_value?: number;
    area_uuid: string;
    net_value?: number;
    status?: string;
    details?: string;
  }) => createRow<MeterResponse>("meters", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<MeterResponse>("meters", uuid, data),
  delete: (uuid: string) => deleteRow("meters", uuid),
};

// Payments
export type PaymentResponse = {
  uuid: string;
  invoice_uuid: string;
  amount: number | null;
  payment_date: string | null;
  payment_type: string | null;
  overdue_amount: number | null;
  ref_payment_uuid: string | null;
  meter_uuid: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const paymentsApi = {
  list: (params?: {
    invoice_uuid?: string;
    meter_uuid?: string;
    skip?: number;
    limit?: number;
    include_deleted?: boolean;
  }) => listRows<PaymentResponse>("payments", params),
  get: (uuid: string) => getRow<PaymentResponse>("payments", uuid),
  create: (data: {
    invoice_uuid: string;
    amount?: number;
    payment_date?: string;
    payment_type?: string;
    overdue_amount?: number;
    ref_payment_uuid?: string;
    meter_uuid?: string;
    status?: string;
    details?: string;
  }) => createRow<PaymentResponse>("payments", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<PaymentResponse>("payments", uuid, data),
  delete: (uuid: string) => deleteRow("payments", uuid),
};

// Documents
export type DocumentResponse = {
  uuid: string;
  ref_table: string;
  ref_uuid: string;
  name: string;
  path: string;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const documentsApi = {
  list: (params?: {
    ref_table?: string;
    ref_uuid?: string;
    skip?: number;
    limit?: number;
    include_deleted?: boolean;
  }) => listRows<DocumentResponse>("documents", params),
  get: (uuid: string) => getRow<DocumentResponse>("documents", uuid),
  create: (data: {
    ref_table: string;
    ref_uuid: string;
    name: string;
    path: string;
    status?: string;
    details?: string;
  }) => createRow<DocumentResponse>("documents", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<DocumentResponse>("documents", uuid, data),
  delete: (uuid: string) => deleteRow("documents", uuid),
};

// Users
export type UserResponse = {
  uuid: string;
  code: string;
  name: string;
  last_login: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: string | null;
};
export const usersApi = {
  list: (params?: { skip?: number; limit?: number; include_deleted?: boolean }) =>
    listRows<UserResponse>("users", params),
  get: (uuid: string) => getRow<UserResponse>("users", uuid),
  create: (data: {
    code: string;
    name: string;
    password: string;
    status?: string;
    details?: string;
  }) => createRow<UserResponse>("users", data),
  update: (uuid: string, data: Record<string, unknown>) =>
    updateRow<UserResponse>("users", uuid, data),
  delete: (uuid: string) => deleteRow("users", uuid),
};

// Contract Detail (JOIN)
export type ContractDetailResponse = ContractResponse & {
  area: AreaResponse;
  renter: RenterResponse;
  invoices: InvoiceResponse[];
};