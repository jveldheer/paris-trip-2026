"use client"

import { useState, useEffect, useCallback } from "react"
import { Paintbrush, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { DrawingCanvas } from "@/components/kids/drawing-canvas"
import { KidGallery } from "@/components/kids/kid-gallery"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { useTrip } from "@/lib/hooks/use-trip"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { KidDrawing, Member } from "@/types"

export default function KidsPage() {
  const { trip, currentMember, members } = useTrip()
  const [drawings, setDrawings] = useState<(KidDrawing & { member?: Member })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDrawings = useCallback(async () => {
    if (!trip) return
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from("kid_drawings")
      .select("*, member:members(*)")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: false })
    if (data) setDrawings(data as (KidDrawing & { member?: Member })[])
    setLoading(false)
  }, [trip])

  useEffect(() => {
    fetchDrawings()
  }, [fetchDrawings])

  const kidMembers = members.filter((m) => m.is_kid)
  const isKid = currentMember?.is_kid ?? false

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10">
      <PageHeader title="Kid Corner" subtitle="Draw, create, and have fun!" />

      <div className="p-4 max-w-lg mx-auto pb-24 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white text-center shadow-lg">
          <div className="text-4xl mb-1 select-none">🎨</div>
          <h2 className="text-lg font-bold">
            {isKid
              ? `Welcome, ${currentMember?.name}! Let's make art!`
              : "Kid Corner — Art Gallery"}
          </h2>
          <p className="text-sm text-purple-100 mt-0.5">
            {isKid
              ? "Draw anything you want and share it with everyone!"
              : "See what the kids are creating on the trip!"}
          </p>
        </div>

        {/* Drawing canvas — show for everyone but highlight for kids */}
        {trip && currentMember && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-bold text-foreground">
                {isKid ? "Your Canvas" : "Create a Drawing"}
              </h2>
            </div>
            <DrawingCanvas
              tripId={trip.id}
              memberId={currentMember.id}
              onSaved={fetchDrawings}
            />
          </div>
        )}

        {/* Gallery */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-600" />
            <h2 className="text-base font-bold text-foreground">Our Drawings</h2>
            {drawings.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                {drawings.length} {drawings.length === 1 ? "drawing" : "drawings"}
              </span>
            )}
          </div>
          {loading ? (
            <LoadingSkeleton variant="grid" count={4} />
          ) : (
            <KidGallery drawings={drawings} members={members} />
          )}
        </div>

        {/* Kid members list */}
        {kidMembers.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-card border border-purple-200 dark:border-purple-800 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Artists on this trip
            </p>
            <div className="flex flex-wrap gap-2">
              {kidMembers.map((kid) => (
                <div
                  key={kid.id}
                  className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-full px-3 py-1.5"
                >
                  <span className="text-lg select-none">{kid.emoji}</span>
                  <span className="text-sm font-medium">{kid.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
