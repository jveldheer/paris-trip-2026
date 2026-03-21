"use client"

import { useState, useEffect } from "react"
import { TripProvider, useTrip } from "@/lib/hooks/use-trip"
import { NavBar } from "@/components/layout/nav-bar"
import { MemberSelector } from "@/components/layout/member-selector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Loader2 } from "lucide-react"

// ── Cookie helpers ──────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

// ── Password Gate ───────────────────────────────────────────────────────────

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === "Paris!") {
      setCookie("trip_access", "granted", 90)
      onSuccess()
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
      <div
        className={`w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${shaking ? "animate-shake" : ""}`}
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">
            ✈️🗼
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Veldheer Europe 2026</h1>
          <p className="text-blue-200 text-sm">Enter the trip password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:border-white/40 focus:ring-white/20 h-12 text-base"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center">
              Wrong password. Try again!
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-white text-blue-900 hover:bg-blue-50"
          >
            Enter
          </Button>
        </form>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

// ── Inner content (inside TripProvider) ─────────────────────────────────────

function TripContent({ children }: { children: React.ReactNode }) {
  const { currentMember, loading } = useTrip()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!currentMember) {
    return <MemberSelector />
  }

  return (
    <>
      <main className="flex-1 pb-20">{children}</main>
      <NavBar />
    </>
  )
}

// ── Main layout ─────────────────────────────────────────────────────────────

export function TripLayoutClient({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    setHasAccess(getCookie("trip_access") === "granted")
  }, [])

  // SSR / hydration: show nothing while checking cookie
  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasAccess) {
    return <PasswordGate onSuccess={() => setHasAccess(true)} />
  }

  return (
    <TripProvider>
      <TripContent>{children}</TripContent>
    </TripProvider>
  )
}
