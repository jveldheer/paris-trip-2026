"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { PollCard } from "@/components/polls/poll-card"
import { CreatePoll } from "@/components/polls/create-poll"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { useTrip } from "@/lib/hooks/use-trip"
import { useRealtime } from "@/lib/hooks/use-realtime"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getLocalItems, setLocalItems } from "@/lib/offline-storage"
import type { Poll, PollOption, PollVote, Member } from "@/types"

type FullPoll = Poll & {
  poll_options: (PollOption & { poll_votes: (PollVote & { member?: Member })[] })[]
  member?: Member
}

const STORAGE_KEY = "offline_polls"

export default function PollsPage() {
  const { trip, currentMember, isOffline } = useTrip()
  const [polls, setPolls] = useState<FullPoll[]>([])
  const [loading, setLoading] = useState(true)
  const [showClosed, setShowClosed] = useState(false)

  const fetchPolls = useCallback(async () => {
    if (!trip) return

    if (isOffline) {
      setPolls(getLocalItems<FullPoll>(STORAGE_KEY))
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from("polls")
      .select(`
        *,
        member:members(*),
        poll_options(
          *,
          poll_votes(
            *,
            member:members(*)
          )
        )
      `)
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: false })

    if (data) setPolls(data as FullPoll[])
    setLoading(false)
  }, [trip, isOffline])

  useEffect(() => {
    fetchPolls()
  }, [fetchPolls])

  const debouncedFetchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedFetchPolls = useCallback(() => {
    if (debouncedFetchRef.current) clearTimeout(debouncedFetchRef.current)
    debouncedFetchRef.current = setTimeout(() => fetchPolls(), 300)
  }, [fetchPolls])

  useRealtime<PollVote & { id: string }>(
    "poll_votes",
    debouncedFetchPolls,
    debouncedFetchPolls,
    debouncedFetchPolls
  )

  async function handleVote(pollId: string, pollOptionId: string) {
    if (!currentMember) return

    if (isOffline) {
      setPolls((prev) => {
        const next = prev.map((p) => {
          if (p.id !== pollId) return p
          return {
            ...p,
            poll_options: p.poll_options.map((opt) => {
              if (opt.id !== pollOptionId) return opt
              return {
                ...opt,
                poll_votes: [
                  ...(opt.poll_votes ?? []),
                  {
                    id: `local-vote-${Date.now()}`,
                    poll_option_id: pollOptionId,
                    member_id: currentMember.id,
                    member: currentMember,
                  },
                ],
              }
            }),
          }
        }) as FullPoll[]
        setLocalItems(STORAGE_KEY, next)
        return next
      })
      return
    }

    const supabase = getSupabaseClient()
    await supabase
      .from("poll_votes")
      .insert({ poll_option_id: pollOptionId, member_id: currentMember.id })

    fetchPolls()
  }

  function handleCreated(newPoll?: FullPoll) {
    if (isOffline && newPoll) {
      setPolls((prev) => {
        const next = [newPoll, ...prev]
        setLocalItems(STORAGE_KEY, next)
        return next
      })
    } else {
      fetchPolls()
    }
  }

  const isEffectivelyClosed = (p: FullPoll) =>
    !p.is_active || (p.closes_at ? new Date(p.closes_at) < new Date() : false)

  const activePolls = polls.filter((p) => !isEffectivelyClosed(p))
  const closedPolls = polls.filter((p) => isEffectivelyClosed(p))

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Polls" subtitle="Vote on what to do next">
        {trip && currentMember && (
          <CreatePoll
            tripId={trip.id}
            memberId={currentMember.id}
            onCreated={handleCreated}
            isOffline={isOffline}
          />
        )}
      </PageHeader>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
        {loading ? (
          <LoadingSkeleton count={3} />
        ) : activePolls.length === 0 && closedPolls.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No polls yet"
            description="Create a poll to get the group's input on anything!"
          />
        ) : (
          <>
            {activePolls.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active ({activePolls.length})
                </p>
                {activePolls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    currentMemberId={currentMember?.id ?? null}
                    onVote={(optionId) => handleVote(poll.id, optionId)}
                  />
                ))}
              </div>
            )}

            {activePolls.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active polls right now.
              </p>
            )}

            {closedPolls.length > 0 && (
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => setShowClosed((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full py-2"
                >
                  {showClosed ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {closedPolls.length} closed{" "}
                  {closedPolls.length === 1 ? "poll" : "polls"}
                </button>
                {showClosed && (
                  <div className="space-y-3 mt-2">
                    {closedPolls.map((poll) => (
                      <PollCard
                        key={poll.id}
                        poll={poll}
                        currentMemberId={currentMember?.id ?? null}
                        onVote={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
