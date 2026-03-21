"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plane,
  Train,
  Hotel,
  UtensilsCrossed,
  Phone,
  Lightbulb,
  Copy,
  Check,
  MapPin,
  ExternalLink,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useTrip } from "@/lib/hooks/use-trip"
import { getSupabaseClient } from "@/lib/supabase/client"
import { CATEGORY_LABELS } from "@/lib/constants"
import type { ItineraryItem } from "@/types"

// ── Static emergency / tips content ──────────────────────────────────────────

const EMERGENCY_INFO = [
  {
    region: "France",
    lines: [
      { label: "Emergency (EU)", value: "112" },
      { label: "Medical (SAMU)", value: "15" },
      { label: "Police", value: "17" },
      { label: "US Embassy Paris", value: "+33 1 43 12 22 22" },
    ],
  },
  {
    region: "Portugal",
    lines: [
      { label: "Emergency", value: "112" },
      { label: "US Embassy Lisbon", value: "+351 21 727 3300" },
    ],
  },
]

const TRAVEL_TIPS = [
  {
    heading: "Paris Metro",
    tips: [
      "Buy a carnet of 10 tickets or use a Navigo Easy card (contactless).",
      "Kids under 4 ride free; under 10 ride at half price.",
      "Download the RATP app for live journey planning.",
      "Validate your ticket BEFORE boarding — inspectors are common.",
    ],
  },
  {
    heading: "Tipping",
    tips: [
      "France: Service is included. Round up or leave 1–2 EUR for great service.",
      "Portugal: 5–10% appreciated but not mandatory. Round up in cafes.",
    ],
  },
  {
    heading: "Useful Phrases",
    tips: [
      "Bonjour (Hello) / Merci (Thank you) / S'il vous plaît (Please)",
      "Excusez-moi (Excuse me) / L'addition, s'il vous plaît (The bill, please)",
      "Obrigado/a (Thank you in Portuguese) / Com licença (Excuse me)",
      "Onde fica...? (Where is...? in Portuguese)",
    ],
  },
]

// ── Copyable booking ref ──────────────────────────────────────────────────────

function BookingRef({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded-md hover:bg-muted/80 transition-colors"
      title="Copy booking reference"
    >
      <span>{value}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  )
}

// ── Address link ──────────────────────────────────────────────────────────────

function AddressLink({ address }: { address: string }) {
  const encoded = encodeURIComponent(address)
  const href = `https://maps.google.com/?q=${encoded}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
    >
      <MapPin className="h-3 w-3 shrink-0" />
      {address}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  )
}

// ── Dynamic itinerary section ─────────────────────────────────────────────────

function ItinerarySection({
  items,
  category,
}: {
  items: ItineraryItem[]
  category: string
}) {
  const filtered = items.filter((i) => i.category === category)
  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No {(CATEGORY_LABELS[category] ?? category).toLowerCase()} bookings added yet.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {filtered.map((item) => (
        <div
          key={item.id}
          className="space-y-1.5 pb-4 border-b border-border last:border-0 last:pb-0"
        >
          <div className="flex items-start gap-2 flex-wrap">
            <span className="font-medium text-sm">{item.title}</span>
            {item.booking_ref && <BookingRef value={item.booking_ref} />}
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          {item.address && <AddressLink address={item.address} />}
          {item.notes && (
            <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-1.5">
              {item.notes}
            </p>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View booking
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InfoPage() {
  const { trip } = useTrip()
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!trip) return
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_id", trip.id)
      .order("sort_order")
    if (data) setItems(data as ItineraryItem[])
    setLoading(false)
  }, [trip])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const countByCategory = (cat: string) => items.filter((i) => i.category === cat).length

  const sections = [
    {
      id: "flights",
      icon: Plane,
      title: "Flights",
      badge: countByCategory("flight"),
      content: <ItinerarySection items={items} category="flight" />,
    },
    {
      id: "trains",
      icon: Train,
      title: "Trains",
      badge: countByCategory("train"),
      content: <ItinerarySection items={items} category="train" />,
    },
    {
      id: "hotels",
      icon: Hotel,
      title: "Hotels",
      badge: countByCategory("hotel"),
      content: <ItinerarySection items={items} category="hotel" />,
    },
    {
      id: "restaurants",
      icon: UtensilsCrossed,
      title: "Restaurant Reservations",
      badge: countByCategory("restaurant"),
      content: <ItinerarySection items={items} category="restaurant" />,
    },
    {
      id: "emergency",
      icon: Phone,
      title: "Emergency Info",
      badge: 0,
      content: (
        <div className="space-y-5">
          {EMERGENCY_INFO.map((region) => (
            <div key={region.region}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {region.region}
              </h4>
              <div className="space-y-2">
                {region.lines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-muted-foreground">{line.label}</span>
                    <a
                      href={`tel:${line.value.replace(/\s/g, "")}`}
                      className="font-mono text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {line.value}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "tips",
      icon: Lightbulb,
      title: "Travel Tips",
      badge: 0,
      content: (
        <div className="space-y-5">
          {TRAVEL_TIPS.map((section) => (
            <div key={section.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {section.heading}
              </h4>
              <ul className="space-y-1.5">
                {section.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Info & Logistics" subtitle="Everything you need to know" />

      <div className="p-4 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border border-border rounded-xl px-4 overflow-hidden bg-card"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                  <div className="flex items-center gap-2.5 flex-1 text-left">
                    <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1">{section.title}</span>
                    {section.badge > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto mr-2 text-xs tabular-nums"
                      >
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="border-t border-border pt-4">{section.content}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}
