import SharedShell from "../../SharedShell";
import EntityTable from "../../components/EntityTable";
import { EntityType } from "../../lib/entity-config";

export default async function DataPage(props: { params: Promise<{ type: string }> }) {
  const { type } = await props.params;

  // Map URL path to entity type
  const typeMap: Record<string, EntityType> = {
    area: "area",
    tenant: "tenant",
    contract: "contract",
    invoice: "invoice",
    meter: "meter",
    payment: "payment",
    document: "document",
    user: "user",
  };

  const entityType = typeMap[type];

  if (!entityType) {
    return (
      <SharedShell>
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold text-zinc-600">ไม่พบข้อมูลประเภทนี้</h1>
          <p className="text-zinc-400 mt-2">กรุณาตรวจสอบ URL อีกครั้ง</p>
        </div>
      </SharedShell>
    );
  }

  return (
    <SharedShell>
      <EntityTable type={entityType} />
    </SharedShell>
  );
}
