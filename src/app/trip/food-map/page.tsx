'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// ── Types ────────────────────────────────────────────────────────────────────

interface Venue {
  name: string;
  lat: number;
  lon: number;
  stars?: number;
  type?: string;
  award: string;
  cuisine: string;
  desc: string;
}

interface CityData {
  city: string;
  flag: string;
  center: [number, number];
  zoom: number;
  venues: Venue[];
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CITIES: CityData[] = [
  {
    city: 'Paris',
    flag: '\u{1F5FC}',
    center: [48.8566, 2.3522],
    zoom: 13,
    venues: [
      { name: 'Guy Savoy', lat: 48.8612, lon: 2.3365, stars: 3, award: '3 Michelin Stars', cuisine: 'French', desc: "One of Paris's most celebrated chefs. Monnaie de Paris." },
      { name: 'Le Cinq', lat: 48.8718, lon: 2.3072, stars: 3, award: '3 Michelin Stars', cuisine: 'French', desc: "Four Seasons George V. Christian Le Squer's masterpiece." },
      { name: 'Epicure', lat: 48.8742, lon: 2.3128, stars: 3, award: '3 Michelin Stars', cuisine: 'French', desc: "Le Bristol Paris. Eric Frechon's iconic black truffle macaroni." },
      { name: 'Le Grand Vefour', lat: 48.8637, lon: 2.3370, stars: 2, award: '2 Michelin Stars', cuisine: 'French Classic', desc: "One of Paris's oldest restaurants, inside Palais Royal arcades since 1784." },
      { name: 'Passage 53', lat: 48.8688, lon: 2.3388, stars: 2, award: '2 Michelin Stars', cuisine: 'Japanese-French', desc: "Hidden inside Passage des Panoramas. Shinichi Sato's Franco-Japanese precision." },
      { name: 'Taillevent', lat: 48.8754, lon: 2.3044, stars: 2, award: '2 Michelin Stars', cuisine: 'French Classic', desc: 'Parisian institution since 1946. Impeccable service, timeless elegance.' },
      { name: 'Septime', lat: 48.8527, lon: 2.3741, stars: 1, award: '1 Michelin Star', cuisine: 'Modern French', desc: "Bertrand Grebaut's beloved natural wine bistro. Notoriously hard to book." },
      { name: 'Frenchie', lat: 48.8627, lon: 2.3469, stars: 1, award: '1 Michelin Star', cuisine: 'Modern French', desc: "Gregory Marchand's Rue du Nil empire. Inventive market-driven cooking." },
      { name: 'Datil', lat: 48.8571, lon: 2.3497, stars: 1, award: '1 Michelin Star (2024 new)', cuisine: 'Vegetable-forward', desc: "Chef Manon Fleury. Sustainable, plant-led fine dining, one of 2024's most exciting new stars." },
      { name: 'Le Comptoir du Relais', lat: 48.8528, lon: 2.3396, stars: 0, award: 'Bib Gourmand', cuisine: 'Bistro', desc: "Yves Camdeborde's legendary bistro in Saint-Germain. No reservations at dinner." },
      { name: "Marche d'Aligre", lat: 48.8499, lon: 2.3752, type: 'market', award: 'Notable Market', cuisine: 'Market', desc: "Paris's most authentic daily market. Best prices, North African influence, local favorite." },
      { name: 'Marche des Enfants Rouges', lat: 48.8622, lon: 2.3618, type: 'market', award: 'Oldest Covered Market in Paris (1615)', cuisine: 'Market', desc: "Paris's oldest covered market. Moroccan, Japanese, Lebanese food stalls." },
    ],
  },
  {
    city: 'Saint-Raphael',
    flag: '\u{1F30A}',
    center: [43.4252, 6.7673],
    zoom: 11,
    venues: [
      { name: "La Vague d'Or", lat: 43.2682, lon: 6.6408, stars: 3, award: '3 Michelin Stars', cuisine: 'Mediterranean', desc: "Arnaud Donckele at Cheval Blanc Saint-Tropez. One of France's greatest restaurants." },
      { name: 'Residence de la Pinede', lat: 43.2720, lon: 6.6391, stars: 2, award: '2 Michelin Stars', cuisine: 'French', desc: "Saint-Tropez seafront. Arnaud Donckele's second address, equally extraordinary." },
      { name: 'Rivea', lat: 43.2697, lon: 6.6352, stars: 1, award: '1 Michelin Star', cuisine: 'Mediterranean', desc: "Alain Ducasse's casual Riviera table at Byblos Saint-Tropez." },
      { name: 'Flaveur', lat: 43.7102, lon: 7.2620, stars: 2, award: '2 Michelin Stars', cuisine: 'Modern French', desc: 'Nice. Brothers Gael and Mickael Tourteaux. Market-driven, technically brilliant.' },
      { name: 'Le Mas Candille', lat: 43.6412, lon: 6.9894, stars: 1, award: '1 Michelin Star', cuisine: 'Provencal', desc: 'Mougins. Stunning views, refined Provencal cuisine in a mas setting.' },
      { name: 'Marche Provencal de Saint-Raphael', lat: 43.4249, lon: 6.7649, type: 'market', award: 'Notable Market', cuisine: 'Market', desc: 'Daily Provencal market. Best local olives, lavender honey, tapenade, fresh fish.' },
      { name: 'Marche de Saint-Tropez', lat: 43.2724, lon: 6.6405, type: 'market', award: 'Notable Market', cuisine: 'Market', desc: "Place des Lices, Tues & Sat mornings. One of France's most famous Provencal markets." },
    ],
  },
  {
    city: 'Lisbon',
    flag: '\u{1F1F5}\u{1F1F9}',
    center: [38.7167, -9.1333],
    zoom: 13,
    venues: [
      { name: 'Belcanto', lat: 38.7113, lon: -9.1423, stars: 2, award: "2 Michelin Stars + World's 50 Best", cuisine: 'Portuguese Creative', desc: "Jose Avillez. Portugal's most acclaimed restaurant. Modern take on Portuguese classics." },
      { name: 'Alma', lat: 38.7118, lon: -9.1429, stars: 2, award: '2 Michelin Stars', cuisine: 'Portuguese', desc: 'Henrique Sa Pessoa. Chiado neighborhood. Celebrated for his carne de porco a Alentejana.' },
      { name: '100 Maneiras', lat: 38.7134, lon: -9.1461, stars: 1, award: '1 Michelin Star', cuisine: 'Creative', desc: 'Ljubomir Stanisic. Bairro Alto. 17-course storytelling menus, dark theatrical atmosphere.' },
      { name: 'Arkhe', lat: 38.7138, lon: -9.1388, stars: 1, award: '1 Michelin Star (2025)', cuisine: 'Vegetarian', desc: "Lisbon's best vegetarian fine dining. New star in 2025. Chiado." },
      { name: 'Marlene', lat: 38.7189, lon: -9.1369, stars: 1, award: '1 Michelin Star (2025)', cuisine: 'Portuguese', desc: 'Chef Marlene Vieira. New star 2025. Also has an outpost at Time Out Market.' },
      { name: 'SALA', lat: 38.7229, lon: -9.1491, stars: 1, award: '1 Michelin Star', cuisine: 'Modern Portuguese', desc: 'Joao Sa. Seasonal tasting menus with a strong connection to Portuguese terroir.' },
      { name: 'Taberna da Rua das Flores', lat: 38.7128, lon: -9.1405, stars: 0, award: 'Bib Gourmand', cuisine: 'Tasca', desc: 'Traditional petiscos done perfectly. Daily changing menu, packed with locals.' },
      { name: 'Canalha', lat: 38.7142, lon: -9.1472, stars: 0, award: 'Bib Gourmand (2025)', cuisine: 'Wine Bar', desc: 'New Bib Gourmand 2025. Natural wines and creative small plates in Bairro Alto.' },
      { name: 'Mercado da Ribeira (Time Out Market)', lat: 38.7068, lon: -9.1490, type: 'market', award: "World's Best Food Market (Time Out)", cuisine: 'Market', desc: "Iconic riverside market. 35 of Lisbon's best chefs and restaurants under one roof." },
      { name: 'Mercearia Assessoria', lat: 38.7155, lon: -9.1388, type: 'market', award: 'Notable Food Shop', cuisine: 'Deli', desc: 'Best tinned fish and Portuguese pantry products. A Lisbon institution.' },
    ],
  },
];

// ── Pin helpers ───────────────────────────────────────────────────────────────

function getMarkerColor(venue: Venue): string {
  if (venue.type === 'market') return '#3b82f6'; // blue
  if (venue.stars === 0) return '#22c55e'; // green - Bib Gourmand
  if (venue.stars === 1) return '#facc15'; // yellow
  if (venue.stars === 2) return '#f59e0b'; // gold
  if (venue.stars === 3) return '#d97706'; // amber
  return '#3b82f6'; // blue default
}

function getAwardBadge(venue: Venue): string {
  if (venue.type === 'market') return '\u{1F535}';
  if (venue.stars === 0) return '\u{1F7E2}';
  if (venue.stars === 1) return '\u{2B50}';
  if (venue.stars === 2) return '\u{2B50}\u{2B50}';
  if (venue.stars === 3) return '\u{1F451}';
  return '\u{1F535}';
}

function getAwardLabel(venue: Venue): string {
  if (venue.type === 'market') return 'Market / Shop';
  if (venue.stars === 0) return 'Bib Gourmand';
  if (venue.stars === 1) return '1 Star';
  if (venue.stars === 2) return '2 Stars';
  if (venue.stars === 3) return '3 Stars';
  return '';
}

// ── Dynamic Map (no SSR) ─────────────────────────────────────────────────────

const FoodMap = dynamic(() => import('./food-map-client'), { ssr: false });

// ── Main Page ────────────────────────────────────────────────────────────────

export default function FoodMapPage() {
  const router = useRouter();
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const city = CITIES[selectedCityIdx];

  const sortedVenues = useMemo(() => {
    return [...city.venues].sort((a, b) => {
      const aRank = a.type === 'market' ? -1 : (a.stars ?? -1);
      const bRank = b.type === 'market' ? -1 : (b.stars ?? -1);
      return bRank - aRank;
    });
  }, [city]);

  // Scroll selected venue into view in the list
  useEffect(() => {
    if (selectedVenue && listRef.current) {
      const el = listRef.current.querySelector(`[data-venue="${selectedVenue}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedVenue]);

  return (
    <div className="min-h-screen pb-24 bg-[#FFFBF0]">
      {/* Header */}
      <div className="bg-[#1a1a3e] pt-safe">
        <div className="flex items-center px-4 pt-4 pb-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="ml-3">
            <h1 className="text-white font-semibold text-lg leading-tight">Food Map</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Award-Winning Dining</p>
          </div>
        </div>

        {/* City tab bar */}
        <div className="flex gap-2 px-4 pb-4">
          <div className="flex gap-1.5 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
            {CITIES.map((c, i) => {
              const isActive = i === selectedCityIdx;
              return (
                <button
                  key={c.city}
                  onClick={() => {
                    setSelectedCityIdx(i);
                    setSelectedVenue(null);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.city.split('-')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: '55vh' }}>
        <FoodMap
          city={city}
          selectedVenue={selectedVenue}
          onSelectVenue={setSelectedVenue}
        />
        {/* Legend */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#1a1a3e] shadow-lg border border-[#1a1a3e]/10 z-[1000]">
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-600" /> 3 Stars</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> 2 Stars</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" /> 1 Star</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Bib Gourmand</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" /> Market</span>
        </div>
      </div>

      {/* Venue list */}
      <div ref={listRef} className="px-4 pt-4 pb-4 space-y-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1a3e]/40 px-1">
          {city.city} &middot; {city.venues.length} Award-Winning Spots
        </h2>
        {sortedVenues.map((venue) => {
          const isSelected = selectedVenue === venue.name;
          return (
            <button
              key={venue.name}
              data-venue={venue.name}
              onClick={() => setSelectedVenue(isSelected ? null : venue.name)}
              className={`w-full text-left rounded-xl p-3.5 transition-all border ${
                isSelected
                  ? 'bg-[#1a1a3e]/5 border-[#1a1a3e]/20 shadow-md'
                  : 'bg-white border-[#1a1a3e]/8 hover:border-[#1a1a3e]/15'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 text-sm"
                  style={{ backgroundColor: getMarkerColor(venue) + '20' }}
                >
                  {getAwardBadge(venue)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1a1a3e]">{venue.name}</span>
                    <span className="text-[10px] font-medium text-[#1a1a3e]/40 uppercase tracking-wider">
                      {venue.cuisine}
                    </span>
                  </div>
                  <div className="text-xs text-[#1a1a3e]/50 mt-0.5">
                    {getAwardLabel(venue)} &middot; {venue.award}
                  </div>
                  {isSelected && (
                    <p className="text-xs text-[#1a1a3e]/70 mt-1.5 leading-relaxed">{venue.desc}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { type Venue, type CityData, getMarkerColor };
