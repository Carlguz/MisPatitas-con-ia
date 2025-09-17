
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Invalidar la sesión del usuario en Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase Logout Error:', error.message);
    return NextResponse.json(
      { error: 'Ocurrió un error durante el cierre de sesión.' },
      { status: 500 }
    );
  }

  // Al cerrar sesión, Supabase Auth se encarga de eliminar las cookies de sesión.
  return NextResponse.json({ message: 'Sesión cerrada con éxito' }, { status: 200 });
}
