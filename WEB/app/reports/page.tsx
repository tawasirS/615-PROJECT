"use client";
import { useEffect, useState } from "react";
import SharedShell from "@/app/SharedShell";
import PageHeader from "@/app/components/PageHeader";
import Container from "@/app/components/Container";
import Table from "@/app/components/Table";
import Tabs from "../components/tabs";
import { contractsApi, paymentsApi, invoicesApi, ContractResponse, PaymentResponse, InvoiceResponse } from "@/app/api-client";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("arrears");
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, p, i] = await Promise.all([
          contractsApi.list(),
          paymentsApi.list(),
          invoicesApi.list(),
        ]);
        setContracts(c);
        setPayments(p);
        setInvoices(i);
      } catch (e) {
        console.error("Failed to load report data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // รายงาน: ผู้เช่าค้างชำระ (invoices ที่ไม่ใช่ PAID)
  const overdueInvoices = invoices.filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED");
  const arrearsColumns = ["รหัสสัญญา", "วันที่ออก", "วันครบกำหนด", "สถานะ"];
  const arrearsData = overdueInvoices.map((inv) => ({
    "รหัสสัญญา": inv.contract_uuid.slice(0, 8) + "...",
    "วันที่ออก": inv.invoice_date || "-",
    "วันครบกำหนด": inv.payment_date || "-",
    "สถานะ": inv.status || "-",
  }));

  // รายงาน: การชำระเงิน
  const payColumns = ["รหัส Invoice", "จำนวนเงิน", "วันที่ชำระ", "ประเภท", "สถานะ"];
  const payData = payments.map((p) => ({
    "รหัส Invoice": p.invoice_uuid.slice(0, 8) + "...",
    "จำนวนเงิน": p.amount ? Number(p.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "-",
    "วันที่ชำระ": p.payment_date || "-",
    "ประเภท": p.payment_type || "-",
    "สถานะ": p.status || "-",
  }));

  // รายงาน: ค่าใช้จ่าย (payments with amounts)
  const costColumns = ["จำนวนเงิน", "ค่าปรับ", "วันที่ชำระ", "ประเภท", "สถานะ"];
  const costData = payments.map((p) => ({
    "จำนวนเงิน": p.amount ? Number(p.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "-",
    "ค่าปรับ": p.overdue_amount ? Number(p.overdue_amount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "-",
    "วันที่ชำระ": p.payment_date || "-",
    "ประเภท": p.payment_type || "-",
    "สถานะ": p.status || "-",
  }));

  // รายงาน: สัญญาเช่า
  const contractColumns = ["รหัสพื้นที่", "รหัสผู้เช่า", "วันที่เริ่ม", "วันที่สิ้นสุด", "สถานะ"];
  const contractData = contracts.map((c) => ({
    "รหัสพื้นที่": c.area_uuid.slice(0, 8) + "...",
    "รหัสผู้เช่า": c.renter_uuid.slice(0, 8) + "...",
    "วันที่เริ่ม": c.start_date || "-",
    "วันที่สิ้นสุด": c.end_date || "-",
    "สถานะ": c.status || "-",
  }));

  return (
    <SharedShell>
      <Container>
        <div className="space-y-4">
          <PageHeader title="รายงาน" subtitle="รายงานต่างๆ ของระบบ" />

          <Tabs
            element={[
              { reportname: "รายงานผู้เช่าค้างชำระ", href: "#arrears" },
              { reportname: "รายงานการชำระเงิน", href: "#payment" },
              { reportname: "รายงานค่าใช้จ่าย", href: "#cost" },
              { reportname: "รายงานสัญญาเช่า", href: "#contract" },
            ]}
          />

          {/* Tab selector */}
          <div className="flex gap-2 border-b pb-2">
            {(["arrears", "payment", "cost", "contract"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t ${
                  activeTab === tab
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {tab === "arrears" && "ค้างชำระ"}
                {tab === "payment" && "การชำระเงิน"}
                {tab === "cost" && "ค่าใช้จ่าย"}
                {tab === "contract" && "สัญญาเช่า"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8 text-zinc-500">กำลังโหลด...</div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              {activeTab === "arrears" && (
                <div className="p-4">
                  <h3 className="font-semibold mb-3">รายงานผู้เช่าค้างชำระ ({overdueInvoices.length} รายการ)</h3>
                  {overdueInvoices.length === 0 ? (
                    <p className="text-sm text-zinc-500">ไม่มีรายการค้างชำระ</p>
                  ) : (
                    <Table columns={arrearsColumns} data={arrearsData} />
                  )}
                </div>
              )}

              {activeTab === "payment" && (
                <div className="p-4">
                  <h3 className="font-semibold mb-3">รายงานการชำระเงิน ({payments.length} รายการ)</h3>
                  <Table columns={payColumns} data={payData} />
                </div>
              )}

              {activeTab === "cost" && (
                <div className="p-4">
                  <h3 className="font-semibold mb-3">รายงานค่าใช้จ่าย ({payments.length} รายการ)</h3>
                  <Table columns={costColumns} data={costData} />
                </div>
              )}

              {activeTab === "contract" && (
                <div className="p-4">
                  <h3 className="font-semibold mb-3">รายงานสัญญาเช่า ({contracts.length} รายการ)</h3>
                  <Table columns={contractColumns} data={contractData} />
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </SharedShell>
  );
}
