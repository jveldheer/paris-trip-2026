"use client"

import { Member } from "@/types"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  member: Member
  count: number
}

interface LeaderboardProps {
  title: string
  entries: LeaderboardEntry[]
  unit?: string
}

const MEDALS = ["🥇", "🥈", "🥉"]

export function Leaderboard({ title, entries, unit = "" }: LeaderboardProps) {
  if (entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => b.count - a.count)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {sorted.map((entry, i) => {
          const rank = i + 1
          const medal = MEDALS[i]

          return (
            <div
              key={entry.member.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                rank === 1 && "bg-yellow-50/60 dark:bg-yellow-950/20"
              )}
            >
              {/* Rank / medal */}
              <div className="w-8 flex items-center justify-center shrink-0">
                {medal ? (
                  <span className="text-xl leading-none select-none">{medal}</span>
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{rank}</span>
                )}
              </div>

              {/* Member */}
              <MemberAvatar member={entry.member} size="sm" showName />

              {/* Count */}
              <div className="ml-auto flex items-baseline gap-1 shrink-0">
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    rank === 1 ? "text-yellow-600" : "text-foreground"
                  )}
                >
                  {entry.count}
                </span>
                {unit && (
                  <span className="text-xs text-muted-foreground">{unit}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
