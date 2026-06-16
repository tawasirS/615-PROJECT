"use client";
import Sidebar from "./Sidebar";

export default function SharedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-50">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
