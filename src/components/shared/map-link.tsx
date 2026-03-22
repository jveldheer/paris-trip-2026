'use client';

import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapLinkProps {
  address: string;
  label?: string;
}

function buildMapUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  const isApplePlatform =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  return isApplePlatform
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

export function MapLink({ address, label }: MapLinkProps) {
  const handleOpen = () => {
    window.open(buildMapUrl(address), '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpen}
      className="gap-1.5 text-xs h-8 px-3 rounded-full"
    >
      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
      <span className="truncate max-w-[180px]">{label ?? address}</span>
    </Button>
  );
}
