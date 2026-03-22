"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { CloudRain, Sun, Thermometer, Wind, Droplets, Eye, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

// ── Types ────────────────────────────────────────────────────────────────────

interface DailyData {
  date: string
  tempMax: number
  tempMin: number
  precipProb: number
  weatherCode: number
  windMax: number
  uvMax: number
  sunrise: string
  sunset: string
}

interface HourlyData {
  time: string
  temp: number
  precipProb: number
  weatherCode: number
  windSpeed: number
}

interface CityForecast {
  city: string
  daily: DailyData[]
  hourly: HourlyData[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const CITIES = [
  { name: "Paris", lat: 48.8566, lon: 2.3522, dates: ["2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06"] },
  { name: "Saint-Raphael", lat: 43.4252, lon: 6.7673, dates: ["2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10", "2026-04-11"] },
  { name: "Lisbon", lat: 38.7167, lon: -9.1333, dates: ["2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", "2026-04-15"] },
] as const

const CITY_THEME: Record<string, { gradient: string; bg: string; text: string; ring: string; badge: string }> = {
  Paris: { gradient: "from-blue-600 to-blue-900", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", ring: "ring-blue-200 dark:ring-blue-800", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "Saint-Raphael": { gradient: "from-amber-500 to-orange-800", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-200 dark:ring-amber-800", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  Lisbon: { gradient: "from-teal-500 to-teal-800", bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-700 dark:text-teal-300", ring: "ring-teal-200 dark:ring-teal-800", badge: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
}

// ── WMO Weather Codes ────────────────────────────────────────────────────────

function getWeatherInfo(code: number): { emoji: string; label: string; type: "clear" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm" } {
  if (code === 0) return { emoji: "\u2600\uFE0F", label: "Clear sky", type: "clear" }
  if (code <= 3) return { emoji: "\uD83C\uDF24", label: "Partly cloudy", type: "cloudy" }
  if (code <= 48) return { emoji: "\uD83C\uDF2B", label: "Foggy", type: "fog" }
  if (code <= 55) return { emoji: "\uD83C\uDF26", label: "Drizzle", type: "drizzle" }
  if (code <= 65) return { emoji: "\uD83C\uDF27", label: "Rain", type: "rain" }
  if (code <= 75) return { emoji: "\u2744\uFE0F", label: "Snow", type: "snow" }
  if (code <= 82) return { emoji: "\uD83C\uDF26", label: "Rain showers", type: "rain" }
  if (code >= 95) return { emoji: "\u26C8", label: "Thunderstorm", type: "storm" }
  return { emoji: "\uD83C\uDF24", label: "Partly cloudy", type: "cloudy" }
}

function weatherBgClass(type: string): string {
  switch (type) {
    case "clear": return "bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20"
    case "cloudy": return "bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800/30 dark:to-blue-900/20"
    case "rain": case "drizzle": return "bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-900/30 dark:to-slate-800/30"
    case "snow": return "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900/30"
    case "storm": return "bg-gradient-to-br from-purple-100 to-slate-200 dark:from-purple-900/30 dark:to-slate-800/30"
    case "fog": return "bg-gradient-to-br from-gray-100 to-slate-50 dark:from-gray-800/30 dark:to-slate-900/30"
    default: return "bg-muted/40"
  }
}

// ── Temperature helpers ──────────────────────────────────────────────────────

function toF(c: number): number {
  return Math.round(c * 9 / 5 + 32)
}

function tempStr(c: number, useFahrenheit: boolean): string {
  return useFahrenheit ? `${toF(c)}\u00B0F` : `${Math.round(c)}\u00B0C`
}

// ── Clothing suggestions ─────────────────────────────────────────────────────

function getClothingSuggestion(temp: number, weatherType: string): { emoji: string; text: string; kidsNote: string } {
  const isRainy = weatherType === "rain" || weatherType === "drizzle" || weatherType === "storm"

  if (isRainy && temp < 15) {
    return { emoji: "\uD83E\uDDE5\uD83C\uDF02\uD83D\uDC62", text: "Rain jacket, waterproof boots, layers", kidsNote: "Kids: waterproof jacket + sturdy walking shoes" }
  }
  if (temp < 15) {
    return { emoji: "\uD83E\uDDE5\uD83E\uDDE3\uD83D\uDC5F", text: "Warm jacket, scarf, comfortable shoes", kidsNote: "Kids: warm layers + comfortable walking shoes" }
  }
  if (isRainy && temp < 20) {
    return { emoji: "\uD83D\uDC5F\uD83C\uDF02\uD83D\uDC55", text: "Light rain jacket, comfortable shoes", kidsNote: "Kids: rain jacket + extra layers + walking shoes" }
  }
  if (temp < 20) {
    return { emoji: "\uD83D\uDC5F\uD83E\uDDE3\uD83D\uDC55", text: "Light jacket, comfortable shoes", kidsNote: "Kids: layers + comfortable walking shoes" }
  }
  if (temp < 25) {
    return { emoji: "\uD83D\uDC57\uD83D\uDD76\uFE0F\uD83D\uDC5F", text: "Light layers, sunglasses, comfy shoes", kidsNote: "Kids: light layers + comfy walking shoes + sun hat" }
  }
  return { emoji: "\uD83E\uDE73\uD83D\uDC52\uD83D\uDD76\uFE0F", text: "Shorts, hat, sunscreen \u2014 stay hydrated!", kidsNote: "Kids: light clothes + hat + sunscreen + water bottle" }
}

// ── City climate cards ───────────────────────────────────────────────────────

const CITY_CLIMATE = [
  { city: "Paris", tagline: "City of Light", description: "April brings mild 14\u201318\u00B0C days, occasional showers. Pack layers.", emoji: "\uD83D\uDDFC" },
  { city: "Saint-Raphael", tagline: "French Riviera", description: "Warm 18\u201322\u00B0C, perfect beach weather. Lighter clothes!", emoji: "\uD83C\uDFD6\uFE0F" },
  { city: "Lisbon", tagline: "Lisboa", description: "Sunny and warm 18\u201323\u00B0C. The most summer-like of the trip.", emoji: "\u2600\uFE0F" },
]

// ── Get city for a date ──────────────────────────────────────────────────────

function getCityForDate(dateStr: string): string {
  for (const city of CITIES) {
    if ((city.dates as readonly string[]).includes(dateStr)) return city.name
  }
  return "Paris"
}

// ── API fetching ─────────────────────────────────────────────────────────────

async function fetchCityForecast(city: typeof CITIES[number]): Promise<CityForecast> {
  // Request from today + 16 days to capture as much trip data as possible
  // Open-Meteo returns climatological averages for dates beyond the 16-day window
  const today = new Date().toISOString().split("T")[0]
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,windspeed_10m_max,uv_index_max,sunrise,sunset&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m&timezone=auto&forecast_days=16`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch weather for ${city.name}`)
  const data = await res.json()

  const daily: DailyData[] = data.daily.time.map((t: string, i: number) => ({
    date: t,
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipProb: data.daily.precipitation_probability_max[i],
    weatherCode: data.daily.weathercode[i],
    windMax: data.daily.windspeed_10m_max[i],
    uvMax: data.daily.uv_index_max[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
  }))

  const hourly: HourlyData[] = data.hourly.time.map((t: string, i: number) => ({
    time: t,
    temp: data.hourly.temperature_2m[i],
    precipProb: data.hourly.precipitation_probability[i],
    weatherCode: data.hourly.weathercode[i],
    windSpeed: data.hourly.windspeed_10m[i],
  }))

  return { city: city.name, daily, hourly }
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function WeatherPage() {
  const [forecasts, setForecasts] = useState<CityForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("2026-04-03")
  const [useFahrenheit, setUseFahrenheit] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(CITIES.map(fetchCityForecast))
      setForecasts(results)
    } catch {
      setError("Weather data unavailable. Open-Meteo may not have forecast data this far out yet.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Build merged daily view: for each date, pick the city's forecast
  const tripDays = buildTripDays(forecasts)
  const selectedDay = tripDays.find(d => d.date === selectedDate) ?? tripDays[0]
  const selectedCity = getCityForDate(selectedDate)
  const selectedHourly = getHourlyForDate(forecasts, selectedDate, selectedCity)
  const alerts = buildAlerts(tripDays)

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Weather" subtitle="Apr 3\u201315 forecast">
        <button
          onClick={() => setUseFahrenheit(!useFahrenheit)}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          {useFahrenheit ? "\u00B0F" : "\u00B0C"}
        </button>
      </PageHeader>

      <div className="p-4 max-w-lg mx-auto pb-24 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading forecast...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <CloudRain className="h-8 w-8" />
            <p className="text-sm">{error}</p>
            <button onClick={loadData} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        ) : (
          <>
            {/* ── Alerts Banner ── */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={i} className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium",
                    alert.type === "rain"
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                      : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                  )}>
                    {alert.message}
                  </div>
                ))}
              </div>
            )}

            {/* ── Trip Overview Forecast ── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">13-Day Overview</h2>
              <div className="space-y-4">
                {CITIES.map(city => (
                  <div key={city.name}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", CITY_THEME[city.name].badge)}>
                        {city.name === "Saint-Raphael" ? "Saint-Rapha\u00EBl" : city.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(city.dates[0]), "MMM d")}\u2013{format(parseISO(city.dates[city.dates.length - 1]), "d")}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                      {city.dates.map(date => {
                        const day = tripDays.find(d => d.date === date)
                        if (!day) return null
                        const weather = getWeatherInfo(day.weatherCode)
                        const isSelected = date === selectedDate
                        return (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                              "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all text-center",
                              weatherBgClass(weather.type),
                              isSelected ? "ring-2 ring-primary shadow-md scale-105" : "hover:scale-102 hover:shadow-sm",
                            )}
                          >
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {format(parseISO(date), "EEE")}
                            </span>
                            <span className="text-[10px] font-semibold">{format(parseISO(date), "d")}</span>
                            <span className="text-lg leading-none weather-icon" data-type={weather.type}>{weather.emoji}</span>
                            <span className="text-[10px] font-semibold">
                              {tempStr(day.tempMax, useFahrenheit)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {tempStr(day.tempMin, useFahrenheit)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Daily Detail Card ── */}
            {selectedDay && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {format(parseISO(selectedDay.date), "EEEE, MMMM d")}
                </h2>
                <DailyDetailCard day={selectedDay} hourly={selectedHourly} city={selectedCity} useFahrenheit={useFahrenheit} />
              </section>
            )}

            {/* ── Clothing Suggestion ── */}
            {selectedDay && (
              <ClothingSuggestionCard temp={(selectedDay.tempMax + selectedDay.tempMin) / 2} weatherType={getWeatherInfo(selectedDay.weatherCode).type} />
            )}

            {/* ── City Climate Cards ── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">City Climate Guide</h2>
              <div className="space-y-3">
                {CITY_CLIMATE.map(c => (
                  <div key={c.city} className={cn("rounded-2xl p-4 border", CITY_THEME[c.city].bg, CITY_THEME[c.city].ring)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{c.emoji}</span>
                      <div>
                        <h3 className={cn("font-semibold text-sm", CITY_THEME[c.city].text)}>{c.tagline}</h3>
                        <span className="text-xs text-muted-foreground">{c.city === "Saint-Raphael" ? "Saint-Rapha\u00EBl" : c.city}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// ── Daily Detail Card component ──────────────────────────────────────────────

function DailyDetailCard({ day, hourly, city, useFahrenheit }: { day: DailyData; hourly: HourlyData[]; city: string; useFahrenheit: boolean }) {
  const weather = getWeatherInfo(day.weatherCode)
  const theme = CITY_THEME[city]

  return (
    <div className={cn("rounded-2xl overflow-hidden border", theme.ring)}>
      {/* Header */}
      <div className={cn("bg-gradient-to-r text-white px-4 py-4", theme.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl weather-icon" data-type={weather.type}>{weather.emoji}</span>
            <p className="text-sm opacity-90 mt-1">{weather.label}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{tempStr(day.tempMax, useFahrenheit)}</p>
            <p className="text-sm opacity-80">Low {tempStr(day.tempMin, useFahrenheit)}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1 px-3 py-3 bg-card">
        <StatItem icon={<Wind className="h-3.5 w-3.5" />} label="Wind" value={`${Math.round(day.windMax)} km/h`} />
        <StatItem icon={<Droplets className="h-3.5 w-3.5" />} label="Rain" value={`${day.precipProb}%`} />
        <StatItem icon={<Eye className="h-3.5 w-3.5" />} label="UV" value={`${Math.round(day.uvMax)}`} />
        <StatItem icon={<Sun className="h-3.5 w-3.5" />} label="Sun" value={formatSunTime(day.sunrise)} />
      </div>

      {/* Sunrise/Sunset */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 text-xs text-muted-foreground border-t border-border">
        <span>Sunrise {formatSunTime(day.sunrise)}</span>
        <span>Sunset {formatSunTime(day.sunset)}</span>
      </div>

      {/* Hourly breakdown */}
      {hourly.length > 0 && (
        <div className="px-3 py-3 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Hourly</h4>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {hourly.map((h, i) => {
              const hw = getWeatherInfo(h.weatherCode)
              return (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[52px] py-1.5 px-1 rounded-lg bg-muted/40">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {format(parseISO(h.time), "ha")}
                  </span>
                  <span className="text-base">{hw.emoji}</span>
                  <span className="text-xs font-semibold">{tempStr(h.temp, useFahrenheit)}</span>
                  {h.precipProb > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Droplets className="h-2.5 w-2.5 text-blue-500" />
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">{h.precipProb}%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-semibold">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

// ── Clothing Suggestion Card ─────────────────────────────────────────────────

function ClothingSuggestionCard({ temp, weatherType }: { temp: number; weatherType: string }) {
  const suggestion = getClothingSuggestion(temp, weatherType)

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">What to Wear</h2>
      <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{suggestion.emoji}</span>
          <p className="text-sm font-medium text-foreground">{suggestion.text}</p>
        </div>
        <div className="flex items-start gap-2 bg-muted/50 rounded-xl px-3 py-2">
          <span className="text-sm shrink-0">&#x1F9D2;</span>
          <p className="text-xs text-muted-foreground">{suggestion.kidsNote}</p>
        </div>
      </div>
    </section>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatSunTime(isoStr: string): string {
  try {
    return format(parseISO(isoStr), "h:mm a")
  } catch {
    return ""
  }
}

function buildTripDays(forecasts: CityForecast[]): DailyData[] {
  const allDates = [
    "2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06",
    "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10",
    "2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", "2026-04-15",
  ]

  return allDates.map(date => {
    const city = getCityForDate(date)
    const forecast = forecasts.find(f => f.city === city)
    const dayData = forecast?.daily.find(d => d.date === date)

    if (dayData) return dayData

    // Fallback if no data
    return {
      date,
      tempMax: 18,
      tempMin: 10,
      precipProb: 0,
      weatherCode: 0,
      windMax: 0,
      uvMax: 0,
      sunrise: "",
      sunset: "",
    }
  })
}

function getHourlyForDate(forecasts: CityForecast[], date: string, city: string): HourlyData[] {
  const forecast = forecasts.find(f => f.city === city)
  if (!forecast) return []

  // Filter hourly data for this date, every 3 hours from 6 AM to midnight
  const targetHours = [6, 9, 12, 15, 18, 21]
  return forecast.hourly.filter(h => {
    if (!h.time.startsWith(date)) return false
    const hour = parseInt(h.time.slice(11, 13), 10)
    return targetHours.includes(hour)
  })
}

function buildAlerts(tripDays: DailyData[]): { type: "rain" | "heat"; message: string }[] {
  const alerts: { type: "rain" | "heat"; message: string }[] = []

  for (const day of tripDays) {
    const city = getCityForDate(day.date)
    const dateLabel = format(parseISO(day.date), "MMM d")

    if (day.precipProb > 60) {
      alerts.push({ type: "rain", message: `\uD83C\uDF27 Rain likely on ${dateLabel} in ${city === "Saint-Raphael" ? "Saint-Rapha\u00EBl" : city} \u2014 pack an umbrella` })
    }
    if (day.tempMax > 28) {
      alerts.push({ type: "heat", message: `\u2600\uFE0F Hot day on ${dateLabel} \u2014 sunscreen and hats for the kids` })
    }
  }

  return alerts
}
