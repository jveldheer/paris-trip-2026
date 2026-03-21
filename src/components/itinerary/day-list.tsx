"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, CalendarDays } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CityBadge } from "@/components/shared/city-badge"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { useTrip } from "@/lib/hooks/use-trip"
import { formatDate } from "@/lib/trip-utils"
import { CITY_COLORS } from "@/lib/constants"
import { getTripStatus, getCurrentDayNumber } from "@/lib/trip-utils"
import type { City, TripDay } from "@/types"

// ── Item count per day ────────────────────────────────────────────────────────

function useItemCounts(tripDays: TripDay[]) {
  const { supabase } = useTrip()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!tripDays.length) return
    const ids = tripDays.map((d) => d.id)

    supabase
      .from("itinerary_items")
      .select("trip_day_id")
      .in("trip_day_id", ids)
      .then(({ data }) => {
        const map: Record<string, number> = {}
        for (const row of data ?? []) {
          map[row.trip_day_id] = (map[row.trip_day_id] ?? 0) + 1
        }
        setCounts(map)
      })
  }, [tripDays.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return counts
}

// ── City Section Header ───────────────────────────────────────────────────────

function CitySectionHeader({ city, dayCount }: { city: City; dayCount: number }) {
  const colors = CITY_COLORS[city]
  const flags: Record<City, string> = {
    Paris: "🇫🇷",
    "Saint-Raphael": "🇫🇷",
    Lisbon: "🇵🇹",
  }
  const taglines: Record<City, string> = {
    Paris: "7 days in the City of Light",
    "Saint-Raphael": "3 days on the Riviera",
    Lisbon: "3 days in the City of Seven Hills",
  }

  return (
    <div
      className={`bg-gradient-to-r ${colors.gradient} rounded-2xl px-4 py-4 mb-3 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-2xl">{flags[city]}</span>
            <h2 className="text-white text-xl font-bold">{city}</h2>
          </div>
          <p className="text-white/70 text-xs">{taglines[city]}</p>
        </div>
        <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
          <span className="text-white font-bold text-lg leading-none block">{dayCount}</span>
          <span className="text-white/70 text-xs">days</span>
        </div>
      </div>
    </div>
  )
}

// ── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({
  day,
  itemCount,
  isToday,
  index,
}: {
  day: TripDay
  itemCount: number
  isToday: boolean
  index: number
}) {
  const colors = CITY_COLORS[day.city]

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link href={`/trip/itinerary/${day.day_number}`}>
        <Card
          className={`
            hover:shadow-md active:scale-[0.99] transition-all duration-150 border
            ${isToday ? `border-2 shadow-md` : "border-border"}
          `}
          style={isToday ? { borderColor: colors.accent } : undefined}
        >
          <CardContent className="flex items-center gap-3 py-3 px-4">
            {/* Day number bubble */}
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 font-bold text-lg"
              style={
                isToday
                  ? { backgroundColor: colors.accent, color: "#fff" }
                  : { backgroundColor: colors.bg, color: colors.primary }
              }
            >
              {day.day_number}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-sm leading-snug truncate">{day.title}</p>
                {isToday && (
                  <Badge
                    className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                    style={{ backgroundColor: colors.accent }}
                  >
                    Today
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span className="text-xs">{formatDate(day.date)}</span>
              </div>
            </div>

            {/* Right side: city badge + item count + chevron */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <CityBadge city={day.city} size="sm" />
              {itemCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

// ── DayList ───────────────────────────────────────────────────────────────────

export function DayList() {
  const { tripDays, loading } = useTrip()
  const itemCounts = useItemCounts(tripDays)

  const status = getTripStatus()
  const currentDayNumber = status === "during" ? getCurrentDayNumber() : null

  const cityOrder: City[] = ["Paris", "Saint-Raphael", "Lisbon"]

  const grouped = tripDays.reduce(
    (acc, day) => {
      if (!acc[day.city]) acc[day.city] = []
      acc[day.city].push(day)
      return acc
    },
    {} as Record<string, TripDay[]>
  )

  if (loading) return <LoadingSkeleton count={6} />

  let globalIndex = 0

  return (
    <div className="space-y-8 px-4 pb-6">
      {cityOrder.map((city) => {
        const days = grouped[city]
        if (!days?.length) return null

        return (
          <section key={city}>
            <CitySectionHeader city={city} dayCount={days.length} />
            <div className="space-y-2">
              {days.map((day) => {
                const idx = globalIndex++
                return (
                  <DayCard
                    key={day.id}
                    day={day}
                    itemCount={itemCounts[day.id] ?? 0}
                    isToday={day.day_number === currentDayNumber}
                    index={idx}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
