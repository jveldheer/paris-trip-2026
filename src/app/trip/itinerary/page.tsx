"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DayList } from "@/components/itinerary/day-list"

export default function ItineraryPage() {
  return (
    <div className="pb-24">
      <PageHeader title="Itinerary" />
      <DayList />
    </div>
  )
}
