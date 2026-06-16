"use client";
// NOTE: click-outside pattern used below is simple and effective for small apps.
// For production, consider a reusable hook (useOnClickOutside) and ARIA roles
// for better accessibility.
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Avatar from "./components/Avatar";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <nav className="w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            615
          </div>
          <div className="text-lg font-semibold">615 Project</div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-zinc-600">Learn · Build · Ship</div>

          <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-2">
              <Avatar name="Demo User" />
              <span className="sr-only">User menu</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md py-2 z-20">
                <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-zinc-50">Profile</Link>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50">Logout</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
