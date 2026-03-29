"use client"

import { Poll, PollOption, PollVote, Member } from "@/types"
import { Badge } from "@/components/ui/badge"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { cn } from "@/lib/utils"
import { Lock, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { formatDateLong } from "@/lib/utils"

interface PollCardProps {
  poll: Poll & {
    poll_options: (PollOption & {
      poll_votes: (PollVote & { member?: Member })[]
    })[]
    member?: Member
  }
  currentMemberId: string | null
  onVote: (pollOptionId: string) => void
}

export function PollCard({ poll, currentMemberId, onVote }: PollCardProps) {
  const allVotes = poll.poll_options.flatMap((o) => o.poll_votes ?? [])
  const totalVotes = allVotes.length

  // Which option did the current user vote on?
  const myVote = poll.poll_options.find((o) =>
    (o.poll_votes ?? []).some((v) => v.member_id === currentMemberId)
  )

  const isClosed = !poll.is_active || (poll.closes_at ? new Date(poll.closes_at) < new Date() : false)
  const hasVoted = !!myVote

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {poll.member && (
              <span className="text-xs text-muted-foreground">
                {poll.member.emoji} {poll.member.name}
              </span>
            )}
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatDateLong(poll.created_at)}</span>
          </div>
          <h3 className="text-base font-semibold leading-snug">{poll.question}</h3>
        </div>
        {isClosed && (
          <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
            <Lock className="h-3 w-3" />
            Closed
          </Badge>
        )}
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {poll.poll_options
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((option) => {
            const votes = (option.poll_votes ?? []).length
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
            const isMyChoice = myVote?.id === option.id
            const canVote = !isClosed && !hasVoted && !!currentMemberId

            return (
              <button
                key={option.id}
                onClick={() => canVote && onVote(option.id)}
                disabled={!canVote}
                className={cn(
                  "w-full text-left rounded-xl border transition-all overflow-hidden",
                  isMyChoice
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40"
                    : "border-border bg-background",
                  canVote && "hover:border-blue-300 hover:bg-muted/50 active:scale-[0.99]",
                  !canVote && "cursor-default"
                )}
              >
                <div className="relative px-3 py-2.5">
                  {/* Background bar */}
                  {(hasVoted || isClosed) && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-xl",
                        isMyChoice ? "bg-blue-200/60 dark:bg-blue-800/40" : "bg-muted"
                      )}
                    />
                  )}

                  {/* Content row */}
                  <div className="relative flex items-center gap-2">
                    {isMyChoice && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium leading-snug",
                        isMyChoice ? "text-blue-700 dark:text-blue-300" : "text-foreground"
                      )}
                    >
                      {option.text}
                    </span>

                    {(hasVoted || isClosed) && (
                      <span className="text-xs font-semibold text-muted-foreground shrink-0">
                        {pct}%
                      </span>
                    )}
                  </div>

                  {/* Voter avatars */}
                  {(option.poll_votes ?? []).length > 0 && (
                    <div className="relative flex items-center gap-1 mt-1.5">
                      <div className="flex -space-x-1.5">
                        {(option.poll_votes ?? []).slice(0, 6).map((vote) =>
                          vote.member ? (
                            <div
                              key={vote.id}
                              className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center text-xs leading-none"
                              title={vote.member.name}
                            >
                              {vote.member.emoji}
                            </div>
                          ) : null
                        )}
                        {(option.poll_votes ?? []).length > 6 && (
                          <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                            +{(option.poll_votes ?? []).length - 6}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {votes} {votes === 1 ? "vote" : "votes"}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
        </span>
        {!isClosed && !hasVoted && currentMemberId && (
          <span className="text-xs text-blue-600 font-medium">Tap an option to vote</span>
        )}
        {hasVoted && !isClosed && (
          <span className="text-xs text-green-600 font-medium">You voted!</span>
        )}
      </div>
    </div>
  )
}
