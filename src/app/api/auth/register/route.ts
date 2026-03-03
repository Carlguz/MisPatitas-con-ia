
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

  try {
    const { email, password, name, role, phone } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "VALIDATION_ERROR: Faltan campos requeridos." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SERVER_CONFIG_ERROR: Las variables de entorno de Supabase no están configuradas.");
    }

    // Usamos el cliente Admin para tener control total
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const mappedRole = mapRole(role);

    // Creamos el usuario directamente con el cliente admin
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Marcamos el email como confirmado para evitar el problema de la clave foránea
      user_metadata: { 
        name,
        phone,
        role: mappedRole
      },
    });

    if (signUpError) {
      // Manejo de errores más específico para conflictos de email
      if (signUpError.message.includes('duplicate key value') || signUpError.message.includes('already exists')) {
        return NextResponse.json({ error: "AUTH_CONFLICT_ERROR: El correo electrónico ya está registrado." }, { status: 409 });
      }
      throw new Error(`AUTH_SIGNUP_ERROR: ${signUpError.message}`);
    }

    if (!user) {
      throw new Error("AUTH_CRITICAL_ERROR: El objeto de usuario no fue devuelto tras el registro.");
    }

    userIdForCleanup = user.id; // Guardamos el ID para posible limpieza en caso de error posterior

    // Si el rol es Vendedor o Paseador, insertamos en la tabla correspondiente
    if (mappedRole === 'SELLER') {
      const { error: sellerError } = await supabaseAdmin.from('sellers').insert({
        userId: user.id,
        storeName: `${name}'s Store`, // Nombre de tienda por defecto
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
        pricePerHour: 0, // Precio inicial por defecto
      });
      if (walkerError) {
        throw new Error(`DB_INSERT_WALKER_ERROR: ${walkerError.message} (Code: ${walkerError.code})`);
      }
    }
    
    // Devolvemos una respuesta exitosa
    return NextResponse.json({ message: "Usuario registrado con éxito.", userId: user.id }, { status: 201 });

  } catch (error: any) {
    // Bloque de limpieza: Si algo falla después de crear el usuario en Auth, lo eliminamos para evitar datos huérfanos.
    if (userIdForCleanup) {
      try {
        const supabaseAdminForCleanup = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await supabaseAdminForCleanup.auth.admin.deleteUser(userIdForCleanup);
      } catch (cleanupError: any) {
        console.error("CRITICAL_CLEANUP_ERROR: Falló la limpieza del usuario.", cleanupError.message);
        // Aún así devolvemos el error original al cliente
      }
    }

    console.error("REGISTRATION_GLOBAL_ERROR:", error.message);
    return NextResponse.json(
      { error: `ERROR_CAPTURADO: ${error.message}` },
      { status: 500 }
    );
  }
}
