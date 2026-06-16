"use client";
import { FormEvent, useState } from "react";

type FieldErrors = Record<string, string>;

export default function ValidatedForm({ onSubmit, children }: { onSubmit: (data: Record<string, any>) => Promise<void> | void; children: React.ReactNode }) {
  const [errors, setErrors] = useState<FieldErrors>({});

  // Simple validation: inputs with data-required="true" must be non-empty
  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fm = new FormData(form);
    const obj: Record<string, any> = {};
    const errs: FieldErrors = {};
    for (const [k, v] of fm.entries()) {
      obj[k] = v;
      const el = form.elements.namedItem(k) as HTMLInputElement | null;
      if (el && el.dataset.required === "true" && String(v).trim() === "") {
        errs[k] = "This field is required";
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) await onSubmit(obj);
  }

  // Helper to surface error messages to children: children should render form fields and use aria-describedby where appropriate.
  return (
    <form onSubmit={handle} className="space-y-4">
      {children}
      {/* Beginner note: errors object contains simple messages per field */}
      <div className="text-sm text-red-600">{Object.values(errors)[0] ?? ''}</div>
    </form>
  );
}
