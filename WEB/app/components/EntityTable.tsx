"use client";
import { useEffect, useState, useCallback } from "react";
import { EntityConfig, EntityType, ENTITY_CONFIG } from "../lib/entity-config";
import Table from "./Table";
import Modal from "./Modal";
import { useToast } from "./Toast";
import { ApiError } from "../api-client";

type Props = {
  type: EntityType;
};

export default function EntityTable({ type }: Props) {
  const config: EntityConfig = ENTITY_CONFIG[type];

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const { add: toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await config.api.list();
      setRows(data as Record<string, unknown>[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    load();
  }, [load]);

  // เปิด modal สำหรับสร้างใหม่
  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  // เปิด modal สำหรับแก้ไข
  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    setShowModal(true);
  }

  // บันทึก (สร้างหรือแก้ไข)
  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      if (editing) {
        await config.api.update(editing.uuid as string, data);
        toast("แก้ไขข้อมูลสำเร็จ");
      } else {
        await config.api.create(data);
        toast("เพิ่มข้อมูลสำเร็จ");
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  // ลบ
  async function handleDelete(row: Record<string, unknown>) {
    if (!confirm(`คุณต้องการลบ "${row.code || row.name || row.uuid}"?`)) return;
    try {
      await config.api.delete(row.uuid as string);
      toast("ลบข้อมูลสำเร็จ");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  const columns = config.columns.map((c) => c.label);

  return (
    <div className="space-y-4">
      {/* Header + ปุ่มเพิ่ม */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{config.labelPlural}</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
          + เพิ่ม{config.label}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
          <button onClick={load} className="ml-2 underline">ลองใหม่</button>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="text-center py-8 text-zinc-500">กำลังโหลด...</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table
            columns={columns}
            data={rows.map((row) => {
              const obj: Record<string, string> = {};
              config.columns.forEach((col) => {
                obj[col.label] = col.render
                  ? col.render(row[col.key], row)
                  : String(row[col.key] ?? row[col.key.toLowerCase()] ?? "");
              });
              return obj;
            })}
          />
        </div>
      )}

      {/* Action buttons per row (fixed below table) — in real app use a column action */}
      {!loading && !error && rows.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-zinc-500">การจัดการ:</div>
          <div className="flex flex-wrap gap-2">
            {rows.slice(0, 50).map((row) => (
              <div key={row.uuid as string} className="flex items-center gap-1 bg-white border rounded px-2 py-1 text-xs">
                <span className="max-w-24 truncate">{(row.code || row.name || String(row.uuid).slice(0, 8)) as string}</span>
                <button onClick={() => openEdit(row)} className="text-indigo-600 hover:underline ml-1">แก้ไข</button>
                <button onClick={() => handleDelete(row)} className="text-red-600 hover:underline ml-1">ลบ</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal สำหรับ Create / Edit */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-lg font-semibold mb-4">
          {editing ? `แก้ไข${config.label}` : `เพิ่ม${config.label}`}
        </h2>
        <EntityForm
          config={config}
          initial={editing}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
          saving={saving}
        />
      </Modal>
    </div>
  );
}

// ---- Entity Form (ใช้ใน Modal) ----
function EntityForm({
  config,
  initial,
  onSave,
  onCancel,
  saving,
}: {
  config: EntityConfig;
  initial: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    config.formFields.forEach((f) => {
      init[f.name] = initial ? String(initial[f.name] ?? initial[f.name.toLowerCase()] ?? "") : "";
    });
    return init;
  });

  function setField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: Record<string, unknown> = {};
    config.formFields.forEach((f) => {
      const val = form[f.name]?.trim();
      if (val !== "") {
        if (f.type === "number") {
          data[f.name] = Number(val);
        } else {
          data[f.name] = val;
        }
      }
    });
    // ถ้าเป็น user edit และ password ว่าง ไม่ส่ง password
    if (initial && config.resource === "users" && !form.password?.trim()) {
      delete data.password;
    }
    await onSave(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.formFields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium mb-1">
            {f.label}
            {f.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {f.type === "select" ? (
            <select
              value={form[f.name] || ""}
              onChange={(e) => setField(f.name, e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">-- เลือก --</option>
              {(f.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              value={form[f.name] || ""}
              onChange={(e) => setField(f.name, e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              rows={3}
              placeholder={f.placeholder}
            />
          ) : (
            <input
              type={f.type}
              value={form[f.name] || ""}
              onChange={(e) => setField(f.name, e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder={f.placeholder}
              required={f.required}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm hover:bg-zinc-50">
          ยกเลิก
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </form>
  );
}