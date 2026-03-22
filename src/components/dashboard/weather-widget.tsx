"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { WeatherIcon, getWeatherGradient, getWeatherLabel } from "@/components/weather/weather-icons"

const CITIES = {
  NYC: { lat: 40.7128, lon: -74.006, name: "New York", dates: ["2026-04-01", "2026-04-02"] },
  Paris: { lat: 48.8566, lon: 2.3522, name: "Paris", dates: ["2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06"] },
  "Saint-Raphael": { lat: 43.4252, lon: 6.7673, name: "Saint-Rapha\u00EBl", dates: ["2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10", "2026-04-11"] },
  Lisbon: { lat: 38.7167, lon: -9.1333, name: "Lisbon", dates: ["2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", "2026-04-15"] },
}

const CITY_FLAGS: Record<string, string> = {
  "Paris": "\uD83D\uDDFC",
  "Saint-Rapha\u00EBl": "\uD83C\uDF0A",
  "New York": "\uD83D\uDDFD",
}
const DEFAULT_FLAG = "\uD83D\uDCCD"

function getCurrentCity() {
  const today = new Date().toISOString().split("T")[0]
  for (const [, data] of Object.entries(CITIES)) {
    if (data.dates.includes(today)) return data
  }
  return CITIES.Paris
}

const toF = (c: number | null | undefined): string =>
  c == null ? "--" : `${Math.round(c * 9 / 5 + 32)}`

interface DayForecast {
  date: string
  max: number | null
  min: number | null
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
          max: data.daily.temperature_2m_max[i] ?? null,
          min: data.daily.temperature_2m_min[i] ?? null,
          code: data.daily.weathercode[i] ?? 2,
        }))
        setForecast(days)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = forecast[0]
  const upcoming = forecast.slice(1, 4)
  const gradient = today ? getWeatherGradient(today.code) : "from-sky-400 via-sky-300 to-blue-200"

  return (
    <div className="mx-4">
      <div className={cn("rounded-3xl overflow-hidden bg-gradient-to-br shadow-lg border border-white/20", gradient, "relative")}>
        {/* Ambient decoration */}
        <div className="absolute top-2 right-2 opacity-[0.15] pointer-events-none">
          <WeatherIcon code={today?.code ?? 2} size={96} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
            Weather &middot; {CITY_FLAGS[currentCity.name] ?? DEFAULT_FLAG} {currentCity.name}
          </span>
          <Link href="/trip/weather" className="flex items-center gap-1 text-xs text-white/90 font-medium hover:text-white transition-colors">
            Full forecast <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="px-4 pb-4">
            <div className="h-12 bg-white/20 rounded-xl animate-pulse" />
          </div>
        ) : today ? (
          <>
            {/* Today */}
            <div className="flex items-center gap-4 px-4 pb-3 relative z-10">
              <WeatherIcon code={today.code} size={48} />
              <div>
                <div className="text-4xl font-light text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>{toF(today.max)}{today.max != null ? "\u00B0F" : ""}</div>
                <div className="text-xs text-white/90">{getWeatherLabel(today.code)} &middot; Low {toF(today.min)}{today.min != null ? "\u00B0F" : ""}</div>
              </div>
            </div>

            {/* 3-day strip */}
            {upcoming.length > 0 && (
              <div className="grid grid-cols-3 divide-x divide-white/20 border-t border-white/15 relative z-10">
                {upcoming.map((day) => {
                  const d = new Date(day.date + "T12:00:00")
                  const label = d.toLocaleDateString("en-US", { weekday: "short" })
                  return (
                    <div key={day.date} className="flex flex-col items-center py-3 gap-1.5">
                      <span className="text-xs text-white/60 font-medium">{label}</span>
                      <WeatherIcon code={day.code} size={24} />
                      <span className="text-xs font-semibold text-white">
                        {toF(day.max)}{"\u00B0"} <span className="font-normal text-white/70">{toF(day.min)}{"\u00B0"}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="px-4 pb-4 text-sm text-white/60">Weather unavailable</div>
        )}
      </div>
    </div>
  )
}
