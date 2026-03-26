"use client"

import { useState } from "react"
import {
  Plane,
  TrainFront,
  Bed,
  Utensils,
  Ticket,
  Car,
  Coffee,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Hash,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatTime, getMapUrl } from "@/lib/trip-utils"
import { CATEGORY_LABELS } from "@/lib/constants"
import type { ItineraryItem, ItineraryItemCategory } from "@/types"

// ── Category icon + color maps ────────────────────────────────────────────────

const CATEGORY_ICONS: Record<ItineraryItemCategory, React.ElementType> = {
  flight: Plane,
  train: TrainFront,
  hotel: Bed,
  restaurant: Utensils,
  activity: Ticket,
  transport: Car,
  free_time: Coffee,
}

const CATEGORY_BG: Record<ItineraryItemCategory, string> = {
  flight:     "bg-sky-100 text-sky-700",
  train:      "bg-violet-100 text-violet-700",
  hotel:      "bg-indigo-100 text-indigo-700",
  restaurant: "bg-orange-100 text-orange-700",
  activity:   "bg-emerald-100 text-emerald-700",
  transport:  "bg-slate-100 text-slate-600",
  free_time:  "bg-amber-100 text-amber-700",
}

// ── Copy button with checkmark feedback ───────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs gap-1.5 shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {label}
        </>
      )}
    </Button>
  )
}

// ── Expanded details panel ────────────────────────────────────────────────────

function ExpandedDetails({ item }: { item: ItineraryItem }) {
  return (
    <motion.div
      key="expanded"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <Separator className="my-3" />
      <div className="space-y-3 text-sm">

        {/* Description */}
        {item.description && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Address + Google Maps link */}
        {item.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground leading-snug text-sm">{item.address}</p>
              <a
                href={item.url ?? getMapUrl(item.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                Open in Google Maps
              </a>
            </div>
          </div>
        )}

        {/* Booking reference */}
        {item.booking_ref && (
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-foreground flex-1 truncate">
              {item.booking_ref}
            </span>
            <CopyButton text={item.booking_ref} label="Copy ref" />
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-800 text-xs leading-relaxed">
            <span className="font-semibold block mb-0.5">Notes</span>
            {item.notes}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main exported card ────────────────────────────────────────────────────────

interface ItineraryItemCardProps {
  item: ItineraryItem
  /** Start expanded (e.g. deep-linked) */
  defaultExpanded?: boolean
  /** Compact single-line mode used inside the TodayCard */
  compact?: boolean
}

export function ItineraryItemCard({
  item,
  defaultExpanded = false,
  compact = false,
}: ItineraryItemCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const Icon = CATEGORY_ICONS[item.category] ?? Coffee
  const iconBg = CATEGORY_BG[item.category] ?? "bg-slate-100 text-slate-600"

  const hasDetails =
    Boolean(item.description) ||
    Boolean(item.address) ||
    Boolean(item.booking_ref) ||
    Boolean(item.url) ||
    Boolean(item.notes)

  // ── Compact mode ─────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-3 py-1.5">
        <div className={cn("p-1.5 rounded-lg shrink-0", iconBg)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          {item.location_name && (
            <p className="text-xs text-muted-foreground truncate">{item.location_name}</p>
          )}
        </div>
        {item.start_time && (
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {formatTime(item.start_time)}
          </span>
        )}
      </div>
    )
  }

  // ── Full card ─────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border/60 shadow-sm p-4",
        "transition-all duration-150",
        hasDetails && "cursor-pointer hover:shadow-md active:scale-[0.99]",
        expanded && "ring-1 ring-inset ring-border/60",
      )}
      onClick={() => hasDetails && setExpanded((e) => !e)}
      role={hasDetails ? "button" : undefined}
      aria-expanded={hasDetails ? expanded : undefined}
    >
      {/* ── Top row ── */}
      <div className="flex items-start gap-3">

        {/* Category icon */}
        <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", iconBg)}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Title + sub-details */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm leading-snug">{item.title}</p>

          {item.location_name && (
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="text-xs truncate">{item.location_name}</span>
            </div>
          )}

          {(item.start_time || item.end_time) && (
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="text-xs tabular-nums">
                {item.start_time ? formatTime(item.start_time) : ""}
                {item.end_time ? ` – ${formatTime(item.end_time)}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Right side: badge + toggle chevron */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant="secondary" className="text-xs tracking-wide text-muted-foreground px-1.5 h-4">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </Badge>
          {hasDetails && (
            <span className="text-muted-foreground">
              {expanded
                ? <ChevronUp className="h-3.5 w-3.5" />
                : <ChevronDown className="h-3.5 w-3.5" />
              }
            </span>
          )}
        </div>
      </div>

      {/* Booking ref peek (collapsed state) */}
      {item.booking_ref && !expanded && (
        <div className="mt-2 flex items-center gap-2">
          <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="font-mono text-xs text-muted-foreground truncate">
            {item.booking_ref}
          </span>
        </div>
      )}

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {expanded && <ExpandedDetails item={item} />}
      </AnimatePresence>
    </div>
  )
}
