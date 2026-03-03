
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Sesión cerrada con éxito' }, { status: 200 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Invalidate the user's session
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase Logout Error:', error.message);
    return NextResponse.json(
      { error: 'Ocurrió un error durante el cierre de sesión.' },
      { status: 500 }
    );
  }

  return response;
}
