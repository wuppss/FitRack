# FITRACK

A premium, mobile-first fitness tracker PWA: **gym workouts + calories, water and steps**.
Dark OLED-native UI with electric-lime accents, glassmorphism depth and Framer Motion
throughout. Exercises come from **ExerciseDB (RapidAPI)** with animated GIF demonstrations.

Built with **React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · Recharts**.

---

## Features

- **Dashboard** — today's calorie ring, water / steps / weekly-workout progress, weekly activity chart, recent workout.
- **Workouts** — starter templates (Push / Pull / Legs / Full Body), full **exercise library** with search + body-part filters, exercise detail with GIF demo + step-by-step instructions.
- **Active Workout** — live session timer, per-set weight/reps logging, complete-set checkoff, rest timer overlay, add exercises on the fly, completion summary with total volume.
- **Calories** — food logging by meal, macro donut chart, daily progress, recent-foods quick add.
- **Water** — animated bottle fill, quick-add buttons, custom amounts, streaks, weekly chart.
- **Steps** — large progress ring, distance + calories-burned estimates, weekly area chart.
- **History** — 12-week contribution heatmap, session list with volume/duration.
- **Statistics** — estimated 1RM personal records, volume progression line chart, muscle-distribution radar.
- **Profile** — body stats, BMR/TDEE (Mifflin-St Jeor), editable goals, metric/imperial units, ExerciseDB sync + API usage meter, data reset.

Everything is **offline-first** — all your data lives in `localStorage`, and the exercise catalog is cached in **IndexedDB**.

---

## ExerciseDB integration (important)

The exercise library is powered by the [ExerciseDB RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb).
The app is designed around the **Basic (free) plan** limits:

| Limit | Value | How the app respects it |
|-------|-------|-------------------------|
| Requests / month | **690 (hard)** | A monthly request counter is tracked in the app (Profile → Exercise Library). A full catalog sync uses **~130** requests. Sync refuses to run if the budget is exhausted. |
| List page size | **10 exercises max** | The sync pages the catalog **10 at a time**, exactly matching the cap. |
| Rate limit | **1000 / hour** | Requests are gently paced; a single sync is well under the limit. |
| GIF resolution | 180 / 360 / 720 / 1080px | Selectable in Profile → Exercise Library → API key. |

### How it works

The sync **runs in your browser**, not on a server, and only **once**:

1. Open **Profile → Exercise Library → Add Key** and paste your RapidAPI key (it is stored only in your browser).
2. Tap **Sync now**. The app fetches the full ~1,300-exercise catalog (10 per request) and caches it in IndexedDB.
3. After that the whole app runs **offline from the cache** — no further API calls are made.

Until you sync, the app ships with **12 bundled starter exercises** (with full instructions) so every screen works out of the box; their demo GIFs appear once you sync.

### API key configuration

You can provide the key two ways:

- **In-app** (recommended): Profile → Exercise Library → Add Key. Stored in `localStorage` only.
- **Env file**: copy `.env.example` to `.env.local` and set `VITE_RAPIDAPI_KEY`. `.env.local` is git-ignored, so the key is **never committed**.

> The key is used from the client, so treat it as it would appear in any client-side app.
> Because the catalog is cached after one sync, ongoing usage stays near zero.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: add your RapidAPI key here
npm run dev                  # http://localhost:5173
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check only (`tsc --noEmit`) |

### Deploy

It's a static SPA — deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Configure a **SPA fallback** so all routes serve `index.html` (see `public/_redirects` for Netlify/Cloudflare).

---

## Project structure

```
src/
├── components/
│   ├── layout/      TopBar, BottomNav (with center FAB), PageLayout
│   ├── ui/          GlassCard, StatCard, ProgressRing, ActionSheet, Button, Input, …
│   └── ExerciseCard.tsx
├── context/         Profile, Exercise, Workout, Nutrition, Water, Steps providers
├── data/            seedExercises.ts (fallback), templates.ts
├── lib/             exercisedb.ts (API + sync), db.ts (IndexedDB), storage.ts, format.ts
├── pages/           Dashboard, WorkoutHub, ExerciseLibrary, ExerciseDetail,
│                    ActiveWorkout, Calories, Water, Steps, History, Stats, Profile
└── types/           shared TypeScript types
```
