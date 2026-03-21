import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /trip routes
  if (!pathname.startsWith("/trip")) {
    return NextResponse.next()
  }

  const hasAuth = request.cookies.get("trip_auth")?.value === "1"
  if (!hasAuth) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/trip/:path*"],
}
