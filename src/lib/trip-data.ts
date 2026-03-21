// ── Complete trip logistics data ─────────────────────────────────────────────

export interface FlightLeg {
  date: string
  flight: string
  route: string
  departs: string
  notes?: string
  confirmation?: string
}

export interface TransferLeg {
  date: string
  type: "shuttle" | "drive"
  description: string
  notes?: string
  confirmation?: string
}

export interface Accommodation {
  city: string
  name: string
  address: string
  dates: string
  notes?: string
}

export interface TrainBooking {
  train: string
  route: string
  date: string
  departs: string
  arrives: string
  class: string
  bookings: { ref: string; passengers: string; cost: string }[]
  notes?: string
}

export interface ActivityItem {
  date: string
  time: string
  title: string
  description?: string
  address?: string
  confirmation?: string
  cost?: string
  notes?: string
  partySize?: string
}

// ── FLIGHTS ──────────────────────────────────────────────────────────────────

export const FLIGHTS: FlightLeg[] = [
  {
    date: "Apr 1",
    flight: "UA3639",
    route: "GRR \u2192 EWR",
    departs: "1:39 PM",
  },
  {
    date: "Apr 2",
    flight: "DL8758 (Air France A350)",
    route: "EWR \u2192 CDG",
    departs: "5:00 PM",
    notes: "Premium Economy",
  },
  {
    date: "Apr 11",
    flight: "Ryanair FR486",
    route: "MRS \u2192 LIS",
    departs: "3:25 PM",
    confirmation: "M41TMN",
    notes: "JARED\u2019S FAMILY ONLY (5 people) \u2014 Aaron\u2019s family heads home from Saint-Rapha\u00ebl",
  },
  {
    date: "Apr 15",
    flight: "AA259",
    route: "LIS \u2192 PHL \u2192 GRR",
    departs: "",
    notes: "Home!",
  },
]

// ── TRANSFERS ────────────────────────────────────────────────────────────────

export const TRANSFERS: TransferLeg[] = [
  {
    date: "Apr 1",
    type: "shuttle",
    description: "Go Airlink shuttle EWR \u2192 Hyatt Grand Central NYC",
  },
  {
    date: "Apr 2",
    type: "shuttle",
    description: "Go Airlink shuttle hotel \u2192 EWR",
  },
  {
    date: "Apr 11",
    type: "drive",
    description: "Transfer Saint-Rapha\u00ebl \u2192 Marseille Airport (MRS)",
    notes: "NOT YET BOOKED \u2014 ~1.5 hr drive, depart ~11:30 AM",
  },
]

// ── ACCOMMODATIONS ───────────────────────────────────────────────────────────

export const ACCOMMODATIONS: Accommodation[] = [
  {
    city: "New York City",
    name: "Hyatt Grand Central New York",
    address: "109 E 42nd St, New York, NY 10017",
    dates: "Apr 1\u20132",
    notes: "One night layover",
  },
  {
    city: "Paris",
    name: "Maison Galante",
    address: "8 Rue de l\u2019Arcade, 75008 Paris",
    dates: "Apr 3\u20136",
  },
  {
    city: "Saint-Rapha\u00ebl",
    name: "Villa Eleanor",
    address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
    dates: "Apr 6\u201311",
  },
  {
    city: "Lisbon",
    name: "Jo\u00e3o\u2019s apartment",
    address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
    dates: "Apr 11\u201315",
  },
]

// ── TRAIN ────────────────────────────────────────────────────────────────────

export const TRAIN: TrainBooking = {
  train: "TGV INOUI 6165",
  route: "Paris Gare de Lyon \u2192 Saint-Rapha\u00ebl Valescure",
  date: "Apr 6",
  departs: "11:22 AM",
  arrives: "~4:15 PM",
  class: "1st class",
  bookings: [
    {
      ref: "ALDMK6",
      passengers: "Aaron Veldheer + James Veldheer",
      cost: "\u20ac282",
    },
    {
      ref: "5HKT8H",
      passengers: "Edwin, Morgan, Eden, Edwin II, Eva, Lennox, Beau, Jodi",
      cost: "\u20ac771.55",
    },
  ],
  notes: "LEAVE EARLY \u2014 EDWIN\u2019S BIRTHDAY \ud83c\udf82 | Kids 4\u201311 need passport on board",
}

// ── ACTIVITIES & RESERVATIONS ────────────────────────────────────────────────

export const ACTIVITIES: ActivityItem[] = [
  {
    date: "Apr 3",
    time: "9:00 AM",
    title: "Louvre Museum (Visit 1)",
    description: "Pyramid entrance \u2014 4 adults + 6 kids",
    address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
    confirmation: "V26078476101 (adults) + V26078476163 (kids)",
  },
  {
    date: "Apr 4",
    time: "7:00 PM",
    title: "Brasserie Bellanger dinner",
    address: "140 Rue du Faubourg Saint-Martin, 75010 Paris",
    confirmation: "3BEU2Y3BGMUC",
    partySize: "Party of 10",
  },
  {
    date: "Apr 5",
    time: "11:30 AM",
    title: "Louvre Museum (Visit 2)",
    description: "Pyramid entrance",
    address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
    confirmation: "V26078645148 (adults, \u20ac128) + V26078645174 (kids, FREE)",
  },
]
