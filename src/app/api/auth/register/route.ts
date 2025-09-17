
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Definición de tipo para el rol de usuario
type UserRole = 'ADMIN' | 'SELLER' | 'WALKER' | 'CUSTOMER';

// Función para mapear roles de entrada a roles estandarizados
function mapRole(input: unknown): UserRole {
  const r = String(input ?? "").trim().toLowerCase();
  if (["paseador", "dog_walker", "dog walker", "walker", "paseador(a)"].includes(r)) {
    return 'WALKER';
  }
  if (["vendedor", "seller"].includes(r)) {
    return 'SELLER';
  }
  return 'CUSTOMER';
}

export async function POST(request: NextRequest) {
  const { email, password, name, role, phone } = await request.json();

  if (!email || !password || !name || !role) {
    return NextResponse.json(
      { error: "Email, contraseña, nombre y rol son requeridos" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Registrar el usuario en Supabase Auth (usando el cliente estándar)
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      },
    },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: signUpError.status || 400 });
  }

  if (!user) {
    return NextResponse.json({ error: 'No se pudo crear el usuario.' }, { status: 500 });
  }

  // === INICIO DE LA CORRECCIÓN ===
  // 2. Crear un cliente de Supabase con privilegios de administrador (service_role)
  //    para poder saltar las políticas de RLS al crear perfiles.
  //    Las variables de entorno deben estar configuradas en Vercel.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const mappedRole = mapRole(role);

  // 3. Insertar el perfil en la tabla 'profiles' USANDO EL CLIENTE ADMIN
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: user.id,
    name,
    phone,
    role: mappedRole,
  });

  if (profileError) {
    // Si la creación del perfil falla, borramos el usuario de auth para evitar inconsistencias.
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return NextResponse.json(
      { error: `Error al crear el perfil: ${profileError.message}` },
      { status: 500 }
    );
  }

  // 4. Si es Vendedor o Paseador, crear la entrada en la tabla correspondiente USANDO EL CLIENTE ADMIN
  if (mappedRole === 'SELLER') {
    const { error: sellerError } = await supabaseAdmin.from('sellers').insert({
      profileId: user.id,
      storeName: `${name}'s Store`, // Valor por defecto
    });
    if (sellerError) {
       console.error('Error al crear la entrada de vendedor:', sellerError.message);
       // En un escenario real, aquí deberíamos deshacer los pasos anteriores (borrar perfil y usuario)
    }
  } else if (mappedRole === 'WALKER') {
    const { error: walkerError } = await supabaseAdmin.from('walkers').insert({
      profileId: user.id,
      pricePerHour: 0, // El usuario deberá configurar esto más tarde
    });
     if (walkerError) {
       console.error('Error al crear la entrada de paseador:', walkerError.message);
    }
  }
  // === FIN DE LA CORRECCIÓN ===

  return NextResponse.json({ message: "Usuario registrado con éxito. Por favor, revisa tu correo para confirmar la cuenta.", user }, { status: 201 });
}
