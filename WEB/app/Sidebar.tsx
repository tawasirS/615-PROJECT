"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icons (inline SVG)
const IconBuilding = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
);
const IconUsers = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" /><path d="M3.5 22C4.5 18 8 16 12 16s7.5 2 8.5 6" /></svg>
);
const IconFile = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
);
const IconDollar = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><circle cx="12" cy="12" r="10" /><path d="M8 16c1.5 1 3.5 1.5 5 1.5 2.5 0 3-1.5 3-2.5s-1-2-4-3c-3-1-5-2-5-5 0-2.5 2-4 5-4 2 0 3.5.5 5 1.5" /></svg>
);
const IconZap = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><polygon points="13 2 4 13 10 13 10 22 20 11 14 11 14 2" /></svg>
);
const IconDroplets = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M12 21C8 21 5 18 5 14c0-5 7-11 7-11s7 6 7 11c0 4-3 7-7 7z" /></svg>
);
const IconChart = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
);
const IconGauge = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M12 22A10 10 0 1112 2a10 10 0 010 20z" /><path d="M12 12l3-3" /><path d="M12 8v4" /></svg>
);
const IconFileText = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M16 2v6h6" /><path d="M8 13h8" /><path d="M8 17h8" /><path d="M8 9h1" /></svg>
);
const IconShield = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconBot = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><path d="M12 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-3V5a3 3 0 00-3-3z" /><circle cx="9" cy="13" r="1" /><circle cx="15" cy="13" r="1" /><path d="M9 17c.7.7 1.8 1 3 1s2.3-.3 3-1" /></svg>
);
const IconWallet = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...p}><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M16 10h4v4h-4" /><path d="M2 6V4h18v2" /></svg>
);

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: IconGauge },
  // ข้อมูลหลัก
  { href: "/data/area", label: "ข้อมูลพื้นที่", icon: IconBuilding },
  { href: "/data/tenant", label: "ข้อมูลผู้เช่า", icon: IconUsers },
  { href: "/data/contract", label: "ข้อมูลสัญญาเช่า", icon: IconFile },
  { href: "/data/invoice", label: "ข้อมูลใบแจ้งหนี้", icon: IconFileText },
  { href: "/data/meter", label: "ข้อมูลมิเตอร์", icon: IconGauge },
  { href: "/data/payment", label: "ข้อมูลการชำระเงิน", icon: IconDollar },
  { href: "/data/document", label: "ข้อมูลเอกสาร", icon: IconFileText },
  { href: "/data/user", label: "ข้อมูลผู้ใช้งาน", icon: IconShield },
  // จัดการค่าใช้จ่าย
  { href: "/payment/summary", label: "การชำระเงิน", icon: IconDollar },
  { href: "/payment/rent", label: "ค่าเช่า", icon: IconWallet },
  { href: "/payment/electricity", label: "ระบบไฟฟ้า", icon: IconZap },
  { href: "/payment/water", label: "ระบบน้ำ", icon: IconDroplets },
  // อื่นๆ
  { href: "/ai", label: "AI Chat", icon: IconBot },
  { href: "/mycost", label: "จัดการค่าใช้จ่าย(เจ้าของ)", icon: IconWallet },
  { href: "/reports", label: "รายงาน", icon: IconChart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r p-4 bg-white min-h-screen hidden md:block">
      <div className="text-sm font-semibold mb-4">Menu</div>
      <ul className="space-y-1 text-sm">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link href={l.href} className={`flex items-center gap-3 px-3 py-2 rounded ${active ? 'bg-zinc-100 font-medium' : 'hover:bg-zinc-50'}`}>
                <span className="text-zinc-500">{l.icon({})}</span>
                <span>{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
