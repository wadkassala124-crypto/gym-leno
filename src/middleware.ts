import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySignedToken } from '@/lib/security';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Extract admin token from cookie or Authorization header
  const tokenFromCookie = request.cookies.get('gym_admin_token')?.value;
  const tokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '').trim();
  const token = tokenFromCookie || tokenFromHeader;

  const verifiedUser = await verifySignedToken(token);
  const isAuthenticated = Boolean(verifiedUser);

  // 1. Protect Admin Pages (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      // Clean invalid cookie if present
      if (tokenFromCookie) res.cookies.delete('gym_admin_token');
      return res;
    }
  }

  // 2. Protect Sensitive GET Data Endpoints (PII protection)
  // a) Members list is strictly private
  if (pathname.startsWith('/api/members') && request.method === 'GET') {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول أولاً (Unauthorized)' },
        { status: 401 }
      );
    }
  }

  // b) Full Bookings list is private (only public if ?lookup= is queried for tracking)
  if (pathname.startsWith('/api/bookings') && request.method === 'GET') {
    const hasLookup = searchParams.has('lookup') && searchParams.get('lookup')?.trim();
    if (!hasLookup && !isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول أولاً (Unauthorized)' },
        { status: 401 }
      );
    }
  }

  // c) Automated Reminders (contains expiring member phones and WhatsApp URLs)
  if (pathname.startsWith('/api/automation/reminders') && request.method === 'GET') {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول أولاً (Unauthorized)' },
        { status: 401 }
      );
    }
  }

  // 3. Protect Sensitive Admin Mutation API Endpoints (POST, PUT, DELETE)
  const isProtectedApiMutation =
    (pathname.startsWith('/api/content') && request.method === 'POST') ||
    (pathname.startsWith('/api/video') && request.method === 'POST') ||
    (pathname.startsWith('/api/settings') && request.method === 'POST') ||
    (pathname.startsWith('/api/plans') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
    (pathname.startsWith('/api/payment-methods') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
    (pathname.startsWith('/api/members') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
    (pathname.startsWith('/api/trainers') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
    (pathname.startsWith('/api/programs') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
    (pathname.startsWith('/api/testimonials') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
    (pathname.startsWith('/api/media') && ['POST', 'DELETE'].includes(request.method)) ||
    (pathname === '/api/upload' && request.method === 'POST') ||
    (pathname.startsWith('/api/bookings') && ['PUT', 'DELETE'].includes(request.method)) ||
    (pathname.startsWith('/api/automation/reminders') && ['POST', 'PUT'].includes(request.method));

  if (isProtectedApiMutation) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول أولاً (Unauthorized)' },
        { status: 401 }
      );
    }
  }

  // 4. Inject Comprehensive HTTP Security Headers into every response
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
