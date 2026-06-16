export default function Footer() {
  return (
    <footer className="w-full border-t bg-white text-sm text-zinc-600">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} 615 Project V1</div>
        <div className="flex gap-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href="/profile" className="hover:underline">Profile</a>
        </div>
      </div>
    </footer>
  );
}
