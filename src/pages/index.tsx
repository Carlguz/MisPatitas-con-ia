export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Mis Patitas</h1>
      <ul>
        <li><a href="/auth/signin">/auth/signin (iniciar sesión)</a></li>
        <li><a href="/auth/signup">/auth/signup (crear cuenta)</a></li>
        <li><a href="/admin">/admin</a></li>
        <li><a href="/customer">/customer</a></li>
        <li><a href="/supabase-test">/supabase-test (prueba UI)</a></li>
      </ul>
    </main>
  );
}
