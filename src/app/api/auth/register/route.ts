
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// El enum "UserRole" ya existe en la base de datos.
// Aquí solo usamos los strings correspondientes.
type UserRole = 'ADMIN' | 'SELLER' | 'WALKER' | 'CUSTOMER';

function mapRole(input: unknown): UserRole {
  const r = String(input ?? "").trim().toLowerCase();
  if (["paseador", "dog_walker", "dog walker", "walker", "paseador(a)"].includes(r)) {
    return 'WALKER';
  }
  if (["vendedor", "seller"].includes(r)) {
    return 'SELLER';
  }
  // Por defecto, o si es 'cliente'
  return 'CUSTOMER';
}

export async function POST(request: NextRequest) {
  const { email, password, name, role, phone } = await request.json();
  
  // Validación mínima
  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, password y nombre son requeridos" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Registrar el usuario en Supabase Auth
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Los datos en 'options.data' se guardan en user_metadata en Supabase
      data: {
        name,
        phone,
      },
    },
  });

  if (signUpError) {
    console.error('Supabase SignUp Error:', signUpError.message);
    return NextResponse.json({ error: signUpError.message }, { status: signUpError.status || 400 });
  }

  if (!user) {
    console.error('Supabase SignUp Error: User object is null.');
    return NextResponse.json({ error: 'No se pudo crear la sesión del usuario.' }, { status: 500 });
  }

  // 2. Insertar el perfil público en la tabla 'profiles'
  const mappedRole = mapRole(role);
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    name,
    phone,
    role: mappedRole,
  });

  if (profileError) {
    console.error('Supabase Profile Insert Error:', profileError.message);
    
    // Si falla la creación del perfil, borramos el usuario de auth para evitar inconsistencias.
    await supabase.auth.admin.deleteUser(user.id);

    return NextResponse.json(
      { error: `Error al crear el perfil: ${profileError.message}` },
      { status: 500 }
    );
  }

  // 3. Si es Vendedor o Paseador, creamos la entrada en la tabla correspondiente.
  if (mappedRole === 'SELLER') {
    const { error: sellerError } = await supabase.from('sellers').insert({
      profileId: user.id,
      storeName: `${name}'s Store`, // Se usa un valor por defecto
    });
    if (sellerError) {
       console.error('Error creating seller entry:', sellerError.message);
       // Podrías añadir lógica para deshacer el registro si esto falla
    }
  } else if (mappedRole === 'WALKER') {
    const { error: walkerError } = await supabase.from('walkers').insert({
      profileId: user.id,
      pricePerHour: 0, // El usuario debe configurar esto después
    });
     if (walkerError) {
       console.error('Error creating walker entry:', walkerError.message);
       // Podrías añadir lógica para deshacer el registro si esto falla
    }
  }

  return NextResponse.json({ message: "Usuario registrado con éxito.", user }, { status: 201 });
}
