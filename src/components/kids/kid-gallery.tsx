"use client"

import { KidDrawing, Member } from "@/types"
import { getStorageUrl } from "@/lib/supabase/client"
import { Paintbrush } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface KidGalleryProps {
  drawings: KidDrawing[]
  members: Member[]
}

export function KidGallery({ drawings, members }: KidGalleryProps) {
  if (drawings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
          <Paintbrush className="h-8 w-8 text-purple-400" />
        </div>
        <p className="text-base font-semibold text-foreground">No drawings yet!</p>
        <p className="text-sm text-muted-foreground">Draw something above and save it here.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {drawings.map((drawing, i) => {
        const artist =
          drawing.member ?? members.find((m) => m.id === drawing.member_id)

        return (
          <motion.div
            key={drawing.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-2xl overflow-hidden border-2 border-purple-200 bg-white dark:bg-card shadow-sm"
          >
            {/* Drawing image */}
            <div className="relative aspect-square bg-muted">
              <Image
                src={getStorageUrl(drawing.storage_path)}
                alt={drawing.caption ?? `Drawing by ${artist?.name ?? "someone"}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 320px"
              />
            </div>

            {/* Artist info */}
            <div
              className={cn(
                "px-2 py-2 bg-gradient-to-r from-purple-50 to-pink-50",
                "dark:from-purple-950/30 dark:to-pink-950/20"
              )}
            >
              {artist && (
                <div className="flex items-center gap-1.5">
                  <span className="text-lg leading-none select-none">{artist.emoji}</span>
                  <span className="text-xs font-semibold text-foreground truncate">
                    {artist.name}
                  </span>
                </div>
              )}
              {drawing.caption && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {drawing.caption}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
