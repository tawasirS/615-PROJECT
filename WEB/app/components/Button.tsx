"use client";

export default function Button({ children, onClick, variant = "primary", className = "" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; className?: string }) {
  const base = "px-4 py-2 rounded-md font-medium inline-block";
  const styles = variant === "primary" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "hover:bg-zinc-50";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
