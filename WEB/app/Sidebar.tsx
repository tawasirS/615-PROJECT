"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/data/area", label: "ข้อมูลพื้นที่", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/data/tenant", label: "ข้อมูลผู้เช่า", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/data/contract", label: "ข้อมูลสัญญาเช่า", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/payment/summary", label: "การชำระเงิน", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/payment/rent", label: "ค่าเช่า", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/payment/electricity", label: "ระบบไฟฟ้า", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/payment/water", label: "ระบบน้ำ", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/ai", label: "AI Chat", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/mycost", label: "จัดการค่าใช้จ่าย(เจ้าของ)", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
  {
    href: "/reports", label: "รายงาน", icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" {...props}><path d="M3 13h8V3H3v10z" /><path d="M13 21h8V11h-8v10z" /></svg>
    )
  },
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
