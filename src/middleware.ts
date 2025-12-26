import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // ✅ Skip static assets, API, and dynamic articles
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/login') ||
    /^\/articles\/[^\/]+$/.test(pathname)
  ) {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  // ✅ Enforce www canonical domain (only in production)
  if (hostname === 'aldeyarksa.tech' && process.env.NODE_ENV === 'production') {
    url.host = 'www.aldeyarksa.tech';
    return NextResponse.redirect(url, 301);
  }

  // ✅ Apply next-intl middleware for all other routes
  // This handles locale detection and routing
  const response = intlMiddleware(request);
  
  // Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*|manifest.json|images/|uploads/).*)',
  ],
};
