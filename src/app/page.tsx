"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"

const CORRECT_PASSWORD = "Paris!"
const COOKIE_NAME = "trip_auth"

function setAuthCookie() {
  const expires = new Date(Date.now() + 90 * 864e5).toUTCString()
  document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; SameSite=Lax`
}

function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.includes(`${COOKIE_NAME}=1`)
}

export default function PasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  // If already authed, redirect immediately
  useState(() => {
    if (typeof window !== "undefined" && hasAuthCookie()) {
      router.replace("/trip")
    }
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setChecking(true)
    if (password === CORRECT_PASSWORD) {
      setAuthCookie()
      router.replace("/trip")
    } else {
      setError(true)
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
          <h1 className="text-2xl font-bold mb-1">Veldheer Europe 2026</h1>
          <p className="text-muted-foreground text-sm">Enter the password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Password"
              autoFocus
              autoComplete="off"
              className={`w-full px-4 py-3 rounded-xl border bg-card text-center text-lg font-medium
                focus:outline-none focus:ring-2 focus:ring-primary/50
                ${error ? "border-red-400 shake" : "border-border"}`}
            />
            {error && (
              <p className="text-red-500 text-xs text-center mt-2">
                Incorrect password. Try again.
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
