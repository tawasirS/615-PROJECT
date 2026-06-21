"use client";
import SharedShell from "../SharedShell";
import PageHeader from "../components/PageHeader";
import Container from "../components/Container";

export default function ProfilePage() {
  return (
    <SharedShell>
      <Container>
        <PageHeader title="โปรไฟล์" subtitle="ข้อมูลบัญชีผู้ใช้" />
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              D
            </div>
            <div>
              <div className="font-medium text-lg">Demo User</div>
              <div className="text-sm text-zinc-500">demo@example.com</div>
              <div className="text-xs text-zinc-400 mt-1">บทบาท: ผู้ดูแลระบบ</div>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm max-w-md">
              <div className="text-zinc-500">รหัสผู้ใช้</div>
              <div>DEMO001</div>
              <div className="text-zinc-500">สถานะ</div>
              <div><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">ACTIVE</span></div>
              <div className="text-zinc-500">เข้าระบบล่าสุด</div>
              <div>-</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a className="px-4 py-2 bg-black text-white rounded text-sm" href="/">กลับหน้าแรก</a>
          </div>
        </div>
      </Container>
    </SharedShell>
  );
}
