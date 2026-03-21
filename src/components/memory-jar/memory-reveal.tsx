"use client"

import { useState } from "react"
import { MemoryJarItem } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, PartyPopper, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MemoryRevealProps {
  memories: MemoryJarItem[]
}

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = ["#f59e0b", "#3b82f6", "#10b981", "#f43f5e", "#8b5cf6", "#ec4899"]
  const color = colors[index % colors.length]
  const x = Math.random() * 200 - 100
  const rotation = Math.random() * 360

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-sm pointer-events-none"
      style={{ backgroundColor: color, zIndex: 50 }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        x: x,
        y: -(Math.random() * 120 + 40),
        opacity: 0,
        scale: 0.5,
        rotate: rotation,
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  )
}

export function MemoryReveal({ memories }: MemoryRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const currentMemory = memories[revealedCount - 1]
  const hasMore = revealedCount < memories.length
  const allDone = revealedCount === memories.length && memories.length > 0

  function revealNext() {
    setRevealedCount((c) => c + 1)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 900)
  }

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-medium">No memories in the jar</p>
        <p className="text-sm text-muted-foreground">Nobody added any notes!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{revealedCount} of {memories.length} revealed</span>
        <div className="flex gap-1">
          {memories.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i < revealedCount ? "bg-amber-500" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Current revealed memory */}
      <AnimatePresence mode="wait">
        {currentMemory && (
          <motion.div
            key={currentMemory.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-6 shadow-md"
          >
            <div className="absolute -top-3 left-4 text-2xl select-none">✨</div>
            <p className="text-base leading-relaxed text-foreground font-medium text-center">
              "{currentMemory.content}"
            </p>
            <p className="text-center text-xs text-muted-foreground mt-3">— Anonymous</p>

            {/* Confetti burst */}
            {showConfetti && (
              <div className="absolute inset-0 overflow-visible pointer-events-none flex items-center justify-center">
                {Array.from({ length: 16 }).map((_, i) => (
                  <ConfettiParticle key={i} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sealed memories stack (not yet revealed) */}
      {revealedCount === 0 && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="relative">
            {[...Array(Math.min(3, memories.length))].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20"
                style={{
                  width: 280,
                  height: 100,
                  top: i * -4,
                  left: i * -4,
                  opacity: 1 - i * 0.2,
                  zIndex: 3 - i,
                }}
              />
            ))}
            <div className="relative z-10 w-[280px] h-[100px] rounded-2xl border border-amber-300 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>
      )}

      {/* All done */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
            🎉
          </div>
          <p className="text-base font-semibold">All memories revealed!</p>
          <p className="text-sm text-muted-foreground">
            What a trip. These memories will last a lifetime.
          </p>
        </motion.div>
      )}

      {/* Reveal button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={revealNext}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-md"
          >
            {revealedCount === 0 ? (
              <>
                <PartyPopper className="h-5 w-5" />
                Open the memory jar!
              </>
            ) : (
              <>
                <ChevronRight className="h-5 w-5" />
                Reveal next memory
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
