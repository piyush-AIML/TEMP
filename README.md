# Educraft

**Five paths. One learning ecosystem.** — Educraft is a digital education platform unifying five
verticals — linguistics, inclusive education, psychological counseling, AI & digital technologies,
and NEET/JEE preparation — under one trust umbrella.

Next.js 16.3.4 (App Router, Turbopack) · React 19.2.8 · TypeScript 5 · Tailwind CSS v4 · Prisma 7 on
Neon Postgres · Clerk 7 · AWS S3 · zod v4 · Vitest.

## 📚 Documentation

The documentation is a **distributed knowledge base**, filed by *when it loads* rather than by topic.

**Start at [`docs/INDEX.md`](docs/INDEX.md)** — it is the map, and it includes the old → new mapping
for the documents that were split on 2026-09-12.

| Read | For |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | The invariants that apply to every task. Loads automatically — no action needed. |
| [`docs/INDEX.md`](docs/INDEX.md) | Where a given fact lives |
| [`docs/KNOWLEDGE-BASE.md`](docs/KNOWLEDGE-BASE.md) | **Why** the docs are structured this way — read before adding or moving any document |
| [`docs/projects/landing-redesign/state.md`](docs/projects/landing-redesign/state.md) | The active project's current state |

Per-subtree conventions live in `.claude/rules/` and load automatically when you open a matching
file — you do not need to read them by hand.

The root files `EDUCRAFT_PRODUCTION.md`, `TECH-STACK.md`, `ARCHITECTURE_REVIEW.md`, and the two
Dashboard plan documents are now **short pointer stubs**; their content moved into `docs/`. Originals
remain in git history.

## 🚀 Getting Started

**Prerequisites:** Node.js ≥ 20.19.0

```bash
npm install

# dev server (http://localhost:3000)
npm run dev

# the gate — all four must pass before shipping
npx tsc --noEmit && npm run lint && npm run test && npm run build

# serve the production build
npm start
```

**There is no `.env.local` in this repo**, so the app cannot run locally against real data — see
[`docs/platform/verification.md`](docs/platform/verification.md) for what can and cannot be verified
here, and use the `verify` skill before claiming a change works.

## 🌍 Environment Variables

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical production domain (metadata, sitemap, OG images). Falls back to `https://educraft.com` |
| `ENQUIRY_WEBHOOK_URL` | Where enquiries are delivered (CRM/email). Without it, enquiries are appended to `data/enquiries.jsonl` (gitignored) — **see [`docs/architecture/open-questions.md`](docs/architecture/open-questions.md) §3 for why that fallback is unsafe in production** |

Full environment documentation, including Clerk, database and storage variables, is in
[`docs/platform/deployment-env.md`](docs/platform/deployment-env.md).
