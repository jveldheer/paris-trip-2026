import { NextResponse } from "next/server"

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production"
  const cookieFlags = [
    "trip_auth=",
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
    ...(isProduction ? ["Secure"] : []),
  ].join("; ")

  const response = NextResponse.json({ success: true })
  response.headers.set("Set-Cookie", cookieFlags)
  return response
}
