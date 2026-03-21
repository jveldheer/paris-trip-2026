'use client'

import { Photo, Member } from '@/types'
import { getStorageUrl } from '@/lib/supabase/client'

interface PhotoCardProps {
  photo: Photo
  onClick: (photo: Photo) => void
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const member = photo.member
  const thumbnailUrl = photo.thumbnail_path
    ? getStorageUrl(photo.thumbnail_path)
    : getStorageUrl(photo.storage_path)

  return (
    <button
      onClick={() => onClick(photo)}
      className="group relative w-full overflow-hidden rounded-xl bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={photo.caption ?? 'Photo'}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={photo.caption ?? ''}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        {photo.caption && (
          <p className="line-clamp-2 text-left text-xs font-medium leading-snug text-white">
            {photo.caption}
          </p>
        )}
      </div>

      {/* Member emoji badge — always visible */}
      {member && (
        <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-sm leading-none backdrop-blur-sm">
          <span role="img" aria-label={member.name}>
            {member.emoji}
          </span>
        </div>
      )}
    </button>
  )
}
