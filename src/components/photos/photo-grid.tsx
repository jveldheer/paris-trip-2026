'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Photo } from '@/types'
import { PhotoCard } from './photo-card'
import { cn } from '@/lib/utils'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
}

/** Individual photo cell with Intersection Observer lazy-reveal */
function LazyPhotoCell({
  photo,
  onClick,
}: {
  photo: Photo
  onClick: (p: Photo) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {visible && <PhotoCard photo={photo} onClick={onClick} />}
      {/* Placeholder while not yet visible */}
      {!visible && (
        <div className="aspect-square w-full rounded-xl bg-muted animate-pulse" />
      )}
    </div>
  )
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  // Sort newest first
  const sorted = [...photos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (sorted.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'grid gap-1',
        'grid-cols-2',          // mobile
        'sm:grid-cols-3',       // tablet
        'lg:grid-cols-4'        // desktop
      )}
    >
      {sorted.map((photo) => (
        <LazyPhotoCell key={photo.id} photo={photo} onClick={onPhotoClick} />
      ))}
    </div>
  )
}
