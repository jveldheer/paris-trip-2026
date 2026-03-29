"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Trip, Member, TripDay } from "@/types"
import { getSupabaseClient } from "@/lib/supabase/client"
import { TRIP_CODE, STATIC_TRIP, STATIC_MEMBERS, STATIC_TRIP_DAYS } from "@/lib/constants"

interface TripContextValue {
  trip: Trip | null
  members: Member[]
  currentMember: Member | null
  tripDays: TripDay[]
  setCurrentMember: (member: Member) => void
  supabase: ReturnType<typeof getSupabaseClient>
  loading: boolean
  isOffline: boolean
}

const TripContext = createContext<TripContextValue | null>(null)

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [currentMember, setCurrentMemberState] = useState<Member | null>(null)
  const [tripDays, setTripDays] = useState<TripDay[]>([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false)

  const supabase = getSupabaseClient()

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])

  useEffect(() => {
    async function loadTrip() {
      // Skip Supabase entirely if using placeholder credentials
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder") || supabaseUrl.includes("your-project")

      if (isPlaceholder) {
        setTrip(STATIC_TRIP)
        setMembers(STATIC_MEMBERS)
        setTripDays(STATIC_TRIP_DAYS)
        const memberId = getCookie("member_id")
        if (memberId) {
          const found = STATIC_MEMBERS.find((m) => m.id === memberId)
          if (found) setCurrentMemberState(found)
        }
        setLoading(false)
        return
      }

      try {
        const client = getSupabaseClient()

        const { data: tripData, error: tripError } = await client
          .from("trips")
          .select("*")
          .eq("code", TRIP_CODE)
          .single()

        if (tripError || !tripData) {
          throw new Error("Supabase unavailable")
        }

        setTrip(tripData)

        const [membersRes, daysRes] = await Promise.all([
          client.from("members").select("*").eq("trip_id", tripData.id).order("sort_order"),
          client.from("trip_days").select("*").eq("trip_id", tripData.id).order("day_number"),
        ])

        const loadedMembers = membersRes.data && membersRes.data.length > 0
          ? membersRes.data
          : STATIC_MEMBERS
        const loadedDays = daysRes.data && daysRes.data.length > 0
          ? daysRes.data
          : STATIC_TRIP_DAYS

        setMembers(loadedMembers)
        setTripDays(loadedDays)

        const memberId = getCookie("member_id")
        if (memberId) {
          const found = loadedMembers.find((m: Member) => m.id === memberId)
          if (found) setCurrentMemberState(found)
        }
      } catch {
        // Supabase unavailable — silently use static data
        setTrip(STATIC_TRIP)
        setMembers(STATIC_MEMBERS)
        setTripDays(STATIC_TRIP_DAYS)

        const memberId = getCookie("member_id")
        if (memberId) {
          const found = STATIC_MEMBERS.find((m) => m.id === memberId)
          if (found) setCurrentMemberState(found)
        }
      }
      setLoading(false)
    }

    loadTrip()
  }, [])

  function setCurrentMember(member: Member) {
    setCurrentMemberState(member)
    setCookie("member_id", member.id, 90)
  }

  return (
    <TripContext.Provider
      value={{ trip, members, currentMember, tripDays, setCurrentMember, supabase, loading, isOffline }}
    >
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error("useTrip must be used within TripProvider")
  return ctx
}
