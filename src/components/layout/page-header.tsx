'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  cityColor?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref, cityColor, children }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3'
      )}
      style={cityColor ? { borderBottomColor: `${cityColor}40` } : undefined}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {backHref && (
          <button
            onClick={() => router.push(backHref)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1
            className="text-lg font-semibold leading-tight truncate"
            style={cityColor ? { color: cityColor } : undefined}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
}
