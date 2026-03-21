"use client"

import { useState } from "react"
import { Lock, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import { addLocalItem, generateId } from "@/lib/offline-storage"

interface AddMemoryProps {
  tripId: string
  memberId: string | null
  onAdded?: () => void
  isOffline?: boolean
}

const STORAGE_KEY = "offline_memory_jar"

export function AddMemory({ tripId, memberId, onAdded, isOffline }: AddMemoryProps) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text) return
    setSubmitting(true)
    setError(null)

    if (isOffline) {
      addLocalItem(STORAGE_KEY, {
        id: generateId(),
        trip_id: tripId,
        member_id: memberId ?? null,
        content: text,
        revealed: false,
        created_at: new Date().toISOString(),
      })
      setContent("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setSubmitting(false)
      onAdded?.()
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { error: err } = await supabase.from("memory_jar").insert({
        trip_id: tripId,
        member_id: memberId ?? null,
        content: text,
        revealed: false,
      })
      if (err) throw err

      setContent("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onAdded?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Lock className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Add a memory</h3>
          <p className="text-xs text-muted-foreground">Your note will be sealed until the trip ends!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="A funny moment, a sweet thought, something you never want to forget..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={500}
          className="resize-none text-sm"
          disabled={submitting}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{content.length}/500</span>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !content.trim()}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Sealing..." : "Seal it"}
          </Button>
        </div>
      </form>

      {success && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
          <Lock className="h-4 w-4 shrink-0" />
          Memory sealed! It'll be revealed after April 15.
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
