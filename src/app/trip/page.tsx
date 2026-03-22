"use client"

import { Countdown } from "@/components/dashboard/countdown"
import { TodayCard } from "@/components/dashboard/today-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { CityBadge } from "@/components/shared/city-badge"
import { useTrip } from "@/lib/hooks/use-trip"
import { getTripStatus, getCurrentDayNumber } from "@/lib/trip-utils"
import { CITY_COLORS } from "@/lib/constants"

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

      {/* Bottom breathing room before nav bar */}
      <div className="h-8" />
    </div>
  )
}
