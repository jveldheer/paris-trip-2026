"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, Wind, Droplets, Eye, Thermometer, Sunrise, Sunset, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

// ── Types ────────────────────────────────────────────────────────────────────

interface DayForecast {
  date: string
  max: number | null
  min: number | null
  code: number
  precipProb: number
  windMax: number
  uvIndex: number
  sunrise: string
  sunset: string
}

interface HourForecast {
  time: string
  temp: number | null
  code: number
  precipProb: number
  wind: number
  apparentTemp: number | null
}

interface CityWeather {
  city: string
  flag: string
  lat: number
  lon: number
  startDate: string
  endDate: string
  timezone: string
  days: DayForecast[]
  hours: HourForecast[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const CITIES = [
  { city: "Paris", flag: "🗼", lat: 48.8566, lon: 2.3522, startDate: "2026-04-03", endDate: "2026-04-06" },
  { city: "Saint-Raphaël", flag: "🌊", lat: 43.4252, lon: 6.7673, startDate: "2026-04-06", endDate: "2026-04-11" },
  { city: "Lisbon", flag: "🇵🇹", lat: 38.7167, lon: -9.1333, startDate: "2026-04-11", endDate: "2026-04-15" },
]

const CITY_ACCENT: Record<string, string> = {
  "Paris": "bg-blue-500",
  "Saint-Raphaël": "bg-orange-500",
  "Lisbon": "bg-teal-500",
}

const CITY_ACCENT_BORDER: Record<string, string> = {
  "Paris": "border-blue-400",
  "Saint-Raphaël": "border-orange-400",
  "Lisbon": "border-teal-400",
}

const WMO_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️",
  45: "🌫", 48: "🌫",
  51: "🌦", 53: "🌦", 55: "🌧",
  61: "🌧", 63: "🌧", 65: "🌧",
  71: "❄️", 73: "❄️", 75: "❄️",
  80: "🌦", 81: "🌦", 82: "⛈",
  95: "⛈", 96: "⛈", 99: "⛈",
}

const WMO_DESC: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Showers", 82: "Heavy showers",
  95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
}

function getGradient(code: number): string {
  if (code === 0) return "from-[#FF6B35] via-[#F7C59F] to-[#2980B9]"
  if (code <= 2) return "from-[#1565C0] via-[#42A5F5] to-[#90CAF9]"
  if (code === 3) return "from-[#455A64] via-[#607D8B] to-[#90A4AE]"
  if (code <= 55) return "from-[#1A237E] via-[#1565C0] to-[#546E7A]"
  if (code <= 82) return "from-[#0D47A1] via-[#1565C0] to-[#37474F]"
  return "from-[#212121] via-[#37474F] to-[#4A148C]"
}

function getDayAccentBorder(code: number): string {
  if (code === 0 || code === 1) return "border-l-amber-400"
  if (code <= 3) return "border-l-gray-400"
  if (code <= 55) return "border-l-blue-400"
  if (code <= 82) return "border-l-blue-500"
  return "border-l-purple-400"
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const toF = (c: number | null | undefined): string => {
  if (c == null || isNaN(c)) return "--"
  return Math.round(c * 9 / 5 + 32) + "°"
}

const toFNum = (c: number | null | undefined): number | null => {
  if (c == null || isNaN(c)) return null
  return Math.round(c * 9 / 5 + 32)
}

function clothingSuggestion(maxF: number | null): { emoji: string; text: string; kids: string } {
  if (maxF == null) return { emoji: "👕", text: "Check conditions before packing", kids: "" }
  if (maxF >= 80) return { emoji: "🩳👒🕶️", text: "Shorts, hat, sunscreen — it's hot!", kids: "Kids: light clothes, hat + sunscreen a must" }
  if (maxF >= 68) return { emoji: "👗🕶️👟", text: "Light layers, sunglasses, comfortable shoes", kids: "Kids: T-shirt + light layer for evenings" }
  if (maxF >= 55) return { emoji: "🧥👟🧣", text: "Light jacket and layers", kids: "Kids: bring a jacket and comfortable shoes" }
  return { emoji: "🧤🧥🌂", text: "Warm jacket, consider an umbrella", kids: "Kids: warm layers + waterproof shoes" }
}

function formatTime(isoTime: string): string {
  const d = new Date(isoTime)
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function formatDate(dateStr: string): { day: string; date: string; full: string } {
  const d = new Date(dateStr + "T12:00:00")
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
  }
}

/** Parse the hour from an ISO string like "2026-04-03T14:00" directly, no Date conversion */
function parseHourFromISO(iso: string): number {
  const match = iso.match(/T(\d{2}):/)
  return match ? parseInt(match[1], 10) : 0
}

/** Format an hour number (0-23) as "2 PM", "12 AM", etc. */
function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

/** Get the current hour in a given timezone */
function getCurrentCityHour(timezone: string): { dateStr: string; hour: number } {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  })
  const parts = fmt.formatToParts(now)
  const year = parts.find(p => p.type === "year")?.value ?? ""
  const month = parts.find(p => p.type === "month")?.value ?? ""
  const day = parts.find(p => p.type === "day")?.value ?? ""
  const hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0", 10)
  return { dateStr: `${year}-${month}-${day}`, hour }
}

// ── API ───────────────────────────────────────────────────────────────────────

async function fetchCityWeather(city: typeof CITIES[0]): Promise<CityWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,windspeed_10m_max,uv_index_max,sunrise,sunset` +
    `&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m` +
    `&timezone=auto&forecast_days=16`

  const res = await fetch(url)
  if (!res.ok) throw new Error("API error")
  const data = await res.json()

  const days: DayForecast[] = data.daily.time.map((date: string, i: number) => ({
    date,
    max: data.daily.temperature_2m_max[i],
    min: data.daily.temperature_2m_min[i],
    code: data.daily.weathercode[i] ?? 1,
    precipProb: data.daily.precipitation_probability_max[i] ?? 0,
    windMax: data.daily.windspeed_10m_max[i] ?? 0,
    uvIndex: data.daily.uv_index_max[i] ?? 0,
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
  }))

  const hours: HourForecast[] = data.hourly.time.map((time: string, i: number) => ({
    time,
    temp: data.hourly.temperature_2m[i],
    apparentTemp: data.hourly.apparent_temperature[i],
    code: data.hourly.weathercode[i] ?? 1,
    precipProb: data.hourly.precipitation_probability[i] ?? 0,
    wind: data.hourly.windspeed_10m[i] ?? 0,
  }))

  return { ...city, days, hours, timezone: data.timezone ?? "UTC" }
}

// ── Animated Weather Icon ────────────────────────────────────────────────────

function WeatherIcon({ code, size = 48 }: { code: number; size?: number }) {
  const emoji = WMO_EMOJI[code] ?? "🌤"
  return (
    <span
      style={{ fontSize: size }}
      className={
        code === 0 ? "animate-pulse-sun" :
        code <= 2 ? "animate-float" :
        code >= 61 && code <= 82 ? "animate-rain" :
        ""
      }
    >
      {emoji}
    </span>
  )
}

// ── Sun Arc ───────────────────────────────────────────────────────────────────

function SunArc({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const now = new Date()
  const riseTime = new Date(sunrise).getTime()
  const setTime = new Date(sunset).getTime()
  const nowTime = now.getTime()
  const progress = Math.max(0, Math.min(1, (nowTime - riseTime) / (setTime - riseTime)))

  return (
    <div className="flex items-center gap-2 text-xs text-white/80">
      <Sunrise className="h-3 w-3" />
      <span>{formatTime(sunrise)}</span>
      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-300 rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span>{formatTime(sunset)}</span>
      <Sunset className="h-3 w-3" />
    </div>
  )
}

// ── Hourly Strip (timezone-aware) ────────────────────────────────────────────

function HourlyStrip({ hours, timezone }: { hours: HourForecast[]; timezone: string }) {
  const cityNow = getCurrentCityHour(timezone)
  const cityNowKey = `${cityNow.dateStr}T${String(cityNow.hour).padStart(2, "0")}:00`

  // Filter: from current city hour, next 12 slots
  const startIdx = hours.findIndex(h => h.time >= cityNowKey)
  const relevant = startIdx >= 0 ? hours.slice(startIdx, startIdx + 12) : []

  if (!relevant.length) return null

  return (
    <div className="px-4 pb-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50 mb-2 px-1">
        Hourly Forecast
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {relevant.map((h, i) => {
          const hour = parseHourFromISO(h.time)
          const isNow = i === 0
          const label = isNow ? "Now" : formatHourLabel(hour)
          return (
            <div
              key={h.time}
              className={`relative flex flex-col items-center gap-1 px-3 py-3 rounded-2xl shrink-0 min-w-[64px] transition-all ${
                isNow
                  ? "bg-white/25 border border-white/50 shadow-lg shadow-white/10 backdrop-blur-md"
                  : "bg-white/10 border border-white/15 backdrop-blur-sm"
              }`}
            >
              {isNow && (
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-shimmer" />
              )}
              <span className={`text-xs font-medium tabular-nums ${isNow ? "text-white" : "text-white/60"}`}>{label}</span>
              <span className="text-lg">{WMO_EMOJI[h.code] ?? "🌤"}</span>
              <span className="text-sm font-semibold text-white tabular-nums">{toF(h.temp)}</span>
              <span className="text-[10px] text-white/40 tabular-nums">{toF(h.apparentTemp)}</span>
              {h.precipProb > 20 && (
                <span className="text-[10px] text-blue-200 tabular-nums">{h.precipProb}%</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Temperature Range Bar ────────────────────────────────────────────────────

function TempRangeBar({ min, max }: { min: number | null; max: number | null }) {
  const minF = toFNum(min) ?? 40
  const maxF = toFNum(max) ?? 80
  // Scale bar relative to a 30-100F range
  const rangeMin = 30
  const rangeMax = 100
  const leftPct = Math.max(0, ((minF - rangeMin) / (rangeMax - rangeMin)) * 100)
  const rightPct = Math.min(100, ((maxF - rangeMin) / (rangeMax - rangeMin)) * 100)

  return (
    <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <div
        className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-amber-300 to-orange-400"
        style={{ left: `${leftPct}%`, width: `${Math.max(4, rightPct - leftPct)}%` }}
      />
    </div>
  )
}

// ── Rain Probability Mini Chart ──────────────────────────────────────────────

function RainBar({ probability }: { probability: number }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0.3, 0.6, 0.85, 1].map((threshold, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm transition-all ${
            probability >= threshold * 100
              ? "bg-blue-300"
              : "bg-white/15"
          }`}
          style={{ height: `${(i + 1) * 25}%` }}
        />
      ))}
    </div>
  )
}

// ── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({ day, isSelected, onClick }: {
  day: DayForecast
  isSelected: boolean
  onClick: () => void
}) {
  const fmt = formatDate(day.date)
  const maxF = toFNum(day.max)
  const clothing = clothingSuggestion(maxF)
  const accentBorder = getDayAccentBorder(day.code)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 transition-all border-l-[3px] ${accentBorder} ${
        isSelected
          ? "bg-white/20 border-y border-r border-white/30 shadow-xl scale-[1.01] backdrop-blur-md"
          : "bg-white/8 border-y border-r border-white/10 hover:bg-white/14 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-center w-10 shrink-0">
            <div className="text-[11px] font-bold text-white/90 uppercase">{fmt.day}</div>
            <div className="text-[10px] text-white/50">{fmt.date}</div>
          </div>
          <WeatherIcon code={day.code} size={26} />
          <div className="min-w-0">
            <div className="text-sm font-medium text-white">{WMO_DESC[day.code] ?? "Mixed"}</div>
            {day.precipProb > 30 && (
              <div className="text-xs text-blue-200 flex items-center gap-1">
                <Droplets className="h-3 w-3" /> {day.precipProb}% rain
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-20 hidden sm:block">
            <TempRangeBar min={day.min} max={day.max} />
          </div>
          <div className="text-right w-14">
            <span className="text-sm font-bold text-white tabular-nums">{toF(day.max)}</span>
            <span className="text-sm text-white/50 tabular-nums ml-1">{toF(day.min)}</span>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-white/15 space-y-3">
          {/* Temp range bar (always visible when expanded on mobile) */}
          <div className="sm:hidden">
            <TempRangeBar min={day.min} max={day.max} />
          </div>
          {/* Precip bar */}
          {day.precipProb > 0 && (
            <div className="flex items-center gap-3">
              <Droplets className="h-3.5 w-3.5 text-blue-300 shrink-0" />
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-300 transition-all"
                  style={{ width: `${day.precipProb}%` }}
                />
              </div>
              <RainBar probability={day.precipProb} />
              <span className="text-xs text-white/60 tabular-nums w-8 text-right">{day.precipProb}%</span>
            </div>
          )}
          {/* Wind & UV */}
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Wind className="h-3 w-3 shrink-0" />
            <span className="tabular-nums">Wind {Math.round(day.windMax * 0.621)} mph</span>
            <span className="text-white/30">|</span>
            <Eye className="h-3 w-3 shrink-0" />
            <span className="tabular-nums">UV {day.uvIndex}</span>
          </div>
          {/* Sun arc */}
          <SunArc sunrise={day.sunrise} sunset={day.sunset} />
          {/* Clothing */}
          <div className="bg-white/8 rounded-xl p-3">
            <div className="text-base mb-1">{clothing.emoji}</div>
            <div className="text-xs font-medium text-white">{clothing.text}</div>
            {clothing.kids && <div className="text-xs text-white/50 mt-0.5">👦 {clothing.kids}</div>}
          </div>
        </div>
      )}
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WeatherPage() {
  const router = useRouter()
  const [cityWeather, setCityWeather] = useState<CityWeather[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCityIdx, setSelectedCityIdx] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const loadWeather = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(CITIES.map(fetchCityWeather))
      setCityWeather(results)
    } catch {
      setError("Could not load weather data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadWeather() }, [loadWeather])

  const city = cityWeather[selectedCityIdx]
  const todayCode = city?.days[0]?.code ?? 1
  const gradient = getGradient(todayCode)
  const heroDay = city?.days[0]
  const heroHours = city?.hours ?? []
  const cityTimezone = city?.timezone ?? "UTC"
  const isClear = todayCode === 0

  const cityDays = city?.days ?? []
  const displayDate = selectedDate ?? cityDays[0]?.date ?? null

  const cityName = CITIES[selectedCityIdx]?.city ?? ""
  const accentClass = CITY_ACCENT[cityName] ?? "bg-white"
  const accentBorderClass = CITY_ACCENT_BORDER[cityName] ?? "border-white"

  return (
    <div className="min-h-screen pb-24 bg-black">
      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${gradient} transition-all duration-700 pt-safe overflow-hidden`}>
        {/* Clear-day shimmer overlay */}
        {isClear && !loading && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-shimmer pointer-events-none" />
        )}

        {/* Back button + title */}
        <div className="relative z-10 flex items-center px-4 pt-4 pb-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl bg-black/20 backdrop-blur-sm text-white border border-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="ml-3">
            <h1 className="text-white font-semibold text-lg leading-tight">Weather</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Trip Forecast</p>
          </div>
          <button
            onClick={loadWeather}
            className="ml-auto p-2 rounded-xl bg-black/20 backdrop-blur-sm text-white border border-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* City tab bar — premium pill style */}
        <div className="relative z-10 flex gap-2 px-4 pb-4">
          <div className="flex gap-1.5 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
            {CITIES.map((c, i) => {
              const isActive = i === selectedCityIdx
              const activeAccent = CITY_ACCENT[c.city] ?? "bg-white"
              return (
                <button
                  key={c.city}
                  onClick={() => { setSelectedCityIdx(i); setSelectedDate(null) }}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-gray-900 shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {isActive && (
                    <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full ${activeAccent}`} />
                  )}
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.city.split("-")[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="relative z-10 px-4 pb-8 space-y-4">
            <div className="h-32 bg-white/10 rounded-2xl animate-pulse backdrop-blur-sm" />
            <div className="h-20 bg-white/10 rounded-2xl animate-pulse backdrop-blur-sm" />
          </div>
        ) : error ? (
          <div className="relative z-10 px-4 pb-8">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 text-white text-center border border-white/10">
              <p className="text-sm mb-3 text-white/70">{error}</p>
              <button onClick={loadWeather} className="bg-white/15 hover:bg-white/25 px-5 py-2 rounded-xl text-sm font-medium transition-all">
                Try again
              </button>
            </div>
          </div>
        ) : heroDay ? (
          <div className="relative z-10">
            {/* City name + dates subtitle */}
            <div className="px-6 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{CITIES[selectedCityIdx]?.flag}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{city?.city}</h2>
                  <p className="text-white/40 text-xs tabular-nums">
                    {city?.startDate && formatDate(city.startDate).date} – {city?.endDate && formatDate(city.endDate).date}
                  </p>
                </div>
              </div>
            </div>

            {/* Big temp hero */}
            <div className="px-6 pb-5 pt-2">
              <div className="flex items-start gap-2">
                <div className="mt-2">
                  <WeatherIcon code={heroDay.code} size={72} />
                </div>
                <div className="flex-1">
                  <div className="text-7xl font-thin text-white leading-none drop-shadow-2xl tabular-nums tracking-tighter">
                    {toF(heroDay.max)}
                  </div>
                  <div className="text-white/80 text-base mt-1.5 font-medium">{WMO_DESC[heroDay.code] ?? "Mixed"}</div>
                  <div className="text-white/50 text-sm mt-0.5 tabular-nums">
                    H:{toF(heroDay.max)} L:{toF(heroDay.min)} · {heroDay.precipProb}% rain
                  </div>
                </div>
              </div>

              {/* Stat pills row */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {[
                  { icon: "💨", label: "Wind", value: `${Math.round((heroDay.windMax ?? 0) * 0.621)} mph` },
                  { icon: "☀️", label: "UV", value: `${heroDay.uvIndex ?? "--"}` },
                  { icon: "🌧", label: "Rain", value: `${heroDay.precipProb}%` },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 flex items-center gap-2">
                    <span className="text-sm">{stat.icon}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</span>
                    <span className="text-sm font-semibold text-white tabular-nums">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly strip */}
            <HourlyStrip hours={heroHours} timezone={cityTimezone} />
            <div className="h-4" />
          </div>
        ) : null}
      </div>

      {/* Daily forecast */}
      {!loading && !error && city && (
        <div className={`bg-gradient-to-b ${gradient} opacity-95`}>
          <div className="px-4 pt-4 pb-6 space-y-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 px-1 pb-1">
              {city.city} · Daily Forecast
            </h2>
            {cityDays.map(day => (
              <DayCard
                key={day.date}
                day={day}
                isSelected={day.date === displayDate}
                onClick={() => setSelectedDate(day.date === displayDate ? null : day.date)}
              />
            ))}
          </div>
        </div>
      )}

      {/* City climate cards */}
      {!loading && !error && (
        <div className="px-4 pt-6 pb-4 space-y-3 bg-black">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 px-1">
            City Climates
          </h2>
          {[
            { city: "Paris", flag: "🗼", watermark: "🗼", desc: "Cool spring days, 50–63°F. Occasional showers — pack a light rain jacket and layers.", gradient: "from-[#0D47A1] via-[#1565C0] to-[#1E88E5]" },
            { city: "Saint-Raphaël", flag: "🌊", watermark: "☀️", desc: "Mediterranean warmth, 63–72°F. Sunshine and sea breeze — this is what the trip is for.", gradient: "from-[#BF360C] via-[#E65100] to-[#FB8C00]" },
            { city: "Lisbon", flag: "🇵🇹", watermark: "🌤", desc: "Warm and bright, 64–73°F. The most summer-like stop. Lightest packing needed.", gradient: "from-[#004D40] via-[#00695C] to-[#26A69A]" },
          ].map(c => (
            <div key={c.city} className={`relative bg-gradient-to-br ${c.gradient} rounded-2xl p-5 text-white overflow-hidden border border-white/10`}>
              {/* Watermark emoji */}
              <span className="absolute -right-3 -bottom-3 text-7xl opacity-10 pointer-events-none select-none">
                {c.watermark}
              </span>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{c.flag}</span>
                  <span className="font-bold text-lg">{c.city}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
