'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, Search, X, MapPin, ExternalLink, List, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// ── Categories ──────────────────────────────────────────────────────────────

export type Category = 'bakery' | 'coffee' | 'market' | 'wine' | 'specialty' | 'iconic' | 'chocolate' | 'sweets' | 'experience' | 'playground' | 'home';

export interface CategoryDef {
  key: Category;
  emoji: string;
  label: string;
  color: string;
  colorBg: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'bakery',    emoji: '\u{1F950}', label: 'Bakery',   color: '#e11d48', colorBg: '#e11d4820' },
  { key: 'coffee',    emoji: '\u2615', label: 'Coffee',   color: '#78350f', colorBg: '#78350f20' },
  { key: 'market',    emoji: '\u{1F6D2}', label: 'Market',   color: '#16a34a', colorBg: '#16a34a20' },
  { key: 'wine',      emoji: '\u{1F377}', label: 'Wine',     color: '#7c3aed', colorBg: '#7c3aed20' },
  { key: 'specialty', emoji: '\u{1FAD9}', label: 'Shop',     color: '#0d9488', colorBg: '#0d948820' },
  { key: 'iconic',    emoji: '\u{1F36E}', label: 'Iconic',   color: '#ea580c', colorBg: '#ea580c20' },
  { key: 'chocolate', emoji: '\u{1F36B}', label: 'Chocolate', color: '#5c3317', colorBg: '#5c331720' },
  { key: 'sweets',    emoji: '\u{1F368}', label: 'Sweets',    color: '#db2777', colorBg: '#db277720' },
  { key: 'experience', emoji: '\u{1F3B5}', label: 'Experience', color: '#4338ca', colorBg: '#4338ca20' },
  { key: 'playground', emoji: '\u{1F3A0}', label: 'Playground', color: '#16a34a', colorBg: '#16a34a20' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c])) as Record<Category, CategoryDef>;

// Home category: used for home-base pins but excluded from filter pills
CATEGORY_MAP['home'] = { key: 'home', emoji: '🏠', label: 'Home', color: '#6366f1', colorBg: '#6366f120' };

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
  return 8;
}

function googleMapsUrl(venue: Venue): string {
  const query = encodeURIComponent(venue.name);
  return `https://www.google.com/maps/search/${query}/@${venue.lat},${venue.lon},17z`;
}

function venueSortRank(v: Venue): number {
  const catOrder: Record<Category, number> = { bakery: 80, iconic: 70, chocolate: 65, sweets: 63, experience: 62, coffee: 60, market: 50, wine: 40, specialty: 30, playground: 55, home: 999 };
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

      // HOME BASE
      { name: '\u{1F3E0} Maison Galante', lat: 48.8743, lon: 2.3205, category: 'home', tagline: "Your Paris home. Apr 3–6.", desc: "Your Paris accommodation. 8 Rue de l\u2019Arcade, 75008 Paris. Check-in Apr 3 at 3 PM, checkout Apr 6 by 11 AM. 🗺️ https://maps.google.com/?q=8+Rue+de+l'Arcade+75008+Paris" },

      // 8TH ARR — NEAR MAISON GALANTE (PLACE DE LA MADELEINE AREA)
      { name: 'Fauchon', lat: 48.8701, lon: 2.3249, category: 'specialty', award: 'Paris institution since 1886', tagline: "The world's most famous épicerie fine. 7-min walk from your hotel.", desc: "Founded in 1886 on Place de la Madeleine — Fauchon is Paris's most legendary luxury food emporium and a 7-minute walk from Maison Galante. The pastry counter rivals any dedicated pâtisserie, and the foie gras, truffles, champagne, and exotic spice selection are extraordinary. If you buy one extravagant Paris food souvenir, it's from Fauchon." },
      { name: 'Hédiard', lat: 48.8702, lon: 2.3245, category: 'specialty', award: "Paris's oldest épicerie fine (founded 1854)", tagline: "Founded 1854 — the original luxury grocer. Opposite Fauchon on Place de la Madeleine.", desc: "Hédiard predates Fauchon by 32 years, founded in 1854 by Ferdinand Hédiard who first brought exotic fruits and spices to Paris. Opposite Fauchon on Place de la Madeleine. Their teas, jams, and fruit confits are iconic. The building itself — with its distinctive red-and-black livery — is a Paris landmark. Steps from your hotel." },
      { name: 'La Maison de la Truffe', lat: 48.8703, lon: 2.3244, category: 'specialty', award: 'Best truffle specialist in Paris', tagline: "Fresh black truffles, truffle pasta, truffle everything. Steps from your hotel.", desc: "The definitive truffle specialist in Paris, right on Place de la Madeleine — 6 minutes from Maison Galante. Fresh Périgord black truffles in season, truffle pasta, oil, butter, and chocolate. The restaurant upstairs serves a full truffle tasting menu. An entire world built around the world's most prized ingredient." },
      { name: 'Pierre Hermé — Rue Vignon', lat: 48.8710, lon: 2.3243, category: 'chocolate', award: "World's Best Pastry Chef — closest boutique to your hotel", tagline: "The Ispahan macaron. Closest Pierre Hermé to Maison Galante (8-min walk).", desc: "The most accessible Pierre Hermé boutique from your hotel — 8 minutes on foot. The Ispahan (rose-lychee-raspberry) is his most famous creation and one of the most celebrated pastries in the world. Also: seasonal macaron collections, hot chocolate, and gift boxes. More low-key than his Saint-Germain flagship, equally excellent." },
      { name: 'Ladurée — Rue Royale', lat: 48.8672, lon: 2.3261, category: 'sweets', award: 'Original location since 1862 — inventor of the modern macaron', tagline: "The original Ladurée. Where the modern macaron was invented in 1862.", desc: "The first Ladurée, opened in 1862 on Rue Royale near the Madeleine — 10 minutes from Maison Galante. This is where Ladurée's grandson invented the modern double-layered macaron in 1930. The salon de thé upstairs — gilded mirrors, painted ceilings, velvet benches — is as beautiful as any palace. A quintessential Paris experience for the whole family.", kidFriendly: true },
      { name: 'À la Mère de Famille', lat: 48.8748, lon: 2.3421, category: 'sweets', award: "Paris's oldest confectionery (founded 1761)", tagline: "The oldest candy shop in Paris. Chocolates, pralines, bonbons since 1761.", desc: "The oldest confectionery in Paris, founded in 1761 on Rue du Faubourg Montmartre. The window display alone stops traffic — handmade chocolates, pralines, fruit confits, nougats, and traditional French bonbons. The interior looks almost exactly as it did in the 18th century. A 15-minute walk from Maison Galante.", kidFriendly: true },
      { name: 'Galeries Lafayette — Le Gourmet', lat: 48.8736, lon: 2.3319, category: 'specialty', award: 'Largest gourmet food hall in Paris', tagline: "The most staggering food hall in Paris. 12-min walk from your hotel.", desc: "Lafayette Gourmet in the basement of Galeries Lafayette Haussmann is the most staggering concentration of French gastronomy under one roof — oyster bars, cheese caves, charcuterie counters, pâtisserie stands, wine cellars, and prepared food from Paris's top chefs. Free to enter. 12 minutes from Maison Galante. Also: the famous glass dome upstairs is free to see.", kidFriendly: true },
      { name: 'Marché Couvert de Poncelet', lat: 48.8813, lon: 2.3041, category: 'market', award: 'Best daily market in western Paris', tagline: "Local daily market in the 17th. 20-min walk from your hotel.", desc: "The Poncelet market street in the 17th is one of the best kept secrets near your hotel — a lively daily street market with exceptional cheese, charcuterie, fishmongers, and produce vendors. Almost entirely frequented by locals. Open every morning except Monday. Walk there for breakfast supplies, come back loaded. Far better than any tourist-area market." },
      { name: 'Café de la Paix', lat: 48.8713, lon: 2.3315, category: 'iconic', award: 'Paris institution since 1862 — UNESCO-listed monument', tagline: "Hemingway, Zola, six US Presidents. The most storied café in Paris.", desc: "Opened in 1862 beside the Opéra Garnier, Café de la Paix is one of the great historic cafés of the world — UNESCO-listed, Belle Époque interior by the same architect as the Opéra itself. Oscar Wilde, Hemingway, Maupassant, Zola, and six US Presidents have all sat here. Come for a coffee. The terrace looking at the Opéra is one of the defining Paris views. 12-min walk from Maison Galante." },
      { name: 'Caviar Kaspia', lat: 48.8700, lon: 2.3248, category: 'iconic', award: 'Paris caviar institution since 1927', tagline: "The iconic caviar house on Place de la Madeleine. Steps from your hotel.", desc: "Caviar Kaspia has held court on Place de la Madeleine since 1927 — the first name in Parisian caviar. The ground-floor boutique sells caviar, smoked salmon, and blinis. Upstairs, the private dining room serves buckwheat blinis with crème fraîche and caviar to a devoted clientele that includes half the fashion industry. A treat, not an everyday stop — but steps from your door." },
      { name: 'Nicolas — Place de la Madeleine', lat: 48.8699, lon: 2.3251, category: 'wine', tagline: "France's premier wine chain flagship, steps from your hotel.", desc: "Nicolas's flagship near Place de la Madeleine is the best-stocked and most knowledgeable Nicolas in Paris — an incredible selection of Bordeaux, Burgundy, Champagne, and natural wines. Perfect for picking up a great bottle without paying restaurant markup. Staff actually know wine. Steps from Maison Galante." },

      // BAKERY
      { name: 'La Parisienne', lat: 48.8765, lon: 2.3570, category: 'bakery', award: '\u{1F947} Grand Prix de la Baguette 2025', tagline: "Supplies baguettes to the \u00C9lys\u00E9e Palace.", desc: "Micka\u00EBl Reydellet won Paris's most prestigious baguette competition in 2025. For one year, this bakery in the 10th arrondissement supplies baguettes to the President of France. The crust crackle is extraordinary." },
      { name: 'Boulangerie Utopie', lat: 48.8618, lon: 2.3744, category: 'bakery', award: '\u{1F947} Grand Prix de la Baguette 2024 + Best Croissant', tagline: "Double winner: best baguette and best croissant.", desc: "Xavier Netry won the 2024 Grand Prix de la Baguette and is also rated one of Paris's best croissants. 20 Rue Jean-Pierre Timbaud in the 11th. If you only visit one bakery in Paris, make it this one." },
      { name: 'Du Pain et des Id\u00E9es', lat: 48.8718, lon: 2.3572, category: 'bakery', award: '\u{1F3C5} France\'s Most Beautiful Bakery', tagline: "Christophe Vasseur's Canal Saint-Martin masterpiece.", desc: "The escargot pastry and praline croissant are unmissable. The bakery itself \u2014 with original 19th-century painted ceilings \u2014 is a monument. Often has a queue, worth every minute. Closed weekends.", kidFriendly: true },
      { name: 'Stohrer', lat: 48.8641, lon: 2.3478, category: 'bakery', award: 'Paris\u2019s oldest p\u00E2tisserie (1730)', tagline: "Founded by Louis XV\u2019s royal pastry chef.", desc: "Founded by Louis XV\u2019s royal pastry chef. Still making baba au rhum the same way since 1730. On Rue Montorgueil.", kidFriendly: true },
      { name: 'Pain de Sucre', lat: 48.8578, lon: 2.3528, category: 'bakery', award: 'Top-rated Paris p\u00E2tisserie', tagline: "Didier Mathray\u2019s extraordinary pastries in the Marais.", desc: "Didier Mathray\u2019s extraordinary pastries in the Marais. The guimauve (marshmallows) come in 40 flavors. A candy store for adults and kids alike.", kidFriendly: true },

      // COFFEE
      { name: 'T\u00E9lescope', lat: 48.8637, lon: 2.3386, category: 'coffee', award: 'Pioneer of Paris specialty coffee', tagline: "The caf\u00E9 that started Paris's third-wave revolution.", desc: "Nicolas Clerc's tiny, perfect caf\u00E9 near Palais Royal changed everything. Before T\u00E9lescope, Paris coffee was an afterthought. 5 Rue Vill\u00E9do in the 1st arrondissement. Simple, focused, exceptional." },
      { name: 'Coutume Caf\u00E9', lat: 48.8510, lon: 2.3272, category: 'coffee', award: 'Flagship of Paris coffee culture', tagline: "Kickstarted the Paris coffee revolution in 2011.", desc: "Opened in 2011 on Rue de Babylone in Saint-Germain, Coutume was the flagship that proved Parisians cared about great coffee. Still one of the best. Beautiful space, excellent pastries too." },
      { name: 'Lomi', lat: 48.8893, lon: 2.3504, category: 'coffee', award: 'Top-rated Paris roaster', tagline: "18th arr roastery. One of France's most respected.", desc: "Worth the trip to the 18th arrondissement. Lomi is a roastery, training lab, and caf\u00E9 all in one. One of the most respected specialty roasters in France. The space is industrial-cool and the coffee is perfect." },
      { name: 'KB Caf\u00E9Shop', lat: 48.8834, lon: 2.3399, category: 'coffee', award: 'OG Paris specialty coffee pioneer', tagline: "One of the original third-wave coffee shops in Paris.", desc: "One of the original specialty coffee shops that launched Paris\u2019s third-wave scene. South Pigalle (SoPi), neighborhood itself worth exploring." },
      { name: 'Ten Belles', lat: 48.8684, lon: 2.3587, category: 'coffee', award: 'Time Out Paris top coffee 2024', tagline: "Canal Saint-Martin institution.", desc: "Canal Saint-Martin institution. Perfect coffee, great pastries, beautiful outdoor terrace by the canal.", kidFriendly: true },

      // MARKETS
      { name: "March\u00E9 d'Aligre", lat: 48.8499, lon: 2.3752, category: 'market', tagline: "Paris's most authentic daily market.", desc: "Best prices in Paris, strong North African influence, local butchers and fishmongers who know your name. Covered hall (March\u00E9 Beauvau) plus outdoor stalls. Tuesday through Sunday. The real Paris.", kidFriendly: true },
      { name: 'March\u00E9 des Enfants Rouges', lat: 48.8622, lon: 2.3618, category: 'market', award: "Paris's oldest covered market (1615)", tagline: "Moroccan tagine, Japanese bento, Lebanese mezze under one historic roof.", desc: "Paris's oldest covered market, dating to 1615. The food stalls are incredible \u2014 Moroccan tagine, Japanese bento, Lebanese mezze, Italian pasta, all made fresh. Rue de Bretagne in the 3rd. Perfect family lunch spot.", kidFriendly: true },
      { name: 'Rue Montorgueil', lat: 48.8645, lon: 2.3478, category: 'market', tagline: "The great pedestrian market street of Paris.", desc: "Everything you need within a few blocks: Stohrer (Paris's oldest p\u00E2tisserie, founded 1730), fresh fish, incredible cheese shops, charcuterie, and bakeries. A living, breathing food street that's been feeding Paris for centuries.", kidFriendly: true },

      // WINE
      { name: 'Caves Legrand', lat: 48.8660, lon: 2.3388, category: 'wine', award: 'Institution since 1905', tagline: "Legendary cave inside Galerie Vivienne.", desc: "One of the most beautiful wine shops in the world, tucked inside the stunning Galerie Vivienne. Curated natural and classic French wines. The staff are passionate and knowledgeable. A temple of French wine culture." },
      { name: 'La Derni\u00E8re Goutte', lat: 48.8519, lon: 2.3340, category: 'wine', award: 'Best natural wine shop in Saint-Germain', tagline: "Beloved by sommeliers worldwide.", desc: "Exclusively small-producer French wines. The American owner has impeccable taste and deep relationships with winemakers across France. Rue de Bourbon le Ch\u00E2teau in the 6th. Saturday tastings are legendary." },

      // SPECIALTY
      { name: 'Maison Plisson', lat: 48.8575, lon: 2.3663, category: 'specialty', tagline: "The ultimate Parisian \u00E9picerie fine.", desc: "Best selection of French cheeses, charcuterie, and pantry goods in the Marais. Also a beautiful caf\u00E9 for lunch. Think of it as the Whole Foods of Paris, but actually good. Everything is curated with care." },
      { name: 'Fromagerie Laurent Dubois', lat: 48.8483, lon: 2.3527, category: 'specialty', award: 'Meilleur Ouvrier de France (MOF) \u2014 highest craftsman honor', tagline: "Holds France's highest craftsman honor. Affinage cave on-site.", desc: "Laurent Dubois holds the MOF, France\u2019s ultimate craft honor. The selection is extraordinary \u2014 affinage cave on-site. 47 Blvd Saint-Germain, 5th arr." },
      { name: 'Paroles de Fromagers', lat: 48.8608, lon: 2.3494, category: 'specialty', award: 'BBC-featured best fromagerie Paris 2024', tagline: "Alpine chalet design, exceptional selection.", desc: "Romain Ricciardi and Pierre Brisson \u2014 alpine chalet design, exceptional selection. Also runs Le Mus\u00E9e du Fromage (opened 2024). 5 Rue Rambuteau, 3rd arr." },

      // CHOCOLATE
      { name: 'Jacques Genin', lat: 48.8628, lon: 2.3598, category: 'chocolate', award: 'World\u2019s Best Chocolatier (multiple)', tagline: "The reclusive genius. Caramels, \u00E9clairs, and mille-feuille.", desc: "The reclusive genius. His caramels, eclairs, and mille-feuille are so good chefs eat here. 133 Rue de Turenne, Marais. Closed Mondays.", kidFriendly: true },
      { name: 'Pierre Herm\u00E9', lat: 48.8515, lon: 2.3332, category: 'chocolate', award: 'World\u2019s Best Pastry Chef \u2014 Le Monde', tagline: "The Picasso of pastry. Ispahan is world-famous.", desc: "The Picasso of pastry. First chocolate boutique opened 2024 near Op\u00E9ra. His Ispahan (rose-lychee-raspberry macaron) is one of the most famous pastries in the world.", kidFriendly: true },
      { name: 'La Manufacture de Chocolat (Alain Ducasse)', lat: 48.8549, lon: 2.3725, category: 'chocolate', award: 'First bean-to-bar chocolate by a 3-star chef', tagline: "Alain Ducasse\u2019s revolutionary bean-to-bar atelier.", desc: "Alain Ducasse\u2019s revolutionary bean-to-bar atelier. All chocolate made on-site. Transparent factory you can watch. Unique in the world. 40 Rue de la Roquette, 11th." },

      // SWEETS
      { name: 'Berthillon', lat: 48.8520, lon: 2.3562, category: 'sweets', award: "Paris's most legendary ice cream since 1954", tagline: "Île Saint-Louis. The cassis sorbet and salted caramel are extraordinary.", desc: "On Île Saint-Louis. Every food writer agrees: if you get one ice cream cone in Paris, it's from Berthillon. The cassis sorbet and salted caramel are extraordinary. Steps from Notre-Dame.", kidFriendly: true },
      { name: 'Angelina', lat: 48.8638, lon: 2.3310, category: 'sweets', award: 'Paris institution since 1903 — world-famous hot chocolate', tagline: "Rue de Rivoli. The L'Africain hot chocolate is legendary.", desc: "Rue de Rivoli. The L'Africain hot chocolate is so thick you eat it with a spoon. Belle Époque interior is stunning. Tourists come, locals come, everyone comes.", kidFriendly: true },

      // BAKERY (additional)
      { name: 'Poilâne', lat: 48.8516, lon: 2.3346, category: 'bakery', award: "World's most famous sourdough (since 1932)", tagline: "The miche au levain — baked identically since 1932.", desc: "The miche au levain has been baked identically since 1932. Lionel Poilâne was named one of the most influential food figures of the 20th century. Rue du Cherche-Midi, Saint-Germain. Buy a whole loaf to share — it's an event.", kidFriendly: true },
      { name: 'Breizh Café', lat: 48.8571, lon: 2.3583, category: 'bakery', award: 'Condé Nast Traveler best crêpes in Paris', tagline: "Bertrand Larcher's Breton crêperie in the Marais.", desc: "Bertrand Larcher's Breton crêperie in the Marais. Buckwheat galettes and sweet crêpes using serious Brittany ingredients. Real Breton cider. The galette complète is a meal.", kidFriendly: true },

      // ── PARIS PLAYGROUNDS ────────────────────────────────────────────────
      { name: 'Jardin du Luxembourg — Playground', lat: 48.8462, lon: 2.3372, category: 'playground', award: '⭐ Market combo: Rue Mouffetard market 10 min away', tagline: "Paris's best playground in its most beautiful garden. Don't miss Rue Mouffetard.", desc: "The Luxembourg playground is the finest in Paris — slides, wooden towers, swings, trampolines, and a miniature carousel. Admission ~€3/child. Combo: walk 10 minutes to Rue Mouffetard, one of Paris's oldest market streets — incredible cheese, charcuterie, boulangeries — pick up a picnic feast and bring it back to the garden. 🗺️ https://maps.google.com/?q=Jardin+du+Luxembourg+Playground+Paris+75006", kidFriendly: true },
      { name: 'Jardin des Tuileries — Playground', lat: 48.8638, lon: 2.3275, category: 'playground', award: '⭐ Market combo: Rue Montorgueil market street nearby', tagline: "Post-Louvre/Orsay playground. Between the Louvre and Place de la Concorde.", desc: "Right between the Louvre and the Orsay — perfect post-museum family stop. Grab pastries from Rue Montorgueil (10 min walk north) and picnic on the garden chairs. The carousel is a must for little ones. Free entry; small fee for some rides. 🗺️ https://maps.google.com/?q=Jardin+des+Tuileries+Playground+Paris+75001", kidFriendly: true },
      { name: 'Parc Monceau — Playground', lat: 48.8796, lon: 2.3093, category: 'playground', award: 'Most elegant park in Paris — 8th arr, near your hotel area', tagline: "Hidden gem playground in the most elegant park in Paris. Locals only.", desc: "Parc Monceau in the 8th arrondissement is one of Paris's most stunning and least-touristy parks — Egyptian pyramid, Roman colonnade, fake grotto, all in one garden. The playground is excellent and the crowd is entirely local families. Near your hotel zone. Grab a baguette from any nearby boulangerie and have lunch on the grass. 🗺️ https://maps.google.com/?q=Parc+Monceau+Playground+Paris+75008", kidFriendly: true },
      { name: 'Jardin Nelson-Mandela (Les Halles) — Playground', lat: 48.8624, lon: 2.3474, category: 'playground', award: '⭐ Market combo: Rue Montorgueil + Marché des Enfants Rouges steps away', tagline: "2,500m² adventure playground in central Paris. Enormous. Free.", desc: "The largest adventure playground in central Paris — a 2,500m² course for ages 7–11 plus a 1,400m² area for younger kids. Next to Centre Pompidou and Le Marais. Unbeatable market combo: Rue Montorgueil (best bakeries, charcuterie, cheese) and Marché des Enfants Rouges (Paris's oldest covered market, since 1615 — Moroccan tagine, Japanese bento, incredible fresh food) are both within 5 minutes. 🗺️ https://maps.google.com/?q=Jardin+Nelson+Mandela+Les+Halles+Paris+75001", kidFriendly: true },
      { name: 'Parc Élie Wiesel — Playground (Marais)', lat: 48.8631, lon: 2.3581, category: 'playground', award: '⭐ Market combo: Marché des Enfants Rouges 2 min away', tagline: "Marais playground right next to the oldest market in Paris.", desc: "A lovely neighborhood park in the Haut-Marais, just 2 minutes from the Marché des Enfants Rouges (Paris's oldest covered market, 1615). Pick up incredible food from the market stalls — Moroccan, Japanese, Italian, Lebanese — and eat in the park while the kids play. This is how Parisian families do lunch. Steps from Centre Pompidou and the Jewish Quarter. 🗺️ https://maps.google.com/?q=Parc+Elie+Wiesel+Paris+75003", kidFriendly: true },
      { name: 'Square du Temple — Playground (Marais)', lat: 48.8638, lon: 2.3547, category: 'playground', award: 'Built on site of the Knights Templar fortress', tagline: "Historic park on medieval Knights Templar grounds. Pond, ducks, slides.", desc: "Set on the grounds of a medieval Knights Templar fortress in the 3rd arr. A charming neighborhood playground with climbing ropes, slides, a duck pond, and ping-pong tables. The Marais, Jewish Quarter, and Centre Pompidou are all a short walk. Grab falafel from L'As du Fallafel on Rue des Rosiers (legendary) and bring it to the square for lunch. 🗺️ https://maps.google.com/?q=Square+du+Temple+Paris+75003", kidFriendly: true },
      { name: 'Parc des Buttes-Chaumont — Playground', lat: 48.8796, lon: 2.3817, category: 'playground', award: 'Most dramatic park in Paris — cliffs, lake, island temple', tagline: "Paris's wildest park. Cliff, lake, suspension bridge, massive playground.", desc: "The most dramatic and underrated park in Paris. A fake cliff with a temple on top, a lake with an island, a suspension bridge — and a massive playground. Combine with Marché d'Aligre (one of Paris's best food markets, 20 min walk). Locals adore this park. Tourists don't know it exists. 🗺️ https://maps.google.com/?q=Parc+des+Buttes-Chaumont+Paris+75019", kidFriendly: true },
      { name: 'Square Barye — Playground (Île Saint-Louis)', lat: 48.8513, lon: 2.3558, category: 'playground', award: '⭐ Market combo: Berthillon ice cream 2 min away', tagline: "Tiny island playground. Get Berthillon after — it's steps away.", desc: "A charming small playground on the southern tip of Île Saint-Louis. The genius combo: kids play, then everyone gets Berthillon ice cream (the legendary Paris institution since 1954, literally 2 minutes away). The island itself is magical — no cars, quiet streets, beautiful old architecture. Perfect afternoon loop: playground → Berthillon → walk the island. 🗺️ https://maps.google.com/?q=Square+Barye+Ile+Saint-Louis+Paris+75004", kidFriendly: true },
    ],
  },
  {
    city: 'Saint-Rapha\u00EBl',
    flag: '\u{1F30A}',
    center: [43.4252, 6.7673],
    zoom: 10,
    venues: [

      // HOME BASE
      { name: '\u{1F3E0} Villa Eleanor', lat: 43.4178, lon: 6.7621, category: 'home', tagline: "Your Saint-Rapha\u00EBl home. Apr 6–11.", desc: "Your Saint-Rapha\u00EBl accommodation. 135 Avenue du Ch\u00E2teau d\u2019Eau, Saint-Rapha\u00EBl 83700. Host: Laurence. Check-in Apr 6 at 5 PM, checkout Apr 11 at 10 AM. 🗺️ https://maps.google.com/?q=135+Avenue+du+Chateau+d'Eau+Saint-Raphael+France" },
      { name: '\u{1F3E8} Hyatt Grand Central NYC', lat: 40.7527, lon: -73.9772, category: 'home', tagline: "NYC overnight. Apr 1.", desc: "One night in NYC before the Paris flight. 109 E 42nd St, New York, NY 10017. Check-in Apr 1, checkout Apr 2 by 12 PM. 🗺️ https://maps.google.com/?q=Hyatt+Grand+Central+New+York+109+E+42nd+St" },

      // MARKETS
      { name: 'March\u00E9 Proven\u00E7al de Saint-Rapha\u00EBl', lat: 43.4249, lon: 6.7649, category: 'market', tagline: "Daily Proven\u00E7al market. The real deal.", desc: "Best local olives, lavender honey, tapenade, fresh fish straight from the Mediterranean, and C\u00F4tes de Provence ros\u00E9. A perfect morning ritual. Open daily in summer." },
      { name: 'March\u00E9 de Saint-Tropez', lat: 43.2724, lon: 6.6405, category: 'market', award: "One of France's most famous Proven\u00E7al markets", tagline: "Place des Lices. Tuesday and Saturday mornings.", desc: "Celebrities, fishermen, and locals all shop here. Come early for the best selection. The socca (chickpea flatbread) vendors are not to be missed. One of the great market experiences in the world." },

      // WINE
      { name: "Ch\u00E2teau d'Esclans", lat: 43.5234, lon: 6.6012, category: 'wine', award: "World's most awarded Proven\u00E7al ros\u00E9", tagline: "Home of Whispering Angel.", desc: "Their Garrus ros\u00E9 is one of the most acclaimed wines in the world. The estate near Le Muy is stunning. Visits by appointment \u2014 book ahead. You'll never think of ros\u00E9 the same way again." },

      // SPECIALTY
      { name: "L'Olivier de Saint-Tropez", lat: 43.2731, lon: 6.6398, category: 'specialty', tagline: "Best local olive oil in Saint-Tropez.", desc: "AOC Provence oils, fresh tapenade, artisan products. A C\u00F4te d'Azur essential. The staff will let you taste everything. Makes an incredible gift to bring home." },

      // BAKERY
      { name: 'Gorini Boulangerie', lat: 43.2728, lon: 6.6402, category: 'bakery', award: 'Best bakery Saint-Tropez', tagline: "Exceptional croissants with pine nuts and florentines.", desc: "Known for exceptional croissants with pine nuts, florentines, and perfect baguettes. Fresh, local ingredients. One of the Riviera\u2019s finest." },

      // MARKETS
      { name: 'March\u00E9 de Fr\u00E9jus', lat: 43.4327, lon: 6.7374, category: 'market', award: 'Best Proven\u00E7al market near Saint-Rapha\u00EBl', tagline: "Excellent daily morning market, less touristy.", desc: "Fr\u00E9jus (10 min from Saint-Rapha\u00EBl) has an excellent daily morning market. Better selection and less touristy than the Saint-Rapha\u00EBl market. Tues/Sat best days." },

      // SWEETS
      { name: 'La Tarte Trop\u00E9zienne (original)', lat: 43.2732, lon: 6.6407, category: 'sweets', award: 'Invented here in 1955 \u2014 original recipe', tagline: "The original brioche-cream pastry. Brigitte Bardot named it.", desc: "The original Tarte Trop\u00E9zienne was created by Polish baker Alexandre Micka in 1955. Brigitte Bardot named it during filming. The brioche-cream pastry is a Riviera institution. Place des Lices, Saint-Tropez.", kidFriendly: true },
      { name: 'Barbarac Ice Cream', lat: 43.2695, lon: 6.6368, category: 'sweets', award: 'Saint-Tropez\u2019s most famous ice cream since 1988', tagline: "Artisanal gelato on the port. Celebrity magnet.", desc: "Attracts celebrities from around the world. On the port. Artisanal gelato and sorbet including vegan options. Their mojito sorbet is legendary.", kidFriendly: true },

      // SAINT-RAPHAËL — BIB GOURMAND

      // SAINT-RAPHAËL — EXPERIENCES
      { name: 'Plage du Débarquement (Cap Dramont)', lat: 43.3881, lon: 6.8444, category: 'experience', award: 'WWII D-Day landing site — Provence, August 15 1944', tagline: "Where Allied troops landed to liberate Southern France.", desc: "Cap Dramont is where the American 36th Infantry Division landed on August 15, 1944 — the start of Operation Dragoon to liberate Southern France. Small monument marks the site. Combine with a hike along the red volcanic rock coastal trail and views of Île d'Or. A deeply moving and historically significant site just 10 minutes from Saint-Raphaël.", kidFriendly: true },
      { name: "Île d'Or (Golden Island)", lat: 43.3876, lon: 6.8468, category: 'experience', award: "Inspired Hergé's Tintin — L'Île Noire", tagline: "The tiny island that inspired a Tintin adventure.", desc: "The distinctive rocky islet just off Cap Dramont with its square medieval tower inspired Belgian cartoonist Hergé to write 'The Black Island.' You can't visit the island itself (it's private), but the view from the beach and coastal trail is iconic. A perfect photo moment that every Tintin fan will love.", kidFriendly: true },

      // FRÉJUS (10 min from Saint-Raphaël)
      { name: 'Fréjus Roman Amphitheater', lat: 43.4344, lon: 6.7288, category: 'experience', award: 'Roman ruin — 1st century BC, founded by Julius Caesar', tagline: "One of the largest Roman amphitheaters in Gaul. 10,000 spectators.", desc: "Founded as Forum Julii by Julius Caesar in 49 BC, Fréjus has some of the best-preserved Roman ruins in France. The amphitheater held 10,000 spectators for gladiator fights — it still hosts concerts today. Also see: the Roman aqueduct arches, the 5th-century baptistery (one of the oldest in France), and the Saint-Léonce Cathedral. A half-day of Roman history just 10 minutes from Saint-Raphaël.", kidFriendly: true },

      // SAINT-TROPEZ AREA
      { name: 'Port-Grimaud', lat: 43.2726, lon: 6.5887, category: 'experience', award: "The 'Venice of Provence' — built 1966", tagline: "A stunning car-free village built on a lagoon.", desc: "Port-Grimaud is a private car-free village built in 1966 on a network of canals — the 'Venice of Provence.' Every house has its own dock. Stroll the canals, take a water taxi, or sip rosé at a harborside café. About 10km from Saint-Tropez. Much less crowded than Saint-Tropez and genuinely magical. A 30-minute stop that punches way above its weight.", kidFriendly: true },
      { name: 'Sénéquier', lat: 43.2724, lon: 6.6369, category: 'iconic', award: 'Saint-Tropez institution since 1887', tagline: "The most famous café terrace on the Côte d'Azur.", desc: "The legendary red-awninged café on Saint-Tropez port has been serving coffee, nougat, and people-watching since 1887. Bardot, Picasso, and de Gaulle all sat here. Order a coffee or their famous nougat glacé and watch the superyachts. The Saint-Tropez experience in a single seat. Touristy but mandatory.", kidFriendly: true },
      { name: 'Château de la Moutte', lat: 43.2756, lon: 6.6523, category: 'experience', award: 'Beautifully preserved 19th-century estate', tagline: "The private property that defined Saint-Tropez glamour.", desc: "The historic estate belonging to the Suffren family sits on a pine-covered hillside above Saint-Tropez. While the main estate is private, the surrounding forests and coastal paths offer incredible walking with views of the bay. Combine with the coastal path to the Plage des Graniers beach for a spectacular half-day." },

      // CANNES (38 min by train)
      { name: 'Marché Forville', lat: 43.5518, lon: 7.0142, category: 'market', award: "Cannes' central covered market — daily except Monday", tagline: "The best food market on the western Riviera.", desc: "Cannes' beautiful covered market is the heartbeat of local gastronomy. Provençal vegetables, fresh fish straight from the boats, local cheeses, olives, charcuterie, and flowers. Open every morning except Monday. Go early. Then have coffee at a nearby café and take the 38-minute train back full of everything you want to cook.", kidFriendly: true },
      { name: 'La Croisette', lat: 43.5499, lon: 7.0205, category: 'experience', award: "The world's most famous seaside promenade", tagline: "Walk the boulevard of dreams. Film Festival epicenter.", desc: "The legendary 2km promenade along the sea is the spine of Cannes. Lined with luxury hotels (Carlton, Martinez, Majestic), designer boutiques, and spectacular Mediterranean views. In April, the Cannes Film Festival turns this into the most glamorous sidewalk on Earth. Walk it at golden hour. It's free.", kidFriendly: true },

      // ANTIBES (32 min by train)
      { name: 'Musée Picasso Antibes', lat: 43.5840, lon: 7.1261, category: 'experience', award: 'Picasso lived and worked here 1946 — donated his entire collection', tagline: "Where Picasso painted in a medieval castle above the sea.", desc: "Pablo Picasso spent the autumn of 1946 in the Château Grimaldi in Antibes. He was so inspired by the Mediterranean light and the sea that he donated his entire output from those months to the city. Now the Musée Picasso. The building itself — a 12th-century castle perched on the ramparts above the water — is as extraordinary as the art inside.", kidFriendly: true },
      { name: "Marché Provençal d'Antibes", lat: 43.5814, lon: 7.1245, category: 'market', award: 'One of the most authentic daily markets on the Riviera', tagline: "Old Town Antibes. Flowers, cheese, socca, the works.", desc: "Under the covered Cours Masséna in Antibes Old Town, this daily morning market (closed Monday) is exceptional. Local Provençal vegetables, incredible cheeses, socca (chickpea flatbread), tapenade, fresh flowers. Far less touristy than Nice's market and just as good. Grab socca from a vendor and eat it standing — this is how the locals do it.", kidFriendly: true },

      // GRASSE (55 min by car/bus)
      { name: 'Parfumerie Fragonard (Grasse)', lat: 43.6584, lon: 6.9223, category: 'experience', award: 'Perfume capital of the world — UNESCO listed craft', tagline: "Create your own perfume in the world's fragrance capital.", desc: "Grasse is the world's perfume capital — Chanel No. 5's jasmine and rose comes from here. The historic Parfumerie Fragonard (named after the local painter) offers free factory tours and a museum of 18th-century distillation. The real experience: a 2-hour perfume creation workshop where you blend your own scent from Grasse flowers. Unforgettable, deeply personal. Book ahead.", kidFriendly: true },
      { name: 'Molinard Perfumery (Grasse)', lat: 43.6582, lon: 6.9219, category: 'specialty', award: 'Perfumery founded 1849 — Art Nouveau building', tagline: "The most beautiful perfumery in Grasse. Art Nouveau masterpiece.", desc: "Molinard's flagship perfumery in Grasse was founded in 1849 and the main building features a stunning Art Nouveau interior decorated by students of the famous glassmaker Lalique. Free museum, factory tours, and personalized perfume workshops. Their floral absolutes — jasmine, rose, tuberose — are the finest in the world. Purchase a handcrafted perfume to take home.", kidFriendly: true },

      // MASSIF DE L'ESTÉREL (between Saint-Raphaël and Cannes)
      { name: 'Cap Roux — Estérel Massif', lat: 43.4508, lon: 6.9019, category: 'experience', award: 'Most dramatic viewpoint in the Estérel Massif', tagline: "Volcanic red cliffs plunging into turquoise sea. Staggering.", desc: "The crown jewel of the Estérel Massif. Cap Roux' blood-red porphyry cliffs drop dramatically into the turquoise Mediterranean — one of the most photographed landscapes on the French Riviera. The 3-hour round-trip hike starts near Agay. Interpretive signs explain the massif's unique 250-million-year-old geology. Sunset from the belvedere is unforgettable. Moderate difficulty.", kidFriendly: true },
      { name: 'Agay Bay & Beach', lat: 43.4283, lon: 6.8569, category: 'experience', award: 'Most protected bay in the Estérel — crystal-clear water', tagline: "The most sheltered, beautiful bay between Saint-Raphaël and Cannes.", desc: "The deep natural bay at Agay is formed by ancient red volcanic rock and is sheltered from winds on all sides — making the water incredibly calm and clear. The village has a small marina, excellent swimming beaches, and is the starting point for multiple Estérel hiking trails. This is where locals swim when the rest of the coast is crowded.", kidFriendly: true },
      { name: 'Château de la Napoule (Mandelieu)', lat: 43.5138, lon: 6.9447, category: 'experience', award: 'Romantic medieval castle on the sea — completely rebuilt 1919', tagline: "American sculptor Henry Clews rebuilt this medieval castle stone by stone.", desc: "American sculptor Henry Clews purchased the ruins of a 14th-century castle in 1919 and spent his life rebuilding it as an eccentric, surrealist fantasy. The château sits directly on the water's edge at Mandelieu-la-Napoule, 30 minutes from Saint-Raphaël by train or car. Guided tours of the towers, gardens, and sculpture-filled rooms. One of the most unusual and memorable sites on the entire Riviera.", kidFriendly: true },

      // ── PLAYGROUNDS — SAINT-RAPHAËL & FRÉJUS ────────────────────────────
      { name: 'Aire de Jeux — Jardin Bonaparte', lat: 43.4220, lon: 6.7646, category: 'playground', award: '⭐ Market combo: Marché Provençal is steps away', tagline: "Best playground + market combo in Saint-Raphaël. Grab food, eat at the park.", desc: "Right next to the Marché Provençal de Saint-Raphaël — grab tapenade, fresh bread, cheese, and charcuterie from the market stalls then walk 2 minutes to the shaded Jardin Bonaparte playground. Climbing frames, swings, and a sandpit under the pines. The perfect family morning: market first, playground lunch. 🗺️ https://maps.google.com/?q=Jardin+Bonaparte+Saint-Raphael+France", kidFriendly: true },
      { name: 'Aire de Jeux — Promenade René Coty', lat: 43.4222, lon: 6.7659, category: 'playground', tagline: "Beachfront playground right on the seafront promenade.", desc: "A playground right on the seafront promenade — kids can play while you watch the Mediterranean. Swings, slides, and climbing equipment steps from the beach. Bring a baguette from any nearby boulangerie and make it a seafront picnic. 🗺️ https://maps.google.com/?q=Promenade+Rene+Coty+Saint-Raphael+83700", kidFriendly: true },
      { name: 'Plage du Veillat + Playground', lat: 43.4207, lon: 6.7694, category: 'playground', tagline: "Sandy beach + playground combo. Kids paradise.", desc: "The main sandy beach of Saint-Raphaël has a dedicated kids play area right on the sand. A perfect full-morning combo: playground, then straight into the sea, then lunch at one of the beachside restaurants. Family HQ for the Riviera days. 🗺️ https://maps.google.com/?q=Plage+du+Veillat+Saint-Raphael+France", kidFriendly: true },
      { name: 'Aire de Jeux — Parc de la Chêneraie (Fréjus)', lat: 43.4341, lon: 6.7353, category: 'playground', award: '⭐ Market combo: Near Marché de Fréjus (Tue/Sat)', tagline: "Fréjus's best playground — oak grove park, near the Tuesday/Saturday market.", desc: "Beautiful shaded playground in Fréjus set in an oak grove — excellent for hot April afternoons. 10 minutes from Villa Eleanor. On Tuesday and Saturday mornings, the Marché de Fréjus is nearby — perfect combo of fresh market grocery run + playground lunch in the shade. Climbing structures, slides, picnic tables under the trees. 🗺️ https://maps.google.com/?q=Parc+de+la+Cheneraie+Frejus+France", kidFriendly: true },
      { name: 'Aire de Jeux — Port Fréjus', lat: 43.4231, lon: 6.7465, category: 'playground', award: '⭐ Market combo: Port Fréjus market (Thursday mornings)', tagline: "Modern marina playground + Thursday market. Watch the boats.", desc: "Port Fréjus is a purpose-built marina with a great modern playground and waterfront restaurants. On Thursday mornings the Port Fréjus market sets up — fresh produce, local crafts, Mediterranean atmosphere. Grab market food and eat harborside while the kids play and watch the yachts. A genuinely charming spot that feels nothing like a tourist trap. 🗺️ https://maps.google.com/?q=Port+Frejus+playground+Frejus+France", kidFriendly: true },

      // ── DAY TRIPS BY TRAIN ───────────────────────────────────────────────
      { name: 'Cannes — La Croisette & Marché Forville', lat: 43.5517, lon: 7.0174, category: 'experience', award: '21 min by train · ~€7/person', tagline: "Train to glamour in 21 minutes. Walk the Croisette, hit Forville market.", desc: "Saint-Raphaël → Cannes by TER regional train: 21 minutes, ~€7/person. Walk the famous Croisette, see the Palais des Festivals, browse the covered Marché Forville (daily except Monday) for Provençal produce and lunch supplies. The old port (Le Suquet) has great restaurants. April = pre-tourist season — perfect timing. Book via sncf-connect.com. 🗺️ https://maps.google.com/?q=Gare+de+Cannes+Cannes+France", kidFriendly: true },
      { name: 'Nice — Vieux-Nice & Cours Saleya', lat: 43.6978, lon: 7.2742, category: 'experience', award: '1h 15min by train · ~€12/person', tagline: "Train to Nice: flower market, Old Town, Castle Hill waterfall.", desc: "Saint-Raphaël → Nice Ville by TER: 1h 15min, ~€12-15/person. Don't miss: Cours Saleya flower and food market (mornings), Vieux-Nice's colorful lanes and socca street food, and Colline du Château (Castle Hill) — free park with a waterfall and epic views the kids will love. All-day trip. Book via sncf-connect.com. 🗺️ https://maps.google.com/?q=Gare+de+Nice+Ville+Nice+France", kidFriendly: true },
      { name: 'Monaco — Monte Carlo & Aquarium', lat: 43.7384, lon: 7.4246, category: 'experience', award: '~1h 45min by train (change Nice) · ~€15-20/person', tagline: "Train via Nice to the world's most glamorous city-state.", desc: "Saint-Raphaël → Nice → Monaco-Monte Carlo: ~1h 45min total, change at Nice. See Monte Carlo Casino, Prince's Palace, and walk the actual Formula 1 street circuit. The Musée Océanographique (aquarium/marine museum perched on the cliff) is world-class and the kids will be obsessed. April = Monaco Rolex Masters tennis tournament. Book via sncf-connect.com. 🗺️ https://maps.google.com/?q=Monaco+Monte+Carlo+Monaco", kidFriendly: true },
      { name: 'Antibes — Old Town & Picasso Museum', lat: 43.5804, lon: 7.1256, category: 'experience', award: '32 min by train · ~€8/person', tagline: "32 min to medieval ramparts, Picasso, and the best market on the Riviera.", desc: "Saint-Raphaël → Antibes by TER: 32 minutes, ~€8/person. Antibes Old Town is enclosed by medieval ramparts — the Musée Picasso (Château Grimaldi) sits dramatically above the sea. The covered Marché Provençal (daily except Monday) in Cours Masséna is outstanding. Then walk the ramparts for views over the bay. Underrated gem. 🗺️ https://maps.google.com/?q=Gare+Antibes+Antibes+France", kidFriendly: true },

      // ── HIDDEN GEMS — LOCAL SAINT-RAPHAËL ───────────────────────────────
      { name: 'Château Font du Broc', lat: 43.5198, lon: 6.6134, category: 'wine', award: 'Award-winning Côtes de Provence estate', tagline: "Award-winning winery in a stunning Provençal château setting.", desc: "A beautiful Côtes de Provence winery between Saint-Raphaël and Les Arcs. The château sits in 50 hectares of vines with views of the Maures massif. Their rosé and white wines have won multiple regional awards. Visit by appointment for a guided cellar tour and tasting. A real Provence wine experience, not a tourist operation. 🗺️ https://maps.google.com/?q=Chateau+Font+du+Broc+Le+Muy+France", kidFriendly: false },
      { name: "Distillerie de Provence — L'Oppidum", lat: 43.5462, lon: 6.7832, category: 'specialty', award: 'Artisan spirits + local lavender gin', tagline: "Hidden artisan distillery making lavender gin and pastis near Fréjus.", desc: "A small-batch artisan distillery tucked in the hills above Fréjus making exceptional Provençal spirits — including a lavender gin and a terroir pastis using local wild herbs. Visits by appointment only. The kind of place you tell everyone about when you get home. Genuinely hidden gem. 🗺️ https://maps.google.com/?q=Distillerie+de+Provence+Var+France", kidFriendly: false },
      { name: 'Marché Provençal de Saint-Raphaël (daily)', lat: 43.4249, lon: 6.7649, category: 'market', tagline: "Daily Provençal market — olives, honey, tapenade, rosé.", desc: "The daily Provençal market in the center of Saint-Raphaël. Best local olives, lavender honey, tapenade, fresh fish, and Côtes de Provence rosé. Open every morning. Tuesday and Saturday have the most vendors. A perfect morning ritual — pick up supplies for a picnic or beach day. 🗺️ https://maps.google.com/?q=Marche+Provencal+Saint-Raphael+France", kidFriendly: true },
      { name: 'Marché de Fréjus (Tue/Sat/Sun)', lat: 43.4332, lon: 6.7360, category: 'market', award: 'Best Provençal market near Saint-Raphaël', tagline: "Less touristy than Saint-Raphaël, better local selection.", desc: "Fréjus (10 min from Villa Eleanor) has three weekly markets: Tuesday and Saturday (Provençal produce, best selection), Sunday on Fréjus Beach boulevard. Far less touristy than the Saint-Raphaël market with better prices and more local character. Combine with a visit to the Roman ruins or Port Fréjus playground lunch. 🗺️ https://maps.google.com/?q=Marche+de+Frejus+Frejus+France", kidFriendly: true },
      { name: "Sentier du Littoral — Saint-Raphaël Coast Path", lat: 43.4050, lon: 6.8020, category: 'experience', award: 'Most scenic coastal walk on the Var coast', tagline: "Wild coastal trail through red Estérel rocks and hidden coves.", desc: "The Sentier du Littoral (coastal path) runs west from Saint-Raphaël through the red volcanic Estérel rocks, passing hidden pebble coves, turquoise water inlets, and dramatic cliff viewpoints inaccessible by road. Perfect for an active morning before Chef Valentin's dinner. Accessible directly from the beach at Saint-Raphaël — no car needed. Bring snacks and swim in a cove. Unforgettable. 🗺️ https://maps.google.com/?q=Sentier+du+Littoral+Saint-Raphael+Esterel", kidFriendly: true },
      { name: 'Île des Lérins — Cannes', lat: 43.5082, lon: 7.0493, category: 'experience', award: 'Medieval monastery island off Cannes — accessible by ferry', tagline: "Island monastery, monks still brewing liqueur. 15-min ferry from Cannes.", desc: "Take the train to Cannes (21 min) then a 15-minute ferry to the Île Saint-Honorat — a medieval island monastery still inhabited by Cistercian monks who brew their own liqueur and make wine from their island vineyard. The smaller Île Sainte-Marguerite next door has the fort where The Man in the Iron Mask was imprisoned. Extraordinary half-day from Saint-Raphaël. Ferries run April–October. 🗺️ https://maps.google.com/?q=Ile+Saint-Honorat+Cannes+France", kidFriendly: true },
      { name: 'Saint-Tropez Ferry (Les Bateaux Bleus)', lat: 43.4152, lon: 6.7680, category: 'experience', award: 'April: 2 departures/day from Saint-Raphaël port', tagline: "1-hour ferry to Saint-Tropez from the port. No car needed.", desc: "Les Bateaux Bleus runs a direct ferry from the Old Port of Saint-Raphaël to Saint-Tropez: ~1 hour each way, 2 departures per day in April (off-season). Saint-Tropez in April = zero summer chaos, still gorgeous. The Place des Lices market (Tuesday and Saturday) is world-famous. Book ahead at lesbateauxbleus.com — fills up even in shoulder season. 🗺️ https://maps.google.com/?q=Port+Vieux+Saint-Raphael+ferry+terminal", kidFriendly: true },
      { name: 'Gorges du Verdon (Excursions Beltrame)', lat: 43.7193, lon: 6.3536, category: 'experience', award: "The 'Grand Canyon of Europe' — most dramatic landscape in France", tagline: "Full-day bus tour from Saint-Raphaël to the Grand Canyon of Europe.", desc: "Excursions Beltrame (based in Saint-Raphaël, 50+ years) runs guided full-day bus excursions to the Gorges du Verdon — the deepest canyon in Europe with 700m turquoise limestone gorges. No car or train connection exists — Beltrame's buses depart from Saint-Raphaël directly. One of France's true natural wonders and a bucket-list experience. Search 'Excursions Beltrame Saint-Raphaël Verdon' to book. 🗺️ https://maps.google.com/?q=Gorges+du+Verdon+Var+France", kidFriendly: true },
      { name: 'Grasse Perfume Workshops', lat: 43.6584, lon: 6.9223, category: 'experience', award: 'UNESCO perfume capital — blend your own Grasse perfume', tagline: "55 min by car. Create your own perfume in the world's fragrance capital.", desc: "Grasse is the world's perfume capital — Chanel No. 5's jasmine comes from here. Drive or take an organized excursion (~55 min). Parfumerie Fragonard and Molinard offer 2-hour 'create your own perfume' workshops. Deeply personal, genuinely extraordinary — every family member makes their own unique fragrance using Grasse flowers. Advance booking essential. 🗺️ https://maps.google.com/?q=Parfumerie+Fragonard+Grasse+France", kidFriendly: true },
    ],
  },
  {
    city: 'Lisbon',
    flag: '\u{1F1F5}\u{1F1F9}',
    center: [38.7167, -9.1333],
    zoom: 13,
    venues: [

      // HOME BASE
      { name: '\u{1F3E0} Jo\u00E3o\u2019s Apartment', lat: 38.7102, lon: -9.1364, category: 'home', tagline: "Your Lisbon home. Apr 11–15.", desc: "Your Lisbon accommodation. Cal\u00E7ada de Salvador Correia de S\u00E1 4, Lisbon, Portugal. Host: Jo\u00E3o. Check-in Apr 11 at 4 PM, checkout Apr 15 by 11 AM. 🗺️ https://maps.google.com/?q=Calcada+de+Salvador+Correia+de+Sa+4+Lisbon+Portugal" },

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
      { name: 'Garrafeira Nacional', lat: 38.7133, lon: -9.1376, category: 'specialty', award: 'Lisbon\u2019s oldest and most respected wine shop (since 1927)', tagline: "The definitive Portuguese wine cellar.", desc: "The definitive Portuguese wine cellar. Vintage ports going back decades, every major producer. Staff are experts. Baixa neighborhood." },
      { name: 'A Vida Portuguesa', lat: 38.7136, lon: -9.1394, category: 'specialty', award: 'Best Portuguese design + food gifts', tagline: "Beautifully curated Portuguese products.", desc: "Beautifully curated store: sardines, ceramics, soaps, traditional Portuguese products. The best souvenir shopping in the city.", kidFriendly: true },

      // WINE
      { name: 'Prado Mercearia', lat: 38.7155, lon: -9.1368, category: 'wine', award: 'Best natural wine bar Lisbon \u2014 Reddit/sommelier consensus', tagline: "Half wine shop, half bar. Portuguese natural wines only.", desc: "Half wine shop, half bar. Portuguese natural and low-intervention wines only. Standing room, great snacks. Alfama edge." },
      { name: 'Black Sheep Wine', lat: 38.7131, lon: -9.1428, category: 'wine', award: 'Expanded 2024 \u2014 Culinary Backstreets top pick', tagline: "Crash course in Portuguese wine from passionate staff.", desc: "Once \u2018Lisbon\u2019s smallest wine bar,\u2019 expanded in 2024. Crash course in Portuguese wine from genuinely passionate staff. Chiado." },
      { name: 'Bom Bom Bom', lat: 38.7182, lon: -9.1461, category: 'wine', award: 'Hidden gem \u2014 natural wine + vinyl records', tagline: "Natural wine bar AND record shop.", desc: "Natural wine bar AND record shop. Eclectic, cozy, beloved by in-the-know locals. Bairro Alto." },

      // COFFEE
      { name: 'Wish Slow Coffee House', lat: 38.7097, lon: -9.1376, category: 'coffee', award: 'Top-rated Lisbon specialty coffee', tagline: "Beautifully designed space near the waterfront.", desc: "Beautifully designed space near the waterfront. Single origin focus, exceptional baristas. One of Lisbon\u2019s most peaceful coffee stops." },

      // ICONIC
      { name: 'A Cevicheria', lat: 38.7213, lon: -9.1502, category: 'iconic', award: 'Time Out Lisbon #1 restaurant multiple years', tagline: "Chef Kiko\u2019s octopus ceviche is THE dish of modern Lisbon.", desc: "Chef Kiko\u2019s octopus ceviche is THE dish of modern Lisbon. Perpetual queue, no reservations. Pr\u00EDncipe Real. Come at opening.", kidFriendly: true },
      { name: 'Solar dos Presuntos', lat: 38.7174, lon: -9.1415, category: 'iconic', award: 'Lisbon institution since 1974', tagline: "The definitive bacalhau (salt cod) experience.", desc: "The definitive bacalhau (salt cod) experience. 50+ preparations. A living museum of Portuguese cuisine. Family-run for 50 years.", kidFriendly: true },

      // EXPERIENCE (Fado)
      { name: 'Tasca do Chico', lat: 38.7097, lon: -9.1358, category: 'experience', award: 'Condé Nast Traveler featured — most authentic fado house', tagline: "The most beloved fado house in Lisbon.", desc: "The most beloved fado house in Lisbon. Walls covered in old photos and football scarves. Amateur and professional singers perform nightly. ~€15-20/person for food + fado. Book ahead — tiny space, fills fast. Alfama. 📅 Reservations essential", kidFriendly: true },
      { name: 'A Baiuca', lat: 38.7141, lon: -9.1313, category: 'experience', award: 'Legendary spontaneous fado — Alfama institution', tagline: "The most spontaneous, emotional fado experience in Lisbon.", desc: "The most spontaneous, emotional fado experience in Lisbon. Local singers perform between bites. No phones allowed during songs — pure, unrehearsed, extraordinary. Tiny. Book weeks ahead. Not to be missed. 📅 Reservations essential" },

      // MARKET (additional)
      { name: 'LX Factory Sunday Market', lat: 38.7010, lon: -9.1743, category: 'market', award: "Lisbon's best Sunday market — Time Out top pick", tagline: "Inside a stunning 19th-century factory complex.", desc: "Inside a stunning 19th-century factory complex. Sunday only. Street food, vintage clothing, ceramics, books, live music. The best single afternoon you can spend in Lisbon. Bring the kids — it's massive and fun.", kidFriendly: true },

      // ── LISBON PLAYGROUNDS ───────────────────────────────────────────────
      { name: 'Parque Eduardo VII — Playground', lat: 38.7267, lon: -9.1514, category: 'playground', award: "Lisbon's grandest park at the top of Avenida da Liberdade", tagline: "Lisbon's most central park. Great playground, panoramic city views.", desc: "At the top of Avenida da Liberdade, Parque Eduardo VII has a well-equipped playground and Lisbon's best panoramic viewpoint. The park descends in formal hedged terraces to the city below — the view is stunning. Combo: stroll Avenida da Liberdade for coffee and pastéis de nata at a nearby café, then up to the park. Centrally located for the family. 🗺️ https://maps.google.com/?q=Parque+Eduardo+VII+Playground+Lisbon+Portugal", kidFriendly: true },
      { name: 'Jardim da Estrela — Playground', lat: 38.7143, lon: -9.1589, category: 'playground', award: '⭐ Market combo: Adjacent to Campo de Ourique market (10 min walk)', tagline: "Lisbon's most beloved neighborhood park. Ducks, peacocks, bandstand, playground.", desc: "Jardim da Estrela is where Lisboetas bring their families on weekends — a lush Victorian garden with a lake, ducks, peacocks, a bandstand, and a fantastic shaded playground. Walk 10 minutes to Mercado de Campo de Ourique — Lisbon's best neighborhood food market with fresh produce, cheese, fish, and excellent lunch spots. A genuinely perfect family morning in Lisbon. 🗺️ https://maps.google.com/?q=Jardim+da+Estrela+Lisbon+Portugal", kidFriendly: true },
      { name: 'Parque das Nações — Playground + Waterfront', lat: 38.7635, lon: -9.0954, category: 'playground', award: '⭐ Market combo: Feira da Ladra flea market (Tue/Sat in Alfama) 20 min away', tagline: "Modern waterfront district with enormous playground, aquarium nearby.", desc: "The 1998 World Expo site is now Lisbon's most family-friendly neighborhood — wide waterfront promenades, enormous modern playground structures, fountains kids can run through, and the Oceanário de Lisboa (world-class aquarium). The Oceanário alone is worth a half-day trip. On Tuesday and Saturday, the Feira da Ladra flea market in Alfama has street food vendors and an incredible atmosphere. 🗺️ https://maps.google.com/?q=Parque+das+Nacoes+Playground+Lisbon+Portugal", kidFriendly: true },
      { name: 'Jardim do Príncipe Real — Playground', lat: 38.7164, lon: -9.1478, category: 'playground', award: '⭐ Market combo: Organic market on Saturday mornings in the same square', tagline: "Charming square playground with Saturday organic market in the same garden.", desc: "Príncipe Real is Lisbon's most charming neighborhood — beautiful 19th-century mansions, antique shops, wine bars, and a leafy central square with a playground. On Saturday mornings, an organic farmers market sets up in the same garden — local vegetables, artisan bread, honey, cheese. The ultimate combo: market shop while kids play, then lunch at A Cevicheria or Black Sheep wine bar nearby. 🗺️ https://maps.google.com/?q=Jardim+do+Principe+Real+Lisbon+Portugal", kidFriendly: true },

      // ── MONUMENTS & LANDMARKS ────────────────────────────────────────────
      { name: 'Elevador da Bica', lat: 38.7077, lon: -9.1453, category: 'experience', award: 'Iconic 19th-century funicular — Lisbon landmark', tagline: "The most photographed funicular in Lisbon. Connects Cais do Sodré to Bairro Alto.", desc: "The Elevador da Bica has been hauling Lisbonites up and down the steep hill between Cais do Sodré and Bairro Alto since 1892. It's the most iconic of Lisbon's three remaining funiculars — a single wooden tram on rails that crawls through a narrow residential street. Ride it up, explore Bairro Alto, walk back down. One of the definitive Lisbon images.", kidFriendly: true },
      { name: 'Miradouro de Santa Catarina', lat: 38.7090, lon: -9.1470, category: 'experience', award: 'Best sunset viewpoint in Lisbon', tagline: "Sweeping Tagus River views. The city's best sunset spot.", desc: "One of Lisbon's most beloved viewpoints — a large terrace with a famous statue of Adamastor (sea giant from Portuguese legend) and panoramic views over the Tagus River. The crowd here is a mix of locals, students, and travelers all watching the sun go down over the water. Go in the late afternoon for golden hour. Bica funicular is steps away.", kidFriendly: true },
      { name: 'Praça do Comércio', lat: 38.7075, lon: -9.1364, category: 'experience', award: "Lisbon's grand waterfront square — historic arcades", tagline: "Lisbon's grandest square. Yellow arcades, the Tagus, the triumphal arch.", desc: "Praça do Comércio — Terreiro do Paço — is Lisbon's most dramatic public space: a vast yellow-arcaded square opening directly onto the Tagus River. The bronze equestrian statue of King José I anchors the center; the Arco da Rua Augusta frames the entrance from the city. This was the nerve center of the Portuguese empire. Take a seat at one of the riverside cafés and watch the ferries cross the water.", kidFriendly: true },
      { name: 'Arco da Rua Augusta', lat: 38.7081, lon: -9.1367, category: 'experience', award: 'Panoramic views of downtown Lisbon from the rooftop', tagline: "Climb the triumphal arch for panoramic views of Baixa and the Tagus.", desc: "The triumphal arch at the top of Rua Augusta was built to commemorate Lisbon's reconstruction after the 1755 earthquake. You can take a lift and narrow staircase to the very top for 360° views over Baixa, the Tagus, and the surrounding hills. Open daily; small admission fee. The view of Praça do Comércio from above is one of the best in the city.", kidFriendly: true },
      { name: 'Sé de Lisboa', lat: 38.7099, lon: -9.1329, category: 'experience', award: "One of Lisbon's oldest buildings — Romanesque, Gothic, Baroque", tagline: "Lisbon Cathedral. 900 years of history on the edge of Alfama.", desc: "The Sé de Lisboa (Lisbon Cathedral) was founded in 1147 — the year the city was reconquered from the Moors. Its imposing Romanesque facade has survived earthquakes, fires, and centuries of rebuilding; the result is a layered mashup of Romanesque towers, Gothic chapels, and Baroque altars. Free to enter the main nave. The cloisters (small fee) contain archaeological remains of Roman and Moorish buildings beneath your feet.", kidFriendly: true },

      // ── MUSEUMS & CULTURAL ATTRACTIONS ──────────────────────────────────
      { name: 'Museu Nacional de Arte Antiga', lat: 38.7029, lon: -9.1546, category: 'experience', award: "Portugal's national gallery — 14th to 19th century masterpieces", tagline: "Portugal's finest art museum. Includes The Temptation of St. Anthony by Bosch.", desc: "Portugal's national art gallery holds the country's greatest collection of paintings, sculpture, and decorative arts from the 14th to 19th centuries. Highlights include Hieronymus Bosch's 'The Temptation of Saint Anthony' (one of the most important works in Portugal), the 'Panels of Saint Vincent' (the defining image of 15th-century Portuguese painting), and extraordinary collections of Asian art brought back by Portuguese explorers. The riverside gardens are beautiful.", kidFriendly: true },
      { name: 'Museu do Chiado', lat: 38.7109, lon: -9.1413, category: 'experience', award: 'Modern and contemporary Portuguese art', tagline: "Contemporary Portuguese art in the heart of Chiado.", desc: "The Museu Nacional de Arte Contemporânea do Chiado — known simply as the Museu do Chiado — focuses on Portuguese art from the mid-19th century to the present day. The collection is strong on late-19th-century Naturalism and the Portuguese modernist movement. The museum occupies a converted 13th-century convent; the atrium garden with its iron columns is architecturally stunning. Chiado neighborhood makes it a natural stop on any afternoon walk.", kidFriendly: true },
      { name: 'Carmo Convent & Archaeological Museum', lat: 38.7121, lon: -9.1397, category: 'experience', award: 'Gothic ruins open to the sky — uniquely haunting', tagline: "A roofless Gothic convent, frozen in time since the 1755 earthquake.", desc: "The Convento do Carmo was the finest Gothic church in Lisbon until the 1755 earthquake collapsed its roof. Rather than rebuild, they left it — and it's been open to the sky ever since, its skeletal Gothic arches framing the clouds above. The nave now serves as an archaeological museum with mummies, pre-Columbian artifacts, and fossils. One of the most surreal and beautiful spaces in all of Portugal. Worth every cent of the small admission fee.", kidFriendly: true },
      { name: 'Museu da Cerveja', lat: 38.7072, lon: -9.1372, category: 'experience', award: 'Beer museum with tastings included — Praça do Comércio', tagline: "Beer history museum with tastings. Inside the arcades of Praça do Comércio.", desc: "Inside the grand yellow arcades of Praça do Comércio, the Museu da Cerveja (Beer Museum) tells the story of Portuguese brewing culture with interactive exhibits, historical artifacts, and — the highlight — tastings of Portuguese craft beers included with admission. A genuinely fun stop that pairs perfectly with the waterfront square. Great for a rainy hour or a low-key afternoon break.", kidFriendly: true },
      { name: 'Time Out Market Lisboa', lat: 38.7068, lon: -9.1490, category: 'market', award: "World's Best Food Market — 35 top Portuguese chefs", tagline: "35 of Lisbon's best chefs and restaurants under one historic roof.", desc: "The original Time Out Market, inside the 19th-century Mercado da Ribeira on the waterfront. Thirty-five curated stalls from Lisbon's top chefs — bacalhau from Solar dos Presuntos, pastéis de nata from Aloma, seafood from João Rodrigues, and much more — all at market prices. The communal tables fill up fast at lunch and dinner. The building itself, with its ornate iron structure, is stunning. Perfect for groups where everyone wants something different.", kidFriendly: true },

      // ── RESTAURANTS ─────────────────────────────────────────────────────
      { name: 'Estrela da Bica', lat: 38.7083, lon: -9.1456, category: 'iconic', award: 'Modern Portuguese cuisine with Mediterranean influences', tagline: "Cozy spot near Bica funicular. Modern Portuguese with Mediterranean flair.", desc: "A cozy neighborhood restaurant steps from the Elevador da Bica in the atmospheric Santa Catarina quarter. The kitchen does modern Portuguese cuisine with strong Mediterranean influences — excellent fish dishes, thoughtful wine list heavy on Portuguese natural wines. Intimate space with a genuinely local crowd. Book ahead for dinner.", kidFriendly: false },
      { name: 'Taberna da Rua das Flores', lat: 38.7107, lon: -9.1415, category: 'iconic', award: 'Traditional Portuguese with creative twist — perfect for tapas', tagline: "Traditional petiscos (Portuguese tapas) done with creative flair. No reservations.", desc: "One of the best petiscos restaurants in Lisbon — traditional Portuguese small plates (codfish croquettes, pork cheeks, tinned clams) elevated with modern technique. The wine list is exceptional: deep in Alentejo reds and Vinho Verde. Small space, no reservations, perpetual queue — arrive when it opens or expect to wait. Worth every minute.", kidFriendly: false },
      { name: 'Alma', lat: 38.7107, lon: -9.1421, category: 'iconic', award: 'Michelin-starred — contemporary Portuguese gastronomy', tagline: "Michelin-starred. Chef Henrique Sá Pessoa's contemporary Portuguese cuisine.", desc: "Chef Henrique Sá Pessoa's Michelin-starred restaurant in Chiado is one of Lisbon's finest dining experiences. The menu is deeply rooted in Portuguese tradition — bacalhau, pork, seafood — but executed with exceptional technique and beautiful plating. The space is elegant without being stuffy. Book well in advance. The tasting menu is the move.", kidFriendly: false },
      { name: 'Bairro do Avillez', lat: 38.7103, lon: -9.1408, category: 'iconic', award: 'Multi-concept by Michelin-starred chef José Avillez', tagline: "Chef José Avillez's food village — four dining concepts under one roof.", desc: "Celebrity chef José Avillez (two Michelin stars at Belcanto nearby) created Bairro do Avillez as a multi-concept dining space in Chiado: a Portuguese tavern, a patio restaurant, a mini bar for cocktails and snacks, and a brasserie. Something for every mood and budget. The Taberna is the most fun for groups — great petiscos and wine in a convivial setting. Book ahead.", kidFriendly: true },
      { name: 'Café de São Bento', lat: 38.7147, lon: -9.1530, category: 'iconic', award: 'Famous for the best steaks in Lisbon — intimate old-school setting', tagline: "Old-school Lisbon steakhouse. One of the city's best steaks.", desc: "A Lisbon classic near the parliament building in Santos — a dark, intimate, old-fashioned restaurant famous for serving some of the best steaks in the city. The bife na frigideira (steak in butter sauce with mustard) is legendary. Proper old Lisbon dining room atmosphere: heavy white tablecloths, professional waiters, wines from the cellar. Book for dinner.", kidFriendly: false },

      // ── BARS & NIGHTLIFE ─────────────────────────────────────────────────
      { name: 'Park Bar', lat: 38.7100, lon: -9.1465, category: 'wine', award: 'Best rooftop bar in Lisbon — Time Out top pick', tagline: "Rooftop bar on the top floor of a parking garage. Panoramic Lisbon views.", desc: "Park Bar is exactly what it sounds like: a rooftop bar on the top floor of a multi-story parking garage in Bairro Alto. The views across Lisbon's terracotta rooftops to the Tagus are extraordinary. The crowd is hip, the drinks are good, and the sunset here is one of the great Lisbon experiences. No reservations — just show up. Gets busy from 7 PM. The Bica funicular is steps away." },
      { name: 'By the Wine', lat: 38.7074, lon: -9.1375, category: 'wine', award: 'Excellent wine bar — wide Portuguese wine selection', tagline: "José Maria da Fonseca's wine bar. Every major Portuguese wine region represented.", desc: "Run by the historic José Maria da Fonseca winery, By the Wine in Praça do Comércio is one of Lisbon's best wine bars — a serious selection covering every major Portuguese wine region: Vinho Verde, Alentejo, Dão, Douro, and of course Setúbal (their home region). The tapas selection complements the wine beautifully. A great stop before exploring the waterfront square." },
      { name: 'Red Frog', lat: 38.7186, lon: -9.1480, category: 'experience', award: 'Speakeasy-style cocktail bar — creative bartending', tagline: "Hidden speakeasy with exceptional craft cocktails. Ring the bell.", desc: "Lisbon's most celebrated cocktail bar operates as a speakeasy: an unmarked door, a doorbell to ring, and a moody basement space beyond. The bartenders are genuinely excellent — creative seasonal cocktails using Portuguese spirits, local botanicals, and precise technique. The bar has won multiple European bartending awards. Reservations recommended on weekends.", kidFriendly: false },
      { name: 'Topo Chiado', lat: 38.7120, lon: -9.1397, category: 'experience', award: 'Rooftop bar with panoramic Lisbon views near Carmo Convent', tagline: "Rooftop bar near Carmo Convent. Stunning views of Lisbon's rooftops.", desc: "Topo Chiado sits on the rooftop of a building right next to the Carmo Convent ruins — the views of Lisbon's castle, the Alfama, and the Tagus River are spectacular. Cocktails, wine, and a light food menu. The outdoor terrace is the spot for watching golden hour paint the city. Book a table for sunset — it fills up fast." },
      { name: 'Lounge Bar Bica', lat: 38.7080, lon: -9.1450, category: 'experience', award: 'Vibrant local cocktail bar near the funicular', tagline: "Small, vibrant bar near the Bica funicular. Great cocktails, local crowd.", desc: "A lively neighborhood bar tucked into the Santa Catarina quarter near the Bica funicular. Small space, excellent cocktails, predominantly local crowd. The kind of bar you stumble upon and end up staying for three rounds. Good soundtrack, reasonable prices, authentic Lisbon nightlife atmosphere without the tourist markup." },

      // ── PLACES TO EXPLORE ────────────────────────────────────────────────
      { name: 'Bairro Alto', lat: 38.7131, lon: -9.1454, category: 'experience', award: "Lisbon's most famous nightlife neighborhood", tagline: "The nightlife heartbeat of Lisbon. Narrow streets packed with bars and live music.", desc: "Bairro Alto — the High Quarter — is Lisbon's historic bohemian neighborhood and nightlife epicenter. From about 10 PM, the narrow streets fill with bars spilling onto the cobblestones: fado houses, craft cocktail bars, wine bars, and clubs running side by side. During the day it's quieter but worth exploring for independent boutiques, gallery spaces, and lunch spots. The Miradouro de Santa Catarina and Park Bar are on its western edge.", kidFriendly: false },
      { name: 'Cais do Sodré & Pink Street', lat: 38.7067, lon: -9.1440, category: 'experience', award: 'Vibrant waterfront nightlife district', tagline: "The iconic pink-painted street. Lisbon's most Instagrammed bar district.", desc: "Rua Nova do Carvalho — 'Pink Street' — is Lisbon's most famous bar strip: the entire street is painted hot pink, lined with bars that get increasingly lively as the night goes on. The surrounding Cais do Sodré neighborhood (adjacent to the ferry terminal and Time Out Market) has some of the city's best restaurants and daytime coffee spots. By night it's full of energy. By day it's surprisingly charming.", kidFriendly: true },
      { name: 'Alfama', lat: 38.7138, lon: -9.1307, category: 'experience', award: "Lisbon's oldest district — Fado, history, winding alleys", tagline: "Lisbon's oldest quarter. Fado music, Moorish roots, castle above.", desc: "Alfama is the soul of Lisbon — the medieval Moorish quarter that survived the 1755 earthquake largely intact. The alleys are steep and winding, the views from every corner are extraordinary, and the sound of fado drifts from open windows in the evening. The Castelo de São Jorge sits at the top; Tasca do Chico and A Baiuca are at its base. Wander without a plan — every street leads somewhere beautiful.", kidFriendly: true },
      { name: 'LX Factory', lat: 38.7010, lon: -9.1743, category: 'experience', award: 'Best creative hub in Lisbon — Sunday market is legendary', tagline: "19th-century textile factory reborn as Lisbon's coolest creative hub.", desc: "A sprawling 19th-century industrial complex transformed into a village of shops, restaurants, galleries, bookshops, and bars. The Sunday market is Lisbon's best — vintage clothing, ceramics, food stalls, live music. During the week it's quieter but the restaurants (including the renowned Cantina LX) are excellent. The bookshop suspended in the old factory structure is one of the most beautiful in Europe.", kidFriendly: true },
      { name: 'Belém', lat: 38.6971, lon: -9.2021, category: 'experience', award: 'Jerónimos Monastery + Belém Tower + Pastéis de Belém', tagline: "The must-visit district. 3 UNESCO sites and the world's best pastry.", desc: "Belém is non-negotiable. The Jerónimos Monastery is Portugal's greatest architectural achievement — built with spice trade wealth in the 16th century, UNESCO listed, jaw-dropping Manueline Gothic. Belém Tower (the postcard image of Lisbon) sits in the Tagus 5 minutes away. And the original Pastéis de Belém pastry shop has been making custard tarts to the same secret recipe since 1837. Take the tram (15E) from Praça do Comércio — 30 minutes, full family experience.", kidFriendly: true },
      { name: 'Parque Eduardo VII', lat: 38.7267, lon: -9.1514, category: 'experience', award: "Lisbon's grandest park — panoramic views of the city", tagline: "Lisbon's grandest park. Formal terraces descending to the city with stunning views.", desc: "At the top of Avenida da Liberdade, Parque Eduardo VII is Lisbon's most formal and dramatic park — wide terraced gardens descending toward the city center and the Tagus, with panoramic views from the upper belvedere. The park contains two stunning tropical greenhouses (Estufa Fria and Estufa Quente) with remarkable plant collections. A beautiful, uncrowded spot that most tourists skip in favor of the riverfront.", kidFriendly: true },
      { name: 'Estrela Basilica & Garden', lat: 38.7143, lon: -9.1589, category: 'experience', award: 'Stunning Baroque church — peaceful garden alongside', tagline: "One of Lisbon's most beautiful churches. The garden next door is a secret gem.", desc: "The Basílica da Estrela is one of the most beautiful churches in Lisbon — an 18th-century Baroque masterpiece with a massive white dome visible from across the city. It was built by Queen Maria I (whose tomb is inside) as an act of thanksgiving. The Jardim da Estrela directly opposite is one of Lisbon's most charming public gardens: a Victorian park with a duck pond, peacocks, a bandstand, and a beloved neighborhood playground. A perfect afternoon combination.", kidFriendly: true },
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
  const [activeFilter, setActiveFilter] = useState<Category | 'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [savedVenues, setSavedVenues] = useState<string[]>([]);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  // Load saved venues from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wishlist_venues');
      if (raw) setSavedVenues(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleSaved = useCallback((venueName: string) => {
    setSavedVenues(prev => {
      const next = prev.includes(venueName)
        ? prev.filter(n => n !== venueName)
        : [...prev, venueName];
      localStorage.setItem('wishlist_venues', JSON.stringify(next));
      return next;
    });
  }, []);

  const isVenueSaved = useCallback((venueName: string) => savedVenues.includes(venueName), [savedVenues]);

  const city = CITIES[selectedCityIdx];

  const filteredVenues = useMemo(() => {
    const homeVenues = city.venues.filter(v => v.category === 'home');
    let venues = city.venues.filter(v => v.category !== 'home');
    if (activeFilter === 'saved') {
      venues = venues.filter(v => savedVenues.includes(v.name));
    } else if (activeFilter !== 'all') {
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
    // Home base pins always render on top, regardless of filter
    return [...homeVenues, ...venues].sort((a, b) => venueSortRank(b) - venueSortRank(a));
  }, [city, activeFilter, searchQuery, savedVenues]);

  const handleSelectVenue = (venue: Venue | null) => {
    setSelectedVenue(prev => prev?.name === venue?.name ? null : venue);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-cream overflow-hidden">
      {/* Header — fixed at top */}
      <div className="shrink-0 bg-primary pt-safe" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        {/* Title row — compact single line */}
        <div className="flex items-center px-4 pt-3 pb-2">
          <button
            onClick={() => router.back()}
            className="p-2.5 -ml-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="ml-2.5 text-white font-serif text-base font-medium leading-tight">Map Dots</h1>
        </div>

        {/* City tab bar */}
        <div className="flex items-center gap-2 px-4 pb-2">
          <div className="flex gap-1.5 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
            {CITIES.map((c, i) => {
              const isActive = i === selectedCityIdx;
              const shortLabels: Record<string, string> = { 'Paris': 'Paris', 'Saint-Raphaël': 'St-Raphaël', 'Lisbon': 'Lisbon' };
              const cityColors: Record<string, string> = { 'Paris': '#60a5fa', 'Saint-Raphaël': '#fb923c', 'Lisbon': '#2dd4bf' };
              return (
                <button
                  key={c.city}
                  onClick={() => {
                    setSelectedCityIdx(i);
                    setSelectedVenue(null);
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-white shadow-lg'
                      : 'text-white/50 bg-transparent hover:text-white/70'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cityColors[c.city] }} />
                  )}
                  <span className="text-xs">{c.flag}</span>
                  <span>{shortLabels[c.city] ?? c.city}</span>
                  <span className="text-[10px] opacity-60">({c.venues.length})</span>
                </button>
              );
            })}
          </div>
          <p className="text-white/25 text-[8px] uppercase tracking-[0.15em] ml-auto hidden min-[400px]:block">Every Dot Worth Finding</p>
        </div>

        {/* Separator */}
        <div className="mx-4 h-px bg-white/10" />

        {/* Filter pills with fade affordance */}
        <div className="relative">
          <div
            ref={filterScrollRef}
            className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide food-map-filter-scroll"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <button
              onClick={() => setActiveFilter('all')}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                activeFilter === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-white/40 border-white/15 hover:border-white/30'
              }`}
            >
              ✦ All
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'saved' ? 'all' : 'saved')}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                activeFilter === 'saved'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-white/40 border-white/15 hover:border-white/30'
              }`}
            >
              <Heart className="h-3 w-3" />
              <span>Saved</span>
              {savedVenues.length > 0 && (
                <span className="text-[10px] opacity-60">({savedVenues.filter(n => city.venues.some(v => v.name === n)).length})</span>
              )}
            </button>
            {CATEGORIES.filter(cat => cat.key !== 'home').map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(activeFilter === cat.key ? 'all' : cat.key)}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  activeFilter === cat.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-white/40 border-white/15 hover:border-white/30'
                }`}
              >
                <span className="text-[11px]">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          {/* Right fade gradient for scroll affordance */}
          <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{ maskImage: 'none', background: 'linear-gradient(to right, transparent, oklch(0.20 0.055 258))' }} />
        </div>
      </div>

      {/* Scroll hint animation — CSS keyframes */}
      <style jsx global>{`
        @keyframes filterScrollHint {
          0% { transform: translateX(0); }
          40% { transform: translateX(-20px); }
          100% { transform: translateX(0); }
        }
        .food-map-filter-scroll {
          animation: filterScrollHint 0.6s ease-in-out 1s 1;
        }
      `}</style>

      {/* Map — fills remaining viewport minus nav bar */}
      <div className="relative flex-1 min-h-0" style={{ marginBottom: '64px' }}>
        <FoodMap
          city={city}
          venues={filteredVenues}
          selectedVenue={selectedVenue}
          onSelectVenue={handleSelectVenue}
          savedVenues={savedVenues}
        />

        {/* Floating List toggle button */}
        <button
          onClick={() => setShowList(true)}
          className="absolute bottom-4 right-4 z-[50] flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-primary text-white text-sm font-medium shadow-lg hover:bg-primary/80 transition-colors"
        >
          <List className="h-4 w-4" />
          List
        </button>
      </div>

      {/* ── Venue detail bottom sheet (pin tap) ────────────────────────────── */}
      {/* Backdrop — tap to dismiss */}
      {selectedVenue && (
        <div
          className="fixed inset-0 z-[99]"
          onClick={() => setSelectedVenue(null)}
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[100] bg-cream rounded-t-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.15)] border-t border-primary/10 max-h-[45vh] overflow-y-auto transition-transform duration-300 ease-out ${
          selectedVenue ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {selectedVenue && (
          <div className="p-4 pb-safe">
            {/* Drag handle */}
            <div className="flex justify-center">
              <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedVenue(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <X className="h-4 w-4 text-primary/60" />
            </button>

            {/* Category emoji + award badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{CATEGORY_MAP[selectedVenue.category].emoji}</span>
              {selectedVenue.award && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-800 border border-amber-200">
                  {selectedVenue.award}
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="font-serif text-2xl font-medium text-foreground mb-1">{selectedVenue.name}</h3>

            {/* Divider */}
            <div className="h-px bg-border my-3" />

            {/* Description */}
            <p className="text-sm leading-relaxed text-foreground/80 mb-2">{selectedVenue.desc}</p>

            {/* Kid-friendly badge */}
            {selectedVenue.kidFriendly && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200 mr-2">
                {'\u{1F9D2}'} Kid-friendly
              </span>
            )}

            {/* Reservations note */}
            {selectedVenue.desc.includes('Reservations essential') && (
              <span className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 inline-block">Reservations essential</span>
            )}

            {/* Save / Wishlist button */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => toggleSaved(selectedVenue.name)}
                className={`flex items-center justify-center gap-2 flex-1 text-sm px-4 py-2.5 rounded-lg transition-colors ${
                  isVenueSaved(selectedVenue.name)
                    ? 'bg-amber-50 text-amber-700 border border-amber-300'
                    : 'bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <Heart className={`h-4 w-4 ${isVenueSaved(selectedVenue.name) ? 'fill-amber-500' : ''}`} />
                {isVenueSaved(selectedVenue.name) ? 'Saved' : 'Save to Wish List'}
              </button>
            </div>

            {/* Google Maps button — full width outlined */}
            <a
              href={googleMapsUrl(selectedVenue)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-primary text-primary text-sm px-4 py-2.5 rounded-lg hover:bg-primary/5 transition-colors mt-2"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </div>
        )}
      </div>

      {/* ── Full-screen venue list modal ───────────────────────────────────── */}
      {showList && (
        <div className="fixed inset-0 z-[200] bg-cream flex flex-col">
          {/* List header */}
          <div className="shrink-0 flex items-center justify-between px-4 pt-safe pb-3 border-b border-border bg-cream">
            <div className="pt-4">
              <h2 className="font-serif text-lg font-medium text-foreground">{city.city} Venues</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/40">
                {filteredVenues.length} {activeFilter === 'all' ? 'spots' : activeFilter === 'saved' ? 'saved' : CATEGORY_MAP[activeFilter]?.label.toLowerCase() + ' spots'}
              </p>
            </div>
            <button
              onClick={() => setShowList(false)}
              className="p-2.5 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors mt-4"
            >
              <X className="h-5 w-5 text-primary/60" />
            </button>
          </div>

          {/* Search */}
          <div className="shrink-0 px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-primary/10 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary/25 focus:ring-2 focus:ring-primary/5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5"
                >
                  <X className="h-4 w-4 text-primary/30" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable venue list */}
          <div className="flex-1 overflow-y-auto px-4 pb-safe">
            <div className="divide-y divide-border/50">
              {filteredVenues.map((venue) => {
                const cat = CATEGORY_MAP[venue.category];
                const isSelected = selectedVenue?.name === venue.name;
                return (
                  <button
                    key={venue.name}
                    data-venue={venue.name}
                    onClick={() => {
                      handleSelectVenue(venue);
                      setShowList(false);
                    }}
                    className={`w-full text-left py-3.5 px-1 transition-all ${
                      isSelected
                        ? 'bg-primary/5'
                        : 'hover:bg-primary/[0.02]'
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
                        <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{cat.label}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-serif text-base font-medium text-foreground">{venue.name}</span>
                          {isVenueSaved(venue.name) && <Heart className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {venue.award && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-50 text-amber-800 border border-amber-200">{venue.award}</span>
                          )}
                          {venue.kidFriendly && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">{'\u{1F9D2}'} Kid-friendly</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{venue.tagline}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredVenues.length === 0 && (
                <div className="text-center py-8 text-primary/40 text-sm">
                  No venues found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
