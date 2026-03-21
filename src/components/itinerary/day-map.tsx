"use client"

// DayMap — SSR-safe wrapper that dynamically imports the Leaflet map component.
// Leaflet requires the browser's `window` object, so it must never run on the server.

import dynamic from "next/dynamic"
import type { ItineraryItem } from "@/types"
import type { CityName } from "@/lib/constants"

// Dynamic import with ssr: false — the canonical pattern for Leaflet in Next.js
const DayMapInner = dynamic(
  () => import("@/components/itinerary/day-map-inner").then((m) => m.DayMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 rounded-2xl bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading map…</span>
      </div>
    ),
  }
)

interface DayMapProps {
  items: ItineraryItem[]
  city: CityName
}

export function DayMap({ items, city }: DayMapProps) {
  // Show the map even if no pins have coordinates — DayMapInner will center on the city.
  // Only hide if there are literally no items at all.
  if (items.length === 0) return null

  return <DayMapInner items={items} city={city} />
}
