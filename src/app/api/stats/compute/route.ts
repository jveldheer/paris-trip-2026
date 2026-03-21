import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

export async function GET(req: NextRequest) {
  const tripCode = req.headers.get("x-trip-code") || ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("code", tripCode)
    .single()

  if (!trip) {
    return NextResponse.json({ error: "Invalid trip" }, { status: 401 })
  }

  const tripId = trip.id

  const [photos, moments, wishlist, polls, memoryJar, members] =
    await Promise.all([
      supabase
        .from("photos")
        .select("id, member_id")
        .eq("trip_id", tripId),
      supabase
        .from("moments")
        .select("id, member_id")
        .eq("trip_id", tripId),
      supabase
        .from("wishlist_items")
        .select("id, checked")
        .eq("trip_id", tripId),
      supabase
        .from("polls")
        .select("id")
        .eq("trip_id", tripId),
      supabase
        .from("memory_jar")
        .select("id")
        .eq("trip_id", tripId),
      supabase
        .from("members")
        .select("id, name, emoji")
        .eq("trip_id", tripId)
        .order("sort_order"),
    ])

  const photosByMember: Record<string, number> = {}
  const momentsByMember: Record<string, number> = {}

  for (const p of photos.data || []) {
    photosByMember[p.member_id] = (photosByMember[p.member_id] || 0) + 1
  }
  for (const m of moments.data || []) {
    momentsByMember[m.member_id] = (momentsByMember[m.member_id] || 0) + 1
  }

  const memberList = members.data || []
  const photoLeaderboard = memberList
    .map((m) => ({ member: m, count: photosByMember[m.id] || 0 }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)

  const momentLeaderboard = memberList
    .map((m) => ({ member: m, count: momentsByMember[m.id] || 0 }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)

  return NextResponse.json(
    {
      totalPhotos: photos.data?.length || 0,
      totalMoments: moments.data?.length || 0,
      totalWishlistCompleted:
        wishlist.data?.filter((w) => w.checked).length || 0,
      totalWishlist: wishlist.data?.length || 0,
      totalPolls: polls.data?.length || 0,
      totalMemoryJar: memoryJar.data?.length || 0,
      cities: 3,
      countries: 2,
      photoLeaderboard,
      momentLeaderboard,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=60" },
    }
  )
}
