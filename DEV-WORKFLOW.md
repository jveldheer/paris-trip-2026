# Paris Trip 2026 — Dev Workflow Guide

## 1. Local Dev Setup

```bash
# First time
cd /Users/jarvis/Projects/paris-trip-2026
npm install

# Env vars already in .env.local — required:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY

# Start dev server
npm run dev        # → http://localhost:3000
```

**Hot reload**: Next.js + Turbopack. File saves = instant HMR. No config needed.
**Path alias**: `@/*` → `./src/*`
**Package manager**: npm only (don't mix yarn/pnpm)

---

## 2. Deploy Flow (Critical)

**Push to `main` = production deploy in ~60s. That's the entire pipeline.**

| Trigger | Result |
|---|---|
| Push to `main` | Production deploy (live URL) |
| Push to any branch | Preview deploy (unique URL) |
| PR opened/updated | Preview deploy linked in PR |

No `vercel.json`, no CI gate, no tests block deploy. Vercel auto-detects Next.js.

**Env vars**: Set in Vercel dashboard → Settings → Environment Variables.
Both `NEXT_PUBLIC_*` vars needed there + in `.env.local`.

**Fastest path: edit → live**
```
1. Edit file in src/
2. Verify at localhost:3000
3. git add <files> && git commit -m "feat/fix: description"
4. git push origin main
5. Live in ~60s
```

---

## 3. Supabase

- **Remote-only** — no local Docker setup. Dev + prod share the same database. Be careful with writes.
- **No migration runner** — schema changes go directly via Supabase SQL editor or CLI
- **Auth model** — no Supabase Auth. Cookie-based (`trip_auth=1`). Trip code validated server-side via `TRIP_CODE` env var (see Security section below)
- **Static/dynamic split** — itinerary, members, trip days are hardcoded in `src/lib/constants.ts`. Dynamic features (moments, wishlist, polls, photos) use Supabase.
- **Schema reference**: `supabase/migrations/001_initial_schema.sql`

---

## 4. Key Directories

| Path | What |
|---|---|
| `src/app/trip/*/page.tsx` | All trip pages (weather, itinerary, moments, etc.) |
| `src/components/dashboard/` | Dashboard widgets (weather-widget, countdown, etc.) |
| `src/components/weather/` | Weather-specific components |
| `src/components/ui/` | shadcn base components |
| `src/lib/constants.ts` | Trip data, city colors, member config |
| `src/types/index.ts` | All TypeScript types |

---

## 5. Gotchas

- **Dev + prod share one DB** — no staging safety net
- **No tests, no lint gate** — visual QA only; broken code can ship
- **Static data needs code deploys** — itinerary/member changes require a commit, not just a DB update
- **`force-dynamic`** on trip layout — all trip pages skip caching (fine for 10 users)
- **Env var placeholders** — validated at startup; missing or placeholder values throw a clear error

---

## 6. Commit Conventions

```
feat: description of what changed
fix: description of what was broken and how it was fixed
```

- Lowercase after prefix, single line, descriptive
- Multiple changes in one commit is fine — separate with commas
- No scope parens, no body needed

---

## 7. Security

### Auth flow
- Users enter a trip code on the home page (`/`)
- The code is sent to `POST /api/auth/verify`, which validates it **server-side** against the `TRIP_CODE` env var
- On success, the server sets an `HttpOnly`, `SameSite=Strict`, `Secure` (prod) cookie: `trip_auth=1`
- Middleware (`src/middleware.ts`) checks this cookie on all `/trip/*` routes and redirects to `/` if missing
- The trip code never appears in client-side JavaScript bundles

### Environment variables
| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key |
| `TRIP_CODE` | Server only | The password users enter to access the trip |

All variables are validated at app startup (`src/lib/env.ts`). Missing or placeholder values cause a hard error. See `.env.example` for the template.

### Rotating the trip code
1. Change `TRIP_CODE` in Vercel dashboard (Settings > Environment Variables)
2. Change `TRIP_CODE` in `.env.local` for local dev
3. Redeploy. Existing users stay logged in (cookie is already set). New logins require the new code.

### Rate limiting
- The `/api/auth/verify` endpoint allows max **5 attempts per IP per 15 minutes**
- After 5 failures, returns `429 Too Many Requests` with a `Retry-After: 900` header
- Rate limit state is in-memory (resets on server restart / new deployment)

### Cookie security
- `HttpOnly` — not accessible via `document.cookie` / JavaScript
- `SameSite=Strict` — not sent on cross-origin requests
- `Secure` — only sent over HTTPS (production only, disabled in local dev)
- `Max-Age` — 90 days

### Input sanitization
- All user text inputs (wishlist, moments, polls, memory jar) are trimmed and length-capped via `sanitize()` in `src/lib/utils.ts` before writing to Supabase
- HTML `maxLength` attributes on inputs provide client-side enforcement as a first line of defense

### Known limitations
- RLS policies are `allow_all` — all authorization is app-layer (middleware cookie check). Acceptable for ~10 trusted family users.
- No Supabase Auth — the cookie model is simple but not cryptographically signed. A determined user could set `trip_auth=1` manually, but they'd also need the Supabase URL/key (which are client-bundled) to do anything useful.
- Dev and prod share one Supabase database — no staging isolation
- Rate limit is in-memory, so it resets on each deploy/restart. Sufficient for this use case.
