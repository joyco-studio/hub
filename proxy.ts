import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { trackRegistryDownload } from '@/lib/track'

// Matches component JSONs like /r/button.json, excluding the /r/registry.json
// catalog index that shadcn fetches on init/add.
const REGISTRY_ITEM_PATH = /^\/r\/(?!registry\.json$)[\w-]+\.json$/

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (REGISTRY_ITEM_PATH.test(pathname)) {
    await trackRegistryDownload(request)
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

  const JOYCO_TEAM_ONLY_PATHS = ['/toolbox/ui', '/diagram-comparison']
  if (
    JOYCO_TEAM_ONLY_PATHS.includes(pathname) &&
    !request.cookies.has('joyco-team')
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.png$).*)',
}
