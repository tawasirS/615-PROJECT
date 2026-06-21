"use client";
import { useEffect, useState } from "react";
import SharedShell from "../SharedShell";
import PageHeader from "../components/PageHeader";
import Container from "../components/Container";
import { areasApi, rentersApi, contractsApi, invoicesApi, paymentsApi } from "../api-client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    areas: 0,
    renters: 0,
    contracts: 0,
    invoices: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [areas, renters, contracts, invoices, payments] = await Promise.all([
          areasApi.list(),
          rentersApi.list(),
          contractsApi.list(),
          invoicesApi.list(),
          paymentsApi.list(),
        ]);
        setStats({
          areas: areas.length,
          renters: renters.length,
          contracts: contracts.length,
          invoices: invoices.length,
          payments: payments.length,
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { label: "พื้นที่", value: stats.areas, color: "bg-blue-50 text-blue-700" },
    { label: "ผู้เช่า", value: stats.renters, color: "bg-green-50 text-green-700" },
    { label: "สัญญาเช่า", value: stats.contracts, color: "bg-purple-50 text-purple-700" },
    { label: "ใบแจ้งหนี้", value: stats.invoices, color: "bg-amber-50 text-amber-700" },
    { label: "รายการชำระเงิน", value: stats.payments, color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <SharedShell>
      <Container>
        <div className="space-y-4">
          <PageHeader title="Dashboard" subtitle="ภาพรวมระบบจัดการข้อมูลการเช่า" />

          {loading ? (
            <div className="text-center py-8 text-zinc-500">กำลังโหลด...</div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {cards.map((card) => (
                  <div key={card.label} className={`rounded-lg p-5 ${card.color}`}>
                    <div className="text-3xl font-bold">{card.value}</div>
                    <div className="text-sm mt-1 opacity-80">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-lg mb-3">การดำเนินการด่วน</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <a href="/data/area" className="p-3 bg-zinc-50 rounded text-sm font-medium hover:bg-zinc-100 text-center">เพิ่มพื้นที่</a>
                  <a href="/data/tenant" className="p-3 bg-zinc-50 rounded text-sm font-medium hover:bg-zinc-100 text-center">เพิ่มผู้เช่า</a>
                  <a href="/data/contract" className="p-3 bg-zinc-50 rounded text-sm font-medium hover:bg-zinc-100 text-center">เพิ่มสัญญา</a>
                  <a href="/data/invoice" className="p-3 bg-zinc-50 rounded text-sm font-medium hover:bg-zinc-100 text-center">สร้างใบแจ้งหนี้</a>
                </div>
              </div>
            </>
          )}
        </div>
      </Container>
    </SharedShell>
  );
}
