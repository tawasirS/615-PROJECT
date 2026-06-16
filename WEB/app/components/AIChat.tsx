"use client";
import { useState } from "react";
import { sendMessage } from "../mock-api";

export default function AIChat() {
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [value, setValue] = useState("");

  async function handleSend() {
    if (!value.trim()) return;
    const user = { from: "user", text: value };
    setMessages((m) => [...m, user]);
    setValue("");
    const res = await sendMessage(value);
    setMessages((m) => [...m, { from: "bot", text: res }]);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border">
      <div className="space-y-3 h-64 overflow-auto p-2">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
            <div className="inline-block px-3 py-2 rounded-lg bg-zinc-100">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 border px-3 py-2 rounded" />
        <button onClick={handleSend} className="px-4 py-2 bg-black text-white rounded">Send</button>
      </div>
    </div>
  );
}
