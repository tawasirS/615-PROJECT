"use client";
import { useMemo, useEffect, useState } from "react";

// NOTE: lightweight client-side sorting + pagination for demos. For large datasets
// move sorting/pagination server-side or into a data-layer.

type TableProps = {
  columns: string[];
  data: Record<string, any>[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
};

export default function Table({ columns, data, pageSizeOptions = [10, 25, 50, 100], defaultPageSize = 10 }: TableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(defaultPageSize);

  // reset to first page when page size or data changes
  useEffect(() => {
    setPage(1);
  }, [perPage, data.length]);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const A = String(a[sortKey] ?? a[sortKey.toLowerCase()] ?? "").localeCompare(String(b[sortKey] ?? b[sortKey.toLowerCase()] ?? ""));
      return sortDir === 'asc' ? A : -A;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [pages]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, total);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <span>Show</span>
          <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="border rounded px-2 py-1">
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className="text-sm text-zinc-600">
          {total === 0 ? 'No entries' : `Showing ${startIndex} to ${endIndex} of ${total} entries`}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((c) => (
                <th key={c} className="text-left px-4 py-2">
                  <button onClick={() => toggleSort(c)} className="flex items-center gap-2">
                    <span>{c}</span>
                    <span className="text-xs text-zinc-400">{sortKey === c ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns.map((c) => (
                  <td key={c} className="px-4 py-2">{String(row[c] ?? row[c.toLowerCase()] ?? "")}</td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-zinc-500">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 flex items-center justify-between">
        <div className="text-sm text-zinc-500">Page {page} / {pages}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded text-sm">First</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded text-sm">Prev</button>
          <input value={page} onChange={(e) => { const v = Number(e.target.value) || 1; setPage(Math.max(1, Math.min(pages, Math.floor(v)))); }} className="w-12 text-center border rounded px-2 py-1 text-sm" />
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-2 py-1 border rounded text-sm">Next</button>
          <button onClick={() => setPage(pages)} disabled={page === pages} className="px-2 py-1 border rounded text-sm">Last</button>
        </div>
      </div>
    </div>
  );
}
