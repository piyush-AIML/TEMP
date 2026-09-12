# Educraft

**Five paths. One learning ecosystem.** — Educraft is a digital education platform unifying five verticals — linguistics, inclusive education, psychological counseling, AI & digital technologies, and NEET/JEE preparation — under one trust umbrella.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Three.js + React Three Fiber + Drei · lucide-react · next-themes · zod v4.

## 📚 Documentation

**[`EDUCRAFT_PRODUCTION.md`](EDUCRAFT_PRODUCTION.md) is the master document** — current production state, architecture, conventions, design system, fixed-bug ledger, pending inputs, the background roadmap, and the active implementation project. Read it first; it is kept in sync with the code and **§26 records which of its own sections are superseded**.

Companion documents (the master doc's §§24 and 26 are the synced master-side references for these):

| Document | Covers |
|---|---|
| [`Landing-Redesign-Plan.md`](Landing-Redesign-Plan.md) | **Active project** — the "One Line" homepage redesign: 5 acts, GSAP + Motion, palette v2, pillar extensibility |
| [`Dashboard-Implementation-Plan.md`](Dashboard-Implementation-Plan.md) | The Student & Professor Dashboard (Stages 0–4 shipped; Stage 5 QA & Deploy open) |
| [`TECH-STACK.md`](TECH-STACK.md) | Installed versions, plus the approved-but-not-yet-installed stack for the redesign |

## 🚀 Getting Started

**Prerequisites:** Node.js ≥ 20.9

```bash
npm install

# dev server (http://localhost:3000)
npm run dev

# verification loop — all three must pass before shipping
npm run lint
npx tsc --noEmit
npm run build

# serve the production build
npm start
```

## 🌍 Environment Variables

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical production domain (metadata, sitemap, OG images). Falls back to `https://educraft.com` |
| `ENQUIRY_WEBHOOK_URL` | Where enquiries are delivered (CRM/email). Without it, enquiries are appended to `data/enquiries.jsonl` (gitignored) |

The site is fully static except `POST /api/enquiry` — any Next.js host works; on Vercel import the repo, set the env vars, deploy.
