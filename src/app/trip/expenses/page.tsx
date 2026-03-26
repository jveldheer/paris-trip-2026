"use client"

import {
  Plane,
  Hotel,
  Train,
  Car,
  Ticket,
  UtensilsCrossed,
  ChefHat,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ── Types ────────────────────────────────────────────────────────────────────

type SplitType = "split" | "jared" | "jared-portugal"

interface Expense {
  description: string
  date: string
  amount: number | null // null = TBD
  currency: string
  splitType: SplitType
  note?: string
}

interface ExpenseCategory {
  label: string
  icon: React.ElementType
  expenses: Expense[]
}

// ── Data ─────────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    label: "Flights",
    icon: Plane,
    expenses: [
      {
        description: "DL8758 EWR→CDG Air France Premium Economy",
        date: "Apr 2",
        amount: null,
        currency: "USD",
        splitType: "split",
      },
      {
        description: "Ryanair FR486 MRS→LIS",
        date: "Apr 11",
        amount: null,
        currency: "EUR",
        splitType: "jared-portugal",
      },
      {
        description: "AA259 LIS→PHL→GRR",
        date: "Apr 15",
        amount: null,
        currency: "USD",
        splitType: "jared-portugal",
      },
    ],
  },
  {
    label: "Hotels",
    icon: Hotel,
    expenses: [
      {
        description: "Hyatt Grand Central New York (1 night)",
        date: "Apr 1",
        amount: null,
        currency: "USD",
        splitType: "split",
      },
      {
        description: "Maison Galante Paris (3 nights)",
        date: "Apr 3–6",
        amount: null,
        currency: "EUR",
        splitType: "split",
      },
      {
        description: "Villa Eleanor Saint-Raphaël (5 nights)",
        date: "Apr 6–11",
        amount: null,
        currency: "EUR",
        splitType: "split",
      },
      {
        description: "João's Apartment Lisbon (4 nights)",
        date: "Apr 11–15",
        amount: null,
        currency: "EUR",
        splitType: "jared-portugal",
      },
    ],
  },
  {
    label: "Train",
    icon: Train,
    expenses: [
      {
        description: "TGV INOUI 6165 Paris→Saint-Raphaël (Booking 5HKT8H)",
        date: "Apr 6",
        amount: 771.55,
        currency: "EUR",
        splitType: "split",
      },
      {
        description: "TGV INOUI 6165 Paris→Saint-Raphaël (Booking ALDMK6 — Aaron + James)",
        date: "Apr 6",
        amount: 282,
        currency: "EUR",
        splitType: "jared",
        note: "Aaron's family pays separately",
      },
    ],
  },
  {
    label: "Transfers",
    icon: Car,
    expenses: [
      {
        description: "Go Airlink EWR→NYC",
        date: "Apr 1",
        amount: null,
        currency: "USD",
        splitType: "split",
      },
      {
        description: "Go Airlink NYC→EWR",
        date: "Apr 2",
        amount: null,
        currency: "USD",
        splitType: "split",
      },
      {
        description: "Transfer Saint-Raphaël→Marseille Airport",
        date: "Apr 11",
        amount: null,
        currency: "EUR",
        splitType: "jared-portugal",
      },
    ],
  },
  {
    label: "Activities",
    icon: Ticket,
    expenses: [
      {
        description: "Louvre Visit 1",
        date: "Apr 3",
        amount: 128,
        currency: "EUR",
        splitType: "split",
      },
      {
        description: "Musée d'Orsay",
        date: "Apr 3",
        amount: 64,
        currency: "EUR",
        splitType: "split",
      },
      {
        description: "Louvre Visit 2",
        date: "Apr 5",
        amount: 128,
        currency: "EUR",
        splitType: "split",
      },
    ],
  },
  {
    label: "Dining",
    icon: UtensilsCrossed,
    expenses: [
      {
        description: "Giulietta NYC (Aaron's birthday)",
        date: "Apr 1",
        amount: null,
        currency: "USD",
        splitType: "split",
      },
      {
        description: "La Bastide Paris",
        date: "Apr 3",
        amount: null,
        currency: "EUR",
        splitType: "split",
      },
      {
        description: "Brasserie Bellanger Paris",
        date: "Apr 4",
        amount: null,
        currency: "EUR",
        splitType: "split",
      },
      {
        description: "Gran Caffè Amore Mio (Edwin's birthday)",
        date: "Apr 6",
        amount: null,
        currency: "EUR",
        splitType: "split",
      },
    ],
  },
  {
    label: "Private Chef",
    icon: ChefHat,
    expenses: [
      {
        description: "Chef Valentin Sorkin — 4 breakfasts + 2 dinners @ Villa Eleanor",
        date: "Apr 7–10",
        amount: 1800,
        currency: "EUR",
        splitType: "split",
      },
    ],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number | null, currency: string) {
  if (amount === null) return null
  const symbol = currency === "EUR" ? "€" : "$"
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function splitLabel(type: SplitType): string {
  switch (type) {
    case "split":
      return "Split"
    case "jared":
      return "Jared only"
    case "jared-portugal":
      return "Jared only"
  }
}

function splitBadgeClass(type: SplitType): string {
  switch (type) {
    case "split":
      return "bg-blue-100 text-blue-800"
    case "jared":
      return "bg-gray-100 text-gray-700"
    case "jared-portugal":
      return "bg-teal-100 text-teal-800"
  }
}

/** Compute Jared and Aaron shares for an expense (skipping "note" items like Aaron's train booking) */
function computeShares(expense: Expense): { jared: number | null; aaron: number | null } {
  if (expense.note) {
    // This item is paid separately — exclude from totals
    return { jared: 0, aaron: 0 }
  }
  if (expense.amount === null) return { jared: null, aaron: null }

  switch (expense.splitType) {
    case "split":
      return { jared: expense.amount / 2, aaron: expense.amount / 2 }
    case "jared":
    case "jared-portugal":
      return { jared: expense.amount, aaron: 0 }
  }
}

function computeTotals() {
  let totalKnown = 0
  let jaredKnown = 0
  let aaronKnown = 0
  let hasTbd = false

  for (const cat of EXPENSE_CATEGORIES) {
    for (const exp of cat.expenses) {
      if (exp.note) continue // skip Aaron's separate booking
      if (exp.amount === null) {
        hasTbd = true
        continue
      }
      totalKnown += exp.amount
      const shares = computeShares(exp)
      jaredKnown += shares.jared ?? 0
      aaronKnown += shares.aaron ?? 0
    }
  }

  return { totalKnown, jaredKnown, aaronKnown, hasTbd }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const { totalKnown, jaredKnown, aaronKnown, hasTbd } = computeTotals()
  const tbdSuffix = hasTbd ? "+" : ""

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="Expenses" subtitle="Trip cost breakdown" backHref="/trip" />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* ── Summary Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <Card size="sm">
            <CardContent className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total</p>
              <p className="font-serif text-lg font-semibold">
                €{totalKnown.toLocaleString("en-US", { minimumFractionDigits: 2 })}{tbdSuffix}
              </p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Jared</p>
              <p className="font-serif text-lg font-semibold text-paris">
                €{jaredKnown.toLocaleString("en-US", { minimumFractionDigits: 2 })}{tbdSuffix}
              </p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Aaron</p>
              <p className="font-serif text-lg font-semibold text-saintraphael">
                €{aaronKnown.toLocaleString("en-US", { minimumFractionDigits: 2 })}{tbdSuffix}
              </p>
            </CardContent>
          </Card>
        </div>

        {hasTbd && (
          <p className="text-xs text-muted-foreground text-center">
            Totals are partial — some amounts are still TBD
          </p>
        )}

        {/* ── Portugal note ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 border border-teal-200 px-3 py-2">
          <span className="text-xs text-teal-800">
            Portugal leg (Apr 11–15) is Jared&apos;s family only
          </span>
        </div>

        {/* ── Expense Categories ────────────────────────────────── */}
        {EXPENSE_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center gap-2 mb-3">
              <cat.icon className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-serif text-sm font-semibold">{cat.label}</h2>
            </div>

            <Card size="sm">
              <CardContent className="space-y-0 p-0">
                {cat.expenses.map((exp, i) => {
                  const shares = computeShares(exp)
                  const isLast = i === cat.expenses.length - 1
                  return (
                    <div key={i}>
                      <div className="px-4 py-3 space-y-1.5">
                        {/* Row 1: description + amount */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug">{exp.description}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{exp.date}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {exp.amount !== null ? (
                              <p className="text-sm font-medium tabular-nums">
                                {formatAmount(exp.amount, exp.currency)}
                              </p>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">
                                TBD
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Row 2: split info */}
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={splitBadgeClass(exp.splitType)} variant="secondary">
                            {splitLabel(exp.splitType)}
                          </Badge>

                          {exp.note ? (
                            <span className="text-[11px] text-muted-foreground italic">{exp.note}</span>
                          ) : exp.amount !== null ? (
                            <div className="flex gap-3 text-[11px] text-muted-foreground tabular-nums">
                              <span>J: {formatAmount(shares.jared, exp.currency)}</span>
                              <span>A: {formatAmount(shares.aaron, exp.currency)}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {!isLast && <Separator />}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
