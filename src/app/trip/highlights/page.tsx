"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, Star } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { HighlightVote } from "@/components/highlights/highlight-vote"
import { HighlightWinner } from "@/components/highlights/highlight-winner"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { useTrip } from "@/lib/hooks/use-trip"
import { getSupabaseClient } from "@/lib/supabase/client"
import { TRIP_END } from "@/lib/constants"
import type { TripDay, Moment, Photo, DailyHighlight, Member } from "@/types"
import { format } from "date-fns"

type VoteWithDetails = DailyHighlight & { member?: Member }

interface DayHighlightData {
  tripDay: TripDay
  moments: (Moment & { member?: Member })[]
  photos: (Photo & { member?: Member })[]
  votes: VoteWithDetails[]
  winningMoment: (Moment & { member?: Member }) | null
  winningPhoto: (Photo & { member?: Member }) | null
  voteCount: number
}

export default function HighlightsPage() {
  const { trip, tripDays, currentMember, isOffline } = useTrip()
  const [dayData, setDayData] = useState<DayHighlightData[]>([])
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), "yyyy-MM-dd")

  const fetchData = useCallback(async () => {
    if (!trip || tripDays.length === 0) return

    if (isOffline) {
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()

    const [momentsRes, photosRes, votesRes] = await Promise.all([
      supabase
        .from("moments")
        .select("*, member:members(*)")
        .eq("trip_id", trip.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("photos")
        .select("*, member:members(*)")
        .eq("trip_id", trip.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("daily_highlights")
        .select("*, member:members(*)")
        .in("trip_day_id", tripDays.map((d) => d.id)),
    ])

    const moments = (momentsRes.data ?? []) as (Moment & { member?: Member })[]
    const photos = (photosRes.data ?? []) as (Photo & { member?: Member })[]
    const votes = (votesRes.data ?? []) as VoteWithDetails[]

    // Only show trip days that are today or in the past
    const relevantDays = tripDays.filter((d) => d.date <= today)

    const built: DayHighlightData[] = relevantDays.map((tripDay) => {
      const dayMoments = moments.filter((m) => m.trip_day_id === tripDay.id)
      const dayPhotos = photos.filter((p) => p.trip_day_id === tripDay.id)
      const dayVotes = votes.filter((v) => v.trip_day_id === tripDay.id)

      // Count votes per candidate
      const momentVotes: Record<string, number> = {}
      const photoVotes: Record<string, number> = {}
      for (const vote of dayVotes) {
        if (vote.moment_id) momentVotes[vote.moment_id] = (momentVotes[vote.moment_id] ?? 0) + 1
        if (vote.photo_id) photoVotes[vote.photo_id] = (photoVotes[vote.photo_id] ?? 0) + 1
      }

      let winningMoment: (Moment & { member?: Member }) | null = null
      let winningPhoto: (Photo & { member?: Member }) | null = null
      let topCount = 0

      for (const [id, count] of Object.entries(momentVotes)) {
        if (count > topCount) {
          topCount = count
          winningMoment = dayMoments.find((m) => m.id === id) ?? null
          winningPhoto = null
        }
      }
      for (const [id, count] of Object.entries(photoVotes)) {
        if (count > topCount) {
          topCount = count
          winningPhoto = dayPhotos.find((p) => p.id === id) ?? null
          winningMoment = null
        }
      }

      return {
        tripDay,
        moments: dayMoments,
        photos: dayPhotos,
        votes: dayVotes,
        winningMoment,
        winningPhoto,
        voteCount: dayVotes.length,
      }
    })

    // Most recent first
    setDayData(built.reverse())
    setLoading(false)
  }, [trip, tripDays, today])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleVote({
    tripDayId,
    momentId,
    photoId,
  }: {
    tripDayId: string
    momentId?: string
    photoId?: string
  }) {
    if (!currentMember) return
    const supabase = getSupabaseClient()
    await supabase.from("daily_highlights").insert({
      trip_day_id: tripDayId,
      member_id: currentMember.id,
      moment_id: momentId ?? null,
      photo_id: photoId ?? null,
    })
    fetchData()
  }

  const tripStarted = today >= (trip?.start_date ?? "9999")
  const tripEnded = today > TRIP_END

  const todayData = dayData.find((d) => d.tripDay.date === today)
  const pastData = dayData.filter((d) => d.tripDay.date < today)

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Daily Highlights" subtitle="Vote for the best moment each day" />

      <div className="p-4 space-y-5 max-w-lg mx-auto pb-24">
        {loading ? (
          <LoadingSkeleton count={3} />
        ) : !tripStarted ? (
          <EmptyState
            icon={Trophy}
            title="Trip hasn't started yet"
            description="Highlights will appear here once you're on the road!"
          />
        ) : (
          <>
            {/* Today's voting */}
            {todayData && !tripEnded && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                  <h2 className="text-base font-semibold">Vote for today's highlight</h2>
                </div>
                <HighlightVote
                  tripDayId={todayData.tripDay.id}
                  moments={todayData.moments}
                  photos={todayData.photos}
                  currentMemberId={currentMember?.id ?? null}
                  hasVoted={todayData.votes.some((v) => v.member_id === currentMember?.id)}
                  myVoteMomentId={
                    todayData.votes.find((v) => v.member_id === currentMember?.id)?.moment_id
                  }
                  myVotePhotoId={
                    todayData.votes.find((v) => v.member_id === currentMember?.id)?.photo_id
                  }
                  onVote={({ momentId, photoId }) =>
                    handleVote({ tripDayId: todayData.tripDay.id, momentId, photoId })
                  }
                />
              </div>
            )}

            {/* Past winners */}
            {pastData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <h2 className="text-base font-semibold">Past winners</h2>
                </div>
                <div className="space-y-3">
                  {pastData.map((d) => (
                    <HighlightWinner
                      key={d.tripDay.id}
                      tripDay={d.tripDay}
                      winningMoment={d.winningMoment}
                      winningPhoto={d.winningPhoto}
                      voteCount={d.voteCount}
                    />
                  ))}
                </div>
              </div>
            )}

            {dayData.length === 0 && (
              <EmptyState
                icon={Trophy}
                title="No highlights yet"
                description="Add moments and photos, then vote for the best ones each day!"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
