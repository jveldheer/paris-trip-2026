"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { TRIP_CODE } from "@/lib/constants"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

let _client: SupabaseClient | null = null

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { "x-trip-code": TRIP_CODE },
      },
    })
  }
  return _client
}

export function getStorageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${path}`
}
