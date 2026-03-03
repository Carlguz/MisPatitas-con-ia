
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define user roles and their corresponding dashboards
const roleDashboards: { [key: string]: string } = {
  WALKER: '/walker',
  SELLER: '/seller',
  ADMIN: '/admin',
  CLIENT: '/customer', // Assuming 'CUSTOMER' maps to '/customer'
};

// Public routes that do not require authentication
const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/privacy', '/terms', '/contact', '/faq'];

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // If the user is not authenticated
  if (!session) {
    if (publicRoutes.includes(pathname)) {
      return response;
    }
    const isProtectedRoute = Object.values(roleDashboards).some(dashboard => pathname.startsWith(dashboard));
    if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    return response;
  }

  // If the user is authenticated
  // Fetch user role from your database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Error fetching user profile or profile not found:', error);
    // You might want to sign out the user if their profile is missing
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  const userRole = profile.role as keyof typeof roleDashboards;
  const dashboardUrl = roleDashboards[userRole];

  // If user is on an auth page, redirect them to their dashboard
  if (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup')) {
    return NextResponse.redirect(new URL(dashboardUrl || '/', req.url));
  }
  
  // If user is on the homepage, redirect to their dashboard
  if (dashboardUrl && pathname === '/') {
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }
  
  // If user tries to access a dashboard that is not theirs, redirect them
  if (dashboardUrl && !pathname.startsWith(dashboardUrl)) {
    const isTryingToAccessAnotherDashboard = Object.values(roleDashboards).some(d => pathname.startsWith(d));
    if (isTryingToAccessAnotherDashboard) {
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
