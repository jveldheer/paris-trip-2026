"use client"

import { Moment, Photo } from "@/types"
import { Button } from "@/components/ui/button"
import { getStorageUrl } from "@/lib/supabase/client"
import { CheckCircle2, Trophy, Image as ImageIcon, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface HighlightVoteProps {
  tripDayId: string
  moments: Moment[]
  photos: Photo[]
  currentMemberId: string | null
  hasVoted: boolean
  myVoteMomentId?: string | null
  myVotePhotoId?: string | null
  onVote: (args: { momentId?: string; photoId?: string }) => void
}

export function HighlightVote({
  moments,
  photos,
  currentMemberId,
  hasVoted,
  myVoteMomentId,
  myVotePhotoId,
  onVote,
}: HighlightVoteProps) {
  const canVote = !!currentMemberId && !hasVoted

  if (moments.length === 0 && photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No moments or photos yet for today. Add some first!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {hasVoted && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
          <Trophy className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            Your vote is in! Results update live.
          </p>
        </div>
      )}

      {/* Moment cards */}
      {moments.map((moment) => {
        const isMyVote = myVoteMomentId === moment.id
        return (
          <motion.div
            key={moment.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border p-4 transition-colors",
              isMyVote
                ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed text-foreground">{moment.content}</p>
                {moment.member && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {moment.member.emoji} {moment.member.name}
                  </p>
                )}
              </div>
              {isMyVote ? (
                <div className="flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Voted</span>
                </div>
              ) : canVote ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs h-8"
                  onClick={() => onVote({ momentId: moment.id })}
                >
                  Vote
                </Button>
              ) : null}
            </div>
          </motion.div>
        )
      })}

      {/* Photo cards */}
      {photos.map((photo) => {
        const isMyVote = myVotePhotoId === photo.id
        const src = photo.thumbnail_path
          ? getStorageUrl(photo.thumbnail_path)
          : getStorageUrl(photo.storage_path)

        return (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border overflow-hidden transition-colors",
              isMyVote
                ? "border-yellow-400"
                : "border-border"
            )}
          >
            <div className="relative aspect-video bg-muted">
              <Image
                src={src}
                alt={photo.caption ?? "Trip photo"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-white/40" />
              </div>
            </div>
            <div className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {photo.caption && (
                  <p className="text-sm text-foreground truncate">{photo.caption}</p>
                )}
                {photo.member && (
                  <p className="text-xs text-muted-foreground">
                    {photo.member.emoji} {photo.member.name}
                  </p>
                )}
              </div>
              {isMyVote ? (
                <div className="flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Voted</span>
                </div>
              ) : canVote ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs h-8"
                  onClick={() => onVote({ photoId: photo.id })}
                >
                  Vote
                </Button>
              ) : null}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
