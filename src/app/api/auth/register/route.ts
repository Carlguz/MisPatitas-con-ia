
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type UserRole = 'CLIENT' | 'WALKER' | 'SELLER' | 'ADMIN';

function mapRole(input: string): UserRole {
  const r = input.toLowerCase();
  if (r.includes('walker') || r.includes('paseador')) return 'WALKER';
  if (r.includes('seller') || r.includes('vendedor')) return 'SELLER';
  return 'CLIENT';
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  let userIdForCleanup: string | null = null;

  try {
    const { email, password, name, role, phone } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "VALIDATION_ERROR: Faltan campos requeridos." }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SERVER_CONFIG_ERROR: La variable de entorno SUPABASE_SERVICE_ROLE_KEY no está configurada.");
    }

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

    const mappedRole = mapRole(role);

    // --- Paso 1: Registrar usuario en Supabase Auth ---
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role: mappedRole } },
    });

    if (signUpError) {
      throw new Error(`AUTH_SIGNUP_ERROR: ${signUpError.message}`);
    }
    if (!user) {
      throw new Error("AUTH_CRITICAL_ERROR: El objeto de usuario no fue devuelto tras el registro.");
    }

    userIdForCleanup = user.id;

    // --- Paso 2: Lógica de roles (Vendedor/Paseador) con cliente Admin ---
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (mappedRole === 'SELLER') {
      const { error: sellerError } = await supabaseAdmin.from('sellers').insert({
        userId: user.id,
        storeName: `${name}'s Store`,
        isApproved: false,
      });
      if (sellerError) {
        throw new Error(`DB_INSERT_SELLER_ERROR: ${sellerError.message} (Code: ${sellerError.code})`);
      }
    } else if (mappedRole === 'WALKER') {
      const { error: walkerError } = await supabaseAdmin.from('walkers').insert({
        userId: user.id,
        name: name,
        isAvailable: true,
        isApproved: false,
        pricePerHour: 0,
      });
      if (walkerError) {
        throw new Error(`DB_INSERT_WALKER_ERROR: ${walkerError.message} (Code: ${walkerError.code})`);
      }
    }
    
    return NextResponse.json({ message: "Usuario registrado con éxito.", user }, { status: 201 });

  } catch (error: any) {
    // --- Bloque de Captura y Limpieza ---
    if (userIdForCleanup) {
      try {
        const supabaseAdminForCleanup = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await supabaseAdminForCleanup.auth.admin.deleteUser(userIdForCleanup);
      } catch (cleanupError: any) {
        console.error("CRITICAL_CLEANUP_ERROR: Falló la limpieza del usuario.", cleanupError.message);
      }
    }

    console.error("REGISTRATION_GLOBAL_ERROR:", error.message);
    return NextResponse.json(
      { error: `ERROR_CAPTURADO: ${error.message}` },
      { status: 500 }
    );
  }
}
