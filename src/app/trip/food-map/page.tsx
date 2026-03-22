'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, Search, X, MapPin, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';

// ── Categories ──────────────────────────────────────────────────────────────

export type Category = 'michelin' | 'bakery' | 'coffee' | 'market' | 'wine' | 'specialty' | 'iconic';

export interface CategoryDef {
  key: Category;
  emoji: string;
  label: string;
  color: string;
  colorBg: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'michelin',  emoji: '\u2B50', label: 'Michelin',  color: '#d97706', colorBg: '#d9770620' },
  { key: 'bakery',    emoji: '\u{1F950}', label: 'Bakery',   color: '#e11d48', colorBg: '#e11d4820' },
  { key: 'coffee',    emoji: '\u2615', label: 'Coffee',   color: '#78350f', colorBg: '#78350f20' },
  { key: 'market',    emoji: '\u{1F6D2}', label: 'Market',   color: '#16a34a', colorBg: '#16a34a20' },
  { key: 'wine',      emoji: '\u{1F377}', label: 'Wine',     color: '#7c3aed', colorBg: '#7c3aed20' },
  { key: 'specialty', emoji: '\u{1FAD9}', label: 'Shop',     color: '#0d9488', colorBg: '#0d948820' },
  { key: 'iconic',    emoji: '\u{1F36E}', label: 'Iconic',   color: '#ea580c', colorBg: '#ea580c20' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c])) as Record<Category, CategoryDef>;

// ── Types ────────────────────────────────────────────────────────────────────

export interface Venue {
  name: string;
  lat: number;
  lon: number;
  category: Category;
  stars?: number;
  bibGourmand?: boolean;
  award?: string;
  tagline: string;
  desc: string;
  kidFriendly?: boolean;
}

export interface CityData {
  city: string;
  flag: string;
  center: [number, number];
  zoom: number;
  venues: Venue[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getMarkerColor(venue: Venue): string {
  return CATEGORY_MAP[venue.category].color;
}

export function getMarkerSize(venue: Venue): number {
  if (venue.category === 'michelin') {
    if (venue.stars === 3) return 14;
    if (venue.stars === 2) return 11;
    return 9;
  }
  return 8;
}

function googleMapsUrl(venue: Venue): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name)}`;
}

function venueSortRank(v: Venue): number {
  if (v.category === 'michelin') return 100 + (v.stars ?? 0) * 10 + (v.bibGourmand ? 1 : 0);
  const catOrder: Record<Category, number> = { michelin: 0, bakery: 80, iconic: 70, coffee: 60, market: 50, wine: 40, specialty: 30 };
  return catOrder[v.category] ?? 0;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CITIES: CityData[] = [
  {
    city: 'Paris',
    flag: '\u{1F5FC}',
    center: [48.8566, 2.3522],
    zoom: 13,
    venues: [
      // MICHELIN
      { name: 'Guy Savoy', lat: 48.8612, lon: 2.3365, category: 'michelin', stars: 3, award: '3 Michelin Stars', tagline: "Paris's greatest chef. Monnaie de Paris setting.", desc: "The artichoke soup with black truffle is legendary. Guy Savoy consistently holds his place as one of the world's greatest chefs, and the Monnaie de Paris setting along the Seine is breathtaking. A once-in-a-lifetime meal." },
      { name: 'Le Cinq', lat: 48.8718, lon: 2.3072, category: 'michelin', stars: 3, award: '3 Michelin Stars', tagline: "Four Seasons George V. Christian Le Squer's masterpiece.", desc: "Non-negotiable if budget allows. Christian Le Squer's cooking at the Four Seasons George V is technically flawless and deeply soulful. The dining room itself is one of the most beautiful in Paris." },
      { name: 'Epicure at Le Bristol', lat: 48.8742, lon: 2.3128, category: 'michelin', stars: 3, award: '3 Michelin Stars', tagline: "Eric Frechon's famous black truffle macaroni.", desc: "One of the most copied dishes in French culinary history. Eric Frechon's stuffed macaroni with black truffle, artichoke, and duck foie gras is reason enough to visit. The garden terrace is magical." },
      { name: 'Septime', lat: 48.8527, lon: 2.3741, category: 'michelin', stars: 1, award: '1 Michelin Star', tagline: "Natural wine, market-driven, genuinely exciting.", desc: "Bertrand Gr\u00E9baut runs the hardest reservation in Paris. The wine list is all-natural, the cooking is market-driven and genuinely thrilling. Book well in advance or try the walk-in wine bar next door, Septime La Cave." },
      { name: 'Frenchie', lat: 48.8627, lon: 2.3469, category: 'michelin', stars: 1, award: '1 Michelin Star', tagline: "Gregory Marchand's Rue du Nil. Inventive, ingredient-obsessed.", desc: "Gregory Marchand built an empire on Rue du Nil \u2014 the restaurant, wine bar, and to-go shop form a triangle of deliciousness. Inventive, ingredient-obsessed cooking that never tries too hard. Beloved." },
      { name: 'Datil', lat: 48.8571, lon: 2.3497, category: 'michelin', stars: 1, award: '1 Michelin Star (2024)', tagline: "Chef Manon Fleury. Sustainable, plant-forward fine dining.", desc: "One of 2024's most exciting new stars. Manon Fleury's commitment to sustainability is genuine \u2014 every vegetable is treated with the reverence usually reserved for truffles. A statement about the future of French cuisine." },
      { name: 'Le Comptoir du Relais', lat: 48.8528, lon: 2.3396, category: 'michelin', bibGourmand: true, award: 'Bib Gourmand', tagline: "Yves Camdeborde's legendary Saint-Germain bistro.", desc: "No reservations at dinner \u2014 worth the queue. Yves Camdeborde is the godfather of the bistronomy movement, and this is where it all happens. The prix fixe lunch is one of Paris's best deals." },

      // BAKERY
      { name: 'La Parisienne', lat: 48.8765, lon: 2.3570, category: 'bakery', award: '\u{1F947} Grand Prix de la Baguette 2025', tagline: "Supplies baguettes to the \u00C9lys\u00E9e Palace.", desc: "Micka\u00EBl Reydellet won Paris's most prestigious baguette competition in 2025. For one year, this bakery in the 10th arrondissement supplies baguettes to the President of France. The crust crackle is extraordinary." },
      { name: 'Boulangerie Utopie', lat: 48.8618, lon: 2.3744, category: 'bakery', award: '\u{1F947} Grand Prix de la Baguette 2024 + Best Croissant', tagline: "Double winner: best baguette and best croissant.", desc: "Xavier Netry won the 2024 Grand Prix de la Baguette and is also rated one of Paris's best croissants. 20 Rue Jean-Pierre Timbaud in the 11th. If you only visit one bakery in Paris, make it this one." },
      { name: 'Du Pain et des Id\u00E9es', lat: 48.8718, lon: 2.3572, category: 'bakery', award: '\u{1F3C5} France\'s Most Beautiful Bakery', tagline: "Christophe Vasseur's Canal Saint-Martin masterpiece.", desc: "The escargot pastry and praline croissant are unmissable. The bakery itself \u2014 with original 19th-century painted ceilings \u2014 is a monument. Often has a queue, worth every minute. Closed weekends.", kidFriendly: true },

      // COFFEE
      { name: 'T\u00E9lescope', lat: 48.8637, lon: 2.3386, category: 'coffee', award: 'Pioneer of Paris specialty coffee', tagline: "The caf\u00E9 that started Paris's third-wave revolution.", desc: "Nicolas Clerc's tiny, perfect caf\u00E9 near Palais Royal changed everything. Before T\u00E9lescope, Paris coffee was an afterthought. 5 Rue Vill\u00E9do in the 1st arrondissement. Simple, focused, exceptional." },
      { name: 'Coutume Caf\u00E9', lat: 48.8510, lon: 2.3272, category: 'coffee', award: 'Flagship of Paris coffee culture', tagline: "Kickstarted the Paris coffee revolution in 2011.", desc: "Opened in 2011 on Rue de Babylone in Saint-Germain, Coutume was the flagship that proved Parisians cared about great coffee. Still one of the best. Beautiful space, excellent pastries too." },
      { name: 'Lomi', lat: 48.8893, lon: 2.3504, category: 'coffee', award: 'Top-rated Paris roaster', tagline: "18th arr roastery. One of France's most respected.", desc: "Worth the trip to the 18th arrondissement. Lomi is a roastery, training lab, and caf\u00E9 all in one. One of the most respected specialty roasters in France. The space is industrial-cool and the coffee is perfect." },

      // MARKETS
      { name: "March\u00E9 d'Aligre", lat: 48.8499, lon: 2.3752, category: 'market', tagline: "Paris's most authentic daily market.", desc: "Best prices in Paris, strong North African influence, local butchers and fishmongers who know your name. Covered hall (March\u00E9 Beauvau) plus outdoor stalls. Tuesday through Sunday. The real Paris.", kidFriendly: true },
      { name: 'March\u00E9 des Enfants Rouges', lat: 48.8622, lon: 2.3618, category: 'market', award: "Paris's oldest covered market (1615)", tagline: "Moroccan tagine, Japanese bento, Lebanese mezze under one historic roof.", desc: "Paris's oldest covered market, dating to 1615. The food stalls are incredible \u2014 Moroccan tagine, Japanese bento, Lebanese mezze, Italian pasta, all made fresh. Rue de Bretagne in the 3rd. Perfect family lunch spot.", kidFriendly: true },
      { name: 'Rue Montorgueil', lat: 48.8645, lon: 2.3478, category: 'market', tagline: "The great pedestrian market street of Paris.", desc: "Everything you need within a few blocks: Stohrer (Paris's oldest p\u00E2tisserie, founded 1730), fresh fish, incredible cheese shops, charcuterie, and bakeries. A living, breathing food street that's been feeding Paris for centuries.", kidFriendly: true },

      // WINE
      { name: 'Caves Legrand', lat: 48.8660, lon: 2.3388, category: 'wine', award: 'Institution since 1905', tagline: "Legendary cave inside Galerie Vivienne.", desc: "One of the most beautiful wine shops in the world, tucked inside the stunning Galerie Vivienne. Curated natural and classic French wines. The staff are passionate and knowledgeable. A temple of French wine culture." },
      { name: 'La Derni\u00E8re Goutte', lat: 48.8519, lon: 2.3340, category: 'wine', award: 'Best natural wine shop in Saint-Germain', tagline: "Beloved by sommeliers worldwide.", desc: "Exclusively small-producer French wines. The American owner has impeccable taste and deep relationships with winemakers across France. Rue de Bourbon le Ch\u00E2teau in the 6th. Saturday tastings are legendary." },

      // SPECIALTY
      { name: 'Maison Plisson', lat: 48.8575, lon: 2.3663, category: 'specialty', tagline: "The ultimate Parisian \u00E9picerie fine.", desc: "Best selection of French cheeses, charcuterie, and pantry goods in the Marais. Also a beautiful caf\u00E9 for lunch. Think of it as the Whole Foods of Paris, but actually good. Everything is curated with care." },
      { name: 'Fromagerie Laurent Dubois', lat: 48.8483, lon: 2.3527, category: 'specialty', award: 'Meilleur Ouvrier de France (MOF)', tagline: "Holds France's highest craftsman honor.", desc: "Laurent Dubois holds the Meilleur Ouvrier de France distinction \u2014 the highest honor for a French artisan. The cheese selection at 47 Boulevard Saint-Germain is extraordinary. Ask for recommendations; the staff live for this." },
    ],
  },
  {
    city: 'Saint-Rapha\u00EBl',
    flag: '\u{1F30A}',
    center: [43.4252, 6.7673],
    zoom: 10,
    venues: [
      // MICHELIN
      { name: "La Vague d'Or", lat: 43.2682, lon: 6.6408, category: 'michelin', stars: 3, award: '3 Michelin Stars', tagline: "Possibly the greatest restaurant in the south of France.", desc: "Arnaud Donckele at Cheval Blanc Saint-Tropez. Mediterranean ingredients at their absolute peak. The sea bass with citrus is transcendent. If you splurge on one meal in the south, this is it." },
      { name: 'R\u00E9sidence de la Pin\u00E8de', lat: 43.2720, lon: 6.6391, category: 'michelin', stars: 2, award: '2 Michelin Stars', tagline: "Also Donckele's, Saint-Tropez seafront.", desc: "Equally extraordinary, slightly more accessible than La Vague d'Or. The seafront terrace at sunset is one of the most romantic dining settings on the C\u00F4te d'Azur." },
      { name: 'Le Mas Candille', lat: 43.6412, lon: 6.9894, category: 'michelin', stars: 1, award: '1 Michelin Star', tagline: "Mougins village. Stunning panoramic views.", desc: "Refined Proven\u00E7al cuisine in a beautiful mas setting above Cannes. The panoramic views of the Esterel mountains are breathtaking. Perfect for a long, lazy lunch on the terrace." },

      // MARKETS
      { name: 'March\u00E9 Proven\u00E7al de Saint-Rapha\u00EBl', lat: 43.4249, lon: 6.7649, category: 'market', tagline: "Daily Proven\u00E7al market. The real deal.", desc: "Best local olives, lavender honey, tapenade, fresh fish straight from the Mediterranean, and C\u00F4tes de Provence ros\u00E9. A perfect morning ritual. Open daily in summer." },
      { name: 'March\u00E9 de Saint-Tropez', lat: 43.2724, lon: 6.6405, category: 'market', award: "One of France's most famous Proven\u00E7al markets", tagline: "Place des Lices. Tuesday and Saturday mornings.", desc: "Celebrities, fishermen, and locals all shop here. Come early for the best selection. The socca (chickpea flatbread) vendors are not to be missed. One of the great market experiences in the world." },

      // WINE
      { name: "Ch\u00E2teau d'Esclans", lat: 43.5234, lon: 6.6012, category: 'wine', award: "World's most awarded Proven\u00E7al ros\u00E9", tagline: "Home of Whispering Angel.", desc: "Their Garrus ros\u00E9 is one of the most acclaimed wines in the world. The estate near Le Muy is stunning. Visits by appointment \u2014 book ahead. You'll never think of ros\u00E9 the same way again." },

      // SPECIALTY
      { name: "L'Olivier de Saint-Tropez", lat: 43.2731, lon: 6.6398, category: 'specialty', tagline: "Best local olive oil in Saint-Tropez.", desc: "AOC Provence oils, fresh tapenade, artisan products. A C\u00F4te d'Azur essential. The staff will let you taste everything. Makes an incredible gift to bring home." },
    ],
  },
  {
    city: 'Lisbon',
    flag: '\u{1F1F5}\u{1F1F9}',
    center: [38.7167, -9.1333],
    zoom: 13,
    venues: [
      // MICHELIN
      { name: 'Belcanto', lat: 38.7113, lon: -9.1423, category: 'michelin', stars: 2, award: "2 Michelin Stars + World's 50 Best", tagline: "Portugal's most acclaimed restaurant.", desc: "Jos\u00E9 Avillez's masterpiece in Chiado. Creative reinvention of Portuguese classics that will make you rethink everything you thought you knew about Portuguese cuisine. The pig's ear appetizer is legendary." },
      { name: 'Alma', lat: 38.7118, lon: -9.1429, category: 'michelin', stars: 2, award: '2 Michelin Stars', tagline: "Henrique S\u00E1 Pessoa. Celebrated seafood tasting menu.", desc: "Two Michelin stars in Chiado. The carne de porco \u00E0 Alentejana is celebrated, and the seafood tasting menu is extraordinary. Henrique S\u00E1 Pessoa cooks with deep respect for Portuguese tradition." },
      { name: '100 Maneiras', lat: 38.7134, lon: -9.1461, category: 'michelin', stars: 1, award: '1 Michelin Star', tagline: "Theatrical 17-course storytelling menus.", desc: "Ljubomir Stanisic in Bairro Alto creates truly unforgettable experiences. Each of the 17 courses tells a story. The dark, theatrical atmosphere is part of the magic. Truly one of a kind." },
      { name: 'Arkhe', lat: 38.7138, lon: -9.1388, category: 'michelin', stars: 1, award: '1 Michelin Star (2025)', tagline: "Lisbon's best vegetarian fine dining.", desc: "New star in 2025. Proves that plant-based cooking can be elite. Every dish is a revelation of what vegetables can become in the hands of a great chef. A bold, beautiful statement." },
      { name: 'Marlene', lat: 38.7189, lon: -9.1369, category: 'michelin', stars: 1, award: '1 Michelin Star (2025)', tagline: "Chef Marlene Vieira. New star 2025.", desc: "Marlene Vieira is one of Portugal's most celebrated chefs. Her outpost is also at Time Out Market for a more casual taste. The main restaurant earned its first star in 2025 \u2014 well deserved." },
      { name: 'Taberna da Rua das Flores', lat: 38.7128, lon: -9.1405, category: 'michelin', bibGourmand: true, award: 'Bib Gourmand', tagline: "The best tasca in Lisbon.", desc: "Daily changing petiscos menu. Packed with locals who know better. No reservations, no menu \u2014 the waiter tells you what's good today. Trust them completely. This is Lisbon at its purest." },
      { name: 'Canalha', lat: 38.7142, lon: -9.1472, category: 'michelin', bibGourmand: true, award: 'Bib Gourmand (2025)', tagline: "Natural wines + creative small plates.", desc: "New Bib Gourmand 2025. The coolest room in Lisbon right now. Natural wines are exceptional, the small plates are creative without being pretentious. Bairro Alto. Go with an open mind." },

      // ICONIC
      { name: 'Past\u00E9is de Bel\u00E9m', lat: 38.6971, lon: -9.2021, category: 'iconic', award: 'Original pastel de nata since 1837', tagline: "THE original. The recipe is a secret held by a handful of people.", desc: "Worth the 30-minute tram ride. The recipe has been a closely guarded secret since 1837. Get them warm with cinnamon and powdered sugar. Kids will go insane. Nothing else compares to eating one fresh from the oven here.", kidFriendly: true },
      { name: 'Pastelaria Aloma', lat: 38.7208, lon: -9.1573, category: 'iconic', award: '\u{1F947} Best Pastel de Nata 2024 & 2025', tagline: "Back-to-back winner. Five total awards.", desc: "Won best pastel de nata in Lisbon in both 2024 and 2025. Five total awards. The challenger to Bel\u00E9m's crown. More accessible in Campo de Ourique, equally incredible. The custard-to-crust ratio is perfection." },

      // MARKETS
      { name: 'Mercado da Ribeira (Time Out Market)', lat: 38.7068, lon: -9.1490, category: 'market', award: "World's Best Food Market", tagline: "35 of Lisbon's best chefs under one roof.", desc: "Marlene has a stall here. Perfect for families \u2014 everyone can eat something different. Best for a quick taste of everything Lisbon has to offer. The riverside location is gorgeous.", kidFriendly: true },
      { name: 'Mercado de Campo de Ourique', lat: 38.7208, lon: -9.1613, category: 'market', tagline: "Local's market in the best residential neighborhood.", desc: "Fresh produce, cheese, fish, and excellent lunch spots. Much less touristy than Ribeira. This is where Lisboetas actually shop. The neighborhood around it is charming and walkable." },

      // COFFEE
      { name: 'Copenhagen Coffee Lab', lat: 38.7131, lon: -9.1402, category: 'coffee', award: "Lisbon's top specialty coffee", tagline: "Danish standards, Lisbon location.", desc: "Exceptional single origins in Chiado. Perfect before exploring the neighborhood. Danish precision meets Portuguese warmth. The flat white is outstanding, and the space is beautiful." },
      { name: 'F\u00E1brica Coffee Roasters', lat: 38.7131, lon: -9.1351, category: 'coffee', tagline: "One of Lisbon's pioneering specialty roasters.", desc: "Multiple locations across the city. The flat white benchmark in Lisbon. F\u00E1brica was among the first to bring specialty coffee to Portugal, and they're still among the best." },

      // SPECIALTY
      { name: 'Conserveira de Lisboa', lat: 38.7097, lon: -9.1378, category: 'specialty', award: 'Lisbon institution since 1930', tagline: "The definitive tinned fish shop.", desc: "Sardines, mackerel, tuna in every conceivable preparation. The iconic retro packaging is gorgeous. Everyone leaves with a bag. This is Lisbon's most beloved food souvenir shop, and the quality is extraordinary." },
      { name: 'Mercearia Assessoria', lat: 38.7155, lon: -9.1388, category: 'specialty', tagline: "Best curated Portuguese pantry.", desc: "Wines, olive oils, preserves, honey \u2014 everything you wish you could bring home. A must for gifts. The selection is curated with impeccable taste, and the staff are passionate about every product." },
    ],
  },
];

// ── Dynamic Map (no SSR) ─────────────────────────────────────────────────────

const FoodMap = dynamic(() => import('./food-map-client'), { ssr: false });

// ── Main Page ────────────────────────────────────────────────────────────────

export default function FoodMapPage() {
  const router = useRouter();
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const city = CITIES[selectedCityIdx];

  const filteredVenues = useMemo(() => {
    let venues = city.venues;
    if (activeFilter !== 'all') {
      venues = venues.filter(v => v.category === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      venues = venues.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.tagline.toLowerCase().includes(q) ||
        (v.award ?? '').toLowerCase().includes(q)
      );
    }
    return [...venues].sort((a, b) => venueSortRank(b) - venueSortRank(a));
  }, [city, activeFilter, searchQuery]);

  // Scroll selected venue into view
  useEffect(() => {
    if (selectedVenue && listRef.current) {
      const el = listRef.current.querySelector(`[data-venue="${selectedVenue.name}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedVenue]);

  const handleSelectVenue = (venue: Venue | null) => {
    setSelectedVenue(prev => prev?.name === venue?.name ? null : venue);
  };

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
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Award-Winning Eats & Drinks</p>
          </div>
        </div>

        {/* City tab bar */}
        <div className="flex gap-2 px-4 pb-3">
          <div className="flex gap-1.5 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
            {CITIES.map((c, i) => {
              const isActive = i === selectedCityIdx;
              return (
                <button
                  key={c.city}
                  onClick={() => {
                    setSelectedCityIdx(i);
                    setSelectedVenue(null);
                    setActiveFilter('all');
                    setSearchQuery('');
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

        {/* Filter pills */}
        <div
          ref={filterScrollRef}
          className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            onClick={() => setActiveFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              activeFilter === 'all'
                ? 'bg-white text-[#1a1a3e] border-white'
                : 'bg-transparent text-white/70 border-white/20 hover:border-white/40'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(activeFilter === cat.key ? 'all' : cat.key)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeFilter === cat.key
                  ? 'bg-white text-[#1a1a3e] border-white'
                  : 'bg-transparent text-white/70 border-white/20 hover:border-white/40'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: '50vh' }}>
        <FoodMap
          city={city}
          venues={filteredVenues}
          selectedVenue={selectedVenue}
          onSelectVenue={handleSelectVenue}
        />
      </div>

      {/* Bottom sheet for selected venue */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[2000] bg-[#FFFBF0] rounded-t-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.15)] border-t border-[#1a1a3e]/10 max-h-[45vh] overflow-y-auto"
          >
            <div className="p-4 pb-safe">
              {/* Drag handle */}
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-[#1a1a3e]/15" />
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#1a1a3e]/5 hover:bg-[#1a1a3e]/10 transition-colors"
              >
                <X className="h-4 w-4 text-[#1a1a3e]/60" />
              </button>

              {/* Category + Award badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: CATEGORY_MAP[selectedVenue.category].colorBg,
                    color: CATEGORY_MAP[selectedVenue.category].color,
                  }}
                >
                  {CATEGORY_MAP[selectedVenue.category].emoji} {CATEGORY_MAP[selectedVenue.category].label}
                </span>
                {selectedVenue.award && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                    {selectedVenue.award}
                  </span>
                )}
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-[#1a1a3e] mb-1">{selectedVenue.name}</h3>

              {/* Tagline */}
              <p className="text-sm font-medium text-[#1a1a3e]/60 mb-2">{selectedVenue.tagline}</p>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {selectedVenue.kidFriendly && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                    {'\u{1F9D2}'} Kid-friendly
                  </span>
                )}
                {selectedVenue.category === 'michelin' && selectedVenue.stars && selectedVenue.stars > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-amber-600 text-sm">
                    {Array.from({ length: selectedVenue.stars }).map((_, i) => (
                      <span key={i}>{'\u2B50'}</span>
                    ))}
                  </span>
                )}
                {selectedVenue.bibGourmand && (
                  <span className="text-[11px] font-semibold text-green-600">Bib Gourmand</span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#1a1a3e]/70 leading-relaxed mb-4">{selectedVenue.desc}</p>

              {/* Google Maps button */}
              <a
                href={googleMapsUrl(selectedVenue)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a3e] text-white text-sm font-medium hover:bg-[#1a1a3e]/90 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Venue list */}
      <div className="px-4 pt-4 pb-4">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a1a3e]/30" />
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#1a1a3e]/10 text-sm text-[#1a1a3e] placeholder:text-[#1a1a3e]/30 focus:outline-none focus:border-[#1a1a3e]/25 focus:ring-2 focus:ring-[#1a1a3e]/5"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-[#1a1a3e]/30" />
            </button>
          )}
        </div>

        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1a3e]/40 px-1 mb-2">
          {city.city} &middot; {filteredVenues.length} {activeFilter === 'all' ? 'spots' : CATEGORY_MAP[activeFilter]?.label.toLowerCase() + ' spots'}
        </h2>

        <div ref={listRef} className="space-y-2">
          {filteredVenues.map((venue) => {
            const cat = CATEGORY_MAP[venue.category];
            const isSelected = selectedVenue?.name === venue.name;
            return (
              <button
                key={venue.name}
                data-venue={venue.name}
                onClick={() => handleSelectVenue(venue)}
                className={`w-full text-left rounded-xl p-3.5 transition-all border ${
                  isSelected
                    ? 'bg-[#1a1a3e]/5 border-[#1a1a3e]/20 shadow-md'
                    : 'bg-white border-[#1a1a3e]/8 hover:border-[#1a1a3e]/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 text-base"
                    style={{ backgroundColor: cat.colorBg }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1a1a3e]">{venue.name}</span>
                      {venue.kidFriendly && (
                        <span className="text-[10px] text-green-600 font-medium">{'\u{1F9D2}'} Kids</span>
                      )}
                    </div>
                    <div className="text-xs text-[#1a1a3e]/50 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      {venue.category === 'michelin' && venue.stars && venue.stars > 0 && (
                        <span className="text-amber-600 font-medium">
                          {Array.from({ length: venue.stars }).map((_, i) => '\u2B50').join('')}
                        </span>
                      )}
                      {venue.bibGourmand && (
                        <span className="text-green-600 font-medium">Bib Gourmand</span>
                      )}
                      {venue.award && (
                        <span className="text-amber-700 font-medium">{venue.award}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#1a1a3e]/50 mt-1 leading-relaxed line-clamp-2">{venue.tagline}</p>
                  </div>
                </div>
              </button>
            );
          })}
          {filteredVenues.length === 0 && (
            <div className="text-center py-8 text-[#1a1a3e]/40 text-sm">
              No venues found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
