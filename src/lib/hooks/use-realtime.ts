"use client"

import { useEffect, useRef } from "react"
import { useTrip } from "./use-trip"
import { RealtimeChannel } from "@supabase/supabase-js"

export function useRealtime<T extends { id: string }>(
  table: string,
  onInsert: (record: T) => void,
  onUpdate?: (record: T) => void,
  onDelete?: (id: string) => void
) {
  const { supabase, trip } = useTrip()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!trip) return

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table, filter: `trip_id=eq.${trip.id}` },
        (payload) => onInsert(payload.new as T)
      )

    if (onUpdate) {
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table, filter: `trip_id=eq.${trip.id}` },
        (payload) => onUpdate(payload.new as T)
      )
    }

    if (onDelete) {
      channel.on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table, filter: `trip_id=eq.${trip.id}` },
        (payload) => onDelete((payload.old as { id: string }).id)
      )
    }

    channel.subscribe()
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [table, trip?.id])
}
