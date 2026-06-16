import ComponentsDemo from "./ComponentsDemo";
import SharedShell from "../SharedShell";
import PageHeader from "./PageHeader";
import Container from "./Container";

export default function ComponentsPage() {
  return (
    <SharedShell>
      <Container>
        <PageHeader title="Components" subtitle="Reusable components demo" />
        <div className="bg-white shadow rounded-lg p-6">
          <ComponentsDemo />
        </div>
      </Container>
    </SharedShell>
  );
}
