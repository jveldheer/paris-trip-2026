'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Download, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Photo, TripDay } from '@/types'
import { getStorageUrl } from '@/lib/supabase/client'
import { CITY_COLORS, type CityName } from '@/lib/constants'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

type StylePreset = 'classic' | 'light'

interface PostcardEditorProps {
  photo: Photo
  tripDays: TripDay[]
  onClose: () => void
}

const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 900

export function PostcardEditor({ photo, tripDays, onClose }: PostcardEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [caption, setCaption] = useState('')
  const [style, setStyle] = useState<StylePreset>('classic')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  // Determine city and date from trip day
  const tripDay = tripDays.find((d) => d.id === photo.trip_day_id)
  const city = tripDay?.city as CityName | undefined
  const cityColors = city ? CITY_COLORS[city] : null
  const dateLabel = tripDay
    ? `${format(parseISO(tripDay.date), 'MMMM d')}, ${tripDay.city}`
    : ''

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.src = getStorageUrl(photo.storage_path)
  }, [photo.storage_path])

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw photo (cover-crop)
    const imgRatio = img.width / img.height
    const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT
    let sx = 0, sy = 0, sw = img.width, sh = img.height

    if (imgRatio > canvasRatio) {
      sw = img.height * canvasRatio
      sx = (img.width - sw) / 2
    } else {
      sh = img.width / canvasRatio
      sy = (img.height - sh) / 2
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Style overlay
    if (style === 'classic') {
      // Dark gradient from bottom
      const grad = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.45, 0, CANVAS_HEIGHT)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Subtle top gradient for text legibility
      const topGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.2)
      topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)')
      topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.2)
    } else {
      // Light vignette
      const grad = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.5, 0, CANVAS_HEIGHT)
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)')
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.85)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const topGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.18)
      topGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)')
      topGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.18)
    }

    const textColor = style === 'classic' ? '#FFFFFF' : '#1a1a1a'
    const subtleColor = style === 'classic' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'
    const brassColor = '#c9a84c'

    // Top-left: "Veldheer Europe 2026" serif italic
    ctx.save()
    ctx.font = 'italic 32px "Playfair Display", Georgia, serif'
    ctx.fillStyle = textColor
    ctx.textBaseline = 'top'
    ctx.fillText('Veldheer Europe 2026', 48, 44)
    ctx.restore()

    // Top-right: city badge
    if (city && cityColors) {
      ctx.save()
      const cityText = city === 'Saint-Raphael' ? 'Saint-Raphael' : city
      ctx.font = '600 26px "Geist", system-ui, sans-serif'
      ctx.textBaseline = 'top'
      const textWidth = ctx.measureText(cityText).width

      // Dot
      const dotRadius = 8
      const dotX = CANVAS_WIDTH - 48 - textWidth - 20
      const dotY = 52
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = cityColors.accent
      ctx.fill()

      // City name
      ctx.fillStyle = textColor
      ctx.fillText(cityText, dotX + 20, 38)
      ctx.restore()
    }

    // Bottom-left: date
    if (dateLabel) {
      ctx.save()
      ctx.font = '500 28px "Geist", system-ui, sans-serif'
      ctx.fillStyle = subtleColor
      ctx.textBaseline = 'bottom'
      ctx.fillText(dateLabel, 48, CANVAS_HEIGHT - 48)
      ctx.restore()
    }

    // Brass divider + caption (bottom-center)
    if (caption.trim()) {
      ctx.save()
      const captionY = CANVAS_HEIGHT - (dateLabel ? 100 : 60)

      // Brass divider line
      const lineWidth = 80
      ctx.strokeStyle = brassColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH / 2 - lineWidth / 2, captionY - 16)
      ctx.lineTo(CANVAS_WIDTH / 2 + lineWidth / 2, captionY - 16)
      ctx.stroke()

      // Caption text
      ctx.font = 'italic 30px "Playfair Display", Georgia, serif'
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(caption, CANVAS_WIDTH / 2, captionY)
      ctx.restore()
    }
  }, [imageLoaded, style, caption, city, cityColors, dateLabel])

  useEffect(() => {
    if (imageLoaded) renderCanvas()
  }, [imageLoaded, renderCanvas])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    setSaving(true)

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `postcard-${city?.toLowerCase() ?? 'trip'}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setSaving(false)
    }
  }

  async function handleShare() {
    const canvas = canvasRef.current
    if (!canvas) return
    setSaving(true)

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )
      if (!blob) return

      const file = new File([blob], `postcard-${city?.toLowerCase() ?? 'trip'}.png`, {
        type: 'image/png',
      })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Veldheer Europe 2026 Postcard',
        })
      } else {
        // Fallback: download
        await handleDownload()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <h2 className="text-white font-serif text-base font-semibold">Postcard</h2>
        <div className="w-9" />
      </div>

      {/* Canvas preview */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="max-w-full max-h-[55vh] rounded-lg shadow-2xl object-contain"
          style={{ aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
        />
      </div>

      {/* Controls */}
      <div className="shrink-0 px-4 pb-safe space-y-4 pt-3 pb-6">
        {/* Style toggle */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setStyle('classic')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
              style === 'classic'
                ? 'bg-white text-black'
                : 'bg-white/15 text-white/70 hover:bg-white/25'
            )}
          >
            Classic
          </button>
          <button
            onClick={() => setStyle('light')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
              style === 'light'
                ? 'bg-white text-black'
                : 'bg-white/15 text-white/70 hover:bg-white/25'
            )}
          >
            Light
          </button>
        </div>

        {/* Caption input */}
        <div className="relative">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 80))}
            placeholder="Add a caption..."
            className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30">
            {caption.length}/80
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            disabled={!imageLoaded || saving}
            className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl h-12 font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={handleShare}
            disabled={!imageLoaded || saving}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-12 font-medium"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
