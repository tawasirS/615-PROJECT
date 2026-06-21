"use client";
import { useEffect, useState } from "react";
import SharedShell from "@/app/SharedShell";
import PageHeader from "@/app/components/PageHeader";
import Container from "@/app/components/Container";
import Table from "@/app/components/Table";
import { metersApi, MeterResponse, paymentsApi, PaymentResponse } from "@/app/api-client";

export default function MyCostPage() {
  const [meters, setMeters] = useState<MeterResponse[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [meterData, payData] = await Promise.all([
          metersApi.list(),
          paymentsApi.list(),
        ]);
        setMeters(meterData);
        setPayments(payData);
      } catch (e) {
        console.error("Failed to load cost data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalMeterValue = meters.reduce((s, m) => s + Number(m.meter_value || 0), 0);
  const totalNetValue = meters.reduce((s, m) => s + Number(m.net_value || 0), 0);
  const totalPayments = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const meterColumns = ["ประเภท", "ค่ามิเตอร์", "ค่าสุทธิ", "รหัสพื้นที่", "สถานะ"];
  const paymentColumns = ["จำนวนเงิน", "วันที่ชำระ", "ประเภท", "สถานะ"];

  return (
    <SharedShell>
      <Container>
        <div className="space-y-4">
          <PageHeader title="จัดการค่าใช้จ่าย (เจ้าของ)" subtitle="ดูภาพรวมค่าใช้จ่ายจากมิเตอร์และการชำระเงิน" />

          {loading ? (
            <div className="text-center py-8 text-zinc-500">กำลังโหลด...</div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5">
                  <div className="text-sm text-indigo-600 font-medium">ค่ามิเตอร์รวม</div>
                  <div className="text-2xl font-bold mt-1">
                    {totalMeterValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-5">
                  <div className="text-sm text-teal-600 font-medium">ค่าสุทธิรวม</div>
                  <div className="text-2xl font-bold mt-1">
                    {totalNetValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-5">
                  <div className="text-sm text-emerald-600 font-medium">ยอดชำระรวม</div>
                  <div className="text-2xl font-bold mt-1">
                    {totalPayments.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Meter table */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3">ข้อมูลมิเตอร์</h3>
                <Table
                  columns={meterColumns}
                  data={meters.map((m) => ({
                    "ประเภท": m.meter_type || "-",
                    "ค่ามิเตอร์": Number(m.meter_value || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
                    "ค่าสุทธิ": Number(m.net_value || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
                    "รหัสพื้นที่": m.area_uuid.slice(0, 8) + "...",
                    "สถานะ": m.status || "-",
                  }))}
                />
              </div>

              {/* Payment table */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3">รายการชำระเงิน</h3>
                <Table
                  columns={paymentColumns}
                  data={payments.map((p) => ({
                    "จำนวนเงิน": Number(p.amount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
                    "วันที่ชำระ": p.payment_date || "-",
                    "ประเภท": p.payment_type || "-",
                    "สถานะ": p.status || "-",
                  }))}
                />
              </div>
            </>
          )}
        </div>
      </Container>
    </SharedShell>
  );
}
