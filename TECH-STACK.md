# Educraft — Tech Stack

One Next.js codebase: a public marketing site (`(site)` route group) + an authenticated role-based dashboard (`/dashboard` for students & professors). Versions are as installed (2026-09-05) — see `package.json` for ranges and `EDUCRAFT_MASTER_SYSTEM.md` (§3–§8) for the full architecture.

## Core framework

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.3.1** (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19 |
| Node requirement | ≥ 20.9 (AWS SDK v3 will require ≥ 22 from Jan 2027) |

## Frontend

| Layer | Choice |
|---|---|
| Styling | Tailwind CSS 4 (`@theme inline` CSS vars, art-directed light/dark) |
| Theming | next-themes (light default, localStorage persistence) |
| Icons | lucide-react |
| Fonts | Sora (display) · Manrope (body) via `next/font` |
| Utility | clsx + tailwind-merge, tw-animate-css |

## Visuals & motion

| Layer | Choice |
|---|---|
| 3D | Three 0.185 + React Three Fiber 9.7 + Drei 10.7 (single coordinated WebGL scene) |
| Motion | Hand-rolled hooks (`useScrollProgress`, `useReveal`, `useParallax`…), no GSAP |
| Illustration | Inline SVG systems (paths/nodes/constellations) |

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

`NEXT_PUBLIC_SITE_URL` · `ENQUIRY_WEBHOOK_URL` (optional) · `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` · `DATABASE_URL` · `STORAGE_PROVIDER` + `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` — full docs in `.env.example` and `EDUCRAFT_MASTER_SYSTEM.md` §8.

## Tooling

ESLint 9 (`eslint-config-next`) · TypeScript · Prisma CLI (migrate/seed/studio) · `tsx` scripts (`db:storage-smoke`, seed) · Sharp (image processing). No test suite yet (Vitest + Playwright planned, Dashboard Stage 5).
