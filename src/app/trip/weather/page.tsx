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
  days: DayForecast[]
  hours: HourForecast[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const CITIES = [
  { city: "Paris", flag: "🗼", lat: 48.8566, lon: 2.3522, startDate: "2026-04-03", endDate: "2026-04-06" },
  { city: "Saint-Raphaël", flag: "🌊", lat: 43.4252, lon: 6.7673, startDate: "2026-04-06", endDate: "2026-04-11" },
  { city: "Lisbon", flag: "🇵🇹", lat: 38.7167, lon: -9.1333, startDate: "2026-04-11", endDate: "2026-04-15" },
]

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
  if (code === 0) return "from-amber-500 via-rose-400 to-sky-500"       // golden clear
  if (code <= 2) return "from-blue-600 via-sky-400 to-cyan-300"          // partly cloudy
  if (code === 3) return "from-slate-600 via-slate-400 to-gray-300"      // overcast
  if (code <= 55) return "from-indigo-700 via-blue-500 to-slate-400"     // drizzle
  if (code <= 82) return "from-slate-800 via-blue-700 to-indigo-500"     // rain
  return "from-gray-900 via-slate-800 to-purple-900"                     // storm
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

  return { ...city, days, hours }
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

// ── Hourly Strip ─────────────────────────────────────────────────────────────

function HourlyStrip({ hours }: { hours: HourForecast[] }) {
  const now = new Date()
  const relevant = hours.filter(h => {
    const t = new Date(h.time)
    const diff = (t.getTime() - now.getTime()) / 3600000
    return diff >= -1 && diff <= 23
  }).slice(0, 12)

  if (!relevant.length) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
      {relevant.map((h, i) => {
        const t = new Date(h.time)
        const label = i === 0 ? "Now" : t.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
        const isNow = i === 0
        return (
          <div
            key={h.time}
            className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl shrink-0 min-w-[56px] ${
              isNow ? "bg-white/25 border border-white/40" : "bg-white/10"
            }`}
          >
            <span className="text-xs text-white/70 font-medium">{label}</span>
            <span className="text-lg">{WMO_EMOJI[h.code] ?? "🌤"}</span>
            <span className="text-sm font-semibold text-white">{toF(h.temp)}</span>
            {h.precipProb > 20 && (
              <span className="text-xs text-blue-200">{h.precipProb}%</span>
            )}
          </div>
        )
      })}
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

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 transition-all ${
        isSelected
          ? "bg-white/20 border border-white/40 shadow-lg scale-[1.01]"
          : "bg-white/10 border border-white/10 hover:bg-white/15"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center w-10">
            <div className="text-xs text-white/70 font-medium">{fmt.day}</div>
            <div className="text-sm font-bold text-white">{fmt.date.split(" ")[1]}</div>
          </div>
          <WeatherIcon code={day.code} size={28} />
          <div>
            <div className="text-sm font-medium text-white">{WMO_DESC[day.code] ?? "Mixed"}</div>
            {day.precipProb > 30 && (
              <div className="text-xs text-blue-200 flex items-center gap-1">
                <Droplets className="h-3 w-3" /> {day.precipProb}% rain
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{toF(day.max)}</div>
          <div className="text-sm text-white/60">{toF(day.min)}</div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
          {/* Precip bar */}
          {day.precipProb > 0 && (
            <div className="flex items-center gap-2">
              <Droplets className="h-3 w-3 text-blue-200 shrink-0" />
              <div className="flex-1 h-1.5 bg-white/20 rounded-full">
                <div className="h-full bg-blue-300 rounded-full" style={{ width: `${day.precipProb}%` }} />
              </div>
              <span className="text-xs text-white/70">{day.precipProb}%</span>
            </div>
          )}
          {/* Wind */}
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Wind className="h-3 w-3 shrink-0" />
            <span>Wind {Math.round(day.windMax * 0.621)} mph</span>
            <span>·</span>
            <Eye className="h-3 w-3 shrink-0" />
            <span>UV {day.uvIndex}</span>
          </div>
          {/* Sun arc */}
          <SunArc sunrise={day.sunrise} sunset={day.sunset} />
          {/* Clothing */}
          <div className="bg-white/10 rounded-xl p-3 mt-1">
            <div className="text-base mb-1">{clothing.emoji}</div>
            <div className="text-xs font-medium text-white">{clothing.text}</div>
            {clothing.kids && <div className="text-xs text-white/60 mt-0.5">👦 {clothing.kids}</div>}
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

  const cityDays = city?.days ?? []
  const displayDate = selectedDate ?? cityDays[0]?.date ?? null
  const selectedDay = cityDays.find(d => d.date === displayDate) ?? cityDays[0]

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${gradient} transition-all duration-700 pt-safe`}>
        {/* Back button */}
        <div className="flex items-center px-4 pt-4 pb-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl bg-white/10 text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-2 text-white font-semibold text-lg">Weather</h1>
          <button
            onClick={loadWeather}
            className="ml-auto p-2 rounded-xl bg-white/10 text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* City tabs */}
        <div className="flex gap-2 px-4 pb-4">
          {CITIES.map((c, i) => (
            <button
              key={c.city}
              onClick={() => { setSelectedCityIdx(i); setSelectedDate(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                i === selectedCityIdx
                  ? "bg-white text-gray-800 shadow"
                  : "bg-white/20 text-white"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.city.split("-")[0]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="px-4 pb-8 space-y-4">
            <div className="h-24 bg-white/20 rounded-2xl animate-pulse" />
            <div className="h-16 bg-white/20 rounded-2xl animate-pulse" />
          </div>
        ) : error ? (
          <div className="px-4 pb-8">
            <div className="bg-white/20 rounded-2xl p-4 text-white text-center">
              <p className="text-sm mb-3">{error}</p>
              <button onClick={loadWeather} className="bg-white/20 px-4 py-2 rounded-xl text-sm font-medium">
                Try again
              </button>
            </div>
          </div>
        ) : heroDay ? (
          <>
            {/* Big temp display */}
            <div className="px-6 pb-4">
              <div className="flex items-start gap-4">
                <WeatherIcon code={heroDay.code} size={64} />
                <div>
                  <div className="text-7xl font-thin text-white leading-none">
                    {toF(heroDay.max)}
                  </div>
                  <div className="text-white/80 text-lg mt-1">{WMO_DESC[heroDay.code] ?? "Mixed"}</div>
                  <div className="text-white/60 text-sm mt-0.5">
                    {toF(heroDay.min)} low · {heroDay.precipProb}% rain
                  </div>
                  <div className="flex gap-3 mt-3">
                    {[
                      { icon: "💨", label: "Wind", value: `${Math.round((heroDay.windMax??0) * 0.621)} mph` },
                      { icon: "🌅", label: "UV", value: `${heroDay.uvIndex ?? "--"}` },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                        <span className="text-sm">{stat.icon}</span>
                        <div>
                          <div className="text-xs text-white/60">{stat.label}</div>
                          <div className="text-sm font-semibold text-white">{stat.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly strip */}
            <HourlyStrip hours={heroHours} />
            <div className="h-6" />
          </>
        ) : null}
      </div>

      {/* Daily forecast */}
      {!loading && !error && city && (
        <div className={`bg-gradient-to-b ${gradient} opacity-90`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider px-1 pb-1">
              {city.city} Forecast
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
        <div className="px-4 pt-4 pb-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            City Climates
          </h2>
          {[
            { city: "Paris", flag: "🗼", desc: "Cool spring days, 50–63°F. Occasional showers — pack a light rain jacket.", gradient: "from-blue-600 to-blue-400" },
            { city: "Saint-Raphaël", flag: "🌊", desc: "Mediterranean warmth, 63–72°F. Perfect beach weather, lighter clothes!", gradient: "from-amber-500 to-orange-400" },
            { city: "Lisbon", flag: "🇵🇹", desc: "Sunny and warm, 64–73°F. Most summer-like of the trip.", gradient: "from-teal-600 to-emerald-400" },
          ].map(c => (
            <div key={c.city} className={`bg-gradient-to-r ${c.gradient} rounded-2xl p-4 text-white`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{c.flag}</span>
                <span className="font-bold">{c.city}</span>
              </div>
              <p className="text-sm text-white/90">{c.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
