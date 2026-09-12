# Technology stack

Every framework, runtime and third-party dependency the app is built on, and the reasoning behind the versions that are pinned.

Versions are as installed (2026-09-05 unless stated); ranges live in `package.json`. One Next.js codebase: a public marketing site (the `(site)` route group) plus an authenticated role-based dashboard at `/dashboard` — see [../architecture/routes.md](../architecture/routes.md).

## Core framework

| Layer | Choice |
|---|---|
| Framework | Next.js **16.3.4** (App Router, Turbopack) — verified with `npx next --version` on 2026-09-12 |
| Language | TypeScript 5 |
| UI | React **19** — deliberately pinned `~19.2.8`, see the pin note below |
| Node requirement | **≥ 20.19.0** (`package.json` `engines`) — see the note below on the two floors |

> **Two version records merged here.** The production document's §3 gives Next.js **16.3.1**; the root `TECH-STACK.md` records **16.3.4** as installed on 2026-09-05, which is the value in the tree. Both are retained — treat 16.3.4 as the as-installed figure. The Node floor likewise has two sources: **≥ 20.9** is Next.js's own `engines` floor, while this repo's `package.json` declares `engines: { "node": ">=20.19.0" }`.

> **Why React is pinned to 19.2.x:** `@react-three/fiber` 9.7.0 (the latest release) declares `peer react: ">=19 <19.3"`. React 19.3.0 is published, but R3F has not widened that range yet, so `^19.0.0` resolves to 19.3.0 and fails with `ERESOLVE`. The `~19.2.8` pin keeps installs resolving; relax it once R3F ships a release allowing 19.3. `@types/react*` are pinned to the matching 19.2.x line.
>
> ***(approved 2026-09-12)* This pin is scheduled for removal.** The redesign retires R3F entirely, at which point `react`/`react-dom` return to `^19` and `@types/react*` unpin. Do it in the same pass that removes `three` — and remember `package-lock.json` must be regenerated, not hand-edited.

**Node floor note (full version):** ≥ 20.9 for the app. The Prisma 7 CLI pulls `@prisma/streams-local` (requires ≥ 22), so `npm install` prints a harmless `EBADENGINE` warning on Node 20. AWS SDK v3 will require ≥ 22 from Jan 2027.

## Frontend

| Layer | Choice |
|---|---|
| Styling | Tailwind CSS **4** (`@theme inline` CSS vars, art-directed light/dark; `@tailwindcss/postcss`) — the dynamic-class constraint applies, see [../architecture/layering.md](../architecture/layering.md) and [../design/system.md](../design/system.md) |
| Theming | next-themes (`enableSystem={false}`, `defaultTheme='light'`, localStorage persistence) |
| Icons | lucide-react |
| Fonts | Sora 600/700 (display) · Manrope 400/500/600 (body), both via `next/font` |
| Utilities | clsx + tailwind-merge, tw-animate-css |
| Calendar UI | react-big-calendar **1.20** — dashboard meetings + schedule calendar |
| Dates | date-fns **4.4** — RBC `dateFnsLocalizer` (named imports only; v3/v4 `exports` maps reject v2-style deep imports) |

## Data & validation

| Layer | Choice |
|---|---|
| Validation | zod **4** (note the API differences from v3 — see [../architecture/layering.md](../architecture/layering.md)) |
| State | RSC + Server Actions; React `cache()`; polling for notifications (no websockets) |

## Auth & identity

| Layer | Choice |
|---|---|
| Auth | **Clerk 7.9** (`@clerk/nextjs`) — roles via `publicMetadata` (`student`/`professor`/`admin`), read server-side via `clerkClient()`; auth boundary in `src/proxy.ts` |

Notes that shape the code: `clerkClient()` is **async** (`await clerkClient()`); the auth file is `src/proxy.ts` because Next 16 deprecated the `middleware.ts` filename; `createRouteMatcher` is deprecated in v7 (role layouts' `requireRole()` already gives resource-based checks, so the matcher only gates signed-out redirects). `auth()` **throws** on routes the proxy matcher doesn't cover — keep the matcher aligned with real routes.

## Database & ORM

| Layer | Choice |
|---|---|
| Database | **PostgreSQL on Neon** — `DATABASE_URL` is a single Neon **direct** (non-pooled) URL |
| ORM | **Prisma 7.10** (`prisma-client` generator emitting to `src/generated/prisma`, gitignored; regenerate via `npm run db:generate`). CLI config is `prisma7.config.ts`, which loads `.env.local` via dotenv. **Driver adapter required** → `@prisma/adapter-neon` + `ws` (Node < 22 has no global `WebSocket`), wired once in `src/lib/prisma-client.ts` |

## File storage

| Layer | Choice |
|---|---|
| Storage | **AWS S3** (`@aws-sdk/client-s3` + `s3-request-presigner`) — private bucket, presigned PUT/GET, keys under `materials/*` |
| Abstraction | Provider-agnostic `src/lib/storage/` `StorageProvider` interface (was UploadThing — swapped 2026-09-05; client uploads never route through our server) |

Full setup, env vars and the UploadThing blocker are in [deployment-env.md](deployment-env.md).

## Visuals & motion

> **⚠️ Changing — approved 2026-09-12 for the Landing Redesign.** The rows marked *(approved)* are **not installed yet**; they land with that work. The "no GSAP" rule and the "no new library" constraint were explicitly lifted by the owner — see the supersession record at the end of this file and [../projects/landing-redesign/spec.md](../projects/landing-redesign/spec.md).

| Layer | Choice |
|---|---|
| 3D | **Being retired** — Three **0.185** + React Three Fiber **9.7** + Drei **10.7** is currently the single coordinated WebGL scene, but its whole `three/` tree is reachable **only** from `landing/Hero.tsx`. The redesign retires the orbit scene and uninstalls `three` / `@react-three/fiber` / `@react-three/drei` / `@types/three`, and with it the React `~19.2.8` pin |
| Motion | Currently hand-rolled hooks (`useScrollProgress`, `useReveal`, `useParallax`…), **no GSAP**. ***(approved)* Stack for the redesign: GSAP 3.15 + ScrollTrigger + `@gsap/react`, plus Motion 13.2** — GSAP owns anything scrubbed or pinned, Motion owns anything discrete; never both on the same property of the same element. Registration lives only in `src/lib/gsap.ts` |
| Components | Currently hand-rolled `components/educraft/ui/`. ***(approved)* shadcn/ui adopted for behaviour primitives only** (Dialog, Accordion, Tabs, Popover/Tooltip) in `components/ui/`; shadcn supplies behaviour, never look. It inherits the Educraft palette for free because `globals.css` already defines the full shadcn variable contract and `components.json` is already configured. `react-hook-form` deliberately **not** adopted |
| Illustration | Inline SVG systems (paths/nodes/constellations) — **kept and promoted**; the redesign unifies the page on this "drawn path" language, which the metaphor table in [overview.md](overview.md) already lists first |

## Services & deployment

| Service | Use |
|---|---|
| **Vercel** | Hosting (staging preview `temp-tau-opal.vercel.app`; production domain unset — see [blockers.md](blockers.md)) |
| **Neon** | Managed Postgres |
| **Clerk** | Authentication (accounts created via the in-app invite flow, invite-only) |
| **AWS S3** | Course-material files (bucket `educraftbucket07`, `ap-southeast-2`) |
| **Enquiry pipeline** | `POST /api/enquiry` → optional webhook + local JSONL log (no CRM wired yet) — see [security.md](security.md) and [../surfaces/enquiry.md](../surfaces/enquiry.md) |

## Key environment variables

`NEXT_PUBLIC_SITE_URL` · `ENQUIRY_WEBHOOK_URL` (optional) · `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` · `DATABASE_URL` · `STORAGE_PROVIDER` + `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`.

Every variable's purpose, defaults and loading behaviour is documented in [deployment-env.md](deployment-env.md); the template is the root `.env.example`.

## Tooling

ESLint 9 (`eslint-config-next`) · TypeScript · Prisma CLI (migrate/seed/studio) · `tsx` scripts (`db:storage-smoke`, seed) · Sharp (image processing).

Test tooling: **Vitest** (unit tests over pure functions) + **Playwright** (E2E, planned).

- ***(approved 2026-09-12)* Vitest arrives early**, with the Landing Redesign rather than Dashboard Stage 5. Rationale: the assistant never launches a browser (see [verification.md](verification.md)), so the redesign's scroll geometry and palette contrast are **encoded as pure functions with tests** — `stationPositions(N)`, `perStationVh(N)`, `pathFor`, `drawAt`, `assertContinuity`, and the AA contrast check over the token table — because those are exactly the things that can be verified without a DOM. Playwright remains Stage 5 work.
- **Superseded line, kept as a record:** *"No test suite yet (Vitest + Playwright planned, Dashboard Stage 5)."* Vitest has since arrived early as approved above — `vitest.config.mts` exists, `npm test` runs `vitest run`, and test files live beside their subjects under `src/**/*.test.ts`. Playwright remains Dashboard Stage 5 work.

## Approved dependency changes (Landing Redesign)

| Action | Package |
|---|---|
| add | `gsap` 3.15 + `@gsap/react` (ScrollTrigger free under the standard license since 3.13) |
| add | `motion` 13.2 (peer `react ^18 \|\| ^19` — compatible with the current pin) |
| add | shadcn deps (`@radix-ui/*` per component, `class-variance-authority`) |
| add (dev) | `vitest` |
| **remove** | `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` |
| **relax** | `react`/`react-dom` `~19.2.8` → `^19` — **only after** R3F is gone |

Net: removing R3F is a JS win on the landing page even after adding GSAP + Motion, because the hero currently ships a `dynamic({ ssr: false })` WebGL bundle.

**`TECH-STACK.md` must be updated in the same pass** — post-migration that means **this file**: its "Motion: hand-rolled hooks, no GSAP" row and its React-pin rationale both become wrong once this work lands.

## Supersession record (owner-granted 2026-09-12)

The owner explicitly lifted the constraints that would block this work, with the sole condition that **the website must not break**.

| Superseded / overridden | Where | Replacement |
|---|---|---|
| "Motion: hand-rolled hooks, no GSAP" | the root `TECH-STACK.md` §Visuals & motion | GSAP 3.15 + Motion 13.2 |
| "no new framework / no new library" | the dashboard project plan (§24.5, §24.3) | Lifted for the landing redesign (shadcn, GSAP, Motion, Vitest) |
| §10 WebGL / Graphics Architecture | the production document | Retired; `three/` tree removed |
| §11 Motion / Interaction Architecture | the production document | GSAP + Motion on the marketing surface; the hooks survive in the dashboard |
| §18 rule 4 (R3F `useFrame` / `react-hooks/immutability`) | the production document | GSAP-owned properties must not be shared with Motion — carried in [verification.md](verification.md) |
| §18 rule 7 (`THREE.Clock` warning) | the production document | Obsolete — R3F retired — carried in [verification.md](verification.md) |
| Dashboard roadmap Tier D item 20 (adopt the R3F patch) | the background roadmap | Obsolete — R3F retired |
| `components.json` "install shadcn or keep hand-rolling" open decision | the dashboard project plan | Decided: shadcn for behaviour only |
