"use client"

import { TripProvider, useTrip } from "@/lib/hooks/use-trip"
import { NavBar } from "@/components/layout/nav-bar"
import { MemberSelector } from "@/components/layout/member-selector"
import { Loader2, WifiOff } from "lucide-react"
import { usePathname } from "next/navigation"

// ── Inner content (inside TripProvider) ─────────────────────────────────────

function OfflineBanner() {
  const { isOffline } = useTrip()
  const pathname = usePathname()

  // Weather page works fine without Supabase — suppress the misleading banner
  if (!isOffline || pathname === "/trip/weather") return null

  return (
    <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs text-center py-1.5 px-3 flex items-center justify-center gap-1.5">
      <WifiOff className="h-3 w-3" />
      Running in offline mode &mdash; changes save locally
    </div>
  )
}

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

// ── Main layout — no password gate here, handled by "/" + middleware ─────────

export function TripLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <TripProvider>
      <TripContent>{children}</TripContent>
    </TripProvider>
  )
}
