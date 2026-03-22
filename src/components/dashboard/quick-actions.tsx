"use client"

import Link from "next/link"
import { Camera, Edit3, Heart, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

const actions = [
  {
    icon: Camera,
    label: "Add Photo",
    href: "/trip/photos",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    ringColor: "ring-blue-200",
  },
  {
    icon: Edit3,
    label: "Moment",
    href: "/trip/moments",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    ringColor: "ring-purple-200",
  },
  {
    icon: Heart,
    label: "Wish List",
    href: "/trip/wishlist",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
    ringColor: "ring-rose-200",
  },
  {
    icon: BarChart3,
    label: "Polls",
    href: "/trip/polls",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    ringColor: "ring-emerald-200",
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
