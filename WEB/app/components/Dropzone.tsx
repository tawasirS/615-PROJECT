"use client";
// NOTE: Dropzone uses native drag/drop events and a hidden file input.
// Removing files mutates local component state only; in a real app you would
// also sync with a server or upload queue and handle errors/validation.
import { useCallback, useRef, useState } from "react";

export default function Dropzone() {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files);
    setFiles((f) => [...f, ...list]);
  }, []);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles((f) => [...f, ...Array.from(e.target.files || [])]);
  };
  const removeFile = (index: number) => {
    setFiles((f) => f.filter((_, i) => i !== index));
  };
  return (
    <div onDragOver={(e)=>e.preventDefault()} onDrop={onDrop} className="p-6 border-dashed border-2 rounded bg-white text-center">
      <p>Drag files here or <button type="button" onClick={() => inputRef.current?.click()} className="underline">click to browse</button></p>
      <input ref={inputRef} className="hidden" type="file" multiple onChange={onChange} />
      {files.length>0 && <ul className="text-left mt-3">{files.map((f,i)=> <li key={i} className="flex justify-between items-center"><span>{f.name}</span><button className="ml-4 text-red-600" onClick={() => removeFile(i)}>Remove</button></li>)}</ul>}
    </div>
  );
}
