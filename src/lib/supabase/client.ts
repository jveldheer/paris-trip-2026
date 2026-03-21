"use client"

import { createClient } from "@supabase/supabase-js"
import { TRIP_CODE } from "@/lib/constants"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { "x-trip-code": TRIP_CODE },
    },
  })
}

export function getStorageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${path}`
}
