# Summer Quests ☀️

**Summer isn't infinite.** A live countdown shows exactly how many summer weekends you have left — then an AI named Sunny hands you **three quests** to spend them on. Tap to complete, watch your streak climb, and post a **screenshot-ready summary card**.

## Why it's good

- **Live summer countdown** — the hero of the app: a real, ticking timer to the end of summer plus "X summer weekends left", recalculated from the current date. Finitude you can feel.
- **AI with a personality** — quests are written by "Sunny", your hyper-energetic, slightly chaotic, deeply caring friend who refuses to let you waste the season. Quotable, never corporate.
- **Bilingual** — instant **EN / RU** switch; AI generates quests (and the whole UI) in your language. Choice is remembered.
- **Zero friction** — no signup. Two fields, and you're generating in five seconds.
- **Three-tier cadence** — daily / weekly / monthly, each tagged with a difficulty, so there's always something small enough to do now and something big enough to mean something.
- **One-tap completion** — quests check off with a visible progress counter (`2/3 quests done this summer 🔥`), persisted to a database.
- **Shareable summary card** — a clean PNG of your conquered quests; the takeaway artifact that doubles as the growth loop.
- **Never-fail fallback** — if the network or AI drops, a built-in quest set (in both languages) keeps the app alive. No keys configured? It still runs on an in-memory store.

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # then fill in your keys (optional for a local demo)
npm run dev
```

Open http://localhost:3000. The app works **out of the box with no keys** (fallback quests + in-memory storage). Add keys to unlock real AI generation and persistent storage.

### Environment

```
CURSOR_API_KEY=             # enables real AI quest generation via Cursor API (falls back without it)
NEXT_PUBLIC_SUPABASE_URL=   # enables persistent storage (in-memory without it)
SUPABASE_SERVICE_ROLE_KEY=  # server-only, never exposed to the client
```

To enable persistence, create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) once in the SQL editor.
For `CURSOR_API_KEY`, use a key from [Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations).

## Project structure

```
project-hachatoon/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # single-page quest flow
│   ├── globals.css
│   └── api/
│       ├── session/route.ts      # anonymous cookie session
│       └── quests/
│           ├── generate/route.ts # AI generation + fallback
│           ├── summary/route.ts  # completed quests for the share card
│           └── [id]/complete/route.ts
├── components/
│   ├── QuestForm.tsx
│   ├── QuestCard.tsx
│   ├── ProgressCounter.tsx
│   ├── ShareCard.tsx
│   ├── SummerCountdown.tsx       # live "summer isn't infinite" hero
│   └── LanguageSwitcher.tsx      # EN / RU toggle
├── lib/
│   ├── supabase.ts               # server client (nullable if no keys)
│   ├── session.ts                # cookie read/write
│   ├── generateQuests.ts         # Sunny persona + validation + fallback
│   ├── summer.ts                 # weekends-left / time-left date math
│   ├── i18n.ts                   # EN / RU strings
│   └── db.ts                     # flat queries; Supabase or in-memory
├── data/
│   └── fallbackQuests.ts
└── supabase/
    └── schema.sql
```

## Deploy

Push to GitHub and import the repo on **Vercel**. Set the three environment variables in the Vercel dashboard, run `schema.sql` in Supabase once, and you're live.

## Roadmap

- **Photo proof** — attach a photo to each completion; your quest log becomes a visual diary of the summer.
- **AI verification** — a vision model confirms the photo matches the quest, turning proof into something earned. (The schema already has `proof_photo_url` and `verification_status` columns waiting.)
- **Friends + shared progress** — add friends, see their quests light up, race the summer together.
- **Grounded suggestions** — pull real local events and weather so quests are things genuinely happening this week, near you.
- **Summer as a mechanic** — finite weekends and live forecasts mean the app schedules the right quest for the right day and re-plans when the weather turns.
