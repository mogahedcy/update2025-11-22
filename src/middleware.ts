import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // تحويل من non-www إلى www (مهم جداً للـ SEO)
  // هذا يمنع تكرار المحتوى ويوحد الفهرسة في محركات البحث
  if (hostname === 'aldeyarksa.tech' && process.env.NODE_ENV === 'production') {
    url.host = 'www.aldeyarksa.tech'
    return NextResponse.redirect(url, 301) // 301 = Permanent Redirect
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // إضافة Canonical URL header للمساعدة في SEO
  response.headers.set('Link', `<https://www.aldeyarksa.tech${url.pathname}>; rel="canonical"`)

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*|manifest.json|images/|uploads/).*)',
  ],
}
