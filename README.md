# When Comp 🎮

**Squad up. Lock the time. Dominate.**

When Comp is a production-ready, mobile-first web app for scheduling competitive
matches (CS2, Valorant, COD), filling lobbies, and tracking post-match stats —
Elo, MVP awards, a Trophy Room, and a "Nemesis" system.

Built to be **100% free to run — no paid APIs**. All "smart" content (lobby
banter, post-match summaries) is generated from hand-written templates + pure
logic. There are no OpenAI/Anthropic keys anywhere.

---

## ✨ Features

| Area | What you get |
| --- | --- |
| **Match board** | Live grid of upcoming matches, per-game theming, one-tap **Join Comp** |
| **Lobbies** | Auto-balanced Team A / Team B, player Elo, lobby banter |
| **Scheduling** | Sleek create form (game / date / time / Discord link / max players) |
| **Sharing** | Web Share API, WhatsApp deep links (`wa.me`), `.ics` calendar download |
| **Post-match** | MVP voting + server-FPS rating → updates Elo, MVP count & matches played |
| **Trophy Room** | Stat-based badges with a 3D pointer-tilt effect (Framer Motion) |
| **Nemesis** | Pure-logic "most-faced opponent" across your completed matches |
| **Gamer aesthetic** | Deep-black theme, neon accents, animated hero, subtle Web-Audio UI sounds |
| **PWA** | Installable, offline app-shell service worker, fixed mobile bottom-nav, `overscroll-none` |
| **i18n** | English + Hebrew with full **RTL** support and a live language toggle |
| **Auth** | NextAuth credentials (register + login); Steam OAuth left as a placeholder |

## 🧱 Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + `next-themes` (dark default)
- **Framer Motion** for animations
- **Prisma ORM** + **PostgreSQL** (`User`, `Match`, `Participant`, `Rating`) — free via [Neon](https://neon.tech)
- **NextAuth** (Credentials provider)
- No external paid services.

## 🚀 Getting started

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env          # then edit NEXTAUTH_SECRET

# 3. Create + seed the database
npm run db:push
npm run db:seed

# 4. Run
npm run dev                   # http://localhost:3000
```

Seeded demo login: **`Neo` / `password123`**.

## 🏗️ Production build

```bash
npm run build   # runs `prisma generate` then `next build`
npm run start
```

## ☁️ Deploy to Render (free)

A [`render.yaml`](./render.yaml) blueprint is included. On Render:

- **Build command:** `npm install --include=dev && npm run render-build`
- **Start command:** `npm run start`
- **Environment variables** (no paid/AI keys):

  | Key | Value |
  | --- | --- |
  | `NODE_ENV` | `production` |
  | `DATABASE_URL` | your **Neon** connection string (direct / non-pooled) |
  | `NEXTAUTH_URL` | your live URL, e.g. `https://whencomp.onrender.com` |
  | `NEXTAUTH_SECRET` | a long random string (Render can auto-generate) |

The database is **Neon (free Postgres)** so data persists across deploys.
Create a project at [neon.tech](https://neon.tech), copy the **direct
(non-pooled)** connection string, and paste it into `DATABASE_URL`.

Two gotchas the config handles for you:

1. `--include=dev` is required because Render omits devDependencies when
   `NODE_ENV=production`, but Next's build needs them.
2. `render-build` runs `prisma db push` to create the tables on first deploy
   (idempotent — it does **not** wipe existing data on later deploys).

> To load demo data once, run `npm run db:seed` locally with `DATABASE_URL`
> pointed at Neon. Make sure `NEXTAUTH_URL` exactly matches your live URL or
> auth callbacks will fail.

## 🌍 Environment variables

See [`.env.example`](./.env.example). The only required values are
`DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`. **No AI/API keys.**

## 📁 Project structure

```
prisma/
  schema.prisma      # User / Match / Participant / Rating
  seed.ts            # demo users + matches
src/
  app/               # App Router pages + API routes
    api/matches/...  # REST endpoints (create, join/leave, results)
  components/        # Navbar, BottomNav, Hero, MatchCard, LobbyView, ...
  i18n/              # EN/HE dictionaries + provider (RTL)
  lib/               # prisma, auth, elo, banter (templates), share, sound
public/
  manifest.json      # PWA manifest
  sw.js              # offline service worker
  icon.svg           # app icon (PNGs generated alongside)
```

## 🔊 Notes

- **Sounds** use the Web Audio API (synthesized, no asset files) and can be muted
  from the header. Browsers require a user gesture before audio plays.
- **Nemesis / Trophies / banter / summaries** are all deterministic pure logic —
  no external calls, so the app works fully offline once installed.
- The legacy static site that previously lived at the repo root was moved to
  [`legacy/`](./legacy/) and is untouched.
