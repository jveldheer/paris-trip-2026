'use client';

import { cn } from '@/lib/utils';
import { Member } from '@/types';

interface MemberAvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeClasses = {
  sm: {
    circle: 'w-7 h-7 text-sm',
    name: 'text-xs',
  },
  md: {
    circle: 'w-9 h-9 text-base',
    name: 'text-sm',
  },
  lg: {
    circle: 'w-12 h-12 text-xl',
    name: 'text-base',
  },
};

export function MemberAvatar({ member, size = 'md', showName = true }: MemberAvatarProps) {
  const classes = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted border border-border shrink-0 select-none',
          classes.circle
        )}
        title={member.name}
        aria-label={member.name}
      >
        <span role="img" aria-hidden="true">
          {member.emoji}
        </span>
      </div>
      {showName && (
        <span className={cn('font-medium text-foreground leading-none', classes.name)}>
          {member.name}
        </span>
      )}
    </div>
  );
}

/** Convenience alias that always shows name in a small inline badge. */
export function MemberBadge({ member }: { member: Member }) {
  return <MemberAvatar member={member} size="sm" showName />;
}
