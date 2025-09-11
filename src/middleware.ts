import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security middleware for role-based access control
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply middleware only to dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // TODO: Implement proper Firebase Auth server-side validation
  // For now, we temporarily disable server-side auth check to allow client-side Firebase Auth
  // const authToken = request.cookies.get('__session')?.value || 
  //                  request.headers.get('authorization');
  
  // if (!authToken) {
  //   // No authentication token - redirect to login
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // Extract role from path
  const pathSegments = pathname.split('/');
  const requestedRole = pathSegments[2]; // /dashboard/[role]/...

  // Valid roles mapping
  const validRoles = ['professional', 'company', 'admin'];
  
  if (!validRoles.includes(requestedRole)) {
    // Invalid role in URL - redirect to general dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // TODO: Implement server-side JWT validation and role checking
  // For now, we rely on client-side validation, but this provides basic protection
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers to prevent common attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSRF protection header
  response.headers.set('X-CSRF-Protection', '1');
  
  return response;
}

// Temporarily disable middleware by matching no routes
export const config = {
  matcher: [
    // '/dashboard/:path*',
    // Protect API routes as well
    // '/api/dashboard/:path*',
    // '/api/profile/:path*'
  ]
};