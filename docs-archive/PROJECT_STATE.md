# Educraft — Project State (sub-state file)

**Purpose:** the rolling state layer of the document system — one of a possible set of sub-state files that revolve around [`EDUCRAFT_PRODUCTION.md`](EDUCRAFT_PRODUCTION.md) (read it fully first; the governance rules live in its §0, incl. the living-docs registry). This file holds what is true **right now** and what to do **next**: live snapshot, per-track status, open owner checks, session checklist.

**Update rule (governance R1 — master-first):** when new information arrives (commit, deploy, decision, completed check, correction, rule change), it is recorded in the master **first**, then this file is synced from it. On any disagreement the master wins and this file is corrected. Routine local ticks that change no fact may go straight into this file, but never in a way that contradicts the master. Further sub-state files may be created when topics outgrow this one (governance R2 — each links back to the master and to siblings).

**Created 2026-09-07** during the two-doc consolidation: all seven other project docs (`AGENT_CONTEXT.md`, `ARCHITECTURE_REVIEW.md`, `Dashboard-Implementation-Plan.md`, `Dashboard-Stages-2-5-Implementation-Plan.md`, `UI-UX UPGRADE.md`, `landing_page_redesign_agent_prompt.md`, `site_sections_ui_upgrade_agent_prompt.md`) were fully absorbed into the master (§24.10, §26, §27, §28) and deleted. `README.md` + `TECH-STACK.md` untouched.

---

## 1. Live snapshot (2026-09-07)

| Field | Value |
|---|---|
| Code version | `Prod-version:0.1.3` — commit **`29c96a6` "Course Allocation & Student Enrollment Rework"** on `main` (0.1.2 = `6f91f33` Course Allocation; `7276481` Minor UI changes; marketing baseline `Prod.ver-0.1.0`) |
| Working tree | Master + this file updated by the 2026-09-07 doc consolidation (uncommitted — owner handles git); no code changes in that pass |
| Last verification | lint ✓ · tsc ✓ · build ✓ at 0.1.3 (2026-09-05). **No run since — re-run before any ship** |
| Live deploy | `https://temp-tau-opal.vercel.app` — running 0.1.3 since 2026-09-05, owner-verified working after deploy. Production domain unset (§4) |
| Demo accounts | owner = **admin** `piyush.ghosal.ai@gmail.com` · professor `killerme69blank@gmail.com` · student `pika38212@gmail.com` — seed data is keyed to these emails |
| Demo data (live Neon) | 5 courses · 3 demo materials/course · 3 meetings · 20 tasks · 10 completion logs (seed idempotent — §24.8) |
| Storage | AWS S3 `educraftbucket07` (`ap-southeast-2`), `STORAGE_PROVIDER=s3` — smoke gate PASSED 2026-09-05; owner executed the browser upload E2E (evidence in DB) |
| Env | `.env.local` complete (S3, Clerk, `DATABASE_URL`); `.env.example` mirrors it. **Verify Vercel env before Stage 5 deploy** (master §24.10) |
| Auth instance | Clerk **Open mode** — known unresolved trap (master §22 #6, §4 below) |

## 2. Track A — Dashboard (shipped; Stage 5 next)

**Shipped:** Stages 0–4 + course-setup slice + rework → commit `29c96a6` (0.1.3). Records, decisions, per-stage absorb notes: master §24, §24.8, §24.9. Route map: §24.4.

**Open owner browser-E2E checks** (rolled up from master §24.8 stage lists — tick each here once verified):
- [ ] Course-setup rework flows: admin create course with chips → appears under All courses; Manage → edit code/title (`COURSE_CODE_TAKEN` on collision); assign/remove professors incl. last-one copy; delete flow (typed-code arm); professor Roster Remove → row leaves + student bell "Removed from …"; re-enroll reactivates + notifies; enrolled student's bell "Enrolled in …" + prefs' Course-enrollment switch gates all three
- [ ] Meetings calendar (3 seeded meetings at IST wall times) + Today/prev-next/Month-Week toolbar; create/cancel a STUDENT meeting → student bell row
- [ ] Planner add/move/edit/delete task → professor monitor + student Coursework + student `TASK_DUE` notification; overview meter rows match
- [ ] Schedule page List↔Calendar toggle; a roster-departed student's meeting edits without a silent flip
- [ ] Mobile (~400px): drawer open/close (Escape + focus return + route-change close); overview meter rows + calendar look right
- [ ] Notification prefs: toggle the four switches as the demo student → professor posts class/material → suppressed channels stay silent
- [ ] Loading skeleton on dashboard navigations; bogus course URL → branded 404; error boundary if a page throws
- [ ] **S3 remaining sub-check:** signed download-link click-through on the student side (upload E2E itself passed)
- [ ] Invite flow (admin & professor each invite → invitee accepts and lands in the right dashboard) — exercised 2026-09-05; re-verify after any auth change

**Next: Stage 5 — QA & Deploy.** Scope: §24.5. Full execution plan: **§24.10** (Vitest unit + domain integration + Playwright E2E + deploy checklist + gates). Notes: test runs are owner-authorized (§20); integration tests drive `lib/domain/` directly (no Clerk).

**Stage 6 backlog:** realtime push · Parent view · attendance · gradebook · calendar sync · admin console · CompletionLog student progress · S3 migration/orphan-cleanup scripts.

## 3. Track B — Marketing Site UI-UX Upgrade (spec; not started)

**Status:** requirements distilled + reality-annotated into master **§28** on 2026-09-07; **no code started; nothing from the old briefs is implemented** (and their diagnoses are not all true — read §28.1–28.2 first).

**Owner decisions blocking start** (detail + recommendations: master §28.7):
- D1 Hero "dark, cinematic" direction vs the light-default art-directed theme
- D2 Remove `ProgrammeExplorer` ("Learn — 01/05") and/or `ProgrammeDeepDive` ("Inside a Programme")? — master recommends keep both
- D3 Audience doors (`/for-schools|parents|students` pages) vs compact tabs
- D4 Impact section: charts only with real verified data (no invented statistics — brand law)
- D5 How-It-Works: merge the 5-card row into the scroll path?
- D6 Slogan "Empowering Schools, Empowering Students" placement (nav/hero) + theme behavior
- D7 Dependency adoptions (GSAP/Framer/Lenis/Floating UI/Radix/react-countup) — default: none

**When greenlit**, follow master §28.5 (S0 audit → decisions → primitives → hero workstream → below-hero polish → feature work → responsive/perf → acceptance audit). Marketing stays static; the §20 verification loop runs at every stage; visual QA stays owner-side.

## 4. Production blockers & open issues (authoritative detail: master §22)

1. **Role-less sign-in trap — UNRESOLVED** (master §22 #6): Clerk is Open mode, so uninvited emails create role-less accounts; `/dashboard` silently bounces them to `/` with a live session and no sign-out escape. Agreed fix (not implemented): Clerk **Restricted (invite-only)** mode + a role-less "access is by invitation" page with Sign out.
2. Testimonials are SEED content → real, verified, consented quotes before launch.
3. `NEXT_PUBLIC_SITE_URL` (real domain) + `ENQUIRY_WEBHOOK_URL` (CRM) unset.
4. Business contact details (`hello@educraft.com`, `+91 80 4567 8900`, Bangalore) stakeholder-unverified.
5. Social handles deliberately absent (no dead links) until real handles exist.
6. Rate limiter is per-instance in-memory → shared store (Redis/Upstash) before multi-instance deploy.
7. Enquiry JSONL append = dev-only fallback on serverless; webhook must be the production channel (master §26 A1).
8. Clerk dev-instance invitation mail lands in recipients' spam — set a verified sending domain with the production domain.
9. Hygiene items, cheap and open: master §26 P1 (eslint global ignores, tsconfig `.next/dev/types`, dead `Card.tsx` + `useSectionProgress`, `.playwright-mcp` gitignore, root SVGs).

## 5. Session checklist

1. Read `EDUCRAFT_PRODUCTION.md` fully — §18 conventions, §20 verification, §22 blockers first — then this file (§1–§4).
2. Pick up the active item: Track A Stage 5 (master §24.10) or, once decisions land, Track B (master §28).
3. Verification loop before and after changes (§20): `npm run lint` → `npx tsc --noEmit` → `npm run build`. After deletions/renames: stop dev, `rm -rf .next`, re-run. Never wipe `.next` under a running dev server.
4. Working agreements: no git commits/pushes by the assistant (owner handles all git); owner performs all website viewing/visual QA and browser E2E — never launch a browser or curl the site from the assistant side.
5. Close the loop: record new facts in the master first (governance R1, master §0), then tick/sync this file; report changed files ↔ requirement mapping + content-loss audit.

## 6. Change log

- **2026-09-07** — Two-doc consolidation: master gained §24.10 (Stage 5 plan), §26 (hygiene ledger), §27 (decisions & recipes), §28 (marketing upgrade spec) + merged AGENT_CONTEXT knowledge (§3, §5.1, §6, §18, §20); §0/§2/§24 pointers rewritten; this file created; seven consumed docs deleted.
- **2026-09-06** — AGENT_CONTEXT.md v2 written (pre-consolidation; content now in the master).
- **2026-09-05** — Commit `29c96a6` (0.1.3): course-setup rework. S3 storage gate + owner upload E2E (master §24.9). Invite E2E created second professor account; owner account role set to admin. Clerk invitations confirmed landing in spam (dev instance).
- **2026-09-04/05** — Dashboard Stages 0–4 shipped; S3 provider swap resolved the UploadThing free-tier blocker (master §24.8, §24.9).
- **2026-09-04** — Marketing V2 baseline verified; earlier docs consolidated into the master (master §0).
