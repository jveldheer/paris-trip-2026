"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function PasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | false>(false)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError(false)

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: password }),
      })

      if (res.ok) {
        router.replace("/trip")
      } else if (res.status === 429) {
        setError("Too many attempts. Please try again in 15 minutes.")
        setChecking(false)
      } else {
        setError("Incorrect password. Try again.")
        setChecking(false)
      }
    } catch {
      setError("Network error. Please try again.")
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">
            🇫🇷✈️🌊🇵🇹
          </div>
          <h1 className="font-serif text-2xl font-bold mb-1">Veldheer Europe 2026</h1>
          <p className="text-muted-foreground text-sm">Enter the password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Password"
              aria-label="Trip password"
              autoFocus
              autoComplete="off"
              className={`w-full px-4 py-3 rounded-xl border bg-card text-center text-lg font-medium
                focus:outline-none focus:ring-2 focus:ring-primary/50
                ${error ? "border-destructive shake" : "border-border"}`}
            />
            {error && (
              <p className="text-destructive text-xs text-center mt-2">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold
              hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {checking ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  )
}
