"use client"

// This file is intentionally NOT imported directly — it is dynamically imported
// by day-map.tsx to avoid SSR issues with Leaflet (window is undefined on the server).

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getMapUrl } from "@/lib/trip-utils"
import type { ItineraryItem } from "@/types"
import type { CityName } from "@/lib/constants"

// Fix Leaflet's broken default icon paths when bundled with webpack/Next.js
const defaultIcon = L.icon({
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Default city centers
const CITY_CENTERS: Record<CityName, [number, number]> = {
  Paris:           [48.8566,  2.3522],
  "Saint-Raphael": [43.4254,  6.7686],
  Lisbon:          [38.7223, -9.1393],
}

interface DayMapInnerProps {
  items: ItineraryItem[]
  city: CityName
}

export function DayMapInner({ items, city }: DayMapInnerProps) {
  const pins = items.filter((i) => i.lat != null && i.lng != null)

  // Compute center: average of pins if available, else city default
  const center: [number, number] =
    pins.length > 0
      ? [
          pins.reduce((s, i) => s + i.lat!, 0) / pins.length,
          pins.reduce((s, i) => s + i.lng!, 0) / pins.length,
        ]
      : CITY_CENTERS[city] ?? [48.8566, 2.3522]

  const zoom = pins.length === 1 ? 15 : pins.length > 4 ? 12 : 13

  return (
    <div className="h-56 rounded-2xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat!, item.lng!]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-xs leading-snug max-w-[160px]">
                <strong className="block">{item.title}</strong>
                {item.location_name && (
                  <span className="text-gray-500">{item.location_name}</span>
                )}
                {item.address && (
                  <a
                    href={getMapUrl(item.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 text-blue-600 underline"
                  >
                    Open in Maps
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
