import type { ItineraryItem, ItineraryItemCategory } from "@/types"

// ── Helper ──────────────────────────────────────────────────────────────────

let _id = 0
function item(
  category: ItineraryItemCategory,
  title: string,
  opts: Partial<Omit<ItineraryItem, "id" | "trip_day_id" | "trip_id" | "category" | "title">> = {},
): ItineraryItem {
  return {
    id: `static-${++_id}`,
    trip_day_id: "",
    trip_id: "",
    title,
    category,
    description: opts.description ?? null,
    start_time: opts.start_time ?? null,
    end_time: opts.end_time ?? null,
    location_name: opts.location_name ?? null,
    address: opts.address ?? null,
    lat: opts.lat ?? null,
    lng: opts.lng ?? null,
    booking_ref: opts.booking_ref ?? null,
    url: opts.url ?? null,
    notes: opts.notes ?? null,
    sort_order: opts.sort_order ?? 0,
  }
}

// ── Static itinerary items by date (shown in day detail pages) ──────────────

export const STATIC_ITINERARY: Record<string, ItineraryItem[]> = {
  "2026-04-03": [
    item("hotel", "Check in: Maison Galante", {
      location_name: "Maison Galante",
      address: "8 Rue de l\u2019Arcade, 75008 Paris",
      start_time: "2026-04-03T15:00:00",
      description: "Host: Maison Galante. Check-in: 3:00 PM. Checkout: Mon Apr 6 at 11:00 AM.",
      notes: "3 nights in Paris. Checkout Apr 6 by 11:00 AM — TGV departs 11:22 AM!",
      sort_order: 1,
    }),
    item("activity", "Louvre Museum", {
      start_time: "2026-04-03T09:00:00",
      location_name: "Louvre Museum \u2014 Pyramid Entrance",
      address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
      booking_ref: "V26078476101 (adults) / V26078476163 (kids)",
      notes: "Enter via the Pyramid entrance. Adults: V26078476101. Kids: V26078476163.",
      sort_order: 2,
    }),
  ],

  "2026-04-04": [
    item("restaurant", "Brasserie Bellanger \u2014 Dinner", {
      start_time: "2026-04-04T19:00:00",
      location_name: "Brasserie Bellanger",
      address: "140 Rue du Faubourg Saint-Martin, 75010 Paris",
      booking_ref: "3BEU2Y3BGMUC",
      notes: "Party of 10. Reservation confirmed.",
      sort_order: 1,
    }),
  ],

  "2026-04-05": [
    item("activity", "Louvre Museum (Return Visit)", {
      start_time: "2026-04-05T11:30:00",
      location_name: "Louvre Museum \u2014 Pyramid Entrance",
      address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
      booking_ref: "V26078645148 (adults, \u20ac128) / V26078645174 (kids, FREE)",
      notes: "Enter via the Pyramid entrance. Adults: V26078645148 (\u20ac128). Kids: V26078645174 (FREE).",
      sort_order: 1,
    }),
  ],

  "2026-04-06": [
    item("activity", "\u26a0\ufe0f Edwin\u2019s Birthday \ud83c\udf82", {
      description: "Happy Birthday Edwin! Celebrate before the train ride.",
      notes: "TGV departs at 11:22 AM \u2014 plan morning accordingly!",
      sort_order: 1,
    }),
    item("train", "TGV INOUI 6165 \u2014 Paris \u2192 Saint-Rapha\u00ebl", {
      start_time: "2026-04-06T11:22:00",
      end_time: "2026-04-06T16:15:00",
      location_name: "Paris Gare de Lyon \u2192 Saint-Rapha\u00ebl Valescure",
      address: "Paris Gare de Lyon, 75012 Paris",
      booking_ref: "ALDMK6 / 5HKT8H",
      description: "1st class. Booking 1: ALDMK6 (Aaron + James) \u2014 \u20ac282. Booking 2: 5HKT8H (Edwin, Morgan, Eden, Edwin II, Eva, Lennox, Beau, Jodi) \u2014 \u20ac771.55.",
      notes: "Kids aged 4\u201311 need passport on board. Departs 11:22 AM, arrives ~4:15 PM.",
      sort_order: 2,
    }),
    item("hotel", "Check in: Villa Eleanor", {
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      start_time: "2026-04-06T17:00:00",
      description: "Host: Laurence. Check-in: 5:00 PM. Checkout: Sat Apr 11 at 10:00 AM.",
      notes: "Arriving after TGV ~4:15 PM. Check-in from 5:00 PM. 5 nights on the French Riviera.",
      sort_order: 3,
    }),
  ],

  "2026-04-07": [
    item("free_time", "Free day in Saint-Rapha\u00ebl", {
      description: "Enjoy the Riviera! Villa Eleanor is home base.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      sort_order: 1,
    }),
  ],
  "2026-04-08": [
    item("free_time", "Free day in Saint-Rapha\u00ebl", {
      description: "Explore the coast, beaches, and town.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      sort_order: 1,
    }),
  ],
  "2026-04-09": [
    item("free_time", "Free day in Saint-Rapha\u00ebl", {
      description: "Another beautiful day on the French Riviera.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      sort_order: 1,
    }),
  ],
  "2026-04-10": [
    item("free_time", "Last full day in Saint-Rapha\u00ebl", {
      description: "Enjoy the last full day. Pack for tomorrow\u2019s departure.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      notes: "Tomorrow: transfer to Marseille Airport for Lisbon flight (Jared\u2019s family). Aaron\u2019s family heads home.",
      sort_order: 1,
    }),
  ],

  "2026-04-11": [
    item("transport", "Transfer to Marseille Airport", {
      start_time: "2026-04-11T12:00:00",
      description: "Drive from Saint-Rapha\u00ebl to Marseille Provence Airport (~1.5 hr). TBD \u2014 not yet booked.",
      location_name: "Marseille Provence Airport (MRS)",
      address: "Marseille Provence Airport, Marignane, France",
      notes: "Jared\u2019s family only. Aaron\u2019s family heads home from Saint-Rapha\u00ebl separately.",
      sort_order: 1,
    }),
    item("flight", "Ryanair FR486 \u2014 Marseille \u2192 Lisbon", {
      start_time: "2026-04-11T15:25:00",
      location_name: "MRS \u2192 LIS",
      address: "Marseille Provence Airport, Marignane, France",
      booking_ref: "M41TMN",
      description: "Jared\u2019s family only (5 people \u2014 Jared, Morgan, Eden, Edwin II + one more).",
      notes: "Confirmation: M41TMN. Aaron\u2019s family heads home from Saint-Rapha\u00ebl.",
      sort_order: 2,
    }),
    item("hotel", "Check in: Jo\u00e3o\u2019s Apartment", {
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      start_time: "2026-04-11T16:00:00",
      description: "Host: Jo\u00e3o. Check-in: 4:00 PM. Checkout: Wed Apr 15 at 11:00 AM.",
      notes: "4 nights in Lisbon. Jared\u2019s family only (5 people). Checkout Apr 15 by 11:00 AM.",
      sort_order: 3,
    }),
  ],

  "2026-04-12": [
    item("free_time", "Free day in Lisbon", {
      description: "Explore Lisbon \u2014 tiles, hills, and past\u00e9is de nata!",
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      sort_order: 1,
    }),
  ],
  "2026-04-13": [
    item("free_time", "Free day in Lisbon", {
      description: "Another day to explore the city of seven hills.",
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      sort_order: 1,
    }),
  ],
  "2026-04-14": [
    item("free_time", "Last day in Lisbon", {
      description: "Final day in Portugal. Enjoy and pack for tomorrow\u2019s flight home.",
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      notes: "Tomorrow: AA259 LIS \u2192 PHL \u2192 GRR (home).",
      sort_order: 1,
    }),
  ],

  "2026-04-15": [
    item("flight", "AA259 \u2014 Lisbon \u2192 Philadelphia \u2192 Grand Rapids", {
      location_name: "LIS \u2192 PHL \u2192 GRR",
      address: "Lisbon Humberto Delgado Airport, Lisbon, Portugal",
      description: "Final flight home.",
      sort_order: 1,
    }),
  ],
}

// ── Structured logistics for the Info page ──────────────────────────────────

export const FLIGHTS = [
  {
    date: "Apr 1",
    route: "GRR \u2192 EWR",
    flight: "UA3639",
    time: "Departs 1:39 PM",
    notes: null as string | null,
    confirmation: null as string | null,
  },
  {
    date: "Apr 2",
    route: "EWR \u2192 CDG",
    flight: "DL8758 (Air France A350)",
    time: "Departs 5:00 PM",
    notes: "Premium Economy",
    confirmation: null as string | null,
  },
  {
    date: "Apr 11",
    route: "MRS \u2192 LIS",
    flight: "Ryanair FR486",
    time: "Departs 3:25 PM",
    notes: "Jared\u2019s family only (5 people). Aaron\u2019s family heads home from Saint-Rapha\u00ebl.",
    confirmation: "M41TMN",
  },
  {
    date: "Apr 15",
    route: "LIS \u2192 PHL \u2192 GRR",
    flight: "AA259",
    time: null as string | null,
    notes: "Final flight home",
    confirmation: null as string | null,
  },
]

export const TRAIN = {
  name: "TGV INOUI 6165",
  route: "Paris Gare de Lyon \u2192 Saint-Rapha\u00ebl Valescure",
  date: "Apr 6",
  departs: "11:22 AM",
  arrives: "~4:15 PM",
  class: "1st class",
  stationAddress: "Paris Gare de Lyon, 75012 Paris",
  bookings: [
    { ref: "ALDMK6", passengers: "Aaron Veldheer + James Veldheer", cost: "\u20ac282" },
    { ref: "5HKT8H", passengers: "Edwin, Morgan, Eden, Edwin II, Eva, Lennox, Beau, Jodi", cost: "\u20ac771.55" },
  ],
  notes: "Kids aged 4\u201311 need passport on board.",
}

export const ACCOMMODATIONS = [
  {
    dates: "Apr 1 (one night)",
    name: "Hyatt Grand Central New York",
    address: "109 E 42nd St, New York, NY 10017",
    city: "NYC",
    notes: "Overnight before transatlantic flight",
  },
  {
    dates: "Apr 3\u20136",
    name: "Maison Galante",
    address: "8 Rue de l\u2019Arcade, 75008 Paris",
    city: "Paris",
    notes: null as string | null,
  },
  {
    dates: "Apr 6\u201311",
    name: "Villa Eleanor",
    address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
    city: "Saint-Rapha\u00ebl",
    notes: null as string | null,
  },
  {
    dates: "Apr 11\u201315",
    name: "Jo\u00e3o\u2019s Apartment",
    address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
    city: "Lisbon",
    notes: null as string | null,
  },
]

export const RESTAURANTS = [
  {
    date: "Apr 4",
    name: "Brasserie Bellanger",
    time: "7:00 PM",
    address: "140 Rue du Faubourg Saint-Martin, 75010 Paris",
    confirmation: "3BEU2Y3BGMUC",
    notes: "Party of 10",
  },
]

export const ACTIVITIES = [
  {
    date: "Apr 3",
    name: "Louvre Museum (Visit 1)",
    time: "9:00 AM",
    address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
    entrance: "Pyramid entrance",
    confirmations: [
      { ref: "V26078476101", label: "Adults" },
      { ref: "V26078476163", label: "Kids" },
    ],
  },
  {
    date: "Apr 5",
    name: "Louvre Museum (Visit 2)",
    time: "11:30 AM",
    address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
    entrance: "Pyramid entrance",
    confirmations: [
      { ref: "V26078645148", label: "Adults (\u20ac128)" },
      { ref: "V26078645174", label: "Kids (FREE)" },
    ],
  },
]

export const GROUND_TRANSPORT = [
  { date: "Apr 1", title: "Go Airlink Shuttle", description: "EWR \u2192 Hyatt Grand Central NYC" },
  { date: "Apr 2", title: "Go Airlink Shuttle", description: "Hotel \u2192 EWR" },
  { date: "Apr 11", title: "Transfer to Marseille Airport", description: "Saint-Rapha\u00ebl \u2192 MRS (~1.5 hr drive). TBD \u2014 not yet booked." },
]

export const IMPORTANT_NOTES = [
  "\u26a0\ufe0f Apr 6: EDWIN\u2019S BIRTHDAY \ud83c\udf82 \u2014 TGV departs 11:22 AM, plan morning accordingly!",
  "Apr 11: Group splits \u2014 Jared\u2019s family flies to Lisbon, Aaron\u2019s family heads home from Saint-Rapha\u00ebl.",
  "TGV: Kids aged 4\u201311 need their passport on board.",
  "Ryanair FR486 (Apr 11): Jared\u2019s family only (5 people).",
]
