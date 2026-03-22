"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { WeatherIcon, getWeatherGradient, getWeatherLabel } from "@/components/weather/weather-icons"

const SWIPE_CITIES = [
  { key: "Paris", lat: 48.8566, lon: 2.3522, name: "Paris", flag: "\uD83D\uDDFC" },
  { key: "Saint-Raphael", lat: 43.4252, lon: 6.7673, name: "Saint-Rapha\u00EBl", flag: "\uD83C\uDF0A" },
  { key: "Lisbon", lat: 38.7167, lon: -9.1333, name: "Lisbon", flag: "\uD83C\uDDF5\uD83C\uDDF9" },
] as const

const toF = (c: number | null | undefined): string =>
  c == null ? "--" : `${Math.round(c * 9 / 5 + 32)}`

interface DayForecast {
  date: string
  max: number | null
  min: number | null
  code: number
}

interface CityWeather {
  forecast: DayForecast[]
  loaded: boolean
}

export function WeatherWidget() {
  const [cityIndex, setCityIndex] = useState(0)
  const [weatherData, setWeatherData] = useState<CityWeather[]>(
    SWIPE_CITIES.map(() => ({ forecast: [], loaded: false }))
  )
  const [loading, setLoading] = useState(true)
  const [fading, setFading] = useState(false)
  const [hasSwiped, setHasSwiped] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    const fetches = SWIPE_CITIES.map((city) =>
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=4`
      )
        .then((r) => r.json())
        .then((data) => {
          const days: DayForecast[] = data.daily.time.map((date: string, i: number) => ({
            date,
            max: data.daily.temperature_2m_max[i] ?? null,
            min: data.daily.temperature_2m_min[i] ?? null,
            code: data.daily.weathercode[i] ?? 2,
          }))
          return { forecast: days, loaded: true }
        })
        .catch(() => ({ forecast: [] as DayForecast[], loaded: true }))
    )

    Promise.all(fetches).then((results) => {
      setWeatherData(results)
      setLoading(false)
    })
  }, [])

  const switchCity = useCallback((newIndex: number) => {
    setFading(true)
    setHasSwiped(true)
    setTimeout(() => {
      setCityIndex(newIndex)
      setFading(false)
    }, 150)
  }, [])

  const goNext = useCallback(() => {
    switchCity((cityIndex + 1) % SWIPE_CITIES.length)
  }, [cityIndex, switchCity])

  const goPrev = useCallback(() => {
    switchCity((cityIndex - 1 + SWIPE_CITIES.length) % SWIPE_CITIES.length)
  }, [cityIndex, switchCity])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    touchStartX.current = e.clientX
    touchStartY.current = e.clientY
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const deltaX = e.clientX - touchStartX.current
      const deltaY = e.clientY - touchStartY.current
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) goNext()
        else goPrev()
      }
    },
    [goNext, goPrev]
  )

  const city = SWIPE_CITIES[cityIndex]
  const data = weatherData[cityIndex]
  const today = data.forecast[0]
  const upcoming = data.forecast.slice(1, 4)
  const gradient = today ? getWeatherGradient(today.code) : "from-sky-400 via-sky-300 to-blue-200"

  return (
    <div className="mx-4">
      <Link href="/trip/weather" className="block">
      <div
        className={cn(
          "rounded-lg overflow-hidden bg-gradient-to-br shadow-lg border border-white/20 relative transition-all duration-300",
          gradient
        )}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        {/* Ambient decoration */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
          <WeatherIcon code={today?.code ?? 2} size={120} />
        </div>

        {/* Left chevron */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev() }}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-1 text-white/50 hover:text-white/80 transition-colors"
          aria-label="Previous city"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Right chevron */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext() }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-1 text-white/50 hover:text-white/80 transition-colors"
          aria-label="Next city"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Fading content wrapper */}
        <div
          className={cn(
            "transition-opacity duration-150",
            fading ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
            <span className="font-serif text-base font-semibold text-white/90 tracking-wide">
              {city.flag} {city.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/90 font-medium">
              Full forecast <ChevronRight className="h-3 w-3" />
            </span>
          </div>

          {loading ? (
            <div className="px-4 pb-4">
              <div className="h-12 bg-white/20 rounded-lg animate-pulse" />
            </div>
          ) : today ? (
            <>
              {/* Today */}
              <div className="flex items-center gap-4 px-4 pb-3 relative z-10">
                <WeatherIcon code={today.code} size={48} />
                <div>
                  <div
                    className="text-4xl font-light text-white"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
                  >
                    {toF(today.max)}
                    {today.max != null ? "\u00B0F" : ""}
                  </div>
                  <div className="text-xs text-white/90">
                    {getWeatherLabel(today.code)} &middot; Low {toF(today.min)}
                    {today.min != null ? "\u00B0F" : ""}
                  </div>
                </div>
              </div>

              {/* 3-day strip */}
              {upcoming.length > 0 && (
                <div className="grid grid-cols-3 divide-x divide-white/20 border-t border-white/25 relative z-10">
                  {upcoming.map((day) => {
                    const d = new Date(day.date + "T12:00:00")
                    const label = d.toLocaleDateString("en-US", { weekday: "short" })
                    return (
                      <div key={day.date} className="flex flex-col items-center py-3 gap-1.5">
                        <span className="text-xs text-white/80 font-medium">{label}</span>
                        <WeatherIcon code={day.code} size={24} />
                        <span className="text-xs font-semibold text-white">
                          {toF(day.max)}
                          {"\u00B0"}{" "}
                          <span className="font-normal text-white/80">
                            {toF(day.min)}
                            {"\u00B0"}
                          </span>
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

        {/* Dot indicators + hint */}
        <div className="flex flex-col items-center pb-3 pt-1 relative z-10 gap-1">
          <div className="flex items-center gap-2">
            {SWIPE_CITIES.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (i !== cityIndex) switchCity(i) }}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === cityIndex
                    ? "w-2 h-2 bg-[oklch(0.70_0.085_78)]"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Show ${SWIPE_CITIES[i].name} weather`}
              />
            ))}
          </div>
          {!hasSwiped && (
            <span className="text-[10px] text-white/40 select-none">
              swipe to see all cities
            </span>
          )}
        </div>
      </div>
      </Link>
    </div>
  )
}
