# Educraft

A global digital education platform. One Next.js 16 codebase with two deliberately isolated halves:
a **public marketing site** in the `(site)` route group, and an **authenticated, role-based
dashboard** at `/dashboard` for students, professors and admins. Five subject verticals —
linguistics, inclusive education, wellbeing & counselling, AI & digital technology, and NEET/JEE
preparation — presented as one connected ecosystem.

**The five pillars** (Learn · Include · Thrive · Achieve · Excel) are the structural and visual
metaphor for the whole product, not five unrelated offerings.

## The gate

```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```

All four must pass before claiming anything works. `npm run build` runs `prisma generate && next
build` and takes a minute or more. For the full picture of what this gate does and does **not**
cover, use the `verify` skill.

**After renaming or deleting files**, `rm -rf .next` first — stale `.next/types` produces phantom
type errors. Only with no dev server running; a dev server whose `.next` is deleted serves 404s
until restarted.

## There is no local database

**There is no `.env.local` in this repo.** `createPrismaClient()` throws without `DATABASE_URL`, and
the dashboard needs Clerk keys. So:

- The gate above is the **only** automated safety net.
- **Runtime and visual QA belong to the owner.** Never launch a browser or curl the site.
- Encode anything visual or scroll-sensitive as **pure functions with tests** — that is the only
  verification available. Contrast ratios and scroll geometry are both done this way already.

## Where to look — don't read everything

`docs/INDEX.md` is the map. Start there.

| I need to… | Go to |
|---|---|
| Understand the doc structure, or add/move a doc | `docs/KNOWLEDGE-BASE.md` — read this **before** restructuring anything |
| Know what is being worked on and what's next | `docs/projects/<project>/state.md` |
| Know what's blocked or unverified | `docs/platform/blockers.md` |
| Find where a fact lives | `docs/INDEX.md` — includes the old→new migration map |

Per-subtree conventions are **not** here — they load automatically from `.claude/rules/` when you
open a matching file. Current rules: `marketing-site`, `dashboard`, `design-tokens`, `lib-layers`,
`platform`.

## Working agreements

1. **Never start the next stage of a project without being asked.** Finish what was requested,
   report, and stop. The owner sequences the work.
2. **Branch before implementing.** `main` is the default branch; feature work goes on a branch.
3. **Commit only when asked**, and stage files explicitly rather than `git add -A`. There is often
   unrelated work in the tree.
4. **When a stage closes, move its plan** out of the live plans directory into
   `docs/projects/<project>/stages/`, and update `state.md`. A finished plan left live costs tokens
   on every future session. See `docs/KNOWLEDGE-BASE.md` §7.
5. **Record every non-obvious decision** as an ADR in `docs/decisions/` with what it cost if wrong.
   Decisions recorded only in scratch are decisions made in secret.

## The one architectural rule most likely to bite

**Never put `overflow-hidden` on an ancestor of a sticky or pinned section.** An ancestor with
`overflow: hidden` becomes the sticky element's scroll box and silently breaks the pinning. Put
overflow handling on the sticky *inner* element only.

Two more that have cost real time:

- **Route groups never contribute URL segments.** `(site)/about/page.tsx` serves `/about`. To own a
  URL prefix you need a real folder — that is why the dashboard is `src/app/dashboard/`.
- **`src/design/colors.ts` and `src/app/globals.css` must carry identical hex values.** The first is
  the test source, the second is what paints. A value in only one file passes the entire suite and
  renders nothing. This has shipped broken once already.

## Stack, in one line each

Next.js 16.3.4 (App Router, Turbopack) · React 19.2.8 *(pinned for `@react-three/fiber`, scheduled
for removal)* · TypeScript 5 · Tailwind 4 · zod 4 · Prisma 7 on Neon Postgres · Clerk 7 for auth ·
AWS S3 for course materials · Vitest for tests · Node ≥ 20.19.0.
[`docs/platform/stack.md`](docs/platform/stack.md) has the reasons.

## Current state

Two projects. The **landing redesign** is active; the **dashboard** is complete through Stage 4 with
Stage 5 (QA & Deploy) open. The `SessionStart` hook prints the current branch, active project and
next task — check it rather than guessing.
