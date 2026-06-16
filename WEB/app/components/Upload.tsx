"use client";
import { useState } from "react";

type UploadFile = { file: File; progress: number; id: string };

export default function Upload() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    const next = list.map((f) => ({ file: f, progress: 0, id: `${Date.now()}-${f.name}` }));
    setFiles((s) => [...s, ...next]);
    // simulate upload
    next.forEach(simulate);
  }

  function simulate(uf: UploadFile) {
    const id = setInterval(() => {
      setFiles((cur) => {
        const next = cur.map((c) => (c.id === uf.id ? { ...c, progress: Math.min(100, c.progress + 15) } : c));
        const done = next.find((c) => c.id === uf.id && c.progress >= 100);
        if (done) clearInterval(id);
        return next;
      });
    }, 300);
  }

  function remove(id: string) {
    setFiles((s) => s.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 btn-ghost cursor-pointer">
        <input type="file" className="hidden" multiple onChange={onChange} />
        <span className="text-sm">Select files</span>
      </label>
      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.id} className="bg-white p-2 rounded shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{f.file.name}</div>
              <div className="text-xs text-zinc-500">{Math.round(f.progress)}%</div>
              <div className="w-48 bg-zinc-100 rounded h-2 overflow-hidden mt-1">
                <div style={{ width: `${f.progress}%` }} className="h-2 bg-indigo-600" />
              </div>
            </div>
            <div>
              <button className="text-sm text-red-600" onClick={() => remove(f.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
