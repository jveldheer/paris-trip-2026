"use client"

import { useEffect, useRef, useState } from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  color?: string      // tailwind bg class for icon bg, e.g. "bg-blue-100"
  iconColor?: string  // tailwind text class for icon color, e.g. "text-blue-600"
}

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }

    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return count
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "bg-blue-100",
  iconColor = "text-blue-600",
}: StatCardProps) {
  const count = useCountUp(value)

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", color)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <div className="text-3xl font-bold tabular-nums leading-none">{count}</div>
      <div className="text-xs text-muted-foreground text-center leading-snug">{label}</div>
    </div>
  )
}
