import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { trackDownload } from "@/lib/track"
import { getTopLevelPathsRedirects, source } from "@/lib/source"
import { APP_BASE_URL } from "./lib/constants"

const topLevelRedirects = getTopLevelPathsRedirects(source)

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isRegistryPath = pathname.startsWith("/r/")

  if (isRegistryPath) {
    const componentName = pathname.replace(/^\/r\//, "").replace(/\.json$/, "")
    await trackDownload(componentName)
  }

  const topLevelPathMatch = topLevelRedirects.find(([path]) => path === pathname)

  if (topLevelPathMatch) {
    return NextResponse.redirect(new URL(topLevelPathMatch[1], APP_BASE_URL))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.png$).*)',
}
