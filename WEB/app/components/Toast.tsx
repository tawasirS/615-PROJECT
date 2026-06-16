"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Toast = { id: string; message: string };

const ToastCtx = createContext<{ add: (msg: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string) => {
    const t = { id: `${Date.now()}`, message };
    setToasts((s) => [...s, t]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={{ add }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="bg-zinc-800 text-white px-4 py-2 rounded shadow">{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
