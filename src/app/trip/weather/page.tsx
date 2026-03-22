"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Wind, Droplets, Sun, Sunrise, Sunset, ChevronDown, RefreshCw } from "lucide-react"
import { WeatherIcon, getWeatherLabel, getWeatherGradient, getWeatherType, isLightText } from "@/components/weather/weather-icons"

// -- Null-safe temperature conversion ----------------------------------------

const toF = (c: number | null | undefined): string =>
  c == null ? "--" : `${Math.round(c * 9 / 5 + 32)}`

const toFNum = (c: number | null | undefined): number | null =>
  c == null ? null : Math.round(c * 9 / 5 + 32)

// -- Types -------------------------------------------------------------------

interface DailyData {
  date: string
  tempMax: number | null
  tempMin: number | null
  precipProb: number | null
  weatherCode: number
  windMax: number | null
  uvMax: number | null
  sunrise: string
  sunset: string
}

interface HourlyData {
  time: string
  temp: number | null
  precipProb: number | null
  weatherCode: number
  windSpeed: number | null
  apparentTemp: number | null
}

interface CityForecast {
  city: string
  daily: DailyData[]
  hourly: HourlyData[]
}

// -- Constants ---------------------------------------------------------------

const CITIES = [
  { name: "Paris", lat: 48.8566, lon: 2.3522, flag: "\uD83C\uDDEB\uD83C\uDDF7", icon: "\uD83D\uDDFC", dates: ["2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06"] },
  { name: "Saint-Rapha\u00EBl", lat: 43.4252, lon: 6.7673, flag: "\uD83C\uDDEB\uD83C\uDDF7", icon: "\uD83C\uDF0A", dates: ["2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10", "2026-04-11"] },
  { name: "Lisbon", lat: 38.7167, lon: -9.1333, flag: "\uD83C\uDDF5\uD83C\uDDF9", icon: "\uD83C\uDDF5\uD83C\uDDF9", dates: ["2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", "2026-04-15"] },
] as const

const CITY_CLIMATE: Record<string, { tagline: string; description: string }> = {
  "Paris": { tagline: "Cool spring days, occasional showers", description: "April in Paris brings mild days around 55-65\u00B0F with a chance of rain. Layers are your best friend." },
  "Saint-Rapha\u00EBl": { tagline: "Mediterranean warmth, sunny", description: "The Riviera warms up beautifully in April. Expect 65-72\u00B0F with lots of sunshine and gentle sea breezes." },
  "Lisbon": { tagline: "Warm and bright, most summer-like", description: "Lisbon is the warmest stop on the trip. Expect 65-75\u00B0F with abundant sunshine and clear skies." },
}

// -- API Fetching ------------------------------------------------------------

async function fetchCityForecast(city: typeof CITIES[number]): Promise<CityForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,windspeed_10m_max,uv_index_max,sunrise,sunset&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m,apparent_temperature&timezone=auto&forecast_days=16`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch weather for ${city.name}`)
  const data = await res.json()

  const daily: DailyData[] = data.daily.time.map((t: string, i: number) => ({
    date: t,
    tempMax: data.daily.temperature_2m_max[i] ?? null,
    tempMin: data.daily.temperature_2m_min[i] ?? null,
    precipProb: data.daily.precipitation_probability_max[i] ?? null,
    weatherCode: data.daily.weathercode[i] ?? 0,
    windMax: data.daily.windspeed_10m_max[i] ?? null,
    uvMax: data.daily.uv_index_max[i] ?? null,
    sunrise: data.daily.sunrise[i] ?? "",
    sunset: data.daily.sunset[i] ?? "",
  }))

  const hourly: HourlyData[] = data.hourly.time.map((t: string, i: number) => ({
    time: t,
    temp: data.hourly.temperature_2m[i] ?? null,
    precipProb: data.hourly.precipitation_probability[i] ?? null,
    weatherCode: data.hourly.weathercode[i] ?? 0,
    windSpeed: data.hourly.windspeed_10m[i] ?? null,
    apparentTemp: data.hourly.apparent_temperature?.[i] ?? null,
  }))

  return { city: city.name, daily, hourly }
}

// -- Helpers -----------------------------------------------------------------

function getCityForDate(dateStr: string): typeof CITIES[number] | undefined {
  return CITIES.find(c => (c.dates as readonly string[]).includes(dateStr))
}

function formatSunTime(isoStr: string): string {
  try { return format(parseISO(isoStr), "h:mm a") } catch { return "--" }
}

function getClothingSuggestion(tempF: number | null): { emoji: string; text: string; kidsNote: string | null } {
  if (tempF == null) return { emoji: "\uD83D\uDC55", text: "Check back closer to the trip for suggestions", kidsNote: null }
  if (tempF > 75) return { emoji: "\uD83E\uDE73\uD83D\uDC52\uD83D\uDD76\uFE0F", text: "Shorts, hat, sunscreen", kidsNote: "Kids: extra sunscreen!" }
  if (tempF >= 60) return { emoji: "\uD83D\uDC57\uD83E\uDDE5", text: "Light layers, comfortable shoes", kidsNote: null }
  if (tempF >= 50) return { emoji: "\uD83E\uDDE5\uD83E\uDDE3\uD83D\uDC5F", text: "Light jacket and layers", kidsNote: "Kids: extra layer!" }
  return { emoji: "\uD83E\uDDE4\uD83E\uDDE5\uD83C\uDF02", text: "Warm jacket, consider umbrella", kidsNote: "Kids: extra layer!" }
}

// -- Loading Skeleton --------------------------------------------------------

function WeatherSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-blue-200">
      <div className="pt-16 pb-8 px-6 text-center">
        <div className="h-8 w-40 mx-auto bg-white/20 rounded-full animate-pulse mb-4" />
        <div className="h-24 w-32 mx-auto bg-white/20 rounded-2xl animate-pulse mb-3" />
        <div className="h-6 w-48 mx-auto bg-white/20 rounded-full animate-pulse mb-6" />
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
      <div className="px-4 space-y-4 pb-24">
        <div className="h-24 bg-white/10 rounded-2xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// -- Main Page ---------------------------------------------------------------

export default function WeatherPage() {
  const [forecasts, setForecasts] = useState<CityForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCityIdx, setSelectedCityIdx] = useState(0)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const hourlyRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(CITIES.map(fetchCityForecast))
      setForecasts(results)
    } catch {
      setError("Weather data unavailable. Try again shortly.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return <WeatherSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-8 text-center max-w-sm">
          <WeatherIcon code={3} size={64} className="mx-auto mb-4" />
          <p className="text-white font-medium mb-4">{error}</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white font-medium hover:bg-white/30 transition-colors">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      </div>
    )
  }

  const city = CITIES[selectedCityIdx]
  const forecast = forecasts.find(f => f.city === city.name)
  const cityDays = city.dates
    .map(d => forecast?.daily.find(day => day.date === d))
    .filter((d): d is DailyData => d != null)

  // Today's data = first day of the selected city that has data
  const todayData = cityDays[0]
  const weatherCode = todayData?.weatherCode ?? 2
  const gradient = getWeatherGradient(weatherCode)
  const lightText = isLightText(weatherCode)

  // Hourly data for first day
  const todayHourly = forecast?.hourly.filter(h => {
    if (!todayData) return false
    if (!h.time.startsWith(todayData.date)) return false
    const hour = parseInt(h.time.slice(11, 13), 10)
    return hour >= 6 && hour <= 22
  }) ?? []

  // Feels like from noon hourly
  const noonHourly = forecast?.hourly.find(h =>
    todayData && h.time.startsWith(todayData.date) && h.time.includes("T12:")
  )

  return (
    <div className="min-h-screen pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCityIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ── Hero Section ── */}
          <div className={cn("bg-gradient-to-b", gradient, "pt-12 pb-6 px-6 text-center relative overflow-hidden")}>
            {/* Subtle animated overlay circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={cn("absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10", lightText ? "bg-white" : "bg-white")} style={{ animation: "float 6s ease-in-out infinite" }} />
              <div className={cn("absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10", lightText ? "bg-white" : "bg-white")} style={{ animation: "float 8s ease-in-out infinite 1s" }} />
            </div>

            <div className="relative z-10">
              {/* City name + flag */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className={cn("text-2xl font-bold mb-1", lightText ? "text-white" : "text-gray-900")}>
                  {city.icon} {city.name}
                </h1>
                <p className={cn("text-sm font-medium", lightText ? "text-white/70" : "text-gray-700/70")}>
                  {format(parseISO(city.dates[0]), "MMM d")} - {format(parseISO(city.dates[city.dates.length - 1]), "MMM d, yyyy")}
                </p>
              </motion.div>

              {/* MASSIVE temperature */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="my-6"
              >
                <WeatherIcon code={weatherCode} size={72} className="mx-auto mb-2" />
                <div className={cn("text-8xl font-extralight tracking-tighter", lightText ? "text-white" : "text-gray-900")}>
                  {toF(todayData?.tempMax)}<span className="text-4xl align-top">{todayData?.tempMax != null ? "\u00B0F" : ""}</span>
                </div>
                <p className={cn("text-lg font-medium mt-1", lightText ? "text-white/90" : "text-gray-800/90")}>
                  {getWeatherLabel(weatherCode)}
                </p>
              </motion.div>

              {/* Pill badges: feels like, humidity, wind */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap justify-center gap-2 mb-6"
              >
                {noonHourly?.apparentTemp != null && (
                  <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-white">
                    Feels {toF(noonHourly.apparentTemp)}{"\u00B0F"}
                  </span>
                )}
                {todayData?.windMax != null && (
                  <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1">
                    <Wind className="h-3 w-3" /> {Math.round(todayData.windMax)} km/h
                  </span>
                )}
                {todayData?.precipProb != null && todayData.precipProb > 0 && (
                  <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1">
                    <Droplets className="h-3 w-3" /> {todayData.precipProb}%
                  </span>
                )}
                {todayData?.uvMax != null && (
                  <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1">
                    <Sun className="h-3 w-3" /> UV {Math.round(todayData.uvMax)}
                  </span>
                )}
              </motion.div>

              {/* Sunrise / Sunset bar */}
              {todayData?.sunrise && todayData?.sunset && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="glass rounded-2xl px-4 py-3 max-w-xs mx-auto"
                >
                  <div className="flex items-center justify-between text-white text-xs mb-2">
                    <span className="flex items-center gap-1"><Sunrise className="h-3 w-3" /> {formatSunTime(todayData.sunrise)}</span>
                    <span className="flex items-center gap-1"><Sunset className="h-3 w-3" /> {formatSunTime(todayData.sunset)}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-300/80" style={{ width: `${getSunPosition(todayData.sunrise, todayData.sunset)}%` }} />
                  </div>
                </motion.div>
              )}

              {/* City tabs */}
              <div className="flex justify-center gap-2 mt-6">
                {CITIES.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => { setSelectedCityIdx(i); setExpandedDay(null) }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      i === selectedCityIdx
                        ? "bg-white/30 text-white shadow-lg scale-105"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    )}
                  >
                    {c.icon} {c.name.split("-")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Hourly Strip ── */}
          {todayHourly.length > 0 && (
            <div className="bg-white dark:bg-gray-950 border-b border-border">
              <div className="px-4 pt-4 pb-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hourly Forecast</h2>
              </div>
              <div ref={hourlyRef} className="flex gap-1 overflow-x-auto no-scrollbar px-4 pb-4 pt-2">
                {todayHourly.map((h, i) => {
                  const hour = parseInt(h.time.slice(11, 13), 10)
                  const isNow = hour === new Date().getHours()
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex flex-col items-center gap-1.5 min-w-[58px] py-3 px-2 rounded-2xl transition-colors shrink-0",
                        isNow ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/40"
                      )}
                    >
                      <span className={cn("text-[11px] font-medium", isNow ? "text-primary font-bold" : "text-muted-foreground")}>
                        {isNow ? "Now" : format(parseISO(h.time), "ha")}
                      </span>
                      <WeatherIcon code={h.weatherCode} size={28} />
                      <span className="text-sm font-semibold">{toF(h.temp)}{h.temp != null ? "\u00B0" : ""}</span>
                      {(h.precipProb ?? 0) > 0 && (
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

          {/* ── Daily Forecast Cards ── */}
          <div className="bg-background px-4 pt-6 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {cityDays.length}-Day Forecast
            </h2>
            <div className="space-y-2">
              {cityDays.map((day) => {
                const isExpanded = expandedDay === day.date
                const dayHourly = forecast?.hourly.filter(h => {
                  if (!h.time.startsWith(day.date)) return false
                  const hour = parseInt(h.time.slice(11, 13), 10)
                  return [6, 9, 12, 15, 18, 21].includes(hour)
                }) ?? []

                return (
                  <div key={day.date}>
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card hover:bg-muted/50 transition-colors border border-border group"
                    >
                      {/* Day name */}
                      <div className="w-16 text-left shrink-0">
                        <span className="text-sm font-semibold">{format(parseISO(day.date), "EEE")}</span>
                        <span className="block text-[11px] text-muted-foreground">{format(parseISO(day.date), "MMM d")}</span>
                      </div>

                      {/* Rain probability bar */}
                      <div className="w-10 shrink-0">
                        {(day.precipProb ?? 0) > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Droplets className="h-3 w-3 text-blue-500" />
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{day.precipProb}%</span>
                          </div>
                        )}
                      </div>

                      {/* Weather icon */}
                      <div className="flex-1 flex justify-center">
                        <WeatherIcon code={day.weatherCode} size={32} />
                      </div>

                      {/* High / Low */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold w-10 text-right">{toF(day.tempMax)}{day.tempMax != null ? "\u00B0" : ""}</span>
                        <span className="text-sm text-muted-foreground w-10 text-right">{toF(day.tempMin)}{day.tempMin != null ? "\u00B0" : ""}</span>
                      </div>

                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-180")} />
                    </button>

                    {/* Expanded hourly detail */}
                    <AnimatePresence>
                      {isExpanded && dayHourly.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3">
                            {dayHourly.map((h, i) => (
                              <div key={i} className="flex flex-col items-center gap-1 min-w-[52px] py-2 px-1.5 rounded-xl bg-muted/40 shrink-0">
                                <span className="text-[10px] font-medium text-muted-foreground">{format(parseISO(h.time), "ha")}</span>
                                <WeatherIcon code={h.weatherCode} size={24} />
                                <span className="text-xs font-semibold">{toF(h.temp)}{h.temp != null ? "\u00B0" : ""}</span>
                                {(h.precipProb ?? 0) > 0 && (
                                  <span className="text-[10px] text-blue-500">{h.precipProb}%</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Clothing Suggestion ── */}
          {todayData && (
            <div className="bg-background px-4 pt-4 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">What to Wear</h2>
              <ClothingCard tempMax={todayData.tempMax} tempMin={todayData.tempMin} />
            </div>
          )}

          {/* ── City Climate Cards ── */}
          <div className="bg-background px-4 pt-4 pb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">City Climate Guide</h2>
            <div className="space-y-3">
              {CITIES.map((c) => {
                const climate = CITY_CLIMATE[c.name]
                const cityForecast = forecasts.find(f => f.city === c.name)
                const firstDay = c.dates[0]
                const dayData = cityForecast?.daily.find(d => d.date === firstDay)
                const code = dayData?.weatherCode ?? 2
                const grad = getWeatherGradient(code)

                return (
                  <div
                    key={c.name}
                    className={cn("rounded-2xl overflow-hidden bg-gradient-to-r", grad, "p-4 relative")}
                  >
                    <div className="absolute top-3 right-3 opacity-30">
                      <WeatherIcon code={code} size={48} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-white font-bold text-lg">{c.icon} {c.name}</h3>
                      <p className="text-white/80 text-sm font-medium mt-0.5">{climate?.tagline}</p>
                      <p className="text-white/60 text-xs mt-2 max-w-[260px]">{climate?.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// -- Clothing Card -----------------------------------------------------------

function ClothingCard({ tempMax, tempMin }: { tempMax: number | null; tempMin: number | null }) {
  const avgTempF = tempMax != null && tempMin != null
    ? toFNum((tempMax + tempMin) / 2)
    : null
  const suggestion = getClothingSuggestion(avgTempF)

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{suggestion.emoji}</span>
        <p className="text-sm font-medium text-foreground">{suggestion.text}</p>
      </div>
      {suggestion.kidsNote && (
        <div className="flex items-start gap-2 bg-muted/50 rounded-xl px-3 py-2 mt-3">
          <span className="text-sm shrink-0">{"\uD83E\uDDD2"}</span>
          <p className="text-xs text-muted-foreground">{suggestion.kidsNote}</p>
        </div>
      )}
    </div>
  )
}

// -- Sun position helper -----------------------------------------------------

function getSunPosition(sunrise: string, sunset: string): number {
  try {
    const now = new Date()
    const rise = parseISO(sunrise)
    const set = parseISO(sunset)
    const total = set.getTime() - rise.getTime()
    if (total <= 0) return 50
    const elapsed = now.getTime() - rise.getTime()
    return Math.max(0, Math.min(100, (elapsed / total) * 100))
  } catch {
    return 50
  }
}
