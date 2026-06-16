"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <button onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} className="btn-ghost">
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
