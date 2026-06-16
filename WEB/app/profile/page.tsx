import SharedShell from "../SharedShell";
import PageHeader from "../components/PageHeader";
import Container from "../components/Container";

export default function ProfilePage() {
  return (
    <SharedShell>
      <Container>
        <PageHeader title="Profile" subtitle="Your account details" />
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-zinc-100 rounded-full" />
            <div>
              <div className="font-medium">Demo User</div>
              <div className="text-sm text-zinc-600">demo@example.com</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a className="px-4 py-2 bg-black text-white rounded" href="/">Back</a>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="px-4 py-2 border rounded">Logout</button>
            </form>
          </div>
        </div>
      </Container>
    </SharedShell>
  );
}
