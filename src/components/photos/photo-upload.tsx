'use client'

import { useRef, useState } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Photo, TripDay } from '@/types'
import { resizeImage } from '@/lib/utils'

interface PhotoUploadProps {
  tripId: string
  memberId: string
  tripDays: TripDay[]
  onUpload?: (photo: Photo) => void
}

export function PhotoUpload({ tripId, memberId, tripDays, onUpload }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [dayId, setDayId] = useState<string>('none')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetState() {
    setPreview(null)
    setSelectedFile(null)
    setCaption('')
    setDayId('none')
    setProgress(0)
    setUploading(false)
    setError(null)
  }

  function handleFabClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset value so the same file can be re-selected
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setOpen(true)
    setError(null)
  }

  async function handleUpload() {
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setProgress(10)

    try {
      // Resize full image to max 2000px
      const fullBlob = await resizeImage(selectedFile, 2000)
      setProgress(25)

      // Resize thumbnail to max 400px
      const thumbBlob = await resizeImage(selectedFile, 400)
      setProgress(40)

      const supabase = getSupabaseClient()
      const timestamp = Date.now()
      const ext = selectedFile.type === 'image/png' ? 'png' : 'jpg'
      const fullPath = `photos/${tripId}/${memberId}/${timestamp}.${ext}`
      const thumbPath = `thumbnails/${tripId}/${memberId}/${timestamp}.${ext}`

      // Upload full image
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fullPath, fullBlob, {
          contentType: selectedFile.type || 'image/jpeg',
          upsert: false,
        })
      if (uploadError) throw uploadError
      setProgress(65)

      // Upload thumbnail
      const { error: thumbError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbPath, thumbBlob, {
          contentType: selectedFile.type || 'image/jpeg',
          upsert: false,
        })
      if (thumbError) throw thumbError
      setProgress(80)

      // Create DB record
      const { data, error: dbError } = await supabase
        .from('photos')
        .insert({
          trip_id: tripId,
          member_id: memberId,
          storage_path: fullPath,
          thumbnail_path: thumbPath,
          caption: caption.trim() || null,
          trip_day_id: dayId === 'none' ? null : dayId,
        })
        .select('*, member:members(*)')
        .single()

      if (dbError) throw dbError
      setProgress(100)

      if (data) {
        onUpload?.(data as Photo)
      }

      resetState()
      setOpen(false)
    } catch (err: unknown) {
      console.error(err)
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* FAB */}
      <Button
        size="icon"
        onClick={handleFabClick}
        className="h-14 w-14 rounded-full shadow-lg shadow-black/20 fixed bottom-24 right-4 z-30"
        aria-label="Upload a photo"
      >
        <Camera className="h-6 w-6" />
      </Button>

      {/* Sheet for caption + day selection */}
      <Sheet
        open={open}
        onOpenChange={(v) => {
          if (!v) resetState()
          setOpen(v)
        }}
      >
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Upload Photo</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {/* Preview */}
            {preview && (
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-video flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 w-auto object-contain"
                />
                {!uploading && (
                  <button
                    onClick={() => {
                      setPreview(null)
                      setSelectedFile(null)
                    }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Caption */}
            <Textarea
              placeholder="Add a caption… (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              disabled={uploading}
              className="resize-none"
              maxLength={300}
            />

            {/* Day selector */}
            {tripDays.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Tag a day{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Select value={dayId} onValueChange={(v) => setDayId(v ?? '')} disabled={uploading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Which day was this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific day</SelectItem>
                    {tripDays.map((day) => (
                      <SelectItem key={day.id} value={day.id}>
                        Day {day.day_number} — {day.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Progress bar */}
            {uploading && progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end pb-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetState()
                  setOpen(false)
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
