import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { TRIP_DAYS_SEED, TRIP_START, TRIP_END } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitize(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength)
}

/**
 * Format a time portion from an ISO date string, e.g. "14:30" -> "2:30 PM"
 * Also handles bare time strings like "14:30".
 */
export function formatTimeSafe(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "h:mm a")
  } catch {
    // If it's already a bare time like "14:30", parse it manually
    const [hours, minutes] = dateStr.split(":").map(Number)
    const d = new Date()
    d.setHours(hours, minutes, 0, 0)
    return format(d, "h:mm a")
  }
}

/**
 * Format a date string (ISO) into a long human-readable date, e.g. "April 3, 2026"
 */
export function formatDateLong(dateStr: string): string {
  return format(parseISO(dateStr), "MMMM d, yyyy")
}

/**
 * Returns the city name for a given date based on the trip itinerary.
 */
export function getCityForDate(date: Date): "Paris" | "Saint-Raphael" | "Lisbon" | "NYC" | null {
  const dateStr = format(date, "yyyy-MM-dd")
  const day = TRIP_DAYS_SEED.find((d) => d.date === dateStr)
  return day ? day.city : null
}

/**
 * Returns the trip status and current day number relative to now.
 */
export function getTripStatusDetailed(now: Date): {
  status: "before" | "during" | "after"
  dayNumber: number | null
} {
  const nowStr = format(now, "yyyy-MM-dd")

  if (nowStr < TRIP_START) {
    return { status: "before", dayNumber: null }
  }

  if (nowStr > TRIP_END) {
    return { status: "after", dayNumber: null }
  }

  const day = TRIP_DAYS_SEED.find((d) => d.date === nowStr)
  return { status: "during", dayNumber: day ? day.day_number : null }
}

/**
 * Resize an image File client-side to a maximum width, returning a Blob.
 */
export function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const scale = img.width > maxWidth ? maxWidth / img.width : 1
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Canvas toBlob returned null"))
          }
        },
        file.type || "image/jpeg",
        0.85
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}
