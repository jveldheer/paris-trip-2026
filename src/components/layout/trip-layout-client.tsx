"use client"

import { TripProvider } from "@/lib/hooks/use-trip"
import { TripGuard } from "@/components/layout/trip-guard"
import { NavBar } from "@/components/layout/nav-bar"

export function TripLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <TripProvider>
      <TripGuard>
        <main className="flex-1 pb-20">{children}</main>
        <NavBar />
      </TripGuard>
    </TripProvider>
  )
}
