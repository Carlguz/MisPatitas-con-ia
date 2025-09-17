
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Si el usuario está logueado y está en la página de inicio
  if (session && (pathname === '/' || pathname === '/auth/signin')) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return res; // Procede sin redirección si hay un error
    }

    if (data) {
      const role = data.role;
      if (role === 'WALKER' && pathname !== '/walker') {
        return NextResponse.redirect(new URL('/walker', req.url));
      }
      if (role === 'SELLER' && pathname !== '/seller') {
        return NextResponse.redirect(new URL('/seller', req.url));
      }
      if (role === 'ADMIN' && pathname !== '/admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
