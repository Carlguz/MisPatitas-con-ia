
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define user roles and their corresponding dashboards
const roleDashboards: { [key: string]: string } = {
  WALKER: '/walker',
  SELLER: '/seller',
  ADMIN: '/admin',
  CUSTOMER: '/customer',
};

// Public routes that do not require authentication
const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/privacy', '/terms', '/contact', '/faq'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // If the user is not authenticated
  if (!session) {
    // Allow access to public routes
    if (publicRoutes.includes(pathname)) {
      return res;
    }
    // For any other protected route, redirect to the sign-in page
    const isProtectedRoute = Object.values(roleDashboards).some(dashboard => pathname.startsWith(dashboard));
    if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    return res;
  }

  // If the user is authenticated
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    // If profile is not found, redirect to home. This could be a sign-up completion step.
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  const userRole = data.role;
  const dashboardUrl = userRole ? roleDashboards[userRole] : undefined;

  // If user is on an auth page (signin/signup), redirect them to their dashboard or home
  if (pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL(dashboardUrl || '/', req.url));
  }
  
  // If the user has a designated dashboard and is trying to access a different one, redirect them.
  if (dashboardUrl && !pathname.startsWith(dashboardUrl)) {
    // Allow access to the root path
    if (pathname === '/') {
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
    // Check if path is another dashboard
    const isAnotherDashboard = Object.values(roleDashboards).some(d => pathname.startsWith(d));
    if(isAnotherDashboard) {
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
  }
  
  // If a user with a role lands on the home page, redirect to their dashboard
  if (dashboardUrl && pathname === '/') {
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
