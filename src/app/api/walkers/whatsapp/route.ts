
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { walkerId } = await request.json();

  const { data: walker, error } = await supabase
    .from('walkers')
    .select('phone')
    .eq('id', walkerId)
    .single();

  if (error || !walker) {
    return NextResponse.json({ error: 'Paseador no encontrado' }, { status: 404 });
  }

  // Here you would typically integrate with a WhatsApp API provider
  // For this example, we'll just return the phone number.
  return NextResponse.json({ phoneNumber: walker.phone }, { status: 200 });
}
