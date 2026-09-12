# Educraft — Tech Stack

One Next.js codebase: a public marketing site (`(site)` route group) + an authenticated role-based dashboard (`/dashboard` for students & professors). Versions are as installed (2026-09-05) — see `package.json` for ranges and `EDUCRAFT_PRODUCTION.md` for the full architecture.

## Core framework

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.3.4** (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19.2.8 — deliberately pinned `~19.2.8`, see note below |
| Node requirement | ≥ 20.9 for the app. The Prisma 7 CLI pulls `@prisma/streams-local` (requires ≥ 22), so `npm install` prints a harmless `EBADENGINE` warning on Node 20. AWS SDK v3 will require ≥ 22 from Jan 2027. |

> **Why React is pinned to 19.2.x:** `@react-three/fiber` 9.7.0 (the latest release) declares `peer react: ">=19 <19.3"`. React 19.3.0 is published, but R3F has not widened that range yet, so `^19.0.0` resolves to 19.3.0 and fails with `ERESOLVE`. The `~19.2.8` pin keeps installs resolving; relax it once R3F ships a release allowing 19.3. `@types/react*` are pinned to the matching 19.2.x line.
>
> ***(approved 2026-09-12)* This pin is scheduled for removal.** The redesign retires R3F entirely, at which point `react`/`react-dom` return to `^19` and `@types/react*` unpin. Do it in the same pass that removes `three` — and remember `package-lock.json` must be regenerated, not hand-edited.

## Frontend

| Layer | Choice |
|---|---|
| Styling | Tailwind CSS 4 (`@theme inline` CSS vars, art-directed light/dark) |
| Theming | next-themes (light default, localStorage persistence) |
| Icons | lucide-react |
| Fonts | Sora (display) · Manrope (body) via `next/font` |
| Utility | clsx + tailwind-merge, tw-animate-css |

## Visuals & motion

> **⚠️ Changing — approved 2026-09-12 for the Landing Redesign.** See `EDUCRAFT_PRODUCTION.md` §26 and [`Landing-Redesign-Plan.md`](Landing-Redesign-Plan.md). The rows below marked *(approved)* are **not installed yet**; they land with that work. The "no GSAP" rule and the "no new library" constraint were explicitly lifted by the owner.

| Layer | Choice |
|---|---|
| 3D | **Being retired** — Three 0.185 + R3F 9.7 + Drei 10.7 is currently the single coordinated WebGL scene, but its whole `three/` tree is reachable **only** from `landing/Hero.tsx`. The redesign retires the orbit scene and uninstalls `three` / `@react-three/fiber` / `@react-three/drei` / `@types/three` |
| Motion | Currently hand-rolled hooks (`useScrollProgress`, `useReveal`, `useParallax`…), **no GSAP**. ***(approved)* Stack for the redesign: GSAP 3.15 + ScrollTrigger + `@gsap/react`, plus Motion 13.2** — GSAP owns anything scrubbed or pinned, Motion owns anything discrete; never both on the same property of the same element. Registration lives only in `src/lib/gsap.ts` |
| Components | Currently hand-rolled `components/educraft/ui/`. ***(approved)* shadcn/ui adopted for behaviour primitives only** (Dialog, Accordion, Tabs, Popover/Tooltip) in `components/ui/`; shadcn supplies behaviour, never look. `react-hook-form` deliberately not adopted |
| Illustration | Inline SVG systems (paths/nodes/constellations) — **kept and promoted**; the redesign unifies the page on this "drawn path" language, which §1's metaphor table already lists first |

## Data & validation

| Layer | Choice |
|---|---|
| Validation | zod 4 |
| State | RSC + Server Actions; React `cache()`; polling for notifications (no websockets) |

## Auth & identity

| Layer | Choice |
|---|---|
| Auth | **Clerk 7.9** (`@clerk/nextjs`) — roles via `publicMetadata` (`student`/`professor`/`admin`), read server-side via `clerkClient()`; auth boundary in `src/proxy.ts` |

## Database & ORM

| Layer | Choice |
|---|---|
| Database | **PostgreSQL on Neon** (direct connection URL) |
| ORM | **Prisma 7.10** (`prisma-client` → `src/generated/prisma`, gitignored; driver adapter `@prisma/adapter-neon` + `ws`) |

## File storage

| Layer | Choice |
|---|---|
| Storage | **AWS S3** (`@aws-sdk/client-s3` + `s3-request-presigner`) — private bucket, presigned PUT/GET, keys under `materials/*` |
| Abstraction | Provider-agnostic `src/lib/storage/` `StorageProvider` interface (was UploadThing — swapped 2026-09-05; files never route through our server) |

## Services & deployment

| Service | Use |
|---|---|
| **Vercel** | Hosting (staging preview `temp-tau-opal.vercel.app`; production domain unset) |
| **Neon** | Managed Postgres |
| **Clerk** | Authentication (accounts created in dashboard, invite-only) |
| **AWS S3** | Course-material files (bucket `educraftbucket07`, `ap-southeast-2`) |
| **Enquiry pipeline** | `POST /api/enquiry` → optional webhook + local JSONL log (no CRM wired yet) |

## Key environment variables

`NEXT_PUBLIC_SITE_URL` · `ENQUIRY_WEBHOOK_URL` (optional) · `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` · `DATABASE_URL` · `STORAGE_PROVIDER` + `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` — full docs in `.env.example` and `EDUCRAFT_PRODUCTION.md` §21 / §24.9.

## Tooling

ESLint 9 (`eslint-config-next`) · TypeScript · Prisma CLI (migrate/seed/studio) · `tsx` scripts (`db:storage-smoke`, seed) · Sharp (image processing). No test suite yet (Vitest + Playwright planned, Dashboard Stage 5).

***(approved 2026-09-12)* Vitest arrives early**, with the Landing Redesign rather than Dashboard Stage 5. Rationale: the assistant never launches a browser (see `EDUCRAFT_PRODUCTION.md` §20), so the redesign's scroll geometry and palette contrast are **encoded as pure functions with tests** — `stationPositions(N)`, `perStationVh(N)`, `pathFor`, `drawAt`, `assertContinuity`, and the AA contrast check over the token table — because those are exactly the things that can be verified without a DOM. Playwright remains Stage 5 work.
