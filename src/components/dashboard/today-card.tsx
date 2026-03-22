"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, MapPin, ChevronRight, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CityBadge } from "@/components/shared/city-badge"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { useTrip } from "@/lib/hooks/use-trip"
import { getTripStatus, getCurrentDayNumber, formatTime } from "@/lib/trip-utils"
import { CITY_COLORS, CATEGORY_LABELS } from "@/lib/constants"
import { STATIC_ITINERARY } from "@/lib/trip-data"
import type { ItineraryItem } from "@/types"

export function TodayCard() {
  const { tripDays, supabase } = useTrip()
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const status = getTripStatus()
  // Before trip: show Day 1 as a preview. During trip: show today. After: show Day 13.
  const dayNumber =
    status === "during"
      ? getCurrentDayNumber()
      : status === "before"
      ? 1
      : 13

  const tripDay = tripDays.find((d) => d.day_number === dayNumber)

  useEffect(() => {
    if (!tripDay) return
    setLoading(true)
    setError(false)

    supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_day_id", tripDay.id)
      .order("sort_order")
      .limit(3)
      .then(({ data, error: err }) => {
        if (err || !data || data.length === 0) {
          // Fall back to static itinerary data
          const staticItems = STATIC_ITINERARY[tripDay.date] ?? []
          setItems(staticItems.slice(0, 3))
          setError(false)
        } else {
          setItems(data)
        }
        setLoading(false)
      })
  }, [tripDay?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!tripDay) return null

  const colors = CITY_COLORS[tripDay.city]

  const cardLabel =
    status === "during"
      ? "Today's Plan"
      : status === "before"
      ? "Day 1 Preview"
      : "Final Day"

  return (
    <Link href={`/trip/itinerary/${dayNumber}`} className="block mx-4">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
        {/* City-colored header bar */}
        <div
          className={`bg-gradient-to-r ${colors.gradient} px-4 py-3 flex items-center justify-between`}
        >
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">
              {cardLabel}
            </p>
            <h3 className="text-white font-bold text-base leading-tight mt-0.5">
              {tripDay.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <CityBadge city={tripDay.city} />
            <ChevronRight className="h-4 w-4 text-white/60" />
          </div>
        </div>

        <CardContent className="pt-3 pb-4 px-4">
          {loading ? (
            <LoadingSkeleton count={2} />
          ) : error ? (
            <p className="text-sm text-muted-foreground py-2">
              Could not load schedule.
            </p>
          ) : items.length === 0 ? (
            <div className="flex items-center gap-2 py-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <p className="text-sm">No items scheduled yet.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3 text-sm">
                  {/* Time pill */}
                  <div className="shrink-0 w-16 text-right">
                    {item.start_time ? (
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {formatTime(item.start_time)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </div>

                  {/* Dot + connector */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: colors.accent }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-snug truncate">{item.title}</p>
                    {item.location_name && (
                      <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="text-xs truncate">{item.location_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Category badge */}
                  <Badge variant="secondary" className="shrink-0 text-xs px-1.5 py-0 h-5">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground mt-3 text-right">
            Tap to see full day &rarr;
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
