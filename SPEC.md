# Paris 2026 — Group Trip Experience Platform

## Full Application Specification

---

## 1. Overview

A mobile-first web app for the Veldheer family Europe trip (April 3-15, 2026). Three cities — Paris, Saint-Raphael, Lisbon — 10 people (4 adults, 6 kids). No login required; access via a shared secret code embedded in the URL.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase (Postgres DB + Realtime + Storage + Row Level Security)
- Vercel deployment
- date-fns for date handling
- Leaflet / react-leaflet for maps (free, no API key needed)
- Framer Motion for animations

---

## 2. Access Model

No authentication. Access is controlled by a **trip code** — a short secret string (e.g., `veldheer2026`).

- The app lives at `paris2026.vercel.app` (or custom domain)
- First visit: landing page asks for the trip code
- Valid code is stored in a cookie (`trip_access` — 90-day expiry)
- All Supabase queries use the trip code as a filter; RLS enforces it
- Each person picks their name from a member list on first visit (stored in cookie as `member_id`)
- No passwords, no email — just the trip code + name selection

**Why no auth:** This is a family trip app. Friction kills adoption. A shared code is simple enough for kids to use on a borrowed iPad.

---

## 3. Database Schema (Supabase / Postgres)

### `trips`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| code | text UNIQUE | The access code (`veldheer2026`) |
| name | text | "Veldheer Europe 2026" |
| start_date | date | 2026-04-03 |
| end_date | date | 2026-04-15 |
| created_at | timestamptz | |

### `members`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| name | text | "Jared", "Morgan", etc. |
| emoji | text | Personal emoji avatar |
| is_kid | boolean | For kid corner feature |
| sort_order | int | Display ordering |

### `trip_days`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| date | date | |
| city | text | "Paris" / "Saint-Raphael" / "Lisbon" |
| title | text | "Arrival Day", "Louvre & Montmartre", etc. |
| summary | text | Brief description of the day |
| day_number | int | 1-13 |

### `itinerary_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_day_id | uuid FK -> trip_days | |
| trip_id | uuid FK -> trips | |
| title | text | "Louvre Museum" |
| description | text | Optional details |
| category | text | `flight`, `train`, `hotel`, `restaurant`, `activity`, `transport`, `free_time` |
| start_time | timestamptz | nullable for all-day items |
| end_time | timestamptz | nullable |
| location_name | text | Venue / address label |
| address | text | Full street address |
| lat | float | For map pin |
| lng | float | For map pin |
| booking_ref | text | Confirmation number |
| url | text | Booking link, restaurant website, etc. |
| notes | text | "Ask for the window table" |
| sort_order | int | Within the day |

### `photos`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| trip_day_id | uuid FK -> trip_days | nullable |
| member_id | uuid FK -> members | Who uploaded |
| storage_path | text | Supabase Storage path |
| thumbnail_path | text | Resized version path |
| caption | text | Optional |
| created_at | timestamptz | |

### `moments`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| trip_day_id | uuid FK -> trip_days | nullable |
| member_id | uuid FK -> members | Who posted |
| content | text | The note / quote / memory |
| moment_type | text | `note`, `quote`, `funny`, `highlight` |
| created_at | timestamptz | |

### `wishlist_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| member_id | uuid FK -> members | Who added |
| title | text | "Eat a croissant at 6am" |
| category | text | `eat`, `see`, `do`, `buy` |
| checked | boolean | default false |
| checked_by | uuid FK -> members | nullable |
| created_at | timestamptz | |

### `polls`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| member_id | uuid FK -> members | Who created |
| question | text | "Where for dinner tonight?" |
| is_active | boolean | default true |
| closes_at | timestamptz | nullable, auto-close |
| created_at | timestamptz | |

### `poll_options`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| poll_id | uuid FK -> polls | |
| text | text | "Le Bouillon Chartier" |
| sort_order | int | |

### `poll_votes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| poll_option_id | uuid FK -> poll_options | |
| member_id | uuid FK -> members | |
| UNIQUE(poll_option_id, member_id) | | One vote per option per person |

### `daily_highlights`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_day_id | uuid FK -> trip_days | |
| member_id | uuid FK -> members | voter |
| moment_id | uuid FK -> moments | nullable — voted for a moment |
| photo_id | uuid FK -> photos | nullable — voted for a photo |
| UNIQUE(trip_day_id, member_id) | | One vote per person per day |

### `memory_jar`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| member_id | uuid FK -> members | nullable (anonymous) |
| content | text | The sweet/funny note |
| created_at | timestamptz | |
| revealed | boolean | default false — unlocks at trip end |

### `trip_stats`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| stat_key | text | `miles_traveled`, `museums_visited`, `meals_eaten`, `photos_taken`, etc. |
| stat_value | numeric | |
| updated_at | timestamptz | |

### `kid_drawings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| trip_id | uuid FK -> trips | |
| photo_id | uuid FK -> photos | nullable — drawn on a photo |
| member_id | uuid FK -> members | |
| storage_path | text | PNG from canvas |
| caption | text | |
| created_at | timestamptz | |

### Row Level Security
All tables use RLS with a policy that matches `trip_id` against the trip code provided via a custom Supabase header (`x-trip-code`). A Postgres function `get_trip_id_from_code(code text)` resolves the code to a trip ID for RLS policies.

---

## 4. Supabase Storage Buckets

- **`photos`** — original uploads (max 10MB, image/* only)
- **`thumbnails`** — auto-generated 400px wide versions (via Edge Function or client-side resize before upload)
- **`drawings`** — kid canvas exports (PNG)

All buckets use the same trip-code-based access policy.

---

## 5. File Structure

```
paris-trip-2026/
├── .env.local                    # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql                  # Pre-load trip data, members, itinerary
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout — font, theme, metadata
│   │   ├── page.tsx              # Landing page — trip code entry
│   │   ├── globals.css
│   │   │
│   │   └── trip/
│   │       ├── layout.tsx        # Trip shell — nav bar, member context, trip code guard
│   │       ├── page.tsx          # Dashboard / home — countdown, today's plan, quick actions
│   │       │
│   │       ├── itinerary/
│   │       │   ├── page.tsx      # Full itinerary — all days overview
│   │       │   └── [dayNumber]/
│   │       │       └── page.tsx  # Single day detail — timeline, map, items
│   │       │
│   │       ├── photos/
│   │       │   └── page.tsx      # Photo gallery — grid view, filter by day/person
│   │       │
│   │       ├── moments/
│   │       │   └── page.tsx      # Moments feed — all notes, quotes, highlights
│   │       │
│   │       ├── wishlist/
│   │       │   └── page.tsx      # Shared wish list
│   │       │
│   │       ├── polls/
│   │       │   └── page.tsx      # Active polls + create new
│   │       │
│   │       ├── highlights/
│   │       │   └── page.tsx      # Daily highlight voting + past winners
│   │       │
│   │       ├── memory-jar/
│   │       │   └── page.tsx      # Submit anonymous notes + reveal (post-trip)
│   │       │
│   │       ├── kids/
│   │       │   └── page.tsx      # Kid corner — simplified UI, drawing canvas
│   │       │
│   │       ├── stats/
│   │       │   └── page.tsx      # Trip stats + leaderboard
│   │       │
│   │       └── info/
│   │           └── page.tsx      # Emergency contacts, logistics, all bookings
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (button, card, dialog, etc.)
│   │   │
│   │   ├── layout/
│   │   │   ├── nav-bar.tsx       # Bottom mobile nav (5 tabs)
│   │   │   ├── page-header.tsx   # Reusable page title + back button
│   │   │   └── trip-guard.tsx    # Checks cookie, redirects to landing if no access
│   │   │
│   │   ├── landing/
│   │   │   └── code-entry.tsx    # Trip code input form
│   │   │
│   │   ├── dashboard/
│   │   │   ├── countdown.tsx     # Countdown timer (or "Day X of 13" during trip)
│   │   │   ├── today-card.tsx    # Today's itinerary summary
│   │   │   ├── quick-actions.tsx # Add photo, add moment, view polls
│   │   │   └── weather-badge.tsx # Current weather for today's city (stretch goal)
│   │   │
│   │   ├── itinerary/
│   │   │   ├── day-list.tsx      # All days as cards with city color coding
│   │   │   ├── day-timeline.tsx  # Vertical timeline of a single day
│   │   │   ├── itinerary-item-card.tsx  # Single event/booking card
│   │   │   └── day-map.tsx       # Leaflet map with day's pins
│   │   │
│   │   ├── photos/
│   │   │   ├── photo-grid.tsx    # Masonry-ish grid
│   │   │   ├── photo-upload.tsx  # Upload button + drag-and-drop
│   │   │   ├── photo-viewer.tsx  # Lightbox modal
│   │   │   └── photo-card.tsx    # Single photo with caption + author
│   │   │
│   │   ├── moments/
│   │   │   ├── moment-feed.tsx   # Scrollable feed
│   │   │   ├── moment-card.tsx   # Single moment display
│   │   │   └── add-moment.tsx    # Quick-add form (bottom sheet)
│   │   │
│   │   ├── wishlist/
│   │   │   ├── wishlist-list.tsx
│   │   │   ├── wishlist-item.tsx
│   │   │   └── add-wishlist-item.tsx
│   │   │
│   │   ├── polls/
│   │   │   ├── poll-card.tsx     # Single poll with vote bars
│   │   │   ├── create-poll.tsx   # New poll form
│   │   │   └── poll-results.tsx  # Results visualization
│   │   │
│   │   ├── highlights/
│   │   │   ├── highlight-vote.tsx
│   │   │   └── highlight-winner.tsx
│   │   │
│   │   ├── memory-jar/
│   │   │   ├── add-memory.tsx
│   │   │   └── memory-reveal.tsx
│   │   │
│   │   ├── kids/
│   │   │   ├── drawing-canvas.tsx  # Simple touch-drawing canvas
│   │   │   └── kid-gallery.tsx
│   │   │
│   │   ├── stats/
│   │   │   ├── stat-card.tsx
│   │   │   └── leaderboard.tsx
│   │   │
│   │   └── shared/
│   │       ├── member-avatar.tsx   # Emoji + name badge
│   │       ├── city-badge.tsx      # Color-coded city label
│   │       ├── empty-state.tsx     # "Nothing here yet" placeholder
│   │       ├── loading-skeleton.tsx
│   │       └── map-link.tsx        # Opens Apple/Google Maps
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client (with trip code header)
│   │   │   ├── server.ts         # Server-side Supabase client
│   │   │   └── types.ts          # Generated types from Supabase schema
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-trip.ts       # Trip context — code, member, trip data
│   │   │   ├── use-realtime.ts   # Generic Supabase Realtime subscription hook
│   │   │   ├── use-member.ts     # Current member from cookie
│   │   │   └── use-photos.ts     # Photo upload + list with realtime
│   │   │
│   │   ├── constants.ts          # Trip code, member list, city colors, categories
│   │   ├── utils.ts              # Date formatting, image resize, etc.
│   │   └── trip-data.ts          # Static trip data (all pre-loaded itinerary info)
│   │
│   └── types/
│       └── index.ts              # Shared TypeScript types
│
└── public/
    ├── fonts/
    ├── og-image.png              # Social preview image
    └── icons/                    # PWA icons
```

---

## 6. Pages & Features Detail

### 6.1 Landing Page (`/`)
- Beautiful hero with trip destination photos (Paris, coast, Lisbon)
- Trip title: "Veldheer Europe 2026"
- Single input: "Enter your trip code"
- On valid code: set cookie, redirect to `/trip`
- On invalid: shake animation, "That's not the magic word"
- Animated background with subtle parallax

### 6.2 Dashboard (`/trip`)
- **Before trip (now until April 3):** Countdown timer with days/hours/minutes, animated
- **During trip:** "Day X of 13" hero, current city name + flag
- **After trip:** "X days since our adventure" + memory jar unlock prompt
- Today's schedule card (next 2-3 upcoming items)
- Quick action buttons: Add Photo, Add Moment, Wish List, Polls
- Recent activity feed (last 5 photos/moments from anyone)
- City progress bar (Paris: days 1-7, Saint-Raphael: days 8-10, Lisbon: days 11-13)

### 6.3 Itinerary Overview (`/trip/itinerary`)
- Vertical list of all 13 days as cards
- Each card: day number, date, city (color-coded), title, item count
- City section headers with city illustrations
- Tap a day to drill into detail
- Color system: Paris = blue, Saint-Raphael = amber/orange, Lisbon = teal

### 6.4 Day Detail (`/trip/itinerary/[dayNumber]`)
- Day header with city, date, title
- Vertical timeline of all itinerary items (left-aligned timeline with time markers)
- Each item shows: time, title, category icon, location, booking ref (if any)
- Tap item to expand: full details, address, map link, notes
- Interactive Leaflet map at top showing all day's locations as pins
- Swipe/arrows to navigate between days
- "Add a moment to this day" floating button

### 6.5 Photo Gallery (`/trip/photos`)
- Masonry grid of all photos, newest first
- Filter bar: by day, by person, or "all"
- Tap photo to open lightbox with caption, author, date
- Upload button (camera icon FAB) — opens file picker or camera on mobile
- Client-side resize to max 2000px before upload (saves bandwidth)
- Thumbnail generation on upload (400px wide for grid)
- Realtime: new photos appear live for everyone

### 6.6 Moments Feed (`/trip/moments`)
- Chronological feed of all moments, newest first
- Filter by type: all, notes, quotes, funny, highlights
- Each moment card: content, author avatar, timestamp, day badge
- "Add Moment" bottom sheet with type selector and text input
- Support for tagging a day (optional)
- Realtime updates

### 6.7 Wish List (`/trip/wishlist`)
- Four tabs: Eat, See, Do, Buy
- Each item: title, added by, checkbox
- Anyone can add items, anyone can check them off
- Checked items move to bottom with strikethrough
- "Add" floating button per tab
- Checked_by shows who completed it

### 6.8 Polls (`/trip/polls`)
- Active polls at top, closed polls below
- Create poll: question + 2-6 options
- Vote: tap an option (one vote per person per poll)
- Results: horizontal bar chart showing votes + voter avatars
- Auto-close option (e.g., close in 2 hours)
- Realtime vote updates

### 6.9 Daily Highlights (`/trip/highlights`)
- During trip: "Vote for today's highlight!"
- Shows today's photos + moments as voteable cards
- Each person gets one vote per day
- Past days show the winning highlight with a trophy
- Creates a "best of" timeline over the trip

### 6.10 Memory Jar (`/trip/memory-jar`)
- **During/before trip:** Submit anonymous notes (sweet, funny, grateful)
- Simple text input, no attribution shown
- Counter: "X memories sealed in the jar"
- **After April 15:** Jar "breaks open" — all notes revealed one by one with reveal animation
- Beautiful confetti/animation on reveal

### 6.11 Kid Corner (`/trip/kids`)
- Simplified, large-button UI
- Drawing canvas (finger-painting style) — pick colors, brush size, clear
- Option to draw on top of a photo (overlay)
- Save drawing to gallery
- View kid drawings gallery
- Large, touch-friendly controls

### 6.12 Stats & Leaderboard (`/trip/stats`)
- Trip stats cards (computed from DB data):
  - Total photos taken
  - Total moments shared
  - Cities visited (3)
  - Countries visited (2 — France, Portugal)
  - Wish list items completed
  - Polls created
  - Memory jar notes
- **Leaderboard:** ranked by contributions
  - Most photos uploaded
  - Most moments shared
  - Most poll votes cast
  - Most wish list items added
- Fun animated counters

### 6.13 Info / Logistics (`/trip/info`)
- Accordion sections:
  - **Flights:** All flight details (times, confirmation numbers, terminals)
  - **Trains:** TGV Paris -> Saint-Raphael details
  - **Hotels:** Names, addresses, check-in/out times, confirmation numbers
  - **Restaurant Reservations:** All pre-booked restaurants
  - **Emergency Info:** Local emergency numbers, nearest hospitals, embassy contacts
  - **Travel Tips:** Metro info, tipping customs, useful French/Portuguese phrases
- Every address is a tappable link to maps
- Every booking ref is copyable

---

## 7. Component Hierarchy

```
RootLayout
├── LandingPage (/)
│   └── CodeEntry
│
└── TripLayout (/trip/*)
    ├── TripGuard (cookie check)
    ├── TripProvider (context: trip, member, realtime)
    ├── NavBar (bottom tabs: Home, Itinerary, Photos, Moments, More)
    │
    ├── Dashboard (/trip)
    │   ├── Countdown / DayIndicator
    │   ├── TodayCard
    │   │   └── ItineraryItemCard (mini)
    │   ├── QuickActions
    │   └── RecentActivity
    │
    ├── Itinerary (/trip/itinerary)
    │   ├── DayList
    │   │   └── DayCard (x13)
    │   └── DayDetail (/trip/itinerary/[dayNumber])
    │       ├── DayMap
    │       ├── DayTimeline
    │       │   └── ItineraryItemCard (x N)
    │       └── AddMomentFAB
    │
    ├── Photos (/trip/photos)
    │   ├── FilterBar
    │   ├── PhotoGrid
    │   │   └── PhotoCard (x N)
    │   ├── PhotoViewer (modal)
    │   └── PhotoUpload (FAB)
    │
    ├── Moments (/trip/moments)
    │   ├── FilterTabs
    │   ├── MomentFeed
    │   │   └── MomentCard (x N)
    │   └── AddMoment (bottom sheet)
    │
    └── MoreMenu (tab) -> links to:
        ├── Wishlist
        ├── Polls
        ├── Highlights
        ├── MemoryJar
        ├── Kids
        ├── Stats
        └── Info
```

---

## 8. API Routes (Next.js Route Handlers)

Minimal API surface — most reads go direct to Supabase from the client. Server routes are only needed for operations requiring server logic:

### `POST /api/verify-code`
- Body: `{ code: string }`
- Validates trip code against DB
- Returns: `{ valid: boolean, tripId: string, members: Member[] }`
- Sets `trip_access` cookie

### `POST /api/photos/upload`
- Multipart form: image file + caption + dayId + memberId
- Server-side: validates, uploads to Supabase Storage, creates DB record
- Returns: photo record with URLs
- (Alternative: direct client-to-Supabase upload with signed URL — preferred for simplicity)

### `GET /api/stats/compute`
- Aggregates stats from all tables
- Returns computed stats object
- Called by stats page, cached for 60s

Everything else (CRUD for moments, wishlist, polls, votes, memory jar, highlights) goes **direct from client to Supabase** using the JS client + RLS policies. This keeps the app simple and leverages Supabase Realtime.

---

## 9. Realtime Strategy

Supabase Realtime subscriptions on these tables:
- `photos` — new photos appear in gallery live
- `moments` — new moments appear in feed live
- `poll_votes` — vote counts update live
- `wishlist_items` — checkoffs appear live

Implementation: a `useRealtime(tableName, filter)` hook that subscribes on mount, unsubscribes on cleanup, and merges new records into local state.

---

## 10. Key Implementation Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Cookie + trip code (no Supabase Auth) | Zero friction for a family group. Kids can use it on any device |
| Maps | Leaflet + OpenStreetMap tiles | Free, no API key, works well for pin-dropping |
| Photo storage | Supabase Storage with client-side resize | Keep it simple, 10MB limit is generous for phone photos |
| Thumbnail generation | Client-side canvas resize before upload | Avoids needing an Edge Function; 400px wide is fast |
| Realtime | Supabase Realtime (Postgres Changes) | Built-in, no extra infrastructure |
| Styling | Tailwind + shadcn/ui | Beautiful defaults, fast to build, mobile-first |
| State management | React Context + hooks (no Redux) | Small app, 10 users max — Context is sufficient |
| Data seeding | SQL seed file with all itinerary data | Itinerary is read-only, pre-loaded once |
| PWA | next-pwa for installability | Add to home screen on phones for native feel |
| City theming | CSS variables per city | Header/accent color changes based on current day's city |

---

## 11. City Color Theming

Each city has a color palette that applies to headers, accents, and backgrounds:

- **Paris:** Blue tones (`#1e3a5f` navy, `#3b82f6` accent) — elegant, classic
- **Saint-Raphael:** Warm amber/coral (`#c2410c` rust, `#f59e0b` gold) — Mediterranean warmth
- **Lisbon:** Teal/green (`#0d9488` teal, `#14b8a6` accent) — coastal, tile-inspired

The active city is determined by the current date (during trip) or the viewed day.

---

## 12. Trip Data (to seed)

### Members
| Name | Emoji | Is Kid |
|------|-------|--------|
| Jared | | No |
| Morgan | | No |
| Aaron | | No |
| Jodi | | No |
| Eden | | Yes |
| Edwin II | | Yes |
| Eva | | Yes |
| Lennox | | Yes |
| James | | Yes |
| Beau | | Yes |

### Trip Days
| Day | Date | City | Title |
|-----|------|------|-------|
| 1 | Apr 3 | Paris | Arrival in Paris |
| 2 | Apr 4 | Paris | Paris Day 1 |
| 3 | Apr 5 | Paris | Paris Day 2 |
| 4 | Apr 6 | Paris | Paris Day 3 |
| 5 | Apr 7 | Paris | Paris Day 4 |
| 6 | Apr 8 | Paris | Paris Day 5 |
| 7 | Apr 9 | Paris | Paris Day 6 |
| 8 | Apr 10 | Saint-Raphael | Travel to the Coast |
| 9 | Apr 11 | Saint-Raphael | Riviera Day 1 |
| 10 | Apr 12 | Saint-Raphael | Riviera Day 2 |
| 11 | Apr 13 | Lisbon | Travel to Lisbon |
| 12 | Apr 14 | Lisbon | Lisbon Day 1 |
| 13 | Apr 15 | Lisbon | Departure Day |

*(Specific itinerary items — restaurants, museum bookings, flight times — to be filled in by the user into the seed file.)*

---

## 13. Mobile Navigation

Bottom tab bar with 5 items:

| Tab | Icon | Route |
|-----|------|-------|
| Home | house | /trip |
| Itinerary | calendar | /trip/itinerary |
| Photos | camera | /trip/photos |
| Moments | message-circle | /trip/moments |
| More | menu | (opens sheet with remaining pages) |

The "More" tab opens a bottom sheet / grid with: Wish List, Polls, Highlights, Memory Jar, Kid Corner, Stats, Info.

---

## 14. Build Order

### Phase 1 — Foundation (build first)
1. Next.js project setup (App Router, TypeScript, Tailwind, shadcn/ui)
2. Supabase project setup + migration file with full schema
3. Supabase client setup (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
4. Landing page with trip code entry + cookie flow
5. Trip layout shell with TripGuard, TripProvider context, member selection
6. Bottom navigation bar
7. Seed file with trip days and members

### Phase 2 — Core Read-Only Features
8. Dashboard page (countdown, today card, quick actions)
9. Itinerary overview page (day list)
10. Day detail page (timeline + itinerary item cards)
11. Leaflet map on day detail
12. Info/logistics page

### Phase 3 — Collaborative Features
13. Photo upload + gallery (with client-side resize)
14. Photo lightbox viewer
15. Moments feed + add moment
16. Realtime hook + subscriptions for photos and moments
17. Wish list (CRUD + check off)

### Phase 4 — Social Features
18. Polls (create + vote + results)
19. Daily highlights (vote + winners)
20. Memory jar (add + locked reveal)
21. Stats page + leaderboard

### Phase 5 — Fun & Polish
22. Kid corner (drawing canvas)
23. City color theming
24. Animations (Framer Motion — page transitions, counters, reveals)
25. PWA setup (manifest, icons, offline basics)
26. OG image + meta tags
27. Seed the actual itinerary data (flights, restaurants, hotels)

---

## 15. Deployment

- **Vercel:** Connect GitHub repo, auto-deploy on push to `main`
- **Supabase:** One project, free tier is sufficient (10 users, minimal storage)
- **Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
- **Domain:** Optional custom domain via Vercel (e.g., `veldheer2026.com`)
- **Monitoring:** Vercel Analytics (free) for basic usage tracking

---

## 16. Performance Considerations

- Images are the biggest payload — client-side resize to max 2000px, thumbnails at 400px
- Lazy load photos in grid (Intersection Observer)
- Supabase queries use indexed columns (trip_id, trip_day_id)
- Static itinerary data could be cached aggressively (it doesn't change)
- Keep bundle small: dynamic import for Leaflet (it's heavy), drawing canvas, and photo viewer

---

*This spec is complete and ready to hand to Claude Code for implementation. Start with Phase 1.*
