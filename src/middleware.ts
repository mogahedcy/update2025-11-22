import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const localizedPages = ['/', '/about', '/contact', '/services/mazallat', '/portfolio'];

const nonLocalizedPages = ['/search', '/terms', '/quote', '/services/renovation', '/services/sawater', '/services/pergolas', '/services/landscaping', '/services/sandwich-panel', '/services/hangars'];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  const isArticleDetailPage = /^\/articles\/[^\/]+$/.test(pathname);
  const isNonLocalizedPage = nonLocalizedPages.some(page => pathname === page || pathname.startsWith(page + '/'));
  
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/login') ||
    isArticleDetailPage ||
    isNonLocalizedPage
  ) {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    
    return response;
  }
  
  if (hostname === 'aldeyarksa.tech' && process.env.NODE_ENV === 'production') {
    url.host = 'www.aldeyarksa.tech';
    return NextResponse.redirect(url, 301);
  }

  const cleanPath = pathname.replace(/^\/(ar|en)/, '') || '/';
  const isLocalizedPage = localizedPages.some(page => 
    cleanPath === page || cleanPath.startsWith(page + '/')
  );

  if (!isLocalizedPage && !pathname.startsWith('/ar') && !pathname.startsWith('/en')) {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    
    return response;
  }

  const response = intlMiddleware(request);
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  const locale = pathname.startsWith('/en') ? 'en' : 'ar';
  response.headers.set('Link', `<https://www.aldeyarksa.tech${cleanPath}>; rel="canonical", <https://www.aldeyarksa.tech/ar${cleanPath}>; rel="alternate"; hreflang="ar", <https://www.aldeyarksa.tech/en${cleanPath}>; rel="alternate"; hreflang="en", <https://www.aldeyarksa.tech${cleanPath}>; rel="alternate"; hreflang="x-default"`);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*|manifest.json|images/|uploads/).*)',
  ],
};
