import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const localizedPages = ['/', '/about', '/contact', '/services/mazallat', '/services/sawater', '/services/byoot-shaar', '/services/khayyam', '/services/landscaping', '/services/pergolas', '/services/renovation', '/services/sandwich-panel', '/portfolio', '/search', '/quote'];

const nonLocalizedPages = ['/terms', '/services/hangars'];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // 🔒 السماح بالملفات الثابتة و API بدون تطبيق i18n
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

  // ✅ enforce www canonical domain
  if (hostname === 'aldeyarksa.tech' && process.env.NODE_ENV === 'production') {
    url.host = 'www.aldeyarksa.tech';
    return NextResponse.redirect(url, 301);
  }

  // ✅ إذا كان المسار بالفعل /ar/ أو /en/ لا تعيد التوجيه
  if (pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname === '/ar' || pathname === '/en') {
    const response = intlMiddleware(request);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    return response;
  }

  // ✅ للمسارات بدون locale، تطبيق i18n middleware
  const response = intlMiddleware(request);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*|manifest.json|images/|uploads/).*)',
  ],
};
