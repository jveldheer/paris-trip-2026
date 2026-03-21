import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const { code } = await request.json()

  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false })
  }

  const supabase = await getServerSupabase()
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("code", code.toLowerCase().trim())
    .single()

  if (trip) {
    return NextResponse.json({ valid: true, tripId: trip.id })
  }

  return NextResponse.json({ valid: false })
}
