'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { MomentFeed } from '@/components/moments/moment-feed'
import { AddMoment } from '@/components/moments/add-moment'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { useTrip } from '@/lib/hooks/use-trip'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getLocalItems, setLocalItems } from '@/lib/offline-storage'
import { Moment, MomentType } from '@/types'
import { MOMENT_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'

type FilterType = 'all' | MomentType

const FILTER_TABS: { label: string; value: FilterType; emoji: string }[] = [
  { label: 'All', value: 'all', emoji: '' },
  ...MOMENT_TYPES.map((t) => ({ label: t.label, value: t.value as FilterType, emoji: t.emoji })),
]

const STORAGE_KEY = 'offline_moments'

export default function MomentsPage() {
  const { trip, currentMember, tripDays, isOffline } = useTrip()
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (!trip) return

    if (isOffline) {
      setMoments(getLocalItems<Moment>(STORAGE_KEY))
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    supabase
      .from('moments')
      .select('*, member:members(*), trip_day:trip_days(*)')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMoments((data as Moment[]) ?? [])
        setLoading(false)
      })
  }, [trip?.id, isOffline])

  useRealtime<Moment>(
    'moments',
    useCallback((newMoment) => {
      getSupabaseClient()
        .from('moments')
        .select('*, member:members(*), trip_day:trip_days(*)')
        .eq('id', newMoment.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setMoments((prev) => {
              if (prev.some((m) => m.id === (data as Moment).id)) return prev
              return [data as Moment, ...prev]
            })
          }
        })
    }, [])
  )

  function handleAdd(moment: Moment) {
    setMoments((prev) => {
      const next = prev.some((m) => m.id === moment.id) ? prev : [moment, ...prev]
      if (isOffline) setLocalItems(STORAGE_KEY, next)
      return next
    })
  }

  const filtered =
    filter === 'all' ? moments : moments.filter((m) => m.moment_type === filter)

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Moments" />

      <div className="sticky top-[53px] z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                filter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tab.emoji ? `${tab.emoji} ` : ''}{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 pb-32">
        {loading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={filter === 'all' ? 'No moments yet' : `No ${filter}s yet`}
            description={
              filter === 'all'
                ? 'Capture a funny quote, a highlight, or a note from the trip!'
                : `No ${filter} moments have been shared yet.`
            }
          />
        ) : (
          <MomentFeed moments={filtered} />
        )}
      </div>

      {currentMember && trip && (
        <AddMoment
          tripId={trip.id}
          memberId={currentMember.id}
          tripDays={tripDays}
          onAdd={handleAdd}
          isOffline={isOffline}
        />
      )}
    </div>
  )
}
