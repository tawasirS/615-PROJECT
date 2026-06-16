import AIChat from "../components/AIChat";
import SharedShell from "../SharedShell";
import PageHeader from "../components/PageHeader";
import Container from "../components/Container";

export default function AIPage() {
  return (
    <SharedShell>
      <Container>
        <PageHeader title="AI Chat" subtitle="Demo chat interface (mock)" />
        <div className="bg-white shadow rounded-lg p-6">
          <AIChat />
        </div>
      </Container>
    </SharedShell>
  );
}
