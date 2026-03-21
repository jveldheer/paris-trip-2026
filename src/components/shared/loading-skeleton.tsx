import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'grid';
  count?: number;
  className?: string;
}

function Pulse({ className }: { className?: string }) {
  return <div className={cn('bg-muted rounded-lg animate-pulse', className)} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <Pulse className="h-4 w-2/3" />
      <Pulse className="h-3 w-full" />
      <Pulse className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Pulse className="h-6 w-16 rounded-full" />
        <Pulse className="h-6 w-12 rounded-full" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <Pulse className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3.5 w-1/2" />
        <Pulse className="h-3 w-3/4" />
      </div>
      <Pulse className="h-3 w-10 shrink-0" />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Pulse className="h-36 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Pulse className="h-3.5 w-3/4" />
        <Pulse className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ variant = 'card', count = 3, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'list') {
    return (
      <div className={cn('divide-y divide-border', className)}>
        {items.map((_, i) => (
          <ListSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 gap-3', className)}>
        {items.map((_, i) => (
          <GridSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
