"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Camera,
  MessageCircle,
  MapPin,
  Plane,
  ListChecks,
  BarChart3,
  Heart,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/stats/stat-card"
import { Leaderboard } from "@/components/stats/leaderboard"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { useTrip } from "@/lib/hooks/use-trip"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Member } from "@/types"

interface Stats {
  photos: number
  moments: number
  wishlistDone: number
  polls: number
  memories: number
  photosByMember: Record<string, number>
  momentsByMember: Record<string, number>
}

export default function StatsPage() {
  const { trip, members } = useTrip()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!trip) return
    const supabase = getSupabaseClient()

    const [photosRes, momentsRes, wishlistRes, pollsRes, memoryRes] = await Promise.all([
      supabase
        .from("photos")
        .select("id, member_id")
        .eq("trip_id", trip.id),
      supabase
        .from("moments")
        .select("id, member_id")
        .eq("trip_id", trip.id),
      supabase
        .from("wishlist_items")
        .select("id", { count: "exact" })
        .eq("trip_id", trip.id)
        .eq("checked", true),
      supabase
        .from("polls")
        .select("id", { count: "exact" })
        .eq("trip_id", trip.id),
      supabase
        .from("memory_jar")
        .select("id", { count: "exact" })
        .eq("trip_id", trip.id),
    ])

    const photosByMember: Record<string, number> = {}
    const momentsByMember: Record<string, number> = {}

    for (const p of photosRes.data ?? []) {
      photosByMember[p.member_id] = (photosByMember[p.member_id] ?? 0) + 1
    }
    for (const m of momentsRes.data ?? []) {
      momentsByMember[m.member_id] = (momentsByMember[m.member_id] ?? 0) + 1
    }

    setStats({
      photos: (photosRes.data ?? []).length,
      moments: (momentsRes.data ?? []).length,
      wishlistDone: wishlistRes.count ?? 0,
      polls: pollsRes.count ?? 0,
      memories: memoryRes.count ?? 0,
      photosByMember,
      momentsByMember,
    })
    setLoading(false)
  }, [trip])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const photoEntries = members
    .map((m: Member) => ({ member: m, count: stats?.photosByMember[m.id] ?? 0 }))
    .filter((e) => e.count > 0)

  const momentEntries = members
    .map((m: Member) => ({ member: m, count: stats?.momentsByMember[m.id] ?? 0 }))
    .filter((e) => e.count > 0)

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Trip Stats" subtitle="How are we doing?" />

      <div className="p-4 max-w-lg mx-auto pb-24 space-y-6">
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : stats ? (
          <>
            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Photos Taken"
                value={stats.photos}
                icon={Camera}
                color="bg-blue-100 dark:bg-blue-900/40"
                iconColor="text-blue-600"
              />
              <StatCard
                label="Moments Shared"
                value={stats.moments}
                icon={MessageCircle}
                color="bg-purple-100 dark:bg-purple-900/40"
                iconColor="text-purple-600"
              />
              <StatCard
                label="Cities Visited"
                value={3}
                icon={MapPin}
                color="bg-teal-100 dark:bg-teal-900/40"
                iconColor="text-teal-600"
              />
              <StatCard
                label="Countries Visited"
                value={2}
                icon={Plane}
                color="bg-amber-100 dark:bg-amber-900/40"
                iconColor="text-amber-600"
              />
              <StatCard
                label="Wishes Completed"
                value={stats.wishlistDone}
                icon={ListChecks}
                color="bg-green-100 dark:bg-green-900/40"
                iconColor="text-green-600"
              />
              <StatCard
                label="Polls Created"
                value={stats.polls}
                icon={BarChart3}
                color="bg-rose-100 dark:bg-rose-900/40"
                iconColor="text-rose-600"
              />
              <div className="col-span-2">
                <StatCard
                  label="Memory Jar Notes"
                  value={stats.memories}
                  icon={Heart}
                  color="bg-pink-100 dark:bg-pink-900/40"
                  iconColor="text-pink-600"
                />
              </div>
            </div>

            {/* Leaderboards */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Leaderboards
              </h2>
              <Leaderboard
                title="Most Photos"
                entries={photoEntries}
                unit="photos"
              />
              <Leaderboard
                title="Most Moments"
                entries={momentEntries}
                unit="moments"
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
