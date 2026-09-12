---
paths:
  - "prisma/**"
  - "*.config.*"
  - "package.json"
  - ".env.example"
  - "src/proxy.ts"
  - "src/lib/prisma-client.ts"
---

# Platform, tooling and environment

Build configuration, database, auth boundary and environment. Detail in
[`docs/platform/deployment-env.md`](../../docs/platform/deployment-env.md) and
[`docs/platform/stack.md`](../../docs/platform/stack.md).

## There is no local database

**There is no `.env.local` in this repo**, so the app cannot run locally against real data:
`createPrismaClient()` throws without `DATABASE_URL`, and the dashboard needs Clerk keys too.
Consequences:

- The **only** automated safety net is `npx tsc --noEmit && npm run lint && npm run test && npm run build`.
- **Runtime and visual QA belong to the owner.** Do not try to boot the app or curl it; do not
  launch a browser.
- Encode anything visual or scroll-sensitive as **pure functions with tests** — that is the only
  verification available. See the `verify` skill.

## Environment loading

`prisma7.config.ts` loads `.env.local` explicitly (`dotenv/config` only reads `.env`, which this
repo deliberately does not use) so the Prisma CLI sees `DATABASE_URL`. Next.js loads `.env.local`
natively for the runtime. **The dev server reads env at boot — restart it after changing env.**

## Prisma 7

- The client is generated to `src/generated/prisma` and is **gitignored build output**, regenerated
  by `prisma generate` (which `npm run build` runs first).
- A **driver adapter is required** — `@prisma/adapter-neon` plus `ws`, wired once in
  `src/lib/prisma-client.ts`. Node < 22 has no global `WebSocket`, so `ws` supplies one.
- `DATABASE_URL` is a single Neon **direct** (non-pooled) connection string.
- The generated client is excluded from ESLint via `src/generated/**` in `eslint.config.mjs` — its own
  disable-directive headers trip ESLint 9's config-level `reportUnusedDisableDirectives`, which no
  rule setting can silence.

## The two operational rules that have already cost time

1. **Never `rm -rf .next` while a dev server is running.** A dev server whose `.next` is deleted
   loses route registrations and serves 404s for existing dynamic routes until restarted. Wipes
   belong in a turn with no dev server live — when in doubt, ask the owner to restart.
2. **After deleting or renaming files, wipe `.next` before typechecking** — stale `.next/types`
   references deleted files and produces phantom `tsc` errors. Order: `rm -rf .next && npx tsc
   --noEmit && npm run build`, and only with no dev server up.

## The auth boundary

`src/proxy.ts` is the middleware (Next 16 renamed the file — `middleware.ts` is deprecated). Its
`matcher` must cover every route where `auth()` is called, because Clerk v7's `auth()` **throws** on
uncovered routes. It is deliberately scoped to `/dashboard` and `/api/dashboard` only: the marketing
site must stay Clerk-free.

## Runtime floors

- App: **Node ≥ 20.19.0** (raised from 20.9 — `vite@8`, pulled in by Vitest, requires
  `^20.19.0 || >=22.12.0`, so the declared floor must run the declared toolchain).
- The Prisma 7 CLI pulls `@prisma/streams-local` (requires ≥ 22), so `npm install` prints a
  harmless `EBADENGINE` warning on Node 20.
- AWS SDK v3 will require ≥ 22 from Jan 2027.
