'use client'

import { WishlistItem, Member } from '@/types'
import { MemberAvatar } from '@/components/shared/member-avatar'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface WishlistListProps {
  items: WishlistItem[]
  members: Member[]
  currentMemberId: string
  onToggle: (item: WishlistItem) => void
  tripId: string
}

interface WishlistRowProps {
  item: WishlistItem
  currentMemberId: string
  onToggle: (item: WishlistItem) => void
}

function WishlistRow({ item, currentMemberId, onToggle }: WishlistRowProps) {
  const addedBy = item.member
  const checkedBy = item.checked_by_member

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-3 px-1 border-b border-border last:border-0 transition-colors',
        item.checked ? 'opacity-60' : ''
      )}
    >
      {/* Checkbox toggle */}
      <button
        onClick={() => onToggle(item)}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label={item.checked ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.checked ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium leading-snug',
            item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
          )}
        >
          {item.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {addedBy && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{addedBy.emoji}</span>
              <span>{addedBy.name}</span>
            </span>
          )}
          {item.checked && checkedBy && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span>checked by</span>
              <span>{checkedBy.emoji}</span>
              <span>{checkedBy.name}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function WishlistList({
  items,
  members,
  currentMemberId,
  onToggle,
  tripId,
}: WishlistListProps) {
  // Unchecked first, then checked
  const sorted = [...items].sort((a, b) => {
    if (a.checked === b.checked) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return a.checked ? 1 : -1
  })

  if (sorted.length === 0) {
    return null
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
      {sorted.map((item) => (
        <WishlistRow
          key={item.id}
          item={item}
          currentMemberId={currentMemberId}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
