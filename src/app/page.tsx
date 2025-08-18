export default function Home() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis Patitas</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li><a className="underline" href="/admin">/admin</a></li>
        <li><a className="underline" href="/login">/login</a></li>
        <li><a className="underline" href="/dashboard">/dashboard</a></li>
      </ul>
    </main>
  );
}
