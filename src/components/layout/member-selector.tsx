'use client';

import { useTrip } from '@/lib/hooks/use-trip';
import { cn } from '@/lib/utils';

export function MemberSelector() {
  const { members, setCurrentMember } = useTrip();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3" aria-hidden="true">
            ✈️
          </div>
          <h1 className="font-serif text-2xl font-bold mb-1">Who are you?</h1>
          <p className="text-muted-foreground text-sm">Pick your name to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setCurrentMember(member)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border border-border bg-card',
                'hover:bg-muted hover:border-primary/30 active:scale-95',
                'transition-all duration-150 text-left shadow-sm'
              )}
            >
              <span className="text-2xl shrink-0" role="img" aria-label={member.name}>
                {member.emoji}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{member.name}</div>
                {member.is_kid && (
                  <div className="text-xs text-muted-foreground">Kid</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
