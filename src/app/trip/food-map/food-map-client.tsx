'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CityData, Venue } from './page';
import { CATEGORY_MAP, getMarkerColor, getMarkerSize } from './page';
import 'leaflet/dist/leaflet.css';

// ── Custom SVG marker factory ───────────────────────────────────────────────

function createSvgIcon(venue: Venue, isSelected: boolean, isSaved: boolean): L.DivIcon {
  const cat = CATEGORY_MAP[venue.category];
  const size = getMarkerSize(venue);
  const px = isSelected ? size * 2.8 : size * 2.4;
  const color = getMarkerColor(venue);
  const emoji = cat.emoji;
  const fontSize = venue.category === 'michelin' && (venue.stars ?? 0) >= 3 ? 14 : 11;

  const savedBadge = isSaved
    ? `<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:#f59e0b;border:1.5px solid white;display:flex;align-items:center;justify-content:center;font-size:8px;line-height:1;">&#11088;</div>`
    : '';

  return L.divIcon({
    className: 'food-map-marker',
    iconSize: [px, px],
    iconAnchor: [px / 2, px / 2],
    html: `
      <div style="
        position: relative;
        width: ${px}px;
        height: ${px}px;
        border-radius: 50%;
        background: ${color};
        border: ${isSelected ? '3px' : '2px'} solid ${isSelected ? '#1a1a3e' : 'white'};
        box-shadow: ${isSelected ? '0 0 0 3px rgba(26,26,62,0.3), 0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${fontSize}px;
        line-height: 1;
        transition: transform 0.15s ease;
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        cursor: pointer;
        z-index: ${isSelected ? 1000 : 1};
      ">${emoji}${savedBadge}</div>
    `,
  });
}

// ── Recenter on city change ──────────────────────────────────────────────────

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [map, center, zoom]);
  return null;
}

// ── Pan to selected venue ────────────────────────────────────────────────────

function SelectedPanner({ venue }: { venue: Venue | null }) {
  const map = useMap();
  useEffect(() => {
    if (venue) {
      map.panTo([venue.lat, venue.lon], { animate: true, duration: 0.4 });
    }
  }, [map, venue]);
  return null;
}

// ── Venue marker ─────────────────────────────────────────────────────────────

function VenueMarker({
  venue,
  isSelected,
  isSaved,
  onSelect,
}: {
  venue: Venue;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (venue: Venue) => void;
}) {
  const icon = createSvgIcon(venue, isSelected, isSaved);

  return (
    <Marker
      position={[venue.lat, venue.lon]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect(venue),
      }}
    />
  );
}

// ── Map component ────────────────────────────────────────────────────────────

export default function FoodMapClient({
  city,
  venues,
  selectedVenue,
  onSelectVenue,
  savedVenues = [],
}: {
  city: CityData;
  venues: Venue[];
  selectedVenue: Venue | null;
  onSelectVenue: (venue: Venue | null) => void;
  savedVenues?: string[];
}) {
  const handleSelect = useCallback(
    (venue: Venue) => {
      onSelectVenue(selectedVenue?.name === venue.name ? null : venue);
    },
    [onSelectVenue, selectedVenue],
  );

  return (
    <MapContainer
      center={city.center}
      zoom={city.zoom}
      className="h-full w-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <MapUpdater center={city.center} zoom={city.zoom} />
      <SelectedPanner venue={selectedVenue} />
      {venues.map((venue) => (
        <VenueMarker
          key={venue.name}
          venue={venue}
          isSelected={selectedVenue?.name === venue.name}
          isSaved={savedVenues.includes(venue.name)}
          onSelect={handleSelect}
        />
      ))}
    </MapContainer>
  );
}
