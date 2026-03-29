"use client"

import { useEffect } from "react"

export default function TripError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Trip route error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">😵‍💫</div>
      <h2 className="font-serif text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        An unexpected error occurred. Try again, or head back to the dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <a
          href="/trip"
          className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  )
}
