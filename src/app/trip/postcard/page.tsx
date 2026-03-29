'use client'

import { useState, useEffect, useCallback } from 'react'
import { ImageIcon } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { PostcardEditor } from '@/components/postcard/postcard-editor'
import { useTrip } from '@/lib/hooks/use-trip'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { getSupabaseClient, getStorageUrl } from '@/lib/supabase/client'
import { Photo } from '@/types'
import { cn } from '@/lib/utils'

export default function PostcardPage() {
  const { trip, tripDays, isOffline } = useTrip()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    if (!trip) return

    if (isOffline) {
      setPhotos([])
      setLoading(false)
      return
    }

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
  }, [trip?.id, isOffline])

  useRealtime<Photo>(
    'photos',
    useCallback((newPhoto) => {
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Postcard" />
        <div className="p-4">
          <LoadingSkeleton variant="grid" count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Postcard" />

      {/* Instruction */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm text-muted-foreground">
          Tap a photo to turn it into a downloadable postcard.
        </p>
      </div>

      <div className="flex-1 p-1 pb-32">
        {photos.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No photos yet"
            description={
              isOffline
                ? 'Photos require a connection. Upload some in the Photos tab first.'
                : 'Upload some trip photos first, then come back to make postcards!'
            }
          />
        ) : (
          <div
            className={cn(
              'grid gap-1',
              'grid-cols-2',
              'sm:grid-cols-3',
              'lg:grid-cols-4'
            )}
          >
            {photos.map((photo) => {
              const thumbUrl = photo.thumbnail_path
                ? getStorageUrl(photo.thumbnail_path)
                : getStorageUrl(photo.storage_path)

              return (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square overflow-hidden rounded-xl bg-muted group focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={photo.caption ?? 'Trip photo'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 group-active:scale-100"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-70 transition-opacity drop-shadow-lg" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Postcard Editor Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <PostcardEditor
            photo={selectedPhoto}
            tripDays={tripDays}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
