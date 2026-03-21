"use client"

import { useState } from "react"
import {
  Plane,
  TrainFront,
  Bed,
  Utensils,
  Ticket,
  Car,
  Coffee,
  CalendarDays,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ItineraryItemCard } from "@/components/itinerary/itinerary-item-card"
import { EmptyState } from "@/components/shared/empty-state"
import { CITY_COLORS } from "@/lib/constants"
import { formatTime } from "@/lib/trip-utils"
import type { ItineraryItem, ItineraryItemCategory } from "@/types"
import type { CityName } from "@/lib/constants"

// ── Small icon for the timeline dot ──────────────────────────────────────────

const CATEGORY_ICONS: Record<ItineraryItemCategory, React.ElementType> = {
  flight:     Plane,
  train:      TrainFront,
  hotel:      Bed,
  restaurant: Utensils,
  activity:   Ticket,
  transport:  Car,
  free_time:  Coffee,
}

// ── Timeline item ─────────────────────────────────────────────────────────────

function TimelineItem({
  item,
  accentColor,
  isLast,
  index,
}: {
  item: ItineraryItem
  accentColor: string
  isLast: boolean
  index: number
}) {
  const Icon = CATEGORY_ICONS[item.category] ?? Coffee

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
      className="flex gap-4"
    >
      {/* Left column: time + connector line */}
      <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
        {/* Time label */}
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums text-right w-full leading-none mt-3">
          {item.start_time ? formatTime(item.start_time) : ""}
        </span>

        {/* Dot */}
        <div
          className="mt-1.5 flex items-center justify-center w-8 h-8 rounded-full border-2 border-background shadow-sm shrink-0 z-10"
          style={{ backgroundColor: accentColor }}
        >
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Connector line */}
        {!isLast && (
          <div
            className="flex-1 w-0.5 mt-1 rounded-full opacity-30"
            style={{ backgroundColor: accentColor, minHeight: 20 }}
          />
        )}
      </div>

      {/* Right column: card */}
      <div className="flex-1 min-w-0 pb-4">
        <ItineraryItemCard item={item} />
      </div>
    </motion.div>
  )
}

// ── DayTimeline ───────────────────────────────────────────────────────────────

interface DayTimelineProps {
  items: ItineraryItem[]
  city?: CityName
}

export function DayTimeline({ items, city = "Paris" }: DayTimelineProps) {
  const colors = CITY_COLORS[city]

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nothing scheduled yet"
        description="No items have been added for this day yet."
      />
    )
  }

  return (
    <div className="px-4 pt-2">
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          item={item}
          accentColor={colors.accent}
          isLast={index === items.length - 1}
          index={index}
        />
      ))}
    </div>
  )
}
