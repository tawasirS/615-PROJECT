"use client";
import { useEffect, useState, useMemo } from "react";
import Table from "./Table";
import Dropzone from "./Dropzone";
import Upload from "./Upload";
import Chart from "./Chart";
import ValidatedForm from "./ValidatedForm";
import Modal from "./Modal";
import { ToastProvider } from "./Toast";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import { fetchTable, submitForm } from "../mock-api";

export default function ComponentsDemo() {
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchTable().then((res) => {
      setColumns(res.columns);
      setData(res.data);
    });
  }, []);

  const chartData = useMemo(() => {
    // derive simple numeric data from the table mock for demonstration
    return data.map((r, i) => ({ label: String(r.Name ?? `R${i+1}`).slice(0,6), value: (i + 1) * 10 }));
  }, [data]);

  async function onSubmit(p: any) {
    await submitForm(p);
    alert("Submitted (mock)");
  }

  return (
    <ToastProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Components (demo)</h3>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={() => setOpen(true)} variant="ghost">Open Modal</Button>
          </div>
        </div>

        <section>
          <h4 className="font-medium mb-2">Table (sorting + pagination)</h4>
          <Table columns={columns} data={data} />
        </section>

        <section>
          <h4 className="font-medium mb-2">Dropzone</h4>
          <Dropzone />
        </section>

        <section>
          <h4 className="font-medium mb-2">Upload (progress simulation)</h4>
          <Upload />
        </section>

        <section>
          <h4 className="font-medium mb-2">Chart (line + bar)</h4>
          <Chart data={chartData} type="line" />
          <div className="mt-4">
            <Chart data={chartData} type="bar" />
          </div>
        </section>

        <section>
          <h4 className="font-medium mb-2">Validated Form</h4>
          <ValidatedForm onSubmit={async (d) => { await submitForm(d); alert(JSON.stringify(d)); }}>
            <div className="grid grid-cols-2 gap-3">
              <input name="first" data-required="true" placeholder="First name" className="w-full border px-3 py-2 rounded" />
              <input name="last" data-required="true" placeholder="Last name" className="w-full border px-3 py-2 rounded" />
              <input name="email" placeholder="Email" className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="mt-2">
              <button type="submit" className="btn-primary">Submit</button>
            </div>
          </ValidatedForm>
        </section>

        <Modal open={open} onClose={() => setOpen(false)}>
          <div>
            <h3 className="text-lg font-semibold mb-2">Sample Modal</h3>
            <p className="text-sm text-zinc-600 mb-4">This is a demo modal. Use it to show forms or confirmations.</p>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setOpen(false)} variant="ghost">Close</Button>
            </div>
          </div>
        </Modal>
      </div>
    </ToastProvider>
  );
}
