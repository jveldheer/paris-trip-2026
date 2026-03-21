import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

export async function getServerSupabase() {
  const cookieStore = await cookies()
  const tripCode = cookieStore.get("trip_access")?.value || ""
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: tripCode ? { "x-trip-code": tripCode } : {},
    },
  })
}
