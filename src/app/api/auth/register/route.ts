
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Mapeo de roles de entrada a los roles definidos en el ENUM de la base de datos
// Asegúrate de que estos valores coincidan con tu ENUM 'UserRole'
type UserRole = 'CUSTOMER' | 'WALKER' | 'SELLER';

function mapRole(input: string): UserRole {
  const r = input.toLowerCase();
  if (r.includes('walker') || r.includes('paseador')) return 'WALKER';
  if (r.includes('seller') || r.includes('vendedor')) return 'SELLER';
  return 'CUSTOMER';
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extraer y validar los datos del cuerpo de la solicitud
    const { email, password, name, role, phone } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "VALIDATION_ERROR: Faltan campos requeridos (email, password, name, role)." }, { status: 400 });
    }

    // 2. Validar la configuración del servidor
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SERVER_CONFIG_ERROR: Las variables de entorno de Supabase no están configuradas.");
      return NextResponse.json({ error: "SERVER_CONFIG_ERROR: Error de configuración del servidor." }, { status: 500 });
    }

    // 3. Crear el cliente de Supabase Admin
    // Se usa la SERVICE_ROLE_KEY para tener permisos para crear usuarios.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } } // Opciones para un entorno de servidor
    );

    // 4. Mapear el rol de entrada al tipo de rol de la base de datos
    const mappedRole = mapRole(role);

    // 5. Crear el nuevo usuario en Supabase Auth
    // El trigger que hemos creado en la DB se encargará de crear el perfil público (walker, seller, etc.)
    const { data, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirma el email para que el usuario pueda iniciar sesión inmediatamente
      user_metadata: { 
        // Aquí pasamos los datos que el trigger necesitará
        name: name,
        phone: phone,
        role: mappedRole
      },
    });

    // 6. Manejar errores durante la creación del usuario
    if (signUpError) {
      console.error('AUTH_SIGNUP_ERROR:', signUpError.message);
      // Devolver un error específico si el email ya existe
      if (signUpError.message.includes('already exists')) {
        return NextResponse.json({ error: "AUTH_CONFLICT_ERROR: El correo electrónico ya está registrado." }, { status: 409 });
      }
      // Devolver un error genérico para otros problemas de autenticación
      return NextResponse.json({ error: `AUTH_SIGNUP_ERROR: ${signUpError.message}` }, { status: 500 });
    }

    if (!data.user) {
      console.error("AUTH_CRITICAL_ERROR: El objeto de usuario no fue devuelto tras el registro.");
      return NextResponse.json({ error: "AUTH_CRITICAL_ERROR: No se pudo crear el usuario." }, { status: 500 });
    }

    // 7. Devolver una respuesta exitosa
    // El trabajo del backend termina aquí. El trigger de la DB se encarga del resto.
    return NextResponse.json({ 
      message: "Usuario registrado con éxito. El perfil se está creando.", 
      userId: data.user.id,
      role: mappedRole 
    }, { status: 201 });

  } catch (error: any) {
    // 8. Manejo de errores inesperados (global)
    console.error("REGISTRATION_GLOBAL_ERROR:", error.message);
    return NextResponse.json(
      { error: `ERROR_INESPERADO_EN_REGISTRO: ${error.message}` },
      { status: 500 }
    );
  }
}
