'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSupabaseClient } from '@/lib/supabase/client'
import { generateId } from '@/lib/offline-storage'
import { Moment, MomentType, TripDay } from '@/types'
import { MOMENT_TYPES } from '@/lib/constants'

interface AddMomentProps {
  tripId: string
  memberId: string
  tripDays: TripDay[]
  onAdd?: (moment: Moment) => void
  isOffline?: boolean
}

export function AddMoment({ tripId, memberId, tripDays, onAdd, isOffline }: AddMomentProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [momentType, setMomentType] = useState<MomentType>('note')
  const [dayId, setDayId] = useState<string>('none')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setContent('')
    setMomentType('note')
    setDayId('none')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    if (isOffline) {
      const localMoment: Moment = {
        id: generateId(),
        trip_id: tripId,
        member_id: memberId,
        content: trimmed,
        moment_type: momentType,
        trip_day_id: dayId === 'none' ? null : dayId,
        created_at: new Date().toISOString(),
      }
      onAdd?.(localMoment)
      resetForm()
      setOpen(false)
      setSubmitting(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { data, error: dbError } = await supabase
        .from('moments')
        .insert({
          trip_id: tripId,
          member_id: memberId,
          content: trimmed,
          moment_type: momentType,
          trip_day_id: dayId === 'none' ? null : dayId,
        })
        .select('*, member:members(*), trip_day:trip_days(*)')
        .single()

      if (dbError) throw dbError

      if (data) {
        onAdd?.(data as Moment)
        resetForm()
        setOpen(false)
      }
    } catch (err) {
      setError('Failed to save moment. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetForm()
      }}
    >
      <SheetTrigger
        className="h-14 w-14 rounded-full shadow-lg shadow-black/20 fixed bottom-24 right-4 z-30 bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
        aria-label="Add a moment"
      >
        <Plus className="h-6 w-6" />
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Add a Moment</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What happened? A quote, a funny moment, a highlight…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            autoFocus
            disabled={submitting}
            className="resize-none"
            maxLength={1000}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Type</label>
            <Select
              value={momentType}
              onValueChange={(v) => setMomentType(v as MomentType)}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {MOMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="mr-2">{t.emoji}</span>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tripDays.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Tag a day{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Select
                value={dayId}
                onValueChange={(v) => setDayId(v ?? '')}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Which day?" />
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end pb-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || submitting}>
              {submitting ? 'Saving…' : 'Save Moment'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
