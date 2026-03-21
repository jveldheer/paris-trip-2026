import { TripLayoutClient } from "@/components/layout/trip-layout-client"

export const dynamic = "force-dynamic"

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return <TripLayoutClient>{children}</TripLayoutClient>
}
