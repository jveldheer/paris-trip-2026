-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE trips (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        text UNIQUE NOT NULL,
  name        text NOT NULL,
  start_date  date,
  end_date    date,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE members (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name        text,
  emoji       text,
  is_kid      boolean DEFAULT false,
  sort_order  int
);

CREATE TABLE trip_days (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date        date,
  city        text,
  title       text,
  summary     text,
  day_number  int
);

CREATE TABLE itinerary_items (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_day_id    uuid NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  trip_id        uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title          text,
  description    text,
  category       text,
  start_time     timestamptz,
  end_time       timestamptz,
  location_name  text,
  address        text,
  lat            float,
  lng            float,
  booking_ref    text,
  url            text,
  notes          text,
  sort_order     int
);

CREATE TABLE photos (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_day_id     uuid REFERENCES trip_days(id) ON DELETE SET NULL,
  member_id       uuid REFERENCES members(id) ON DELETE SET NULL,
  storage_path    text,
  thumbnail_path  text,
  caption         text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE moments (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_day_id  uuid REFERENCES trip_days(id) ON DELETE SET NULL,
  member_id    uuid REFERENCES members(id) ON DELETE SET NULL,
  content      text,
  moment_type  text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE wishlist_items (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id   uuid REFERENCES members(id) ON DELETE SET NULL,
  title       text,
  category    text,
  checked     boolean DEFAULT false,
  checked_by  uuid REFERENCES members(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE polls (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id   uuid REFERENCES members(id) ON DELETE SET NULL,
  question    text,
  is_active   boolean DEFAULT true,
  closes_at   timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE poll_options (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id     uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text        text,
  sort_order  int
);

CREATE TABLE poll_votes (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_option_id  uuid NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE (poll_option_id, member_id)
);

CREATE TABLE daily_highlights (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_day_id  uuid NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  member_id    uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  moment_id    uuid REFERENCES moments(id) ON DELETE SET NULL,
  photo_id     uuid REFERENCES photos(id) ON DELETE SET NULL,
  UNIQUE (trip_day_id, member_id)
);

CREATE TABLE memory_jar (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id   uuid REFERENCES members(id) ON DELETE SET NULL,
  content     text,
  created_at  timestamptz DEFAULT now(),
  revealed    boolean DEFAULT false
);

CREATE TABLE trip_stats (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  stat_key    text,
  stat_value  numeric,
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE kid_drawings (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id       uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  photo_id      uuid REFERENCES photos(id) ON DELETE SET NULL,
  member_id     uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  storage_path  text,
  caption       text,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_trip_id_from_code(code text)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM trips WHERE trips.code = get_trip_id_from_code.code LIMIT 1;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE trips            ENABLE ROW LEVEL SECURITY;
ALTER TABLE members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days        ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls            ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options     ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_jar       ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_drawings     ENABLE ROW LEVEL SECURITY;

-- Permissive policies: access control is handled at the app layer via trip code cookie.

CREATE POLICY "allow_all" ON trips            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON members          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON trip_days        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON itinerary_items  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON photos           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON moments          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON wishlist_items   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON polls            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON poll_options     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON poll_votes       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON daily_highlights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON memory_jar       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON trip_stats       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON kid_drawings     FOR ALL USING (true) WITH CHECK (true);
