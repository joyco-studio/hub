import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { trackDownload } from "@/lib/track"

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const componentName = pathname.replace(/^\/r\//, "").replace(/\.json$/, "")

  trackDownload(componentName)

  return NextResponse.next()
}

export const config = {
  matcher: "/r/:path*.json",
}
