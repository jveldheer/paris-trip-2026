"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

function getTripCodeFromCookie(): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(/(^| )trip_access=([^;]+)/)
  return match ? decodeURIComponent(match[2]) : ""
}

export function getSupabaseClient(tripCode?: string) {
  const code = tripCode || getTripCodeFromCookie()
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: code ? { "x-trip-code": code } : {},
    },
  })
}

export function getStorageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${path}`
}
