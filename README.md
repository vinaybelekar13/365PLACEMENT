# ProjectProg

A minimal, monochrome challenge and productivity tracker. Track any challenge
— any name, any duration — with skill-based and general tasks, goals, notes,
a LeetCode counter, and a permanent history of every challenge you complete.

Built with Next.js (App Router), Prisma, and Postgres.

## Getting started

```bash
npm install
npx prisma migrate deploy   # applies the ProjectProg schema
npm run db:seed             # creates the Note/LeetCodeStats singletons + default categories
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with your admin
password (`ADMIN_PASSWORD` in `.env`) to create a challenge and start editing.

Environment variables needed (see `.env` / `.env.example`):

- `DATABASE_URL` — pooled Postgres connection string
- `DIRECT_URL` — direct (non-pooled) Postgres connection string, used by migrations
- `ADMIN_PASSWORD` — the single admin password gating all writes

## Data model

One `Challenge` is active at a time. It owns `ChallengeDay` rows (one per
day of the challenge), which own `Task` rows. A task is either:

- **skill** — tied to a user-defined `Skill`, counts toward that skill's progress
- **general** — tied to a free-form `GeneralCategory`, never counts toward any skill

`Skill`, `GeneralCategory`, and `Goal` are all fully user-managed — there is
no fixed built-in list of skills, categories, or roles.

When a challenge is completed, its entire state (every day, every task, every
date, every completion) is copied into `ChallengeHistory` / `ChallengeHistoryDay`
/ `ChallengeHistoryTask` — denormalized and immutable — and the live challenge
is deleted. Nothing you complete is ever lost; it moves to `/history`.

## Data reset

This version intentionally starts with a clean database: the migration in
`prisma/migrations/20260812000000_projectprog` drops the old
Placement365-era tables (`Day`, `Topic`, `Role`, `RoleTopic`, `SyllabusNode`,
`GlobalNote`) entirely. Everything from this point forward — every challenge
you create and complete — is preserved permanently in Challenge History.

## What changed from Placement365

- Renamed to **ProjectProg**; every fixed 365-day assumption is gone —
  challenges can be any length.
- Removed: Syllabus (page, nav, API, models), Role-wise Preparation,
  Streaks, and the built-in Aptitude skill.
- Added: arbitrary-duration Challenges (create / extend / reduce / complete),
  a permanent Challenge History with full day-by-day activity, user-defined
  Skills and General Categories, a Goals panel, and a Tasks Left panel.
- Kept (same UI/behavior, adapted data model): Day Card, Heatmap, Notes,
  LeetCode Tracker, admin login, light/dark theme.
