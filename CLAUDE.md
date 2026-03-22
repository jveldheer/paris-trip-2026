# Paris Trip 2026 — Claude Code Project Config

## Model
Always use claude-opus-4-6. This project runs on Jared's Max plan.

## Workflow
- After every task: `git add -A && git commit -m "feat/fix: description" && git push origin main`
- Vercel auto-deploys on push to main (~30s). No manual steps needed.
- Dev server: `npm run dev` → http://localhost:3000

## Stack
- Next.js 16 + Tailwind v4 + Shadcn UI
- Supabase (remote only — dev + prod share same DB, be careful with writes)
- Leaflet + react-leaflet for maps (dynamic import, no SSR)
- Playfair Display (serif) + Geist (sans) typography

## Design System
- **Serif (Playfair Display)**: city names, page titles, venue names, anything with soul
- **Sans (Geist)**: all functional UI, labels, numbers
- **Brass accent**: `oklch(0.70 0.085 78)` — use for active states, timeline dots, award badges
- **Deep navy primary**: `oklch(0.20 0.055 258)`
- **Warm ivory background**: `oklch(0.982 0.008 85)`
- One accent color (brass). No blue accents.
- Generous whitespace. Luxury = breathing room.

## Key Files
- `src/app/trip/page.tsx` — Dashboard
- `src/app/trip/weather/page.tsx` — Weather (timezone-aware hourly)
- `src/app/trip/food-map/page.tsx` — Food map (Leaflet, 67 venues, 9 categories)
- `src/components/dashboard/weather-widget.tsx` — Swipeable weather widget
- `src/components/layout/nav-bar.tsx` — Bottom nav
- `src/lib/constants.ts` — All static trip data (hardcoded — changes need deploys)
- `src/app/globals.css` — Design tokens

## Auth
- No Supabase Auth. Cookie-based: `trip_auth=1`
- Trip code validated server-side at `src/app/api/auth/verify/route.ts`
- Trip code env var: `TRIP_CODE` (set in Vercel dashboard)

## App Philosophy
This is a focused family trip companion. Every feature should earn its place. No social features (polls, photo sharing) — just the essentials: countdown, itinerary, weather, food map (with integrated wish list), and trip info.

## DO NOT
- Touch Supabase schema without being careful (dev + prod share one DB)
- Use hardcoded color values — always use CSS custom properties
- Add timeouts to long-running operations
