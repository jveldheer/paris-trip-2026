'use client'

import { useState, useEffect, useCallback } from 'react'
import { Images } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PhotoViewer } from '@/components/photos/photo-viewer'
import { PhotoUpload } from '@/components/photos/photo-upload'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { useTrip } from '@/lib/hooks/use-trip'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Photo } from '@/types'
import { cn } from '@/lib/utils'

type FilterType = 'all' | string // 'all' | tripDayId | 'member:<memberId>'

export default function PhotosPage() {
  const { trip, members, tripDays, currentMember } = useTrip()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  // Fetch photos on mount / trip change
  useEffect(() => {
    if (!trip) return

    const supabase = getSupabaseClient()
    supabase
      .from('photos')
      .select('*, member:members(*)')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPhotos((data as Photo[]) ?? [])
        setLoading(false)
      })
  }, [trip?.id])

  // Realtime — new photos appear live for everyone
  useRealtime<Photo>(
    'photos',
    useCallback((newPhoto) => {
      // Fetch with member join so the avatar renders correctly
      getSupabaseClient()
        .from('photos')
        .select('*, member:members(*)')
        .eq('id', newPhoto.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setPhotos((prev) => {
              if (prev.some((p) => p.id === (data as Photo).id)) return prev
              return [data as Photo, ...prev]
            })
          }
        })
    }, [])
  )

  function handleUpload(photo: Photo) {
    setPhotos((prev) => {
      if (prev.some((p) => p.id === photo.id)) return prev
      return [photo, ...prev]
    })
  }

  // Build filter logic
  const filteredPhotos = photos.filter((p) => {
    if (filter === 'all') return true
    if (filter.startsWith('member:')) return p.member_id === filter.slice(7)
    return p.trip_day_id === filter
  })

  const dayTabs: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    ...tripDays.map((d) => ({ label: `Day ${d.day_number}`, value: d.id })),
  ]

  const memberFilters = members.map((m) => ({
    emoji: m.emoji,
    name: m.name,
    value: `member:${m.id}` as FilterType,
  }))

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Photos" />
        <div className="p-4">
          <LoadingSkeleton variant="grid" count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Photos" />

      {/* Filter bars — sticky under the page header */}
      <div className="sticky top-[53px] z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Day filter */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
          {dayTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Member filter */}
        {memberFilters.length > 0 && (
          <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-hide">
            {memberFilters.map((m) => (
              <button
                key={m.value}
                onClick={() => setFilter((prev) => (prev === m.value ? 'all' : m.value))}
                title={m.name}
                aria-label={`Filter by ${m.name}`}
                className={cn(
                  'shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-base transition-all',
                  filter === m.value
                    ? 'ring-2 ring-primary ring-offset-1 bg-primary/10'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Photo grid */}
      <div className="flex-1 p-1 pb-32">
        {filteredPhotos.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No photos yet"
            description={
              filter === 'all'
                ? 'Be the first to upload a photo from the trip!'
                : 'No photos match this filter.'
            }
          />
        ) : (
          <PhotoGrid photos={filteredPhotos} onPhotoClick={setSelectedPhoto} />
        )}
      </div>

      {/* Lightbox */}
      <PhotoViewer
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        members={members}
      />

      {/* Upload FAB — only when a member is selected */}
      {currentMember && trip && (
        <PhotoUpload
          tripId={trip.id}
          memberId={currentMember.id}
          tripDays={tripDays}
          onUpload={handleUpload}
        />
      )}
    </div>
  )
}
