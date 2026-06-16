import DataTable from "../components/DataTable";
import SharedShell from "../SharedShell";
import PageHeader from "../components/PageHeader";
import Container from "../components/Container";

export default function DashboardPage() {
  return (
    <SharedShell>
      <Container>
        <div className="space-y-4">
          <PageHeader title="Dashboard" subtitle="Overview & examples" />
          <div className="bg-white shadow rounded-lg p-6">
            <DataTable />
          </div>
        </div>
      </Container>
    </SharedShell>
  );
}
