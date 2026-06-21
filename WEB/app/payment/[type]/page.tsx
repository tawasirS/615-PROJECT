import SharedShell from "../../SharedShell";
import PaymentView from "../../components/PaymentView";
import { notFound } from "next/navigation";

const VIEWS: Record<string, { title: string; description: string; filter: "area" | "electric" | "water" | "all" }> = {
  area: { title: "รายการค่าเช่า", description: "จัดการค่าเช่าตามพื้นที่", filter: "area" },
  rent: { title: "ค่าเช่า", description: "รายการค่าเช่าทั้งหมด", filter: "all" },
  electricity: { title: "ระบบไฟฟ้า", description: "จัดการค่าไฟฟ้าและมิเตอร์ไฟฟ้า", filter: "electric" },
  water: { title: "ระบบน้ำ", description: "จัดการค่าน้ำและมิเตอร์น้ำ", filter: "water" },
  summary: { title: "การชำระเงินทั้งหมด", description: "ดูรายการชำระเงินทั้งหมดในระบบ", filter: "all" },
};

export default async function PaymentPage(props: { params: Promise<{ type: string }> }) {
  const { type } = await props.params;
  const view = VIEWS[type];

  if (!view) {
    notFound();
  }

  return (
    <SharedShell>
      <PaymentView title={view.title} description={view.description} filter={view.filter} />
    </SharedShell>
  );
}
