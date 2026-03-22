"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"
import { Countdown } from "@/components/dashboard/countdown"
import { TodayCard } from "@/components/dashboard/today-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { CityBadge } from "@/components/shared/city-badge"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
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
    <div className="px-6">
      <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1">
        Trip Progress
      </h3>
      <p className="text-[11px] text-muted-foreground/60 mb-3">Paris &middot; Saint-Rapha&euml;l &middot; Lisbon</p>
      <div className="space-y-3">
        {cities.map(({ name, days }) => {
          const count = days.length
          const completedDays = days.filter((d) => d <= currentDay).length
          const pct = Math.round((count / 13) * 100)
          const colors = CITY_COLORS[name]
          const isActive = days.includes(currentDay)

          return (
            <div key={name} className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <CityBadge city={name} size="sm" />
              </div>
              <div className="flex-1 relative">
                <div className="h-2 rounded-full bg-muted/40 w-full">
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.bg, width: `${pct}%` }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${count > 0 ? (completedDays / count) * 100 : 0}%`,
                        backgroundColor: isActive ? colors.accent : completedDays === count ? colors.primary : colors.accent + "80",
                      }}
                    />
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">
                {count} days
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

  const loadActivity = useCallback(() => {
    if (!trip) return
    setLoading(true)
    setError(false)

    if (isOffline) {
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
  }, [trip?.id, members, isOffline, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  const momentTypeEmoji: Record<string, string> = {
    note: "\u{1F4DD}",
    quote: "\u{1F4AC}",
    funny: "\u{1F602}",
    highlight: "\u2B50",
  }

  return (
    <div className="px-6">
      <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Recent Moments
      </h3>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <div>
          <p className="text-sm text-muted-foreground">Could not load activity.</p>
          <button
            onClick={loadActivity}
            className="border border-border text-sm text-muted-foreground px-3 py-1.5 rounded-lg mt-2"
          >
            Retry
          </button>
        </div>
      ) : moments.length === 0 ? (
        <EmptyState title="No moments shared yet" description="Be the first to share a moment!" icon={MessageCircle} />
      ) : (
        <ul className="space-y-3">
          {moments.map((moment) => (
            <li
              key={moment.id}
              className="flex items-start gap-3 bg-muted/40 rounded-lg px-4 py-3 border-l-2 border-brass/40"
            >
              <span className="text-xl shrink-0 mt-0.5" aria-hidden>
                {momentTypeEmoji[moment.moment_type] ?? "\u{1F4DD}"}
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
      {/* Programme header */}
      <div className="px-6 pt-4 pb-1 text-center">
        <div className="h-px bg-brass/40 mb-3" />
        <span className="font-serif italic text-sm text-muted-foreground tracking-wide">
          Veldheer Europe &middot; Avril 2026
        </span>
        <div className="h-px bg-brass/40 mt-3" />
      </div>

      {/* Hero countdown / day indicator */}
      <Countdown />

      {/* Today's card */}
      <TodayCard />

      {/* Weather widget */}
      <WeatherWidget />

      {/* Quick action grid */}
      <QuickActions />

      <div className="mx-6 h-px bg-border/60" />

      {/* City progress */}
      <CityProgress />

      <div className="mx-6 h-px bg-border/60" />

      {/* Recent activity */}
      <RecentActivity />
    </div>
  )
}
