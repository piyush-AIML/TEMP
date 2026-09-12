# Dashboard — state

Last updated: 2026-09-12 · plan [`plan.md`](plan.md) · stage guide [`stages-2-5.md`](stages-2-5.md)

## 1. Where we are

**Stages 0–4 shipped; the course-setup slice shipped and was reworked. Stage 5 (QA & Deploy) is the
only stage left, and it is deferred** — the owner sequenced the landing redesign first (2026-09-12).

| Stage | State |
|---|---|
| 0 — Foundations | shipped 2026-09-04 |
| 1 — Student Core | shipped 2026-09-04 |
| 2 — Professor Core | shipped 2026-09-05 |
| 3 — Meetings & Planner | shipped 2026-09-05 |
| 4 — Polish | shipped 2026-09-05 |
| Course-setup slice | shipped 2026-09-05 (`6f91f33`), reworked the same day → `29c96a6` `Prod-version:0.1.3` |
| 5 — QA & Deploy | **open — deferred** |
| 6 — Backlog | not started (realtime push, parent view, attendance, gradebook, calendar sync, admin console) |

## 2. Immediate next action

Start Stage 5 (`## STAGE 5 — QA & Deploy` in [`stages-2-5.md`](stages-2-5.md)), once the owner
sequences it: dev-dep installs → **reconcile `vitest.config.mts`** (below) → Vitest unit specs
(`format`, `validators`, `notifications-builder`, `pillar`, `storage`) → opt-in integration spec
(`tests/integration/course-loop.test.ts` against `TEST_DATABASE_URL`) → Playwright (`setup` project
with `clerkSetup()` in the project file, `auth.setup.ts`, storageState gitignored; runs are
user-authorized) → deploy checklist (Vercel env vars + `npx prisma migrate deploy`).

## 3. Blocked

Nothing is blocked technically — the stage is deferred by the owner's sequencing, and the landing
redesign was sequenced ahead of it. Waiting on the owner: the item-by-item browser E2E checklists for
Stages 3–5 (calendar, prefs, drawer, invite flow, the course-setup rework); live-deploy claims — the
preview `temp-tau-opal.vercel.app` was last verified running `6f91f33`, and whether `29c96a6` is
deployed has not been re-verified; the production domain (`NEXT_PUBLIC_SITE_URL` still unset —
[`platform/blockers.md`](../../platform/blockers.md)); a Clerk verified sending domain before launch
(invitations currently land in spam).

## 4. Do not get wrong

- **Do not rebuild the test harness.** Landing-redesign Stage 1 already installed **Vitest 4** plus a `vitest.config.mts` (node env, `@/` alias, `include: ['src/**/*.test.ts']`) and the `test` script. Stage 5's guide predates that: its `vitest@^5` pin, jsdom default, `@vitejs/plugin-react` and `'server-only'` stub alias must be reconciled **onto** the existing config — including widening `include` for a `tests/**` tree. The guide's inline status snapshots are pre-execution; this file is the status record.
- **`getCurrentUser`'s mirror upsert must never touch `notifPrefs`** (read-modify-write hazard).
- **IST wall-time contract:** `<input type="datetime-local">` values are IST wall times — regex-checked, compared lexicographically, converted with `istWallTimeToUtc`; display derives IST through `Intl.formatToParts`, never UTC `Date` getters.
- **The completion monitor counts live `Task.status`, never `CompletionLog`** — the log is a write-through ledger, and reading it is the drift trap.
- Stage 5 ships no product surface, and this project never touches the marketing site; the landing redesign never touches `src/app/dashboard/**` or `src/components/dashboard/**`.
