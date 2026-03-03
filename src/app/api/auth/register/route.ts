
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
  let userIdForCleanup: string | null = null;
  const tempResponse = new NextResponse();

  try {
    const { email, password, name, role, phone } = await request.json();

    // --- DEBUGGING START ---
    console.log("--- INICIANDO DEPURACIÓN DE REGISTRO ---");
    console.log("URL de Supabase recibida:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Clave Anónima de Supabase cargada:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Sí' : 'No');
    console.log("Clave de Servicio de Supabase cargada:", process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Sí' : 'No');
    // --- DEBUGGING END ---

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "VALIDATION_ERROR: Faltan campos requeridos." }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SERVER_CONFIG_ERROR: La variable de entorno SUPABASE_SERVICE_ROLE_KEY no está configurada.");
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            tempResponse.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            tempResponse.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const mappedRole = mapRole(role);

    console.log("Intentando registrar usuario en Supabase...");
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role: mappedRole } },
    });

    if (signUpError) {
      console.error("Error específico de Supabase signUp:", signUpError);
      throw new Error(`AUTH_SIGNUP_ERROR: ${signUpError.message}`);
    }
    if (!user) {
      throw new Error("AUTH_CRITICAL_ERROR: El objeto de usuario no fue devuelto tras el registro.");
    }

    console.log("Usuario registrado en Auth con éxito. ID:", user.id);
    userIdForCleanup = user.id;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (mappedRole === 'SELLER') {
      console.log("Insertando en la tabla 'sellers'...");
      const { error: sellerError } = await supabaseAdmin.from('sellers').insert({
        userId: user.id,
        storeName: `${name}'s Store`,
        isApproved: false,
      });
      if (sellerError) {
        throw new Error(`DB_INSERT_SELLER_ERROR: ${sellerError.message} (Code: ${sellerError.code})`);
      }
    } else if (mappedRole === 'WALKER') {
      console.log("Insertando en la tabla 'walkers'...");
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
    
    console.log("Proceso de registro completado con éxito.");
    const finalResponse = NextResponse.json({ message: "Usuario registrado con éxito.", user }, { status: 201 });
    const cookieHeader = tempResponse.headers.get('Set-Cookie');
    if (cookieHeader) {
      finalResponse.headers.set('Set-Cookie', cookieHeader);
    }
    return finalResponse;

  } catch (error: any) {
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
