"use client"

import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
  size?: number
}

export function SunIcon({ className, size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn("weather-icon-sun", className)}>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx="32" cy="32" r="28" fill="url(#sunGlow)" className="animate-pulse" style={{ animationDuration: "3s" }} />
      {/* Rays */}
      <g className="origin-center animate-[spin_20s_linear_infinite]">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="32" y1="8" x2="32" y2="14"
            stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${angle} 32 32)`}
          />
        ))}
      </g>
      {/* Core */}
      <circle cx="32" cy="32" r="12" fill="#fbbf24" />
      <circle cx="32" cy="32" r="9" fill="#fcd34d" />
      <circle cx="28" cy="28" r="3" fill="#fde68a" opacity="0.6" />
    </svg>
  )
}

export function CloudIcon({ className, size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 64 48" width={size} height={size * 0.75} className={cn(className)}>
      <g className="animate-[float_4s_ease-in-out_infinite]">
        <ellipse cx="34" cy="30" rx="20" ry="12" fill="#94a3b8" opacity="0.5" />
        <ellipse cx="24" cy="26" rx="14" ry="10" fill="#cbd5e1" />
        <ellipse cx="38" cy="26" rx="16" ry="11" fill="#e2e8f0" />
        <ellipse cx="31" cy="22" rx="12" ry="9" fill="#f1f5f9" />
      </g>
    </svg>
  )
}

export function PartlyCloudyIcon({ className, size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 72 56" width={size} height={size * 0.78} className={cn(className)}>
      {/* Sun behind */}
      <g className="origin-[20px_18px] animate-[spin_20s_linear_infinite]">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <line
            key={angle}
            x1="20" y1="4" x2="20" y2="9"
            stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${angle} 20 18)`}
          />
        ))}
      </g>
      <circle cx="20" cy="18" r="9" fill="#fbbf24" />
      <circle cx="20" cy="18" r="7" fill="#fcd34d" />
      {/* Cloud in front */}
      <g className="animate-[float_4s_ease-in-out_infinite]">
        <ellipse cx="42" cy="38" rx="22" ry="13" fill="#94a3b8" opacity="0.4" />
        <ellipse cx="32" cy="34" rx="15" ry="11" fill="#cbd5e1" />
        <ellipse cx="46" cy="34" rx="17" ry="12" fill="#e2e8f0" />
        <ellipse cx="39" cy="30" rx="13" ry="10" fill="#f1f5f9" />
      </g>
    </svg>
  )
}

export function RainIcon({ className, size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 64 56" width={size} height={size * 0.875} className={cn(className)}>
      {/* Cloud */}
      <g>
        <ellipse cx="34" cy="22" rx="20" ry="12" fill="#94a3b8" opacity="0.5" />
        <ellipse cx="24" cy="18" rx="14" ry="10" fill="#94a3b8" />
        <ellipse cx="38" cy="18" rx="16" ry="11" fill="#9ca3af" />
        <ellipse cx="31" cy="14" rx="12" ry="9" fill="#a1a1aa" />
      </g>
      {/* Rain drops */}
      {[
        { x: 20, delay: "0s" },
        { x: 30, delay: "0.3s" },
        { x: 40, delay: "0.6s" },
        { x: 25, delay: "0.9s" },
        { x: 35, delay: "0.15s" },
      ].map((drop, i) => (
        <line
          key={i}
          x1={drop.x} y1="32" x2={drop.x - 2} y2="42"
          stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"
          className="animate-[rainDrop_1s_linear_infinite]"
          style={{ animationDelay: drop.delay }}
          opacity="0.8"
        />
      ))}
    </svg>
  )
}

export function DrizzleIcon({ className, size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 64 56" width={size} height={size * 0.875} className={cn(className)}>
      {/* Cloud */}
      <g>
        <ellipse cx="34" cy="22" rx="20" ry="12" fill="#94a3b8" opacity="0.4" />
        <ellipse cx="24" cy="18" rx="14" ry="10" fill="#cbd5e1" />
        <ellipse cx="38" cy="18" rx="16" ry="11" fill="#d1d5db" />
        <ellipse cx="31" cy="14" rx="12" ry="9" fill="#e5e7eb" />
      </g>
      {/* Drizzle dots */}
      {[
        { x: 22, delay: "0s" },
        { x: 32, delay: "0.5s" },
        { x: 42, delay: "0.25s" },
      ].map((drop, i) => (
        <circle
          key={i}
          cx={drop.x} cy="38" r="1.5"
          fill="#93c5fd"
          className="animate-[rainDrop_1.5s_linear_infinite]"
          style={{ animationDelay: drop.delay }}
        />
      ))}
    </svg>
  )
}

export function StormIcon({ className, size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 64 60" width={size} height={size * 0.94} className={cn(className)}>
      {/* Dark cloud */}
      <g>
        <ellipse cx="34" cy="20" rx="20" ry="12" fill="#6b7280" opacity="0.5" />
        <ellipse cx="24" cy="16" rx="14" ry="10" fill="#6b7280" />
        <ellipse cx="38" cy="16" rx="16" ry="11" fill="#4b5563" />
        <ellipse cx="31" cy="12" rx="12" ry="9" fill="#6b7280" />
      </g>
      {/* Lightning bolt */}
      <polygon
        points="34,26 28,38 33,38 29,50 40,34 35,34 38,26"
        fill="#fbbf24"
        className="animate-[flash_2s_ease-in-out_infinite]"
      />
      {/* Rain */}
      {[
        { x: 20, delay: "0s" },
        { x: 44, delay: "0.4s" },
      ].map((drop, i) => (
        <line
          key={i}
          x1={drop.x} y1="30" x2={drop.x - 2} y2="40"
          stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"
          className="animate-[rainDrop_0.8s_linear_infinite]"
          style={{ animationDelay: drop.delay }}
          opacity="0.7"
        />
      ))}
    </svg>
  )
}

export function FogIcon({ className, size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 64 40" width={size} height={size * 0.625} className={cn(className)}>
      {[12, 20, 28].map((y, i) => (
        <line
          key={i}
          x1={10 + i * 2} y1={y} x2={54 - i * 2} y2={y}
          stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"
          opacity={0.8 - i * 0.2}
          className="animate-[float_3s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </svg>
  )
}

// Map WMO codes to icon components
export function WeatherIcon({ code, size = 48, className }: { code: number; size?: number; className?: string }) {
  if (code === 0) return <SunIcon size={size} className={className} />
  if (code <= 2) return <PartlyCloudyIcon size={size} className={className} />
  if (code === 3) return <CloudIcon size={size} className={className} />
  if (code <= 48) return <FogIcon size={size} className={className} />
  if (code <= 55) return <DrizzleIcon size={size} className={className} />
  if (code <= 65) return <RainIcon size={size} className={className} />
  if (code <= 82) return <RainIcon size={size} className={className} />
  if (code >= 95) return <StormIcon size={size} className={className} />
  return <PartlyCloudyIcon size={size} className={className} />
}

// WMO code to label
export function getWeatherLabel(code: number): string {
  if (code === 0) return "Clear sky"
  if (code === 1) return "Mainly clear"
  if (code === 2) return "Partly cloudy"
  if (code === 3) return "Overcast"
  if (code <= 48) return "Foggy"
  if (code <= 55) return "Drizzle"
  if (code <= 65) return "Rain"
  if (code <= 75) return "Snow"
  if (code <= 82) return "Rain showers"
  if (code >= 95) return "Thunderstorm"
  return "Partly cloudy"
}

// WMO code to weather type
export function getWeatherType(code: number): "clear" | "partly-cloudy" | "cloudy" | "fog" | "drizzle" | "rain" | "storm" {
  if (code === 0) return "clear"
  if (code <= 2) return "partly-cloudy"
  if (code === 3) return "cloudy"
  if (code <= 48) return "fog"
  if (code <= 55) return "drizzle"
  if (code <= 65) return "rain"
  if (code <= 82) return "rain"
  if (code >= 95) return "storm"
  return "partly-cloudy"
}

// Weather condition to gradient classes
export function getWeatherGradient(code: number): string {
  const type = getWeatherType(code)
  switch (type) {
    case "clear": return "from-amber-300 via-orange-200 to-sky-400"
    case "partly-cloudy": return "from-sky-400 via-sky-300 to-blue-200"
    case "cloudy": return "from-slate-400 via-gray-300 to-slate-200"
    case "rain": return "from-slate-600 via-slate-500 to-blue-400"
    case "drizzle": return "from-slate-500 via-blue-400 to-slate-300"
    case "storm": return "from-gray-800 via-slate-700 to-gray-600"
    case "fog": return "from-gray-400 via-slate-300 to-gray-200"
    default: return "from-sky-400 via-sky-300 to-blue-200"
  }
}

// Whether text should be light on a given weather gradient
export function isLightText(code: number): boolean {
  const type = getWeatherType(code)
  return type === "rain" || type === "storm"
}
