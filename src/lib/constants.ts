import type { City, ItemCategory, WishlistCategory, MomentType } from '@/types';

export const TRIP_CODE = 'veldheer2026';
export const TRIP_START = '2026-04-03';
export const TRIP_END = '2026-04-15';

export const CITY_COLORS = {
  Paris: {
    primary: '#1e3a5f',
    accent: '#3b82f6',
    bg: '#eff6ff',
    gradient: 'from-blue-900 to-blue-600',
    light: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-200',
  },
  'Saint-Raphael': {
    primary: '#c2410c',
    accent: '#f59e0b',
    bg: '#fffbeb',
    gradient: 'from-orange-800 to-amber-500',
    light: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    border: 'border-amber-200',
  },
  Lisbon: {
    primary: '#0d9488',
    accent: '#14b8a6',
    bg: '#f0fdfa',
    gradient: 'from-teal-800 to-teal-500',
    light: 'bg-teal-50',
    badge: 'bg-teal-100 text-teal-800',
    border: 'border-teal-200',
  },
} as const;

export type CityName = keyof typeof CITY_COLORS;

// Legacy config kept for compatibility
export const CITY_CONFIG: Record<City, { color: string; light: string; bg: string; flag: string }> = {
  Paris: { color: '#1e3a5f', light: '#3b82f6', bg: '#eff6ff', flag: '🇫🇷' },
  'Saint-Raphael': { color: '#c2410c', light: '#f59e0b', bg: '#fffbeb', flag: '🇫🇷' },
  Lisbon: { color: '#0d9488', light: '#14b8a6', bg: '#f0fdfa', flag: '🇵🇹' },
};

export const CITY_TAILWIND: Record<City, { bg: string; text: string; border: string; lightBg: string }> = {
  Paris: { bg: 'bg-paris', text: 'text-paris', border: 'border-paris-light', lightBg: 'bg-paris-bg' },
  'Saint-Raphael': { bg: 'bg-saintraphael', text: 'text-saintraphael', border: 'border-saintraphael-light', lightBg: 'bg-saintraphael-bg' },
  Lisbon: { bg: 'bg-lisbon', text: 'text-lisbon', border: 'border-lisbon-light', lightBg: 'bg-lisbon-bg' },
};

export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  flight: 'Plane',
  train: 'Train',
  hotel: 'Hotel',
  restaurant: 'UtensilsCrossed',
  activity: 'Ticket',
  transport: 'Car',
  free_time: 'Coffee',
};

export const CATEGORY_LABELS: Record<string, string> = {
  flight: 'Flight',
  train: 'Train',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  activity: 'Activity',
  transport: 'Transport',
  free_time: 'Free Time',
};

export const WISHLIST_CATEGORY_LABELS: Record<string, string> = {
  eat: 'Eat',
  see: 'See',
  do: 'Do',
  buy: 'Buy',
};

export const WISHLIST_CATEGORIES: { value: WishlistCategory; label: string; emoji: string }[] = [
  { value: 'eat', label: 'Eat', emoji: '🍽️' },
  { value: 'see', label: 'See', emoji: '👀' },
  { value: 'do', label: 'Do', emoji: '⚡' },
  { value: 'buy', label: 'Buy', emoji: '🛍️' },
];

export const MOMENT_TYPES: { value: MomentType; label: string; emoji: string }[] = [
  { value: 'note', label: 'Note', emoji: '📝' },
  { value: 'quote', label: 'Quote', emoji: '💬' },
  { value: 'funny', label: 'Funny', emoji: '😂' },
  { value: 'highlight', label: 'Highlight', emoji: '⭐' },
];

export const MEMBERS_SEED = [
  { name: 'Jared', emoji: '🏈', is_kid: false, sort_order: 1 },
  { name: 'Morgan', emoji: '🌸', is_kid: false, sort_order: 2 },
  { name: 'Aaron', emoji: '💪', is_kid: false, sort_order: 3 },
  { name: 'Jodi', emoji: '✨', is_kid: false, sort_order: 4 },
  { name: 'Eden', emoji: '🌟', is_kid: true, sort_order: 5 },
  { name: 'Edwin', emoji: '🎂', is_kid: true, sort_order: 6 },
  { name: 'Eva', emoji: '🦋', is_kid: true, sort_order: 7 },
  { name: 'Lennox', emoji: '⚡', is_kid: true, sort_order: 8 },
  { name: 'James', emoji: '🚀', is_kid: true, sort_order: 9 },
  { name: 'Beau', emoji: '🐾', is_kid: true, sort_order: 10 },
];

import type { Member, TripDay, Trip } from '@/types';

export const STATIC_TRIP: Trip = {
  id: 'static-trip',
  code: TRIP_CODE,
  name: 'Veldheer Europe 2026',
  start_date: TRIP_START,
  end_date: TRIP_END,
  created_at: '2026-01-01T00:00:00Z',
};

export const STATIC_MEMBERS: Member[] = MEMBERS_SEED.map((m, i) => ({
  id: `member-${i + 1}`,
  trip_id: 'static-trip',
  name: m.name,
  emoji: m.emoji,
  is_kid: m.is_kid,
  sort_order: m.sort_order,
}));

export const TRIP_DAYS_SEED = [
  { day_number: 1, date: '2026-04-03', city: 'Paris' as const, title: 'Arrival in Paris', summary: 'Welcome to France!' },
  { day_number: 2, date: '2026-04-04', city: 'Paris' as const, title: 'Paris Day 1', summary: 'Exploring the City of Light' },
  { day_number: 3, date: '2026-04-05', city: 'Paris' as const, title: 'Paris Day 2', summary: 'Art and culture' },
  { day_number: 4, date: '2026-04-06', city: 'Paris' as const, title: 'Paris Day 3', summary: 'More adventures' },
  { day_number: 5, date: '2026-04-07', city: 'Paris' as const, title: 'Paris Day 4', summary: 'Hidden gems' },
  { day_number: 6, date: '2026-04-08', city: 'Paris' as const, title: 'Paris Day 5', summary: 'Last full day in Paris' },
  { day_number: 7, date: '2026-04-09', city: 'Paris' as const, title: 'Paris Day 6', summary: 'Au revoir Paris' },
  { day_number: 8, date: '2026-04-10', city: 'Saint-Raphael' as const, title: 'Travel to the Coast', summary: 'TGV to the Riviera' },
  { day_number: 9, date: '2026-04-11', city: 'Saint-Raphael' as const, title: 'Riviera Day 1', summary: 'Sun and sea' },
  { day_number: 10, date: '2026-04-12', city: 'Saint-Raphael' as const, title: 'Riviera Day 2', summary: 'Coastal exploration' },
  { day_number: 11, date: '2026-04-13', city: 'Lisbon' as const, title: 'Travel to Lisbon', summary: 'Hello Portugal!' },
  { day_number: 12, date: '2026-04-14', city: 'Lisbon' as const, title: 'Lisbon Day 1', summary: 'Tiles, hills, and pasteis' },
  { day_number: 13, date: '2026-04-15', city: 'Lisbon' as const, title: 'Departure Day', summary: 'Until next time' },
];

export const STATIC_TRIP_DAYS: TripDay[] = TRIP_DAYS_SEED.map((d, i) => ({
  id: `day-${i + 1}`,
  trip_id: 'static-trip',
  date: d.date,
  city: d.city,
  title: d.title,
  summary: d.summary,
  day_number: d.day_number,
}));
