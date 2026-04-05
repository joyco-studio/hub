import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { trackRegistryDownload } from '@/lib/track'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/r/')) {
    const componentName = pathname.replace(/^\/r\//, '').replace(/\.json$/, '')
    await trackRegistryDownload(request, componentName)
  }

  if (request.nextUrl.searchParams.get('joyco') === '1') {
    const response = NextResponse.next()
    response.cookies.set('joyco-team', '1', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.png$).*)',
}
