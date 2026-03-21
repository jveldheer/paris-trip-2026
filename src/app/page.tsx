"use client"

import { CodeEntry } from "@/components/landing/code-entry"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-paris-bg via-white to-lisbon-bg relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-8xl">🗼</div>
        <div className="absolute top-40 right-10 text-6xl">🌊</div>
        <div className="absolute bottom-40 left-20 text-7xl">🏛️</div>
        <div className="absolute bottom-20 right-20 text-5xl">🚂</div>
      </div>

      <motion.div
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-paris mb-2">Veldheer Europe 2026</h1>
        <p className="text-lg text-muted-foreground">Paris &middot; Saint-Raphael &middot; Lisbon</p>
        <p className="text-sm text-muted-foreground mt-1">April 3 - 15, 2026</p>
      </motion.div>

      <CodeEntry />
    </div>
  )
}
