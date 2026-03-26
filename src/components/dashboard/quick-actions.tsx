"use client"

import Link from "next/link"
import { CalendarDays, MapPin, CloudSun, Info } from "lucide-react"
import { motion } from "framer-motion"

const actions = [
  {
    icon: CalendarDays,
    label: "Today",
    href: "/trip/itinerary",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    ringColor: "ring-blue-200",
  },
  {
    icon: MapPin,
    label: "Map Dots",
    href: "/trip/food-map",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-700",
    ringColor: "ring-amber-200",
  },
  {
    icon: CloudSun,
    label: "Weather",
    href: "/trip/weather",
    bgColor: "bg-sky-50",
    iconColor: "text-sky-600",
    ringColor: "ring-sky-200",
  },
  {
    icon: Info,
    label: "Trip Info",
    href: "/trip/info",
    bgColor: "bg-stone-100",
    iconColor: "text-stone-600",
    ringColor: "ring-stone-200",
  },
] as const

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
}

export function QuickActions() {
  return (
    <div className="px-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Quick Actions
      </h3>
      <motion.div
        className="grid grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action) => (
          <motion.div key={action.href} variants={itemVariants}>
            <Link href={action.href} className="block">
              <div className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted active:scale-95 transition-all duration-150 touch-manipulation">
                {/* Icon circle */}
                <div
                  className={`
                    flex items-center justify-center
                    w-14 h-14 rounded-2xl
                    ${action.bgColor}
                    ring-1 ${action.ringColor}
                    shadow-sm
                  `}
                >
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} strokeWidth={1.75} />
                </div>
                {/* Label */}
                <span className="text-xs font-medium text-center leading-tight text-foreground/80">
                  {action.label}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
