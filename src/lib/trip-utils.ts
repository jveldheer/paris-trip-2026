import { format, differenceInDays, differenceInMinutes, parseISO } from "date-fns"
import { City } from "@/types"
import { TRIP_START, TRIP_END } from "./constants"

export function formatTime(dateStr: string | null): string {
  if (!dateStr) return ""
  return format(parseISO(dateStr), "h:mm a")
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "EEE, MMM d")
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d")
}

export function getTripStatus(): "before" | "during" | "after" {
  const now = new Date()
  const start = parseISO(TRIP_START)
  const end = parseISO(TRIP_END)
  if (now < start) return "before"
  if (now > end) return "after"
  return "during"
}

export function getCountdown(): { days: number; hours: number; minutes: number } {
  const now = new Date()
  const start = parseISO(TRIP_START)
  const totalMinutes = differenceInMinutes(start, now)
  if (totalMinutes <= 0) return { days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  return { days, hours, minutes }
}

export function getCurrentDayNumber(): number {
  const now = new Date()
  const start = parseISO(TRIP_START)
  const diff = differenceInDays(now, start)
  // day_number uses TRIP_DAYS_SEED scheme: Apr 1 = -1, Apr 2 = 0, Apr 3 = 1, etc.
  return Math.max(-1, Math.min(13, diff - 1))
}

export function getDaysSince(): number {
  const end = parseISO(TRIP_END)
  return differenceInDays(new Date(), end)
}

export function getCityForDay(dayNumber: number): City {
  if (dayNumber <= 0) return "NYC"
  if (dayNumber <= 3) return "Paris"
  if (dayNumber <= 8) return "Saint-Raphael"
  if (dayNumber <= 13) return "Lisbon"
  return "Lisbon"
}

export function getMapUrl(address: string): string {
  const encoded = encodeURIComponent(address)
  return `https://maps.apple.com/?q=${encoded}`
}
