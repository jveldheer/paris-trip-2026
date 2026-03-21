"use client"

import { useState, useEffect, useCallback } from "react"
import { Archive, Lock } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { AddMemory } from "@/components/memory-jar/add-memory"
import { MemoryReveal } from "@/components/memory-jar/memory-reveal"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { useTrip } from "@/lib/hooks/use-trip"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getLocalItems, setLocalItems } from "@/lib/offline-storage"
import { TRIP_END } from "@/lib/constants"
import type { MemoryJarItem } from "@/types"
import { format } from "date-fns"

const STORAGE_KEY = "offline_memory_jar"

export default function MemoryJarPage() {
  const { trip, currentMember, isOffline } = useTrip()
  const [memories, setMemories] = useState<MemoryJarItem[]>([])
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), "yyyy-MM-dd")
  const tripEnded = today > TRIP_END

  const fetchMemories = useCallback(async () => {
    if (!trip) return

    if (isOffline) {
      setMemories(getLocalItems<MemoryJarItem>(STORAGE_KEY))
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from("memory_jar")
      .select("*")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true })
    if (data) setMemories(data as MemoryJarItem[])
    setLoading(false)
  }, [trip, isOffline])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  function handleAdded() {
    if (isOffline) {
      setMemories(getLocalItems<MemoryJarItem>(STORAGE_KEY))
    } else {
      fetchMemories()
    }
  }

  const sealedCount = memories.length

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Memory Jar" subtitle="Sweet notes sealed until the trip ends" />

      <div className="p-4 max-w-lg mx-auto pb-24 space-y-6">
        {loading ? (
          <LoadingSkeleton count={2} />
        ) : tripEnded ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white text-center shadow-lg">
              <div className="text-4xl mb-2 select-none">🏺</div>
              <h2 className="text-lg font-bold">The jar has broken open!</h2>
              <p className="text-sm text-amber-100 mt-1">
                {sealedCount} {sealedCount === 1 ? "memory is" : "memories are"} waiting to be revealed
              </p>
            </div>
            <MemoryReveal memories={memories} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 p-5 text-center">
              <div className="text-5xl mb-3 select-none">🏺</div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {sealedCount} {sealedCount === 1 ? "memory" : "memories"} sealed
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Notes are hidden until after April 15, 2026
              </p>
            </div>

            {trip && (
              <AddMemory
                tripId={trip.id}
                memberId={currentMember?.id ?? null}
                onAdded={handleAdded}
                isOffline={isOffline}
              />
            )}

            <div className="rounded-xl bg-muted/50 px-4 py-3 flex items-start gap-3">
              <Archive className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Memory jar notes are completely anonymous — nobody will know who wrote what until
                the jar opens on April 16. Write freely!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
