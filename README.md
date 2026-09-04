# Educraft

**Five paths. One learning ecosystem.** — Educraft is a digital education platform unifying five verticals — linguistics, inclusive education, psychological counseling, AI & digital technologies, and NEET/JEE preparation — under one trust umbrella.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Three.js + React Three Fiber + Drei · lucide-react · next-themes · zod v4.

## 📚 Documentation

**[`EDUCRAFT_PRODUCTION.md`](EDUCRAFT_PRODUCTION.md) is the master document** — current production state, architecture, conventions, design system, fixed-bug ledger, pending inputs, the background roadmap, and the next implementation project (Student & Professor Dashboard). Read it first; it supersedes all other documentation and is kept in sync with the code. There are no other design/plan documents in this repo.

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
