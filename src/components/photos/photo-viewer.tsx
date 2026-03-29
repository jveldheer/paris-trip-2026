'use client'

import { useEffect, useCallback, useState } from 'react'
import { Photo, Member } from '@/types'
import { getStorageUrl } from '@/lib/supabase/client'
import { MemberAvatar } from '@/components/shared/member-avatar'
import { X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'

interface PhotoViewerProps {
  photo: Photo | null
  onClose: () => void
  members: Member[]
}

export function PhotoViewer({ photo, onClose, members }: PhotoViewerProps) {
  const [imgError, setImgError] = useState(false)

  // Reset error state when photo changes
  useEffect(() => { setImgError(false) }, [photo?.id])

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!photo) return
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [photo, handleKeyDown])

  const uploader = photo ? members.find((m) => m.id === photo.member_id) ?? photo.member : null
  const imageUrl = photo ? getStorageUrl(photo.storage_path) : ''
  const dateStr = photo
    ? format(parseISO(photo.created_at), 'MMMM d, yyyy · h:mm a')
    : ''

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          key="photo-viewer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={onClose}
        >
          {/* Close button */}
          <div className="flex items-center justify-end p-4 shrink-0">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close photo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image */}
          <div
            className="flex-1 flex items-center justify-center px-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {imgError ? (
              <div className="flex flex-col items-center gap-3 text-white/60">
                <span className="text-4xl">🖼️</span>
                <p className="text-sm">Could not load this photo</p>
              </div>
            ) : (
              <motion.img
                key={photo.id}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.25 }}
                src={imageUrl}
                alt={photo.caption ?? ''}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                draggable={false}
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Caption + metadata */}
          <div
            className="shrink-0 px-4 pt-3 pb-8 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            {photo.caption && (
              <p className="text-white text-sm font-medium leading-relaxed text-center">
                {photo.caption}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              {uploader && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-base"
                    role="img"
                    aria-label={uploader.name}
                  >
                    {uploader.emoji}
                  </span>
                  <span className="text-white/80 text-xs">{uploader.name}</span>
                </div>
              )}
              <span className="text-white/50 text-xs">{dateStr}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
