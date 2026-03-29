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
  "2026-04-01": [
    item("flight", "UA3639 — GRR \u2192 EWR", {
      start_time: "2026-04-01T13:39:00",
      location_name: "Gerald R. Ford International Airport (GRR)",
      address: "5500 44th St SE, Grand Rapids, MI 49512",
      description: "United Airlines UA3639. Departs 1:39 PM.",
      notes: "Arrive at airport by 11:30 AM. Check bags.",
      url: "https://maps.google.com/?q=Gerald+R+Ford+International+Airport+Grand+Rapids+MI",
      sort_order: 1,
    }),
    item("transport", "Go Airlink Shuttle — EWR \u2192 NYC", {
      location_name: "Newark Airport (EWR) \u2192 Hyatt Grand Central",
      address: "Newark Liberty International Airport",
      description: "Go Airlink shuttle from EWR to Hyatt Grand Central New York.",
      notes: "Book or confirm Go Airlink reservation. ~45 min ride.",
      url: "https://maps.google.com/?q=Newark+Liberty+International+Airport",
      sort_order: 2,
    }),
    item("activity", "\ud83c\udf82 Aaron's Birthday!", {
      description: "Happy Birthday Aaron! The trip kicks off on his big day \u2014 NYC first stop.",
      notes: "Consider a birthday dinner in NYC tonight. Great excuse to celebrate before Paris.",
      sort_order: 0,
    }),
    item("hotel", "Check in: Hyatt Grand Central New York", {
      start_time: "2026-04-01T15:00:00",
      location_name: "Hyatt Grand Central New York",
      address: "109 E 42nd St, New York, NY 10017",
      description: "One night in NYC before the Paris flight. Check-in 3 PM.",
      notes: "Steps from Grand Central Terminal. Checkout Apr 2 by 12 PM.",
      url: "https://maps.google.com/?q=Hyatt+Grand+Central+New+York+109+E+42nd+St",
      sort_order: 3,
    }),
    item("restaurant", "🎂 Birthday Dinner — Giulietta", {
      start_time: "2026-04-01T18:15:00",
      location_name: "Giulietta",
      address: "200 Park Ave, New York, NY 10017",
      description: "Aaron's birthday dinner! Two tables — party of 4 + party of 6.",
      booking_ref: "Confirmation #10319 · (212) 597-2424 · Reservation: Jared Veldheer",
      notes: "Table of 4 + table of 6 split. Booked via OpenTable.",
      url: "https://maps.google.com/?q=Giulietta+200+Park+Ave+New+York+NY",
      sort_order: 4,
    }),
  ],
  "2026-04-02": [
    item("transport", "Go Airlink Shuttle — NYC \u2192 EWR", {
      start_time: "2026-04-02T13:30:00",
      location_name: "Hyatt Grand Central \u2192 Newark Airport (EWR)",
      address: "109 E 42nd St, New York, NY 10017",
      description: "Go Airlink shuttle back to Newark. Allow 1.5 hrs + arrive 3 hrs early.",
      notes: "Depart hotel ~1:30 PM for 5 PM flight. International check-in requires 3 hours.",
      url: "https://maps.google.com/?q=Hyatt+Grand+Central+New+York+109+E+42nd+St",
      sort_order: 1,
    }),
    item("flight", "DL8758 \u2014 EWR \u2192 CDG (Air France A350)", {
      start_time: "2026-04-02T17:00:00",
      location_name: "Newark Liberty International Airport (EWR)",
      address: "Newark Liberty International Airport, Newark, NJ",
      description: "Delta/Air France A350 Premium Economy. EWR \u2192 Paris Charles de Gaulle. Overnight flight.",
      notes: "Arrive CDG early morning Apr 3. Premium Economy \u2014 enjoy the flight!",
      url: "https://maps.google.com/?q=Newark+Liberty+International+Airport",
      sort_order: 2,
    }),
  ],
  "2026-04-03": [
    item("hotel", "Check in: Maison Galante", {
      location_name: "Maison Galante",
      address: "8 Rue de l\u2019Arcade, 75008 Paris",
      start_time: "2026-04-03T15:00:00",
      description: "Host: Maison Galante. Check-in: 3:00 PM. Checkout: Mon Apr 6 at 11:00 AM.",
      notes: "3 nights in Paris. Checkout Apr 6 by 11:00 AM — TGV departs 11:22 AM!",
      url: "https://maps.google.com/?q=8+Rue+de+l'Arcade+75008+Paris",
      sort_order: 1,
    }),
    item("activity", "Louvre Museum", {
      start_time: "2026-04-03T09:00:00",
      location_name: "Louvre Museum \u2014 Pyramid Entrance",
      address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
      booking_ref: "V26078476101 (adults) / V26078476163 (kids)",
      notes: "Enter via the Pyramid entrance. Adults: V26078476101. Kids: V26078476163.",
      url: "https://maps.google.com/?q=Louvre+Museum+Rue+de+Rivoli+75001+Paris",
      sort_order: 2,
    }),
    item("activity", "Mus\u00e9e d\u2019Orsay", {
      start_time: "2026-04-03T13:30:00",
      location_name: "Mus\u00e9e d\u2019Orsay",
      address: "1 Rue de la L\u00e9gion d\u2019Honneur, 75007 Paris",
      booking_ref: "194197039",
      description: "4 tickets (full price) \u2014 \u20ac64 total. Home of Van Gogh, Monet, Renoir.",
      notes: "Tickets are non-refundable. Show PDF on phone at entrance. Arrive at 1:30 PM sharp.",
      url: "https://maps.google.com/?q=Mus%C3%A9e+d'Orsay+1+Rue+de+la+L%C3%A9gion+d'Honneur+75007+Paris",
      sort_order: 3,
    }),
    item("restaurant", "La Bastide \u2014 Dinner \ud83c\udf7d\ufe0f", {
      start_time: "2026-04-03T18:00:00",
      location_name: "La Bastide",
      address: "94 Boulevard des Batignolles, 75017 Paris",
      description: "Dinner for 10 \u2014 two tables booked (6 + 4). \u26a0\ufe0f Reservation request pending \u2014 watch for confirmation email/SMS.",
      notes: "Table of 6 (Jared's booking) + separate table of 4. Same restaurant, same time. Confirm both before the trip.",
      url: "https://maps.google.com/?q=La+Bastide+94+Boulevard+des+Batignolles+75017+Paris",
      sort_order: 4,
    }),
  ],

  "2026-04-04": [
    item("restaurant", "Brasserie Bellanger \u2014 Dinner", {
      start_time: "2026-04-04T19:00:00",
      location_name: "Brasserie Bellanger",
      address: "140 Rue du Faubourg Saint-Martin, 75010 Paris",
      booking_ref: "3BEU2Y3BGMUC",
      notes: "Party of 10. Reservation confirmed.",
      url: "https://maps.google.com/?q=Brasserie+Bellanger+140+Rue+du+Faubourg+Saint-Martin+75010+Paris",
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
      url: "https://maps.google.com/?q=Louvre+Museum+Rue+de+Rivoli+75001+Paris",
      sort_order: 1,
    }),
    item("restaurant", "🥩 Le Relais de l\u2019Entrecôte — Dinner", {
      start_time: "2026-04-05T18:30:00",
      location_name: "Le Relais de l\u2019Entrecôte Saint-Honoré",
      address: "12-14 Rue du Marché Saint-Honoré, 75001 Paris",
      description: "No reservations needed — walk-in only. Fixed menu: walnut salad + sliced entrecôte with secret herb butter sauce + unlimited fries. ~€30–40/person.",
      notes: "Doors open 6:30 PM. Walk-in only (no reservations taken). Arrive at opening to beat the queue. Last Paris dinner before TGV to Saint-Raphaël tomorrow.",
      url: "https://maps.google.com/?q=12+Rue+du+Marché+Saint-Honoré+75001+Paris",
      sort_order: 2,
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
      url: "https://maps.google.com/?q=Paris+Gare+de+Lyon+75012+Paris",
      sort_order: 2,
    }),
    item("hotel", "Check in: Villa Eleanor", {
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      start_time: "2026-04-06T17:00:00",
      description: "Host: Laurence. Check-in: 5:00 PM. Checkout: Sat Apr 11 at 10:00 AM.",
      notes: "Arriving after TGV ~4:15 PM. Check-in from 5:00 PM. 5 nights on the French Riviera.",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 3,
    }),
    item("restaurant", "\ud83c\udf82 Birthday Dinner \u2014 Gran Caff\u00e8 Amore Mio", {
      start_time: "2026-04-06T19:00:00",
      location_name: "Gran Caff\u00e8 Ristorante Amore Mio",
      address: "25 Place Sadi Carnot, Saint-Rapha\u00ebl, France 83700",
      description: "Edwin's birthday dinner! Traditional Italian \u2014 reservation for 10. Booked via Reserve with Google.",
      url: "https://maps.google.com/?q=Gran+Caffe+Amore+Mio+25+Place+Sadi+Carnot+Saint-Raphael+France",
      sort_order: 4,
    }),
  ],

  "2026-04-07": [
    item("restaurant", "\u2615 Breakfast \u2014 Chef Valentin", {
      start_time: "2026-04-07T09:00:00",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      description: "Private breakfast prepared by Chef Valentin Sorkin. 4 adults, 2 teens, 4 kids.",
      booking_ref: "Booking #1426701 \u00b7 +33 06 52 05 74 71",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 1,
    }),
    item("free_time", "Free day in Saint-Rapha\u00ebl", {
      description: "Enjoy the Riviera! Villa Eleanor is home base.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 2,
    }),
    item("restaurant", "\ud83c\udf7d\ufe0f Dinner \u2014 Chef Valentin", {
      start_time: "2026-04-07T19:00:00",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      description: "Private dinner prepared by Chef Valentin Sorkin. 4 adults, 2 teens, 4 kids.",
      booking_ref: "Booking #1426701 \u00b7 +33 06 52 05 74 71",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 3,
    }),
  ],
  "2026-04-08": [
    item("restaurant", "\u2615 Breakfast \u2014 Chef Valentin", {
      start_time: "2026-04-08T09:00:00",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      description: "Private breakfast prepared by Chef Valentin Sorkin. 4 adults, 2 teens, 4 kids.",
      booking_ref: "Booking #1426701 \u00b7 +33 06 52 05 74 71",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 1,
    }),
    item("free_time", "Free day in Saint-Rapha\u00ebl", {
      description: "Explore the coast, beaches, and town.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 2,
    }),
  ],
  "2026-04-09": [
    item("restaurant", "\u2615 Breakfast \u2014 Chef Valentin", {
      start_time: "2026-04-09T09:00:00",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      description: "Private breakfast prepared by Chef Valentin Sorkin. 4 adults, 2 teens, 4 kids.",
      booking_ref: "Booking #1426701 \u00b7 +33 06 52 05 74 71",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 1,
    }),
    item("free_time", "Free day in Saint-Rapha\u00ebl", {
      description: "Another beautiful day on the French Riviera.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 2,
    }),
    item("restaurant", "\ud83c\udf7d\ufe0f Dinner \u2014 Chef Valentin", {
      start_time: "2026-04-09T19:00:00",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      description: "Private dinner prepared by Chef Valentin Sorkin. 4 adults, 2 teens, 4 kids.",
      booking_ref: "Booking #1426701 \u00b7 +33 06 52 05 74 71",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 3,
    }),
  ],
  "2026-04-10": [
    item("restaurant", "\u2615 Breakfast \u2014 Chef Valentin", {
      start_time: "2026-04-10T09:00:00",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      description: "Private breakfast prepared by Chef Valentin Sorkin. 4 adults, 2 teens, 4 kids.",
      booking_ref: "Booking #1426701 \u00b7 +33 06 52 05 74 71",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 1,
    }),
    item("free_time", "Last full day in Saint-Rapha\u00ebl", {
      description: "Enjoy the last full day. Pack for tomorrow\u2019s departure.",
      location_name: "Villa Eleanor",
      address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
      notes: "Tomorrow: transfer to Marseille Airport for Lisbon flight (Jared\u2019s family). Aaron\u2019s family heads home.",
      url: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
      sort_order: 2,
    }),
  ],

  "2026-04-11": [
    item("transport", "Transfer to Marseille Airport", {
      start_time: "2026-04-11T12:00:00",
      description: "Drive from Saint-Rapha\u00ebl to Marseille Provence Airport (~1.5 hr). TBD \u2014 not yet booked.",
      location_name: "Marseille Provence Airport (MRS)",
      address: "Marseille Provence Airport, Marignane, France",
      notes: "Jared\u2019s family only. Aaron\u2019s family heads home from Saint-Rapha\u00ebl separately.",
      url: "https://maps.google.com/?q=Marseille+Provence+Airport+Marignane+France",
      sort_order: 1,
    }),
    item("flight", "Ryanair FR486 \u2014 Marseille \u2192 Lisbon", {
      start_time: "2026-04-11T15:25:00",
      location_name: "MRS \u2192 LIS",
      address: "Marseille Provence Airport, Marignane, France",
      booking_ref: "M41TMN",
      description: "Jared\u2019s family only (5 people \u2014 Jared, Morgan, Eden, Edwin II + one more).",
      notes: "Confirmation: M41TMN. Aaron\u2019s family heads home from Saint-Rapha\u00ebl.",
      url: "https://maps.google.com/?q=Marseille+Provence+Airport+Marignane+France",
      sort_order: 2,
    }),
    item("hotel", "Check in: Jo\u00e3o\u2019s Apartment", {
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      start_time: "2026-04-11T16:00:00",
      description: "Host: Jo\u00e3o. Check-in: 4:00 PM. Checkout: Wed Apr 15 at 11:00 AM.",
      notes: "4 nights in Lisbon. Jared\u2019s family only (5 people). Checkout Apr 15 by 11:00 AM.",
      url: "https://maps.google.com/?q=Cal%C3%A7ada+de+Salvador+Correia+de+S%C3%A1+4+Lisbon+Portugal",
      sort_order: 3,
    }),
  ],

  "2026-04-12": [
    item("free_time", "Free day in Lisbon", {
      description: "Explore Lisbon \u2014 tiles, hills, and past\u00e9is de nata!",
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      url: "https://maps.google.com/?q=Cal%C3%A7ada+de+Salvador+Correia+de+S%C3%A1+4+Lisbon+Portugal",
      sort_order: 1,
    }),
  ],
  "2026-04-13": [
    item("free_time", "Free day in Lisbon", {
      description: "Another day to explore the city of seven hills.",
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      url: "https://maps.google.com/?q=Cal%C3%A7ada+de+Salvador+Correia+de+S%C3%A1+4+Lisbon+Portugal",
      sort_order: 1,
    }),
  ],
  "2026-04-14": [
    item("free_time", "Last day in Lisbon", {
      description: "Final day in Portugal. Enjoy and pack for tomorrow\u2019s flight home.",
      location_name: "Jo\u00e3o\u2019s Apartment",
      address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
      notes: "Tomorrow: AA259 LIS \u2192 PHL \u2192 GRR (home).",
      url: "https://maps.google.com/?q=Cal%C3%A7ada+de+Salvador+Correia+de+S%C3%A1+4+Lisbon+Portugal",
      sort_order: 1,
    }),
  ],

  "2026-04-15": [
    item("flight", "AA259 \u2014 Lisbon \u2192 Philadelphia \u2192 Grand Rapids", {
      location_name: "LIS \u2192 PHL \u2192 GRR",
      address: "Lisbon Humberto Delgado Airport, Lisbon, Portugal",
      description: "Final flight home.",
      url: "https://maps.google.com/?q=Lisbon+Humberto+Delgado+Airport+Lisbon+Portugal",
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
  mapsUrl: "https://maps.google.com/?q=Paris+Gare+de+Lyon+75012+Paris",
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
    mapsUrl: "https://maps.google.com/?q=Hyatt+Grand+Central+New+York+109+E+42nd+St",
  },
  {
    dates: "Apr 3\u20136",
    name: "Maison Galante",
    address: "8 Rue de l\u2019Arcade, 75008 Paris",
    city: "Paris",
    notes: null as string | null,
    mapsUrl: "https://maps.google.com/?q=8+Rue+de+l'Arcade+75008+Paris",
  },
  {
    dates: "Apr 6\u201311",
    name: "Villa Eleanor",
    address: "135 Avenue du Ch\u00e2teau d\u2019Eau, Saint-Rapha\u00ebl, France",
    city: "Saint-Rapha\u00ebl",
    notes: null as string | null,
    mapsUrl: "https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France",
  },
  {
    dates: "Apr 11\u201315",
    name: "Jo\u00e3o\u2019s Apartment",
    address: "Cal\u00e7ada de Salvador Correia de S\u00e1 4, Lisbon, Portugal",
    city: "Lisbon",
    notes: null as string | null,
    mapsUrl: "https://maps.google.com/?q=Cal%C3%A7ada+de+Salvador+Correia+de+S%C3%A1+4+Lisbon+Portugal",
  },
]

export const RESTAURANTS = [
  {
    date: "Apr 1",
    name: "Giulietta",
    time: "6:15 PM",
    address: "200 Park Ave, New York, NY 10017",
    confirmation: "#10319 · (212) 597-2424",
    notes: "Aaron's birthday dinner. Table of 4 + table of 6 split.",
    mapsUrl: "https://maps.google.com/?q=Giulietta+200+Park+Ave+New+York+NY",
  },
  {
    date: "Apr 3",
    name: "La Bastide",
    time: "6:00 PM",
    address: "94 Boulevard des Batignolles, 75017 Paris",
    confirmation: "Pending confirmation",
    notes: "Dinner for 10 — table of 6 (Jared) + table of 4. Confirm before the trip.",
    mapsUrl: "https://maps.google.com/?q=La+Bastide+94+Boulevard+des+Batignolles+75017+Paris",
  },
  {
    date: "Apr 6",
    name: "Gran Caffè Amore Mio",
    time: "7:00 PM",
    address: "25 Place Sadi Carnot, Saint-Raphaël, France 83700",
    confirmation: "Confirmed via Reserve with Google",
    notes: "Edwin's birthday dinner. Reservation for 10.",
    mapsUrl: "https://maps.google.com/?q=Gran+Caffe+Amore+Mio+25+Place+Sadi+Carnot+Saint-Raphael+France",
  },
  {
    date: "Apr 4",
    name: "Brasserie Bellanger",
    time: "7:00 PM",
    address: "140 Rue du Faubourg Saint-Martin, 75010 Paris",
    confirmation: "3BEU2Y3BGMUC",
    notes: "Party of 10",
    mapsUrl: "https://maps.google.com/?q=Brasserie+Bellanger+140+Rue+du+Faubourg+Saint-Martin+75010+Paris",
  },
]

export const ACTIVITIES = [
  {
    date: "Apr 3",
    name: "Louvre Museum (Visit 1)",
    time: "9:00 AM",
    address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
    entrance: "Pyramid entrance",
    mapsUrl: "https://maps.google.com/?q=Louvre+Museum+Rue+de+Rivoli+75001+Paris",
    confirmations: [
      { ref: "V26078476101", label: "Adults" },
      { ref: "V26078476163", label: "Kids" },
    ],
  },
  {
    date: "Apr 3",
    name: "Musée d'Orsay",
    time: "1:30 PM",
    address: "1 Rue de la Légion d'Honneur, 75007 Paris",
    entrance: null,
    mapsUrl: "https://maps.google.com/?q=Mus%C3%A9e+d'Orsay+1+Rue+de+la+L%C3%A9gion+d'Honneur+75007+Paris",
    confirmations: [
      { ref: "194197039", label: "4 tickets (€64)" },
    ],
  },
  {
    date: "Apr 5",
    name: "Louvre Museum (Visit 2)",
    time: "11:30 AM",
    address: "Mus\u00e9e du Louvre, Rue de Rivoli, 75001 Paris",
    entrance: "Pyramid entrance",
    mapsUrl: "https://maps.google.com/?q=Louvre+Museum+Rue+de+Rivoli+75001+Paris",
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
