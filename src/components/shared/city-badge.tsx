import { CITY_COLORS, type CityName } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CityBadgeProps {
  city: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CityBadge({ city, size = 'md', className }: CityBadgeProps) {
  const colors = CITY_COLORS[city as CityName];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        colors?.badge || 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {city}
    </span>
  );
}
