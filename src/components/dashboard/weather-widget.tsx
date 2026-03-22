"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CloudSun, ChevronRight } from "lucide-react"

const WMO_ICONS: Record<number, string> = {
  0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️",
  45: "🌫", 48: "🌫",
  51: "🌦", 53: "🌦", 55: "🌧",
  61: "🌧", 63: "🌧", 65: "🌧",
  71: "❄️", 73: "❄️", 75: "❄️",
  80: "🌦", 81: "🌦", 82: "⛈",
  95: "⛈",
}

const WMO_DESC: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Foggy",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Rain showers", 82: "Heavy showers",
  95: "Thunderstorm",
}

const CITIES = {
  NYC: { lat: 40.7128, lon: -74.006, name: "New York", dates: ["2026-04-01", "2026-04-02"] },
  Paris: { lat: 48.8566, lon: 2.3522, name: "Paris", dates: ["2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06"] },
  "Saint-Raphael": { lat: 43.4252, lon: 6.7673, name: "Saint-Raphaël", dates: ["2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10", "2026-04-11"] },
  Lisbon: { lat: 38.7167, lon: -9.1333, name: "Lisbon", dates: ["2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", "2026-04-15"] },
}

function getCurrentCity() {
  const today = new Date().toISOString().split("T")[0]
  for (const [city, data] of Object.entries(CITIES)) {
    if (data.dates.includes(today)) return { city, ...data }
  }
  // Pre-trip: show Paris (destination)
  return { city: "Paris", ...CITIES.Paris }
}

interface DayForecast {
  date: string
  max: number
  min: number
  code: number
}

export function WeatherWidget() {
  const [forecast, setForecast] = useState<DayForecast[]>([])
  const [loading, setLoading] = useState(true)
  const currentCity = getCurrentCity()

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentCity.lat}&longitude=${currentCity.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=4`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const days: DayForecast[] = data.daily.time.map((date: string, i: number) => ({
          date,
          max: Math.round(data.daily.temperature_2m_max[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          code: data.daily.weathercode[i],
        }))
        setForecast(days)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = forecast[0]
  const upcoming = forecast.slice(1, 4)

  return (
    <div className="mx-4">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <CloudSun className="h-4 w-4 text-sky-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Weather · {currentCity.name}
            </span>
          </div>
          <Link href="/trip/weather" className="flex items-center gap-1 text-xs text-sky-600 font-medium">
            Full forecast <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="px-4 pb-4">
            <div className="h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl animate-pulse" />
          </div>
        ) : today ? (
          <>
            {/* Today */}
            <div className="flex items-center gap-4 px-4 pb-3">
              <span className="text-4xl">{WMO_ICONS[today.code] ?? "🌤"}</span>
              <div>
                <div className="text-2xl font-bold text-foreground">{today.max}°C</div>
                <div className="text-xs text-muted-foreground">{WMO_DESC[today.code] ?? "Partly cloudy"} · Low {today.min}°C</div>
              </div>
            </div>

            {/* 3-day strip */}
            {upcoming.length > 0 && (
              <div className="grid grid-cols-3 border-t border-sky-100 dark:border-sky-900/50">
                {upcoming.map((day) => {
                  const d = new Date(day.date + "T12:00:00")
                  const label = d.toLocaleDateString("en-US", { weekday: "short" })
                  return (
                    <div key={day.date} className="flex flex-col items-center py-3 gap-1">
                      <span className="text-xs text-muted-foreground font-medium">{label}</span>
                      <span className="text-lg">{WMO_ICONS[day.code] ?? "🌤"}</span>
                      <span className="text-xs font-semibold">{day.max}° <span className="font-normal text-muted-foreground">{day.min}°</span></span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="px-4 pb-4 text-sm text-muted-foreground">Weather unavailable offline</div>
        )}
      </div>
    </div>
  )
}
