
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();

  // CORRECCIÓN: Implementación correcta del manejador de cookies para @supabase/ssr
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Invalidar la sesión del usuario
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase Logout Error:', error.message);
    return NextResponse.json(
      { error: 'Ocurrió un error durante el cierre de sesión.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Sesión cerrada con éxito' }, { status: 200 });
}
