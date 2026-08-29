# Educraft

**Five paths. One learning ecosystem.** — Educraft is a digital education platform unifying linguistics, inclusive education, psychological counseling, AI & digital technologies, and NEET/JEE preparation under one trust umbrella.

**Current version:** V2 production (`Prod.ver-0.0.2`) — 16 pages + enquiry API, fully art-directed light/dark theme system, scroll-choreographed WebGL/SVG experience.

## 📚 Project documentation

Read the docs in this order — they are kept in sync with the code and with each other:

| Doc | Purpose |
|---|---|
| [`prod.md`](prod.md) | **Current state** — the single source of truth: architecture, design system, feature inventory, fixed-bug ledger, pending inputs |
| [`Educraft_V3_Next_Version_Planner.md`](Educraft_V3_Next_Version_Planner.md) | **Next version planner** — all future work, tiered A–D |
| [`Educraft_V1_Previous_State.md`](Educraft_V1_Previous_State.md) | **Previous state** — the compact V1 record |
| [`Educraft_V2_Experience_Web_Design_Implementation_Plan.md`](Educraft_V2_Experience_Web_Design_Implementation_Plan.md) | ✅ **Archived** — the V2 design plan, fully implemented. Historical reference only; do not plan from it |

## 🛠 Tech Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Three.js + React Three Fiber + Drei · lucide-react · next-themes · zod v4

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

The site is fully static except `/api/enquiry`, so no env vars are required to run it:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical production domain (metadata, sitemap, OG images). Falls back to `https://educraft.com` |
| `ENQUIRY_WEBHOOK_URL` | Where enquiries are delivered (CRM/email). Without it, enquiries are appended to `data/enquiries.jsonl` (gitignored) |

## ▲ Deploying

Any Next.js host works. The site builds to 29 static routes plus one serverless API route (`/api/enquiry`). On Vercel: import the repo, set the env vars above, deploy.

---

See `prod.md` §9 for the pending pre-launch inputs (real testimonials, business details, social handles).
