'use client'

import { Moment, MomentType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { MemberAvatar } from '@/components/shared/member-avatar'
import { Star, Quote } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<
  MomentType,
  { label: string; badgeClass: string; cardClass: string; icon?: React.ReactNode }
> = {
  note: {
    label: 'Note',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    cardClass: 'bg-card border-border',
  },
  quote: {
    label: 'Quote',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    cardClass: 'bg-purple-50 border-purple-100',
    icon: <Quote className="h-4 w-4 text-purple-400" />,
  },
  funny: {
    label: 'Funny',
    badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cardClass: 'bg-yellow-50 border-yellow-100',
  },
  highlight: {
    label: 'Highlight',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    cardClass: 'bg-amber-50 border-amber-100',
    icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" />,
  },
}

interface MomentCardProps {
  moment: Moment
}

export function MomentCard({ moment }: MomentCardProps) {
  const config = TYPE_CONFIG[moment.moment_type]
  const timeAgo = formatDistanceToNow(parseISO(moment.created_at), { addSuffix: true })

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 space-y-3 transition-colors',
        config.cardClass
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn('text-xs font-medium px-2 py-0.5 border', config.badgeClass)}
          >
            {config.icon && (
              <span className="mr-1 inline-flex items-center">{config.icon}</span>
            )}
            {config.label}
          </Badge>
          {moment.trip_day && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
              Day {moment.trip_day.day_number}
            </Badge>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      {/* Content */}
      {moment.moment_type === 'quote' ? (
        <div className="relative pl-4">
          <span
            className="absolute left-0 top-0 font-serif text-4xl leading-none text-purple-300 select-none"
            aria-hidden="true"
          >
            "
          </span>
          <p className="text-base leading-relaxed text-foreground italic">
            {moment.content}
          </p>
          <span
            className="font-serif text-4xl leading-none text-purple-300 select-none"
            aria-hidden="true"
          >
            "
          </span>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-foreground">{moment.content}</p>
      )}

      {/* Footer */}
      {moment.member && (
        <div className="pt-1 border-t border-black/5">
          <MemberAvatar member={moment.member} size="sm" showName />
        </div>
      )}
    </div>
  )
}
