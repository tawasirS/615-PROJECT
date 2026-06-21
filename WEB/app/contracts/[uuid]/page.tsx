"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SharedShell from "../../SharedShell";
import PageHeader from "../../components/PageHeader";
import { contractsApi, ContractDetailResponse } from "../../api-client";

export default function ContractDetailPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  const [detail, setDetail] = useState<ContractDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    contractsApi
      .getDetail(uuid)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [uuid]);

  return (
    <SharedShell>
      <div className="space-y-4">
        <PageHeader title="รายละเอียดสัญญาเช่า" subtitle={`UUID: ${uuid}`} />

        {loading && <div className="text-center py-8 text-zinc-500">กำลังโหลด...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
        )}

        {detail && (
          <>
            {/* Contract Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">ข้อมูลสัญญา</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-zinc-500">สถานะ:</span> <span className="font-medium">{detail.status}</span></div>
                <div><span className="text-zinc-500">วันที่เริ่ม:</span> <span className="font-medium">{detail.start_date || "-"}</span></div>
                <div><span className="text-zinc-500">วันที่สิ้นสุด:</span> <span className="font-medium">{detail.end_date || "-"}</span></div>
                <div><span className="text-zinc-500">วันที่ชำระ:</span> <span className="font-medium">{detail.payment_date || "-"}</span></div>
                <div><span className="text-zinc-500">สร้างเมื่อ:</span> <span className="font-medium">{new Date(detail.created_at).toLocaleString("th-TH")}</span></div>
                <div><span className="text-zinc-500">รายละเอียด:</span> <span className="font-medium">{detail.details || "-"}</span></div>
              </div>
            </div>

            {/* Area Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">ข้อมูลพื้นที่</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-zinc-500">รหัสพื้นที่:</span> <span className="font-medium">{detail.area.code}</span></div>
                <div><span className="text-zinc-500">ชื่อ:</span> <span className="font-medium">{detail.area.name}</span></div>
                <div><span className="text-zinc-500">สถานะ:</span> <span className="font-medium">{detail.area.status}</span></div>
              </div>
            </div>

            {/* Renter Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">ข้อมูลผู้เช่า</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-zinc-500">รหัสผู้เช่า:</span> <span className="font-medium">{detail.renter.code}</span></div>
                <div><span className="text-zinc-500">ชื่อ:</span> <span className="font-medium">{detail.renter.name}</span></div>
                <div><span className="text-zinc-500">เบอร์โทร:</span> <span className="font-medium">{detail.renter.tel || "-"}</span></div>
                <div><span className="text-zinc-500">อีเมล:</span> <span className="font-medium">{detail.renter.email || "-"}</span></div>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">ใบแจ้งหนี้ ({detail.invoices.length} รายการ)</h3>
              {detail.invoices.length === 0 ? (
                <div className="text-sm text-zinc-500">ไม่มีใบแจ้งหนี้</div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left px-3 py-2">วันที่ออก</th>
                        <th className="text-left px-3 py-2">วันครบกำหนด</th>
                        <th className="text-left px-3 py-2">สถานะ</th>
                        <th className="text-left px-3 py-2">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.invoices.map((inv) => (
                        <tr key={inv.uuid} className="border-t">
                          <td className="px-3 py-2">{inv.invoice_date || "-"}</td>
                          <td className="px-3 py-2">{inv.payment_date || "-"}</td>
                          <td className="px-3 py-2">{inv.status || "-"}</td>
                          <td className="px-3 py-2">{inv.details || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SharedShell>
  );
}