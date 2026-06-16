export async function fetchTable() {
  return new Promise<{ columns: string[]; data: any[] }>((res) =>
    setTimeout(
      () =>
        res({
          columns: ["ID", "Name", "Email", "Role"],
          data: [
            { ID: 1, Name: "Alice", Email: "alice@example.com", Role: "Admin" },
            { ID: 2, Name: "Bob", Email: "bob@example.com", Role: "Editor" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
            { ID: 3, Name: "Carol", Email: "carol@example.com", Role: "Viewer" },
          ],
        }),
      300
    )
  );
}

export async function submitForm(payload: any) {
  return new Promise((res) => setTimeout(() => res({ ok: true, payload }), 400));
}

export async function sendMessage(message: string) {
  return new Promise<string>((res) => setTimeout(() => res(`(mock) Echo: ${message}`), 600));
}
