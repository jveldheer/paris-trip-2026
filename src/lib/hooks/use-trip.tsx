"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Trip, Member, TripDay } from "@/types"
import { getSupabaseClient } from "@/lib/supabase/client"

interface TripContextValue {
  tripCode: string | null
  trip: Trip | null
  members: Member[]
  currentMember: Member | null
  tripDays: TripDay[]
  setCurrentMember: (member: Member) => void
  supabase: ReturnType<typeof getSupabaseClient>
  loading: boolean
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
  const [tripCode, setTripCode] = useState<string | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [currentMember, setCurrentMemberState] = useState<Member | null>(null)
  const [tripDays, setTripDays] = useState<TripDay[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = getSupabaseClient(tripCode || undefined)

  useEffect(() => {
    const code = getCookie("trip_access")
    if (code) {
      setTripCode(code)
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!tripCode) return

    async function loadTrip() {
      const client = getSupabaseClient(tripCode!)

      const { data: tripData } = await client
        .from("trips")
        .select("*")
        .eq("code", tripCode!)
        .single()

      if (tripData) {
        setTrip(tripData)

        const [membersRes, daysRes] = await Promise.all([
          client.from("members").select("*").eq("trip_id", tripData.id).order("sort_order"),
          client.from("trip_days").select("*").eq("trip_id", tripData.id).order("day_number"),
        ])

        setMembers(membersRes.data || [])
        setTripDays(daysRes.data || [])

        const memberId = getCookie("member_id")
        if (memberId && membersRes.data) {
          const found = membersRes.data.find((m: Member) => m.id === memberId)
          if (found) setCurrentMemberState(found)
        }
      }
      setLoading(false)
    }

    loadTrip()
  }, [tripCode])

  function setCurrentMember(member: Member) {
    setCurrentMemberState(member)
    setCookie("member_id", member.id, 90)
  }

  return (
    <TripContext.Provider
      value={{ tripCode, trip, members, currentMember, tripDays, setCurrentMember, supabase, loading }}
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
