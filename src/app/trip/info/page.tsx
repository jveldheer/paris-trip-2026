"use client"

import { useState } from "react"
import {
  Plane,
  Train,
  Hotel,
  UtensilsCrossed,
  Ticket,
  Car,
  Phone,
  Lightbulb,
  AlertTriangle,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Clock,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  FLIGHTS,
  TRAIN,
  ACCOMMODATIONS,
  RESTAURANTS,
  ACTIVITIES,
  GROUND_TRANSPORT,
  IMPORTANT_NOTES,
} from "@/lib/trip-data"

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
      className="inline-flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded-md hover:bg-muted/80 transition-colors active:scale-95"
      title="Tap to copy"
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

// ── Apple Maps link ──────────────────────────────────────────────────────────

function AddressLink({ address }: { address: string }) {
  const encoded = encodeURIComponent(address)
  const href = `https://maps.apple.com/?q=${encoded}`
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

// ── Emergency & tips data ───────────────────────────────────────────────────

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
      "Bonjour (Hello) / Merci (Thank you) / S'il vous plait (Please)",
      "Excusez-moi (Excuse me) / L'addition, s'il vous plait (The bill, please)",
      "Obrigado/a (Thank you in Portuguese) / Com licenca (Excuse me)",
      "Onde fica...? (Where is...? in Portuguese)",
    ],
  },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InfoPage() {
  const sections = [
    {
      id: "notes",
      icon: AlertTriangle,
      title: "Important Notes",
      badge: IMPORTANT_NOTES.length,
      content: (
        <div className="space-y-2">
          {IMPORTANT_NOTES.map((note, i) => (
            <div
              key={i}
              className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 text-sm text-amber-800 dark:text-amber-300 leading-relaxed"
            >
              {note}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "flights",
      icon: Plane,
      title: "Flights",
      badge: FLIGHTS.length,
      content: (
        <div className="space-y-4">
          {FLIGHTS.map((f, i) => (
            <div key={i} className="space-y-1.5 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-sm">{f.flight}</span>
                  <span className="text-muted-foreground text-sm ml-2">{f.route}</span>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{f.date}</Badge>
              </div>
              {f.time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {f.time}
                </div>
              )}
              {f.confirmation && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confirmation:</span>
                  <BookingRef value={f.confirmation} />
                </div>
              )}
              {f.notes && (
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-1.5">
                  {f.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "train",
      icon: Train,
      title: "Train",
      badge: 1,
      content: (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-sm">{TRAIN.name}</span>
            <Badge variant="outline" className="text-xs shrink-0">{TRAIN.date}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{TRAIN.route}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Departs {TRAIN.departs}
            </div>
            <span>Arrives {TRAIN.arrives}</span>
            <Badge variant="secondary" className="text-xs">{TRAIN.class}</Badge>
          </div>
          <AddressLink address={TRAIN.stationAddress} />
          <div className="mt-3 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bookings</h4>
            {TRAIN.bookings.map((b) => (
              <div key={b.ref} className="bg-muted/50 rounded-xl px-3 py-2.5 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <BookingRef value={b.ref} />
                  <span className="text-xs font-medium">{b.cost}</span>
                </div>
                <p className="text-xs text-muted-foreground">{b.passengers}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-1.5">
            {TRAIN.notes}
          </p>
        </div>
      ),
    },
    {
      id: "hotels",
      icon: Hotel,
      title: "Accommodations",
      badge: ACCOMMODATIONS.length,
      content: (
        <div className="space-y-4">
          {ACCOMMODATIONS.map((a, i) => (
            <div key={i} className="space-y-1.5 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm">{a.name}</span>
                <Badge variant="outline" className="text-xs shrink-0">{a.dates}</Badge>
              </div>
              <AddressLink address={a.address} />
              {a.notes && (
                <p className="text-xs text-muted-foreground">{a.notes}</p>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "activities",
      icon: Ticket,
      title: "Activities & Reservations",
      badge: ACTIVITIES.length + RESTAURANTS.length,
      content: (
        <div className="space-y-4">
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="space-y-1.5 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm">{a.name}</span>
                <Badge variant="outline" className="text-xs shrink-0">{a.date}</Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {a.time} &bull; {a.entrance}
              </div>
              <AddressLink address={a.address} />
              <div className="flex flex-wrap gap-2 mt-1">
                {a.confirmations.map((c) => (
                  <div key={c.ref} className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{c.label}:</span>
                    <BookingRef value={c.ref} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {RESTAURANTS.map((r, i) => (
            <div key={`r-${i}`} className="space-y-1.5 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold text-sm">{r.name}</span>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{r.date}</Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {r.time} &bull; {r.notes}
              </div>
              <AddressLink address={r.address} />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Confirmation:</span>
                <BookingRef value={r.confirmation} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "transport",
      icon: Car,
      title: "Ground Transport",
      badge: GROUND_TRANSPORT.length,
      content: (
        <div className="space-y-3">
          {GROUND_TRANSPORT.map((t, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
              <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{t.date}</Badge>
              <div>
                <p className="font-medium text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      ),
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
                  <div key={line.label} className="flex items-center justify-between gap-4">
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
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
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
        <Accordion type="multiple" defaultValue={["notes"]} className="space-y-2">
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
                    <Badge variant="secondary" className="ml-auto mr-2 text-xs tabular-nums">
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
      </div>
    </div>
  )
}
