
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Validación mínima
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son requeridos" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Usar la función de Supabase para iniciar sesión
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase Login Error:', error.message);
    return NextResponse.json(
      { error: "Credenciales inválidas. Por favor, verifica tu email y contraseña." },
      { status: 401 } // Unauthorized
    );
  }

  // Si el login es exitoso, Supabase automáticamente maneja la sesión del usuario a través de cookies.
  // La respuesta incluye el usuario y la sesión, pero no necesitamos hacer nada más aquí.
  return NextResponse.json({ message: "Inicio de sesión exitoso", user: data.user }, { status: 200 });
}
