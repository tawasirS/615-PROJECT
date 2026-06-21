"use client";
import Link from "next/link";

const CATEGORIES = [
  {
    title: "ข้อมูลหลัก",
    items: [
      { href: "/data/area", label: "ข้อมูลพื้นที่", desc: "จัดการพื้นที่เช่า", color: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
      { href: "/data/tenant", label: "ข้อมูลผู้เช่า", desc: "จัดการข้อมูลผู้เช่า", color: "bg-green-50 border-green-200 hover:bg-green-100" },
      { href: "/data/contract", label: "ข้อมูลสัญญาเช่า", desc: "จัดการสัญญาเช่า", color: "bg-purple-50 border-purple-200 hover:bg-purple-100" },
    ],
  },
  {
    title: "การเงิน",
    items: [
      { href: "/data/invoice", label: "ใบแจ้งหนี้", desc: "จัดการใบแจ้งหนี้", color: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
      { href: "/data/payment", label: "การชำระเงิน", desc: "ดูรายการชำระเงิน", color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
      { href: "/payment/summary", label: "สรุปการชำระ", desc: "ดูภาพรวมการชำระเงิน", color: "bg-teal-50 border-teal-200 hover:bg-teal-100" },
    ],
  },
  {
    title: "สาธารณูปโภค",
    items: [
      { href: "/data/meter", label: "มิเตอร์", desc: "จัดการมิเตอร์น้ำ-ไฟ", color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100" },
      { href: "/payment/electricity", label: "ระบบไฟฟ้า", desc: "จัดการค่าไฟฟ้า", color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" },
      { href: "/payment/water", label: "ระบบน้ำ", desc: "จัดการค่าน้ำ", color: "bg-sky-50 border-sky-200 hover:bg-sky-100" },
    ],
  },
  {
    title: "อื่นๆ",
    items: [
      { href: "/data/document", label: "เอกสาร", desc: "จัดการไฟล์เอกสาร", color: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100" },
      { href: "/data/user", label: "ผู้ใช้งาน", desc: "จัดการผู้ใช้งานระบบ", color: "bg-red-50 border-red-200 hover:bg-red-100" },
      { href: "/reports", label: "รายงาน", desc: "ดูรายงานต่างๆ", color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100" },
    ],
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center py-12 px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">615 Project V1.2</h1>
          <p className="text-zinc-500">โปรแกรมจัดการข้อมูลการเช่า — Rental Management System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">{cat.title}</h2>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block p-4 rounded-lg border ${item.color} transition-colors`}
                  >
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-3">
          <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            ไปยัง Dashboard
          </Link>
          <Link href="/ai" className="px-5 py-2.5 border rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
            AI Chat
          </Link>
        </div>
      </main>
    </div>
  );
}
