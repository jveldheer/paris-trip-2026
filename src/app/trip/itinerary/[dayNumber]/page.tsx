"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useTrip } from "@/lib/hooks/use-trip"
import { PageHeader } from "@/components/shared/page-header"
import { CityBadge } from "@/components/shared/city-badge"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { DayTimeline } from "@/components/itinerary/day-timeline"
import { DayMap } from "@/components/itinerary/day-map"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/trip-utils"
import { CITY_COLORS } from "@/lib/constants"
import { STATIC_ITINERARY } from "@/lib/trip-data"
import type { ItineraryItem } from "@/types"
import type { CityName } from "@/lib/constants"

const TOTAL_DAYS = 15

export default function DayDetailPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>
}) {
  const { dayNumber: dayStr } = use(params)
  const dayNumber = parseInt(dayStr, 10)

  const { tripDays, supabase, loading: tripLoading } = useTrip()
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState(false)

  const day = tripDays.find((d) => d.day_number === dayNumber)

  useEffect(() => {
    if (!day) return
    setItemsLoading(true)
    setItemsError(false)

    supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_day_id", day.id)
      .order("sort_order")
      .then(({ data, error }) => {
        const sortByTime = (a: ItineraryItem, b: ItineraryItem) => {
          // Items without a time go first (all-day markers like birthdays)
          if (!a.start_time && !b.start_time) return a.sort_order - b.sort_order
          if (!a.start_time) return -1
          if (!b.start_time) return 1
          return a.start_time.localeCompare(b.start_time)
        }
        if (error || !data || data.length === 0) {
          // Fall back to static itinerary data
          const staticItems = (STATIC_ITINERARY[day.date] ?? []).slice().sort(sortByTime)
          setItems(staticItems)
          setItemsError(false)
        } else {
          setItems(data.slice().sort(sortByTime))
        }
        setItemsLoading(false)
      })
  }, [day?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ───────────────────────────────────────────────────────────────
  if (tripLoading) {
    return (
      <div className="pb-24">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 h-14" />
        <LoadingSkeleton count={5} />
      </div>
    )
  }

  // ── Invalid day ───────────────────────────────────────────────────────────
  if (!day) {
    return (
      <div className="pb-24">
        <PageHeader title="Day not found" backHref="/trip/itinerary" />
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground px-4 text-center">
          <AlertCircle className="h-10 w-10" />
          <p className="font-medium">Day {dayNumber} doesn&apos;t exist on this trip.</p>
          <Link href="/trip/itinerary">
            <Button variant="outline" size="sm">Back to Itinerary</Button>
          </Link>
        </div>
      </div>
    )
  }

  const city = day.city as CityName
  const colors = CITY_COLORS[city]

  const prevDay = tripDays.find((d) => d.day_number === dayNumber - 1)
  const nextDay = tripDays.find((d) => d.day_number === dayNumber + 1)

  return (
    <div className="pb-28">
      {/* Sticky header */}
      <PageHeader title={day.title} backHref="/trip/itinerary">
        <CityBadge city={city} />
      </PageHeader>

      {/* City hero bar */}
      <div className={`bg-gradient-to-r ${colors.gradient} px-4 py-4`}>
        <h2 className="font-serif text-3xl font-medium italic text-white">{city}</h2>
        <p className="text-xs tracking-[0.18em] uppercase text-white/70 mt-1">
          Day {day.day_number + 2} of {TOTAL_DAYS}&nbsp;&bull;&nbsp;{formatDate(day.date)}
        </p>
        {day.summary && (
          <p className="text-white/90 text-sm mt-1.5 leading-snug">{day.summary}</p>
        )}
      </div>

      {/* Map */}
      <div className="px-4 pt-4">
        {itemsLoading ? (
          <div className="h-56 rounded-2xl bg-muted animate-pulse" />
        ) : (
          <DayMap items={items} city={city} />
        )}
      </div>

      {/* Timeline */}
      <div className="mt-4">
        {itemsLoading ? (
          <LoadingSkeleton count={4} />
        ) : itemsError ? (
          <div className="flex items-center gap-2 px-4 py-6 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Could not load itinerary items. Check your connection and try again.</span>
          </div>
        ) : (
          <DayTimeline items={items} city={city} />
        )}
      </div>

      {/* Prev / Next day navigation */}
      <div className="flex items-center justify-between px-4 mt-6">
        {dayNumber > -1 ? (
          <Link href={`/trip/itinerary/${dayNumber - 1}`}>
            <Button variant="outline" size="sm" className="gap-1.5 max-w-[160px]">
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {prevDay ? prevDay.title : `Day ${dayNumber + 1}`}
              </span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {dayNumber < 13 ? (
          <Link href={`/trip/itinerary/${dayNumber + 1}`}>
            <Button variant="outline" size="sm" className="gap-1.5 max-w-[160px]">
              <span className="truncate">
                {nextDay ? nextDay.title : `Day ${dayNumber + 3}`}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Floating "Add a moment" button */}
      <Link
        href={`/trip/moments?day=${day.id}`}
        className="fixed bottom-24 right-4 z-20"
        aria-label="Add a moment for this day"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            size="lg"
            className="rounded-full h-14 w-14 p-0 shadow-xl border-2 border-white/30"
            style={{ backgroundColor: colors.accent }}
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          </Button>
        </motion.div>
      </Link>
    </div>
  )
}
