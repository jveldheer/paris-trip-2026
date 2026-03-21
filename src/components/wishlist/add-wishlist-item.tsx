'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getSupabaseClient } from '@/lib/supabase/client'
import { WishlistCategory, WishlistItem } from '@/types'
import { WISHLIST_CATEGORY_LABELS } from '@/lib/constants'

interface AddWishlistItemProps {
  tripId: string
  memberId: string
  category: WishlistCategory
  onAdd: (item: WishlistItem) => void
}

export function AddWishlistItem({ tripId, memberId, category, onAdd }: AddWishlistItemProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error: dbError } = await supabase
        .from('wishlist_items')
        .insert({
          trip_id: tripId,
          member_id: memberId,
          title: trimmed,
          category,
          checked: false,
          checked_by: null,
        })
        .select('*, member:members(*)')
        .single()

      if (dbError) throw dbError

      if (data) {
        onAdd(data as WishlistItem)
        setTitle('')
        setOpen(false)
      }
    } catch (err) {
      setError('Failed to add item. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="h-14 w-14 rounded-full shadow-lg shadow-black/20 fixed bottom-24 right-4 z-30 bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
        aria-label={`Add ${WISHLIST_CATEGORY_LABELS[category]} item`}
      >
        <Plus className="h-6 w-6" />
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to {WISHLIST_CATEGORY_LABELS[category]}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            placeholder="What do you want to add?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            disabled={submitting}
            maxLength={200}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || submitting}>
              {submitting ? 'Adding…' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
