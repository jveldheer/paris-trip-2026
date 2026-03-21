"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { parseISO, differenceInSeconds, differenceInDays } from "date-fns"
import { TRIP_START, TRIP_END, CITY_CONFIG } from "@/lib/constants"
import { getTripStatus, getCurrentDayNumber, getCityForDay, getDaysSince } from "@/lib/trip-utils"
import { Progress } from "@/components/ui/progress"

interface CountdownValues {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getCountdownValues(): CountdownValues {
  const now = new Date()
  const target = parseISO(TRIP_START)
  const totalSeconds = differenceInSeconds(target, now)
  if (totalSeconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0")
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 min-w-[72px] shadow-lg">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="block text-3xl font-bold text-white tabular-nums leading-none"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 text-xs font-medium text-white/70 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function Separator() {
  return (
    <span className="text-2xl font-bold text-white/50 mb-5 select-none">:</span>
  )
}

export function Countdown() {
  const [status, setStatus] = useState<"before" | "during" | "after">(() => getTripStatus())
  const [countdown, setCountdown] = useState<CountdownValues>(getCountdownValues)
  const [dayNumber, setDayNumber] = useState<number>(() => getCurrentDayNumber())

  useEffect(() => {
    const tick = () => {
      setStatus(getTripStatus())
      setCountdown(getCountdownValues())
      setDayNumber(getCurrentDayNumber())
    }
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── BEFORE TRIP ──────────────────────────────────────────────────────────
  if (status === "before") {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 rounded-3xl mx-4 overflow-hidden shadow-xl">
        <div className="px-6 pt-6 pb-2 text-center">
          <p className="text-blue-200 text-xs uppercase tracking-[0.2em] font-semibold mb-1">
            Veldheer Europe 2026
          </p>
          <h2 className="text-white text-xl font-bold mb-5">Countdown to Paris</h2>
        </div>
        <div className="flex items-end justify-center gap-2 pb-6 px-4">
          <FlipUnit value={countdown.days} label="Days" />
          <Separator />
          <FlipUnit value={countdown.hours} label="Hrs" />
          <Separator />
          <FlipUnit value={countdown.minutes} label="Min" />
          <Separator />
          <FlipUnit value={countdown.seconds} label="Sec" />
        </div>
        <div className="bg-white/10 px-6 py-3 text-center">
          <p className="text-blue-100 text-xs">April 3 – 15, 2026 &middot; Paris &rarr; Saint-Raphaël &rarr; Lisbon</p>
        </div>
      </div>
    )
  }

  // ── DURING TRIP ──────────────────────────────────────────────────────────
  if (status === "during") {
    const city = getCityForDay(dayNumber)
    const config = CITY_CONFIG[city]
    const tripStart = parseISO(TRIP_START)
    const tripEnd = parseISO(TRIP_END)
    const totalDays = differenceInDays(tripEnd, tripStart) + 1
    const progressPct = Math.round(((dayNumber - 1) / (totalDays - 1)) * 100)

    return (
      <div
        className="mx-4 rounded-3xl overflow-hidden shadow-xl"
        style={{ background: `linear-gradient(135deg, ${config.color} 0%, ${config.light} 100%)` }}
      >
        <div className="px-6 pt-6 pb-4 text-center">
          <p className="text-white/80 text-xs uppercase tracking-[0.2em] font-semibold mb-1">
            We're in {city}
          </p>
          <motion.h2
            key={dayNumber}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-white text-4xl font-bold"
          >
            Day {dayNumber}
            <span className="text-white/60 text-2xl font-normal"> of 13</span>
          </motion.h2>
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between text-white/70 text-xs mb-1.5">
            <span>Apr 3</span>
            <span>{Math.round(progressPct)}% through</span>
            <span>Apr 15</span>
          </div>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── AFTER TRIP ───────────────────────────────────────────────────────────
  const daysSince = getDaysSince()
  return (
    <div className="mx-4 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 shadow-xl text-center px-6 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-5xl mb-3"
      >
        ✈️
      </motion.div>
      <h2 className="text-white text-2xl font-bold">
        {daysSince} day{daysSince !== 1 ? "s" : ""} since our adventure
      </h2>
      <p className="text-slate-300 text-sm mt-2">
        The memories live on forever. Check the memory jar!
      </p>
    </div>
  )
}
