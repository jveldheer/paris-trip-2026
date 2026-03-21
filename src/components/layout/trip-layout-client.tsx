"use client"

import { TripProvider } from "@/lib/hooks/use-trip"
import { NavBar } from "@/components/layout/nav-bar"

export function TripLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <TripProvider>
      <main className="flex-1 pb-20">{children}</main>
      <NavBar />
    </TripProvider>
  )
}
