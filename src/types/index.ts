export type Trip = {
  id: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export type Member = {
  id: string;
  trip_id: string;
  name: string;
  emoji: string;
  is_kid: boolean;
  sort_order: number;
};

export type TripDay = {
  id: string;
  trip_id: string;
  date: string;
  city: City;
  title: string;
  summary: string;
  day_number: number;
};

export type ItineraryItemCategory =
  | 'flight' | 'train' | 'hotel' | 'restaurant' | 'activity' | 'transport' | 'free_time';

export type ItineraryItem = {
  id: string;
  trip_day_id: string;
  trip_id: string;
  title: string;
  description: string | null;
  category: ItineraryItemCategory;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  booking_ref: string | null;
  url: string | null;
  notes: string | null;
  sort_order: number;
};

export type Photo = {
  id: string;
  trip_id: string;
  trip_day_id: string | null;
  member_id: string;
  storage_path: string;
  thumbnail_path: string;
  caption: string | null;
  created_at: string;
  member?: Member;
};

export type MomentType = 'note' | 'quote' | 'funny' | 'highlight';

export type Moment = {
  id: string;
  trip_id: string;
  trip_day_id: string | null;
  member_id: string;
  content: string;
  moment_type: MomentType;
  created_at: string;
  member?: Member;
  trip_day?: TripDay;
};

export type WishlistCategory = 'eat' | 'see' | 'do' | 'buy';

export type WishlistItem = {
  id: string;
  trip_id: string;
  member_id: string;
  title: string;
  category: WishlistCategory;
  checked: boolean;
  checked_by: string | null;
  created_at: string;
  member?: Member;
  checked_by_member?: Member;
};

export type Poll = {
  id: string;
  trip_id: string;
  member_id: string;
  question: string;
  is_active: boolean;
  closes_at: string | null;
  created_at: string;
  member?: Member;
  poll_options?: PollOption[];
};

export type PollOption = {
  id: string;
  poll_id: string;
  text: string;
  sort_order: number;
  poll_votes?: PollVote[];
};

export type PollVote = {
  id: string;
  poll_option_id: string;
  member_id: string;
  member?: Member;
};

export type DailyHighlight = {
  id: string;
  trip_day_id: string;
  member_id: string;
  moment_id: string | null;
  photo_id: string | null;
};

export type MemoryJarItem = {
  id: string;
  trip_id: string;
  member_id: string | null;
  content: string;
  created_at: string;
  revealed: boolean;
};

export type TripStat = {
  id: string;
  trip_id: string;
  stat_key: string;
  stat_value: number;
  updated_at: string;
};

export type KidDrawing = {
  id: string;
  trip_id: string;
  photo_id: string | null;
  member_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  member?: Member;
};

// Convenience aliases kept for compatibility
export type City = 'Paris' | 'Saint-Raphael' | 'Lisbon' | 'NYC';
export type ItemCategory = ItineraryItemCategory;
