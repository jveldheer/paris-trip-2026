"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase/client"
import { generateId } from "@/lib/offline-storage"

interface CreatePollProps {
  tripId: string
  memberId: string
  onCreated?: (poll?: any) => void
  isOffline?: boolean
}

const CLOSE_OPTIONS = [
  { label: "No expiry", value: null },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "4 hours", value: 240 },
  { label: "Tomorrow", value: 1440 },
]

export function CreatePoll({ tripId, memberId, onCreated, isOffline }: CreatePollProps) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [closeIn, setCloseIn] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addOption() {
    if (options.length < 6) setOptions([...options, ""])
  }

  function removeOption(index: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }

  function updateOption(index: number, value: string) {
    const next = [...options]
    next[index] = value
    setOptions(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const q = question.trim()
    const validOptions = options.map((o) => o.trim()).filter(Boolean)

    if (!q) { setError("Please enter a question."); return }
    if (validOptions.length < 2) { setError("Need at least 2 options."); return }

    setSubmitting(true)

    if (isOffline) {
      const pollId = generateId()
      const closesAt = closeIn
        ? new Date(Date.now() + closeIn * 60 * 1000).toISOString()
        : null

      const localPoll = {
        id: pollId,
        trip_id: tripId,
        member_id: memberId,
        question: q,
        is_active: true,
        closes_at: closesAt,
        created_at: new Date().toISOString(),
        poll_options: validOptions.map((text, i) => ({
          id: generateId(),
          poll_id: pollId,
          text,
          sort_order: i,
          poll_votes: [],
        })),
      }

      setQuestion("")
      setOptions(["", ""])
      setCloseIn(null)
      setOpen(false)
      setSubmitting(false)
      onCreated?.(localPoll)
      return
    }

    try {
      const supabase = getSupabaseClient()

      const closesAt = closeIn
        ? new Date(Date.now() + closeIn * 60 * 1000).toISOString()
        : null

      const { data: poll, error: pollErr } = await supabase
        .from("polls")
        .insert({ trip_id: tripId, member_id: memberId, question: q, closes_at: closesAt, is_active: true })
        .select()
        .single()

      if (pollErr || !poll) throw pollErr ?? new Error("Failed to create poll")

      const optionRows = validOptions.map((text, i) => ({
        poll_id: poll.id,
        text,
        sort_order: i,
      }))

      const { error: optErr } = await supabase.from("poll_options").insert(optionRows)
      if (optErr) throw optErr

      setQuestion("")
      setOptions(["", ""])
      setCloseIn(null)
      setOpen(false)
      onCreated?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus className="h-4 w-4" />
        New Poll
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Question</label>
            <Input
              placeholder="Where should we eat tonight?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Options <span className="text-muted-foreground font-normal">({options.length}/6)</span>
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  maxLength={120}
                  className="text-sm flex-1"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add option
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Close poll</label>
            <div className="relative">
              <select
                value={closeIn ?? ""}
                onChange={(e) => setCloseIn(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CLOSE_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Creating…" : "Create Poll"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
