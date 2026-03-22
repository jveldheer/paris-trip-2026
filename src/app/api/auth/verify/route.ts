import { NextRequest, NextResponse } from "next/server"

// In-memory rate limiting: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed, remaining } = getRateLimitInfo(ip)

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 15 minutes." },
      {
        status: 429,
        headers: { "Retry-After": "900" },
      }
    )
  }

  let body: { code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const tripCode = process.env.TRIP_CODE
  if (!tripCode) {
    console.error("TRIP_CODE environment variable is not set")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  if (!body.code || body.code !== tripCode) {
    return NextResponse.json(
      { error: "Incorrect password", remaining },
      { status: 401 }
    )
  }

  const isProduction = process.env.NODE_ENV === "production"
  const cookieFlags = [
    `trip_auth=1`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=${90 * 24 * 60 * 60}`,
    ...(isProduction ? ["Secure"] : []),
  ].join("; ")

  const response = NextResponse.json({ success: true })
  response.headers.set("Set-Cookie", cookieFlags)

  return response
}
