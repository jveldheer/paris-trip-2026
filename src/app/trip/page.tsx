"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Countdown } from "@/components/dashboard/countdown"
import { TodayCard } from "@/components/dashboard/today-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CityBadge } from "@/components/shared/city-badge"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useTrip } from "@/lib/hooks/use-trip"
import { getTripStatus, getCurrentDayNumber } from "@/lib/trip-utils"
import { CITY_COLORS } from "@/lib/constants"
import { MessageCircle } from "lucide-react"
import type { Moment, Member } from "@/types"

// ── Types ────────────────────────────────────────────────────────────────────

interface MomentWithMember extends Moment {
  member?: Member
}

// ── City Progress Indicator ───────────────────────────────────────────────────

function CityProgress() {
  const { tripDays } = useTrip()
  const status = getTripStatus()
  const currentDay = status === "during" ? getCurrentDayNumber() : status === "before" ? 0 : 13

  const cities = [
    { name: "Paris" as const, days: [1, 2, 3] },
    { name: "Saint-Raphael" as const, days: [4, 5, 6, 7, 8] },
    { name: "Lisbon" as const, days: [9, 10, 11, 12, 13] },
  ]

  if (!tripDays.length) return null

  return (
    <div className="px-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Trip Progress
      </h3>
      <div className="space-y-3">
        {cities.map(({ name, days }) => {
          const count = days.length
          const completedDays = days.filter((d) => d <= currentDay).length
          const pct = Math.round((count / 13) * 100)
          const completedPct = Math.round((completedDays / 13) * 100)
          const colors = CITY_COLORS[name]
          const isActive = days.includes(currentDay)

          return (
            <div key={name} className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <CityBadge city={name} size="sm" />
              </div>
              <div className="flex-1 relative">
                {/* background track (this city's allocation) */}
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: colors.bg, width: `${pct}%` }}
                >
                  {/* filled portion */}
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${count > 0 ? (completedDays / count) * 100 : 0}%`,
                      backgroundColor: isActive ? colors.accent : completedDays === count ? colors.primary : colors.accent + "80",
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                {count}d
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Recent Activity ───────────────────────────────────────────────────────────

function RecentActivity() {
  const { supabase, trip, members, isOffline } = useTrip()
  const [moments, setMoments] = useState<MomentWithMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!trip) return
    setLoading(true)

    if (isOffline) {
      // Load from localStorage in offline mode
      try {
        const raw = localStorage.getItem("offline_moments")
        const local = raw ? JSON.parse(raw) : []
        const enriched: MomentWithMember[] = local.slice(0, 5).map((m: any) => ({
          ...m,
          member: members.find((mb) => mb.id === m.member_id),
        }))
        setMoments(enriched)
      } catch {
        setMoments([])
      }
      setLoading(false)
      return
    }

    supabase
      .from("moments")
      .select("*")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data, error: err }) => {
        if (err) {
          setError(true)
          setLoading(false)
          return
        }
        const enriched: MomentWithMember[] = (data ?? []).map((m) => ({
          ...m,
          member: members.find((mb) => mb.id === m.member_id),
        }))
        setMoments(enriched)
        setLoading(false)
      })
  }, [trip?.id, members.length, isOffline]) // eslint-disable-line react-hooks/exhaustive-deps

  const momentTypeEmoji: Record<string, string> = {
    note: "📝",
    quote: "💬",
    funny: "😂",
    highlight: "⭐",
  }

  return (
    <div className="px-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Recent Moments
      </h3>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <p className="text-sm text-muted-foreground">Could not load activity.</p>
      ) : moments.length === 0 ? (
        <EmptyState title="No moments shared yet" description="Be the first to share a moment!" icon={MessageCircle} />
      ) : (
        <ul className="space-y-3">
          {moments.map((moment) => (
            <li
              key={moment.id}
              className="flex items-start gap-3 bg-muted/40 rounded-2xl px-3 py-3"
            >
              {/* Emoji type indicator */}
              <span className="text-xl shrink-0 mt-0.5" aria-hidden>
                {momentTypeEmoji[moment.moment_type] ?? "📝"}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug line-clamp-2 text-foreground">
                  {moment.content}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {moment.member && (
                    <MemberAvatar member={moment.member} size="sm" showName={true} />
                  )}
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="pb-24 space-y-6 pt-2">
      {/* Hero countdown / day indicator */}
      <Countdown />

      {/* Today's card */}
      <TodayCard />

      {/* Quick action grid */}
      <QuickActions />

      <Separator className="mx-4" />

      {/* City progress */}
      <CityProgress />

      <Separator className="mx-4" />

      {/* Recent activity */}
      <RecentActivity />
    </div>
  )
}
