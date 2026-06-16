"use client";
// NOTE (helpful for beginners): This Form component serializes a native HTML form into
// a plain object using `Object.fromEntries(new FormData(form))` before passing it to
// the provided onSubmit handler. This keeps the component generic and avoids
// coupling to any specific form library.
import { FormEvent } from "react";

type Props = {
  onSubmit: (payload: Record<string, any>) => Promise<void> | void;
  children?: React.ReactNode;
};

export default function Form({ onSubmit, children }: Props) {
  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form) as unknown as Iterable<[string, any]>);
    await onSubmit(data);
  }
  return <form onSubmit={handle} className="space-y-4">{children}</form>;
}
