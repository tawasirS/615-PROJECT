"use client";

export default function Avatar({ name = "U", className = "" }: { name?: string; className?: string }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "U";
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white flex items-center justify-center text-sm font-semibold ${className}`}>
      {initial}
    </div>
  );
}
