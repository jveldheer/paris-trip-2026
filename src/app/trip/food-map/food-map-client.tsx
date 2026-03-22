'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { CityData, Venue } from './page';
import { getMarkerColor } from './page';
import 'leaflet/dist/leaflet.css';

// ── Recenter on city change ──────────────────────────────────────────────────

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [map, center, zoom]);
  return null;
}

// ── Open popup for selected venue ────────────────────────────────────────────

function VenueMarker({
  venue,
  isSelected,
  onSelect,
}: {
  venue: Venue;
  isSelected: boolean;
  onSelect: (name: string) => void;
}) {
  const markerRef = useRef<L.CircleMarker>(null);
  const color = getMarkerColor(venue);
  const is3Star = (venue.stars ?? 0) === 3;

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  return (
    <CircleMarker
      ref={markerRef}
      center={[venue.lat, venue.lon]}
      radius={is3Star ? 10 : 7}
      pathOptions={{
        fillColor: color,
        fillOpacity: 0.9,
        color: '#1a1a3e',
        weight: is3Star ? 2 : 1.5,
        opacity: 0.7,
      }}
      eventHandlers={{
        click: () => onSelect(venue.name),
      }}
    >
      <Popup>
        <div className="text-[#1a1a3e] min-w-[180px]">
          <div className="font-bold text-sm">{venue.name}</div>
          <div className="text-xs font-medium mt-0.5" style={{ color }}>
            {venue.award}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">{venue.cuisine}</div>
          <p className="text-[11px] text-gray-600 mt-1 leading-snug">{venue.desc}</p>
        </div>
      </Popup>
    </CircleMarker>
  );
}

// ── Map component ────────────────────────────────────────────────────────────

export default function FoodMapClient({
  city,
  selectedVenue,
  onSelectVenue,
}: {
  city: CityData;
  selectedVenue: string | null;
  onSelectVenue: (name: string | null) => void;
}) {
  return (
    <MapContainer
      center={city.center}
      zoom={city.zoom}
      className="h-full w-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapUpdater center={city.center} zoom={city.zoom} />
      {city.venues.map((venue) => (
        <VenueMarker
          key={venue.name}
          venue={venue}
          isSelected={selectedVenue === venue.name}
          onSelect={(name) => onSelectVenue(selectedVenue === name ? null : name)}
        />
      ))}
    </MapContainer>
  );
}
