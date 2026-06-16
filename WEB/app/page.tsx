"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-16 px-6 bg-white">
        <h1 className="text-3xl font-bold mb-4">615 Project V1.2</h1>
        <p className="text-zinc-600 mb-8">โปรแกรมจัดการข้อมูลการเช่า</p>
        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl mb-6">
          <div className="p-6 bg-blue-100 rounded-lg shadow text-center" >ข้อมูล</div>
          <Link href="/area" className="p-6 bg-zinc-50 rounded-lg shadow text-center">ข้อมูลพื้นที่</Link>
          <Link href="/tenant" className="p-6 bg-zinc-50 rounded-lg shadow text-center">ข้อมูลผู้เช่า</Link>
          <Link href="/contract" className="p-6 bg-zinc-50 rounded-lg shadow text-center">ข้อมูลสัญญาเช่า</Link>
        </div>
        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl mb-6">
          <div className="p-6 bg-blue-100 rounded-lg shadow text-center" >จัดการค่าใช้จ่าย(ผู้เช่า)</div>
          <Link href="/area" className="p-6 bg-zinc-50 rounded-lg shadow text-center">ค่าเช่า</Link>
          <Link href="/tenant" className="p-6 bg-zinc-50 rounded-lg shadow text-center">ระบบไฟฟ้า</Link>
          <Link href="/contract" className="p-6 bg-zinc-50 rounded-lg shadow text-center">ระบบน้ำ</Link>
        </div>
        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl mb-6">
          <div className="p-6 bg-blue-100 rounded-lg shadow text-center" >อื่นๆ</div>
          <Link href="/ai" className="p-6 bg-zinc-50 rounded-lg shadow text-center">AI Chat</Link>
          <Link href="/data" className="p-6 bg-zinc-50 rounded-lg shadow text-center">จัดการค่าใช้จ่าย(เจ้าของ)</Link>
          <Link href="/data" className="p-6 bg-zinc-50 rounded-lg shadow text-center">รายงาน</Link>
        </div>

        {/* <div className="w-full max-w-3xl">
          <div className="prose">
            <h2>Welcome</h2>
            <p>Explore demo screens using the links above (Dashboard is at /dashboard).</p>
          </div>
        </div> */}
      </main>
    </div>
  );
}
