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

export function getCityColor(city: City): string {
  const colors: Record<City, string> = {
    Paris: "#1e3a5f",
    "Saint-Raphael": "#c2410c",
    Lisbon: "#0d9488",
    NYC: "#1f2937",
  }
  return colors[city]
}

export async function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ratio = Math.min(maxWidth / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.85)
    }
    img.src = URL.createObjectURL(file)
  })
}

export function getMapUrl(address: string): string {
  const encoded = encodeURIComponent(address)
  return `https://maps.apple.com/?q=${encoded}`
}
