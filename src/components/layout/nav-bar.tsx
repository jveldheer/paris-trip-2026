'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  Calendar,
  Camera,
  MessageCircle,
  Menu,
  BarChart3,
  Star,
  Heart,
  Smile,
  Info,
  TrendingUp,
  CloudSun,
  MapPin,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const tabs = [
  { icon: House, label: 'Home', href: '/trip' },
  { icon: Calendar, label: 'Itinerary', href: '/trip/itinerary' },
  { icon: MapPin, label: 'Map Dots', href: '/trip/food-map' },
];

const moreItems = [
  { icon: Camera, label: 'Photos', href: '/trip/photos' },
  { icon: MessageCircle, label: 'Moments', href: '/trip/moments' },
  { icon: CloudSun, label: 'Weather', href: '/trip/weather' },
  { icon: Star, label: 'Highlights', href: '/trip/highlights' },
  { icon: Heart, label: 'Memory Jar', href: '/trip/memory-jar' },
  { icon: Smile, label: 'Kid Corner', href: '/trip/kids' },
  { icon: Receipt, label: 'Expenses', href: '/trip/expenses' },
  { icon: TrendingUp, label: 'Stats', href: '/trip/stats' },
  { icon: Info, label: 'Info', href: '/trip/info' },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
      <div className="flex items-stretch justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const active =
            tab.href === '/trip'
              ? pathname === '/trip'
              : pathname.startsWith(tab.href);
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors',
                active ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', active && 'fill-accent/10')} />
              <span className="text-[10px] tracking-[0.08em]">{tab.label}</span>
            </button>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <button
            onClick={() => setOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors',
              isMoreActive ? 'text-accent' : 'text-muted-foreground'
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] tracking-[0.08em]">More</span>
          </button>
          <SheetContent side="bottom" className="rounded-t-lg px-4 pb-safe">
            <SheetTitle className="font-serif text-base font-semibold pt-2 pb-1">More</SheetTitle>
            <Separator className="mb-4" />
            <div className="grid grid-cols-3 gap-3 pb-6">
              {moreItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg transition-colors',
                      active ? 'bg-accent/10 text-accent' : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-[10px] font-medium tracking-[0.08em]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
