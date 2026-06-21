"use client";
import { useEffect, useState } from "react";
import PageHeader from "./PageHeader";
import Table from "./Table";
import { paymentsApi, PaymentResponse, invoicesApi, InvoiceResponse, metersApi, MeterResponse } from "../api-client";

type Props = {
  title: string;
  description: string;
  filter: "area" | "electric" | "water" | "all";
};

export default function PaymentView({ title, description, filter }: Props) {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [meters, setMeters] = useState<MeterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "invoices">("payments");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [payData, invData, meterData] = await Promise.all([
          paymentsApi.list(),
          invoicesApi.list(),
          metersApi.list(),
        ]);
        setPayments(payData);
        setInvoices(invData);
        setMeters(meterData);
      } catch (e) {
        console.error("Failed to load payment data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // กรองข้อมูลตาม filter
  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    if (filter === "electric") return p.meter_uuid != null;
    if (filter === "water") return p.meter_uuid != null;
    return true;
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "all") return true;
    return true;
  });

  const payColumns = [
    "รหัส Invoice",
    "จำนวนเงิน",
    "วันที่ชำระ",
    "ประเภท",
    "ค่าปรับ",
    "รหัสมิเตอร์",
    "สถานะ",
  ];

  const invColumns = [
    "รหัสสัญญา",
    "วันที่ออกใบแจ้งหนี้",
    "วันครบกำหนด",
    "สถานะ",
  ];

  const payloads = filteredPayments.map((p) => ({
    "รหัส Invoice": p.invoice_uuid.slice(0, 8) + "...",
    "จำนวนเงิน": p.amount ? Number(p.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "-",
    "วันที่ชำระ": p.payment_date || "-",
    "ประเภท": p.payment_type || "-",
    "ค่าปรับ": p.overdue_amount ? Number(p.overdue_amount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "-",
    "รหัสมิเตอร์": p.meter_uuid ? p.meter_uuid.slice(0, 8) + "..." : "-",
    "สถานะ": p.status || "-",
  }));

  const invRows = filteredInvoices.map((inv) => ({
    "รหัสสัญญา": inv.contract_uuid.slice(0, 8) + "...",
    "วันที่ออกใบแจ้งหนี้": inv.invoice_date || "-",
    "วันครบกำหนด": inv.payment_date || "-",
    "สถานะ": inv.status || "-",
  }));

  return (
    <div className="space-y-4">
      <PageHeader title={title} subtitle={description} />

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "payments" ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-500"
          }`}
        >
          รายการชำระเงิน
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "invoices" ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-500"
          }`}
        >
          ใบแจ้งหนี้
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-zinc-500">กำลังโหลด...</div>
      ) : (
        <>
          {activeTab === "payments" && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <Table columns={payColumns} data={payloads} />
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <Table columns={invColumns} data={invRows} />
            </div>
          )}

          {/* Meter summary section */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-3">สรุปมิเตอร์</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">มิเตอร์ทั้งหมด</div>
                <div className="text-2xl font-bold mt-1">{meters.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">จำนวนเงินชำระทั้งหมด</div>
                <div className="text-2xl font-bold mt-1">
                  {filteredPayments
                    .filter((p) => p.amount)
                    .reduce((sum, p) => sum + Number(p.amount), 0)
                    .toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-sm text-amber-600 font-medium">รายการชำระเงิน</div>
                <div className="text-2xl font-bold mt-1">{filteredPayments.length}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}