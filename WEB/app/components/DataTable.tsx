"use client";
import Table from "./Table";
import { fetchTable } from "../mock-api";
import { useEffect, useState } from "react";

export default function DataTable() {
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchTable().then((res) => {
      setColumns(res.columns);
      setData(res.data);
    });
  }, []);

  return (
    <div>
      <Table columns={columns} data={data} />
    </div>
  );
}
