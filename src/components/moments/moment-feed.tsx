'use client'

import { Moment } from '@/types'
import { MomentCard } from './moment-card'

interface MomentFeedProps {
  moments: Moment[]
}

export function MomentFeed({ moments }: MomentFeedProps) {
  // Sort newest first
  const sorted = [...moments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (sorted.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {sorted.map((moment) => (
        <MomentCard key={moment.id} moment={moment} />
      ))}
    </div>
  )
}
