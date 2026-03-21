"use client"

import { TripDay, Moment, Photo } from "@/types"
import { Trophy, MessageSquare, Image as ImageIcon } from "lucide-react"
import { getStorageUrl } from "@/lib/supabase/client"
import { CityBadge } from "@/components/shared/city-badge"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface HighlightWinnerProps {
  tripDay: TripDay
  winningMoment?: Moment | null
  winningPhoto?: Photo | null
  voteCount: number
}

export function HighlightWinner({
  tripDay,
  winningMoment,
  winningPhoto,
  voteCount,
}: HighlightWinnerProps) {
  const hasWinner = winningMoment || winningPhoto

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Day header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-border bg-muted/30">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">Day {tripDay.day_number}</span>
            <CityBadge city={tripDay.city} />
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(tripDay.date)}</p>
        </div>
        {voteCount > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </span>
        )}
      </div>

      {/* Winner content */}
      {hasWinner ? (
        <div>
          {winningPhoto && (
            <div className="relative aspect-video bg-muted">
              <Image
                src={
                  winningPhoto.thumbnail_path
                    ? getStorageUrl(winningPhoto.thumbnail_path)
                    : getStorageUrl(winningPhoto.storage_path)
                }
                alt={winningPhoto.caption ?? "Highlight photo"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
              />
              {/* Trophy overlay */}
              <div className="absolute top-2 left-2 bg-yellow-400/90 rounded-full p-1.5">
                <Trophy className="h-3.5 w-3.5 text-yellow-900" />
              </div>
            </div>
          )}
          <div className="p-4">
            {winningMoment && (
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    "bg-yellow-100 text-yellow-600"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed font-medium text-foreground">
                    "{winningMoment.content}"
                  </p>
                  {winningMoment.member && (
                    <p className="text-xs text-muted-foreground mt-1">
                      — {winningMoment.member.emoji} {winningMoment.member.name}
                    </p>
                  )}
                </div>
              </div>
            )}
            {winningPhoto && winningPhoto.caption && (
              <p className="text-sm text-muted-foreground mt-1">{winningPhoto.caption}</p>
            )}
            {winningPhoto?.member && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {winningPhoto.member.emoji} {winningPhoto.member.name}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No winner for this day yet</p>
        </div>
      )}
    </div>
  )
}
