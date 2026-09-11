# EDUCRAFT — SUB-STATE (Live Work Queue & State Machine)

**Edition:** v1.2 (FC-cycle merge, 2026-09-07) · **Compiled:** 2026-09-07 · **Companion to:** `EDUCRAFT_MASTER_SYSTEM.md` (master wins on conflict) · **Line budget:** 500 lines max — splitting rules in master §12.2 · **Sibling sub-state files:** `EDUCRAFT_SUBSTATE_UI-CYCLE.md` + `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md` (Front-End Overhaul Cycle, master §13)

> **What this file is.** The live state of every unit of work in the Educraft system: the queue, the full execution specs, the dependency waves, the retraction/reversal ledger, the completion archive, and the append-only session ledger. The working agent **must** mutate this file every session (master §1.1 S5) — stale state is a defect.
>
> **How to read it:** §1 tells you *what exists and its state*. §2 tells you *exactly how to execute an item*. §3 tells you *what order*. §4 tells you *what never to do again*. §5 tells you *what is already true*. §6 tells you *what happened last session*.

---

## §0. State Model (condensed — full transition law in master §1.2)

| State | One-line meaning |
|---|---|
| `READY` | Spec complete, dependencies met — start it now |
| `VERIFY-FIRST` | Attempt to reproduce the premise in code before implementing; close honestly if it doesn't reproduce |
| `ACTIVE` | Being implemented this session |
| `VERIFY` | Implemented; passing the verification gate (master §1.5) |
| `DONE` | Shipped, verified, archived in §5 |
| `BLOCKED` | Waiting on an external input (named: who unblocks) |
| `OWNER-GATED` | Owner's judgment reserved; agents analyze, never implement |
| `CONDITIONAL` | Execute only if the named trigger fires |
| `RETRACTED` | Premise factually wrong — never do it (ledger §4.1) |
| `REVERSED` | Former rule overturned by owner 2026-09-07 (ledger §4.2) |
| `DEFERRED` | Valid, intentionally parked |
| `MERGED` | Folded into another item — follow the pointer |

**Item ID scheme:** `H-*` hero/landing · `UIS-*` approved UI/UX upgrade · `DASH-*` dashboard · `BLK-*` launch blockers · `V3-A/B/C/D-*` roadmap tiers · `FLAG-*` owner-judgment flags.

---

## §1. Queue Overview (Master Table)

| ID | Item | Family | State | Depends on | Source |
|---|---|---|---|---|---|
| DASH-01 | Dashboard Stage 5 — QA & Deploy | DASH | **READY · current focus** | BLK-02 (for the final production step) | prod §24.5 |
| DASH-02 | Browser E2E checklist (owner pass) | DASH | BLOCKED — owner action | DASH-01 | prod §24.8 |
| DASH-03 | Signed download-link click-through (owner pass) | DASH | BLOCKED — owner action | — | prod §24.9 |
| DASH-04 | Role-less sign-in trap fix (app-level) | DASH | READY | — | prod §22.6 |
| DASH-05 | Stage 6 backlog (realtime, parent view, attendance, gradebook, calendar sync, admin console) | DASH | DEFERRED | DASH-01 | prod §24.5 |
| UIS-01…11 | UI/UX upgrade family — **MERGED into the Front-End Overhaul Cycle** (master §13) | UIS | MERGED → FC items | — | see FC-05/12/14/16/17/18/19/24 — specs moved to `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md` |
| H1–H6 | Hero & landing family — **MERGED into the Front-End Overhaul Cycle** (master §13) | H | MERGED → FC items | — | see FC-08/10/11 — specs moved to the cycle spec file |
| H7 | Program dropdown pointer-safety | H | VERIFY-FIRST | — | landing §8 (conflict noted) — unchanged, independent of the cycle |
| V3-A1 | Enquiry webhook → CRM/email wiring | V3-A | BLOCKED — needs BLK-02 | BLK-02 | prod §25 |
| V3-A2 | Real testimonials + case studies | V3-A | BLOCKED — stakeholder (= BLK-01) | BLK-01 | prod §25 |
| V3-A3 | Privacy-conscious analytics (Plausible/PostHog) | V3-A | READY | — | prod §25 |
| V3-A4 | Error monitoring (Sentry) | V3-A | READY (post-public-traffic) | launch | prod §25 |
| V3-A5 | Production domain + sitemap/canonical/OG re-verify | V3-A | BLOCKED — needs BLK-02 | BLK-02 | prod §25 |
| V3-B6 | Insights-article OG images | V3-B | READY | — | prod §25 |
| V3-B7…B10 | Experience items — **MERGED into the Front-End Overhaul Cycle** (master §13) | V3-B | MERGED → FC items | — | see FC-02/05/09/20 |
| V3-B11 | Programme-page 3D accents | V3-B | MERGED → FC-24 | — | prod §25 |
| V3-B12 | GSAP/ScrollTrigger adoption | V3-B | MERGED → FC-13 (GSAP is an implementation means inside cycle items, not a queue item) | — | prod §25 (§5 reversal) |
| V3-C13 | Insights growth (categories, search, pagination) | V3-C | READY | — | prod §25 |
| V3-C14 | Headless-CMS migration path | V3-C | DEFERRED | — | prod §25 |
| V3-C15 | i18n evaluation | V3-C | DEFERRED | — | prod §25 |
| V3-D16 | Test suite (Vitest unit/integration + Playwright E2E; visual-regression slice → FC-26) | V3-D | READY | — | prod §25 |
| V3-D17 | Lighthouse baseline + CWV field data | V3-D | MERGED → FC-01 (pre) + FC-27 (post) | — | prod §25 |
| V3-D18 | Shared rate-limit store | V3-D | MERGED → BLK-05 | — | prod §25 |
| V3-D19 | WCAG 2.2 AA audit pass | V3-D | MERGED → FC-27 (audit is meaningless mid-rebuild) | — | prod §25 |
| V3-D20 | R3F patch clearing THREE.Clock warning | V3-D | GATED on upstream release | — | prod §25 |
| V3-D21 | Repo hygiene sweep (eslint ignores, tsconfig dev-types, dead code, repo clutter) | V3-D | READY | — | retired hygiene ledger (archived) |
| BLK-01 | Real, verified, consented testimonials | BLK | BLOCKED — stakeholder | — | prod §22 |
| BLK-02 | `NEXT_PUBLIC_SITE_URL` + `ENQUIRY_WEBHOOK_URL` set | BLK | BLOCKED — owner | — | prod §22 |
| BLK-03 | Business details stakeholder-confirmed | BLK | BLOCKED — stakeholder | — | prod §22 |
| BLK-04 | Real social handles | BLK | BLOCKED — stakeholder | — | prod §22 |
| BLK-05 | Shared rate-limit store (Redis/Upstash) before multi-instance | BLK | READY-on-trigger | multi-instance deploy | prod §22 |
| FLAG-1 | `ProgrammeExplorer` vs `ProgrammeDeepDive` redundancy | FLAG | OWNER-GATED — governs FC-13/FC-16 via cycle gate G5 (master §13.4) | — | memo §5 |

**Queue health (v1.2):** 32 rows here — 9 READY · 9 BLOCKED (external) · 1 OWNER-GATED (FLAG-1) · 1 VERIFY-FIRST (H7) · 1 GATED-on-upstream · 3 DEFERRED · 8 MERGED (→ FC cycle, pointers above) — **plus 27 FC-cycle items** in `EDUCRAFT_SUBSTATE_UI-CYCLE.md` (all OWNER-GATED on the Phase 0 gate, master §13).

**Reminder:** `OWNER-GATED` items are never auto-selected; `BLOCKED` items name who unblocks them; the master §1.3 precedence ladder decides between selectable items.

---

## §2. Item Specifications

> Every spec below is execution-complete: an agent must be able to work from it **plus the repo** without opening any other document. Specs were written against a live repo — stage S3 step (b) (verify current code state) always applies. Code style everywhere: single quotes, no semicolons, PascalCase default exports, sparse comments — match neighboring code exactly.

### §2.1 Family H — Hero & Landing Experience

**H1–H6 are MERGED into the Front-End Overhaul Cycle (master §13)** — execution specs moved to `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md` (H1/H2/H3 → FC-10; H4 → FC-11; H5/H6 → FC-08). All are `OWNER-GATED` on the cycle Phase 0 gate. Do not execute from the retired text below; the cycle specs supersede it.

**Shared context (still binding for H7):** target page = the public landing/home page (`(site)/page.tsx`); locate every target from the repo, never from screenshots. Visual direction, lighting/material/animation principles, and the avoid/prefer lists live in master §11.4–§11.5 + §13.2 (design direction v4). All items respect master §7 constraints (sticky law, hydration law, Tailwind literal-class law, one-canvas law) and the §1.5 gates (reduced-motion, responsive, contrast).

**H7 · Program dropdown pointer-safety — `VERIFY-FIRST`**
- *The conflict:* the old brief reported "dropdown opens → page scrolls/jumps upward → unusable." The production doc's nav audit states the mega menu already has "no pointer-corridor bug in this menu today" (hover+click open, Escape/outside-click/route-change close with focus return, `aria-expanded`/`aria-controls`). **Protocol:** (1) reproduce the premise in code — trace the trigger→panel path for scroll-jump causes (`href="#"` anchors, scroll-modifying handlers, focus restoration, hover-firing navigation, transformed/scrolled positioning parents, overflow clipping, pointer gaps, wrong position hierarchy, body-lock logic, remounting state, `preventDefault` errors, containing blocks); (2) if a defect reproduces, fix at root cause per the brief's required result below; (3) if it does not, close `DONE (not-reproducible)` with the code-level evidence — do not invent work.
- Required result if implemented: standard stable dropdown — open without page movement; cursor travels trigger→panel through a continuous pointer-safe interaction region (wrapper model: NAV ITEM WRAPPER ⊃ trigger + panel); stays open while inside; items hoverable and clickable; closes naturally outside the interaction area. Never: permanently open, globally disabled scrolling, precision-pixel gaps, arbitrary-timeout-only fixes.
- Touch/mobile: dropdown behavior compatible; mobile nav unaffected.
- **Accept (if reproduced):** the full acceptance walk (hover → menu → move in → stays → hover item → click → navigates) passes at multiple viewport widths; no scroll-position change from pointer movement alone.

### §2.2 Family UIS — Approved UI/UX Upgrade

**MERGED into the Front-End Overhaul Cycle (master §13).** All 11 items' execution specs moved to `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md` (UIS-01…04 → FC-17 · UIS-05 → FC-19 · UIS-06/07 → FC-12 · UIS-08 → FC-18 · UIS-09 → FC-14 · UIS-10 → FC-24 · UIS-11 → FC-05). Do not execute from retired spec text — it is removed. The cycle specs carry every invariant forward (the `aria-live` Ecosystem panel and `StudentJourney`'s single-`useScrollProgress` architecture remain binding via cycle gates G9/G4).

### §2.3 Family DASH — Dashboard Project

**DASH-01 · Stage 5 — QA & Deploy (current focus) — `READY`**
- Scope (prod §24.5): integration tests for critical paths — enroll → student sees class; post material → student notified; create task → completion updates (drive the `src/lib/domain/` layer directly, no Clerk, per the §24.8 test contract); seed/demo-data walkthrough; Vercel preview + staging DB; merge to production with the same Prisma migration; rollback plan (feature-flag the dashboard nav link if needed).
- Exit criteria: feature live on the real domain behind auth. Note: the final production step requires BLK-02 (`NEXT_PUBLIC_SITE_URL`) — testing and preview work can proceed without it.
- Library Rule effect: shadcn/ui (or any dashboard kit) may be introduced for any remaining widget gaps (data tables, command menus, toasts) — `components.json` exists; theme into the dashboard's existing visual language (§5.4 law 5).
- **Accept:** integration tests green (domain-level); seed walkthrough complete; preview verified; production merge plan + rollback documented.

**DASH-02 · Browser E2E checklist (owner pass) — `BLOCKED — owner action`**
- The owner's browser walkthrough list (evidence lands in the live DB): admin creates a course with chips → success names professors, row appears under All courses; Manage → edit code/title → header updates, `COURSE_CODE_TAKEN` on collision; assign + remove professors incl. last-one copy; delete flow (typed-code confirmation, wrong code stays disabled, correct deletes → returns to list); professor Roster Remove → row leaves, student bell shows "Removed from …", re-enroll reactivates + notifies again; enrolled student's bell shows "Enrolled in …"; prefs' Course-enrollment switch gates all three notifications.
- **Same owner pass also covers the Stage 3/4 checks (folded in 2026-09-07 from the retired PROJECT_STATE.md):** meetings calendar shows the 3 seeded meetings at IST wall times and the Today/prev-next/Month-Week toolbar works; create/cancel a STUDENT meeting → student bell shows the row; schedule-page List↔Calendar toggle; Planner add/move/edit/delete task → professor monitor + student Coursework + student `TASK_DUE` notification; overview meter rows match; a roster-departed student's meeting edits without a silent flip; the four prefs switches (classes/materials/task-due/meetings) suppress their channels when off; drawer at ~400px (Escape + focus return + route-change close); loading skeleton flashes on dashboard navigation; bogus course URL → branded 404; error boundary visible if a page throws.
- Unblocks when: owner executes the list and reports results.

**DASH-03 · Signed download-link click-through (owner pass) — `BLOCKED — owner action`**
- Remaining S3 sub-check: the student-side signed download link click-through (upload flow itself passed the smoke gate + owner browser E2E on 2026-09-05).

**DASH-04 · Role-less sign-in trap fix (app-level) — `READY`**
- Problem: Clerk instance in Open mode lets uninvited emails create role-less accounts; `/dashboard` dispatch silently redirects them to `/`; session stays live with no sign-out affordance on marketing (stranded until cookies cleared); deep links into `/dashboard/<role>` hit a 500 (`requireRole` throws).
- Code part (agent, READY): role-less dispatch shows an honest "no role — Educraft access is by invitation" page with a Sign out button (proxy `/dashboard` branch); `requireRole` redirects instead of throwing for role-less users; marketing site gains a sign-out affordance path per the agreed direction.
- Instance part (owner): Clerk Dashboard → User & Authentication → Restrictions → enable **Restricted (invite-only) mode**; delete junk role-less accounts manually (Clerk Dashboard → Users).
- **Accept:** no session can strand regardless of instance mode; role-less deep links redirect honestly (no 500); evidence in report.

**DASH-05 · Stage 6 future backlog — `DEFERRED`**
- Realtime push (Supabase Realtime/Pusher); Parent view (read-only window into a student's dashboard — ties into the For-Parents audience door); attendance per `ClassSession`; gradebook/assessment scores; calendar sync (.ics/Google); full admin console (users/courses/enrollments).

### §2.4 Family BLK — Launch Blockers (precedence over roadmap; mostly external inputs)

| ID | Blocker | Unblocked by | Agent-side note |
|---|---|---|---|
| BLK-01 | Replace SEED testimonials in `data/testimonials.ts` with real, verified, consented quotes | Stakeholder content | When real quotes arrive: swap data, verify layout, keep editorial pattern (§6.3); add verified outcome metrics to `/impact` only when real data exists |
| BLK-02 | Set `NEXT_PUBLIC_SITE_URL` (real domain) + `ENQUIRY_WEBHOOK_URL` (CRM) | Owner (env vars) | Unblocks V3-A1, V3-A5, DASH-01 final step |
| BLK-03 | Confirm business details (`hello@educraft.com` / `+91 80 4567 8900` / Bangalore) | Stakeholder | Update footer, contact page, structured data on confirmation |
| BLK-04 | Real social handles | Stakeholder | Add footer icons only when real handles exist (no dead `href="#"`) |
| BLK-05 | Shared rate-limit store (Redis/Upstash) | Trigger: multi-instance deploy | Swap `lib/rate-limit.ts`'s in-memory store behind its interface; = V3-D18 |

### §2.5 Family V3 — Roadmap (Tier A conversion/trust · Tier B experience · Tier C content · Tier D platform)

**Tier A — before public launch (most BLOCKED on BLK items)**
- **V3-A1 · Enquiry webhook → CRM** — wire `ENQUIRY_WEBHOOK_URL` to CRM/transactional email (Resend, HubSpot, or similar) + internal notification channel. `BLOCKED` on BLK-02.
- **V3-A2 · Real testimonials + case studies** — `BLOCKED` (= BLK-01).
- **V3-A3 · Privacy-conscious analytics** — Plausible or PostHog; event map: `page_view, programme_view, programme_cta, enquiry_started, enquiry_completed, enquiry_error, nav_open, theme_changed, scroll_depth, insight_open`; milestone-based scroll events only, never per-frame. `READY`.
- **V3-A4 · Error monitoring** — Sentry once public traffic exists. `READY` (post-launch).
- **V3-A5 · Production domain** — point `NEXT_PUBLIC_SITE_URL` at the real domain; re-verify sitemap/canonicals/OG. `BLOCKED` on BLK-02.

**Tier B — experience upgrades**
- **V3-B6 · Insights OG images** — `insights/[slug]/opengraph-image.tsx`; the only content type missing a social preview; follow the Satori flex rule (§6.9). `READY`. (Independent of the FC cycle — the insights redesign (FC-21/FC-23) must keep the OG status in mind.)
- **V3-B7…B10 · MERGED into the Front-End Overhaul Cycle** — cursor labels → FC-09 · transition washes → FC-05 · testimonial movement → FC-20 (gate G7) · smooth-scroll → FC-02 (gate G11). Execution text moved to `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md`.
- **V3-B11 · Programme-page 3D accents** — `MERGED → FC-24`.
- **V3-B12 · GSAP/ScrollTrigger adoption** — `MERGED → FC-13` (GSAP is an implementation means inside cycle items — never a wholesale replacement of correct pinned-section architecture, §6.6).

**Tier C — content & growth**
- **V3-C13 · Insights growth** — more articles, `/insights/[category]` pages, simple search; pagination when volume demands. `READY`.
- **V3-C14 · Headless-CMS migration path** — when non-technical editors need to publish; data files are already CMS-shaped. `DEFERRED`.
- **V3-C15 · i18n evaluation** — large; only when international expansion is real. `DEFERRED`.

**Tier D — platform & QA**
- **V3-D16 · Test suite** — Vitest unit (validation, utils, rate-limit) + component (accordion, staged form, mega menu, theme toggle) + Playwright E2E (enquiry flow, navigation, mobile menu, reduced-motion behavior). `READY`. (The visual-regression slice is `MERGED → FC-26` — it is meaningless until the cycle ships surfaces worth freezing.)
- **V3-D17 · Lighthouse baseline + CWV** — `MERGED → FC-01` (pre-measure, Wave 1) + `FC-27` (post-measure, Wave 5). Never report targets as achieved without measurement.
- **V3-D18 · Shared rate-limit store** — `MERGED → BLK-05`.
- **V3-D19 · A11y audit** — `MERGED → FC-27` (a WCAG pass mid-rebuild is wasted work; the cycle's Wave 5 acceptance owns it: keyboard walk of rebuilt surfaces, screen-reader pass, contrast incl. `achieve` gold on light + the new dark-anchor zones).
- **V3-D20 · R3F Clock patch** — adopt the R3F patch clearing the THREE.Clock warning when it ships; no canary upgrades. `GATED` on upstream release.
- **V3-D21 · Repo hygiene sweep — `READY`** — ported 2026-09-07 from the retired hygiene ledger (findings were verified against the live config on that date). P1: (1) move `eslint.config.mjs`'s `ignores` array to a standalone leading flat-config block and add `.playwright-mcp/` to it (ignores nested in the rules object only exempt that object — preset configs still match `.next`); (2) drop `.next/dev/types/**/*.ts` from `tsconfig.json`'s `include` (keep `.next/types` — ends the stale-`.next` `tsc` ritual for dev-type corruption, master §7/.next hygiene); (3) delete or adopt `components/educraft/ui/Card.tsx` (0 importers — the `card-surface` class is what's used) and `hooks/useSectionProgress.ts` (0 consumers). P2: (4) ship a small `favicon.ico`/`.svg` instead of the ~601 KB `logo.png` as `icons.icon`; (5) dedupe/remove the two unreferenced `Educraft Branding Showcase*.svg` at repo root (~237 KB each); (6) if `data/enquiries.jsonl` survives into production, rename the runtime dir (e.g. `runtime/`) to end the `data/` vs `src/data/` collision, or document JSONL as dev-only (master §6.8 — it cannot be a production delivery channel on serverless anyway). Already resolved, do not redo: `.env.example` exists; the shadcn `components.json` question is settled by §5 (V8). Each fix is tiny and independent — one item at a time, §1.5 gates, honest "closed as not-worth-it" accepted with reasoning. **Accept:** every listed item either fixed or explicitly closed with reasoning.

### §2.6 Family FLAG — Owner-Judgment Flags

**FLAG-1 · `ProgrammeExplorer` (03) vs `ProgrammeDeepDive` (06) narrative redundancy — `OWNER-GATED`**
- Both are deep, single-sourced, per-programme storytelling devices on the same homepage, separated by `WhyDifferent` (04) and `StudentJourney` (05). May be deliberate re-engagement sequencing — or may read as two similar experiences too close together. Only the owner's live scroll-through can judge (working agreement: agents don't visual-QA).
- Prepared options if the owner wants a change: (a) keep both, differentiate visual idioms more sharply (bento panel for the explorer, curriculum-focused tab-based deep-dive); or (b) fold `ProgrammeDeepDive`'s unique content (curriculum modules, method, outcomes/proof) into `ProgrammeExplorer`'s panel and retire the second section.
- **No action without the owner's explicit call.** Agents may surface this flag in reports; never implement either option unprompted.
- **Cycle link:** this flag is consumed by the Front-End Overhaul Cycle as **gate G5** (master §13.4) — it gates FC-13 (ProgrammeExplorer v4) and FC-16 (ProgrammeDeepDive v4). A Phase-0 ruling on G5 resolves it.

---

## §3. Dependency & Sequencing Map

### §3.1 Remaining dependencies in this queue (FC-cycle dependencies live in the cycle control file)

```text
DASH-01 (Stage 5) ────────────► BLK-02 (only for the final production step)
DASH-02, DASH-03 ◄── owner passes; DASH-04 independent
V3-A1 ──► BLK-02      V3-A5 ──► BLK-02      V3-A2 = BLK-01
V3-D18 = BLK-05      H7 self-gating (VERIFY-FIRST)
FLAG-1 gated on owner judgment only (cycle gate G5, master §13.4)
```

### §3.2 Execution waves

- **Front-End Overhaul Cycle items:** waves and sequencing live in `EDUCRAFT_SUBSTATE_UI-CYCLE.md` §2 (master §13) — Phase 0 owner gate, then Waves 1–5.
- **Non-cycle items:** DASH-01 (Stage 5 QA & Deploy) is the dashboard track's focus; V3-A/D/BLK items proceed as their blockers clear. Within any wave, item ID order or the owner's emphasis governs.

Waves are guidance, not a lock — the master §1.3 precedence ladder governs.

---

## §4. Retraction & Rule-Change Ledger (never resurrect, never re-enforce)

### §4.1 Retracted claims (premise factually wrong — work must never be done)

| # | Retracted claim | Origin | Correction |
|---|---|---|---|
| R1 | "Remove the Learn — 01/05 scrollable section" | site-sections brief | `ProgrammeExplorer` is a flagship, single-sourced pinned story. Not recommended for removal. See FLAG-1 for the only legitimate (owner-gated) question about it. |
| R2 | "Remove the Inside a Programme section" | site-sections brief | `ProgrammeDeepDive` is legitimate, single-sourced content. Not recommended for removal. Same FLAG-1 pointer. |
| R3 | "`Ecosystem` has a static side card that never changes" | site-sections brief | The panel is `aria-live` and reactive. UIS-07 adds a decorative echo *alongside* it — never a replacement of an element that was never static. |
| R4 | "Journey steps are separately-triggered / StudentJourney needs re-architecting" | site-sections brief | `StudentJourney` already runs on one shared `useScrollProgress` value — the correct architecture. The dual time/confidence meters idea from the draft remains un-built and un-approved; flag, don't build. |
| R5 | Section names "Five Pillars," "Why Educraft," "Outcomes & Evidence," "Who Are You," "How It Works" as component names | both old briefs | Those are eyebrow *copy*. Real files: `Ecosystem`, `ProgrammeExplorer`, `WhyDifferent`, `StudentJourney`, `ProgrammeDeepDive`, `Impact`, `AudienceEntryPoints`, `Methodology`. |
| R6 | "Testimonial stats row has no labels" | site-sections brief | The `Stat` row already has labels; the real fixes are UIS-02/03/04. |
| R7 | Whole-document execution | site-sections brief | The document was written without repo access and is retired; its surviving valid intent arrived via the corrected memo + UIS specs. |

### §4.2 Reversed rules (were true standing rules — overturned by owner 2026-09-07, Library Empowerment Rule)

| # | Former rule | Former home | Effect of reversal |
|---|---|---|---|
| V1 | No new animation/positioning/UI library without a demonstrated gap; Framer Motion/GSAP/Lenis/Floating UI/Radix/shadcn "unapproved" | prod §18 rule 9 | Replaced by master §5 — any library, freely, from-scratch discouraged |
| V2 | Hand-rolled UI / no shadcn/radix for marketing | memo §4.8 | Reversed — shadcn/Radix usable anywhere, themed (§5.4 law 5) |
| V3 | "Do not add Framer Motion, GSAP, Lenis, Floating UI, Radix, or shadcn anywhere in this brief's scope" | homepage v2 brief §9 | Reversed — the UIS family may use arsenal equivalents when genuinely better; outcome requirements still bind |
| V4 | "No new npm dependency, anywhere, for any reason, without a separate owner conversation" | homepage v2 brief §11 | Reversed — dependencies are normal; list them in the diff-scope report |
| V5 | "Do not introduce a major new dependency unless there is a clear reason" | landing brief §0/§12 | Reversed — same as V4 |
| V6 | "Custom motion system, no animation library" as a protected decision | memo §3 | Reversed — the custom hooks remain the scroll-choreography spine (§6.6), but library composition is free |
| V7 | GSAP/ScrollTrigger "reviewed — not adopted; stays gated" | prod §25 item 12 | MOOT → V3-B12 `READY` |
| V8 | shadcn "Decide: install for data-heavy widgets or keep hand-rolling" | prod §24.3 | RESOLVED: allowed — resolved in master §10 |
| V9 | Old briefs' library recommendations "conflict with the no-library rule and are not approved" | both old briefs' status banners | MOOT — no conflict exists anymore; Appendix-A arsenal absorbed into master §5.3 |

**Retained despite the reversal (not library rules — design-restraint laws):** kinetic-type one-heading cap (§7 rule 10); no autoplay carousels; no scroll-jacking; one WebGL canvas; no invented statistics; reduced-motion guarantee; one visual language.

### §4.3 Standing corrections (naming/diagnosis — use these, not the old ones)

| Wrong | Right |
|---|---|
| `middleware.ts` | `src/proxy.ts` (Next 16 name) |
| `(dashboard)` route group for URL prefix | real `src/app/dashboard/` folder (groups never add segments) |
| "ProgrammeExplorer/ProgrammeDeepDive are duplicates" | single-sourced deliberate features (R1/R2) |
| Screenshots as work input | repo structure + specs identify targets; owner does visual QA |

---

## §5. Completion Archive (baseline record — do not redo)

| Shipped | When | Evidence |
|---|---|---|
| V2 marketing site — 16 pages, 12-section homepage, programme pages ×5, lead pipeline, art-directed themes, motion system, one-canvas WebGL | 2026-08-30 build; verified 2026-09-04 | lint ✓ tsc ✓ build ✓ (29 routes) |
| Brand lockup swap (`logo.png`/`logo-dark.png`, theme-aware CSS switch) | 2026-09-04 (`Prod.ver-0.1.0`) | No residual old-lockup references (grep clean) |
| Dashboard Stage 0 (Prisma 7.10 + Neon + Clerk 7.9 + shells) | 2026-09-04 | Both role shells verified |
| Dashboard Stage 1 (Student Core — real data reads) | 2026-09-04 | End-to-end from DB |
| Dashboard Stage 2 (Professor Core + S3 decision groundwork) | 2026-09-05 | lint/tsc/build ✓ |
| Storage: UploadThing → AWS S3 provider swap (provider-agnostic layer absorbed it, zero domain/DB/UI change) | 2026-09-05 | Smoke gate PASSED (`db:storage-smoke`); browser E2E by owner (uploads visible in live DB) |
| Dashboard Stage 3 (Meetings & Planner, react-big-calendar + date-fns 4) | 2026-09-05 | lint/tsc/build ✓ |
| Dashboard Stage 4 (Polish: mobile drawer, notification prefs editor, loading/error/not-found boundaries, access-control audit clean) | 2026-09-05 | lint/tsc/build ✓ |
| Course-setup slice + same-day rework (enrollment notifications, normalized emails, hardened domain, full admin/professor course management, chip forms) | 2026-09-05 | lint ✓ tsc ✓ build ✓ (admin routes emitted); smoke ✓; live at `29c96a6` (`Prod-version:0.1.3`) on staging |
| UI/UX strategic review + corrected execution spec (the source memo + brief) | 2026-09-06 | Owner-authorized; synced into the old master's ledger (now this system) |

**V1 → V2 historical delta (context):** one landing page → 16 pages + API; 3 decorative canvases → one coordinated theme-aware scene system; card grids → editorial modules, pinned storytelling, SVG path-draws; simulated form → production lead pipeline; basic fades → full motion system; light-only → art-directed dual themes; hard-coded content → typed data-driven UI.

---

## §6. Session Ledger (append-only — every session adds one entry)

**Entry template:**

```text
### [date] — Session #[n] — item(s): [IDs]
- Baseline: [loop green/red at start]
- Spec-vs-reality findings: [conflicts found & reconciled]
- Changed files ↔ items: [the diff-scope mapping]
- Dependencies: [added/removed, why]
- Gates: [reduced-motion / contrast / responsive / a11y / sticky / hydration / content-preservation results]
- State transitions: [ID: FROM → TO]
- Owner flags: [OWNER-GATED encounters, design calls reserved to owner]
- Lessons for master §7: [new hard-won rules, if any]
```

**Entries:**

```text
### 2026-09-07 — Session #0 — item(s): system convergence (meta)
- Baseline: n/a (documentation run, no repo changes)
- Action: 5 predecessor docs analyzed in full and absorbed into EDUCRAFT_MASTER_SYSTEM.md v3.0 +
  EDUCRAFT_SUBSTATE.md v1.0; predecessor docs retired (supersession map: master §12.1)
- Rule change applied: Library Empowerment Rule enacted (master §5) — fully unrestricted library/
  component/asset adoption; from-scratch demoted to exception (§5.5); reversals V1–V9 logged (§4.2)
- State model commissioned: pipeline S0–S6 + 11-state item machine (master §1)
- Queue commissioned: 49 tracked items across H / UIS / DASH / BLK / V3 / FLAG families (§1)
- Owner flags: UIS-09 heading choice reserved to owner; FLAG-1 reserved to owner; H7 set to
  VERIFY-FIRST per owner instruction
- Next session: start master S0 → S1/S2 per §3.2 Wave 1 (DASH-01) unless the owner re-prioritizes
```

### 2026-09-07 — Session #1 — item(s): system migration (meta)
- Baseline: n/a (documentation run — no repo code changes)
- Action: fully migrated to this system per owner instruction. Old-system files
  `EDUCRAFT_PRODUCTION.md` + `PROJECT_STATE.md` moved to `docs-archive/` (owner chose archive
  over delete). README + TECH-STACK doc pointers updated to the new files.
- Spec-vs-reality findings (reconciled): master §3/§10 and this file's §5 claimed latest commit
  `6f91f33`/0.1.2 — actual repo HEAD is `29c96a6`/0.1.3 → corrected in master (§3, §10) + §5;
  demo accounts + demo-data state were absent → added to master §3; open Stage 3/4 owner E2E
  checks existed only in the retired PROJECT_STATE.md → folded into DASH-02; hygiene ledger
  existed only in the retired EDUCRAFT_PRODUCTION.md → ported as V3-D21.
- Changed files ↔ items: EDUCRAFT_MASTER_SYSTEM.md (§3 facts + demo accounts, §0 companion
  pluralization, §12.2 500-line budget + registry, §12.3 changelog) · EDUCRAFT_SUBSTATE.md
  (edition v1.1, V3-D21 row + spec, DASH-02 spec extension, health recount 50, §5 archive fix,
  this entry) · README.md · TECH-STACK.md
- Dependencies: none
- Gates: n/a (docs only)
- State transitions: V3-D21: — → READY (added); DASH-02: spec extended, still BLOCKED — owner
- Owner flags: owner approved archive-not-delete; approved V3-D21 port; approved DASH-02 extension
- Lessons for master §7: none new (500-line sub-state budget recorded in master §12.2)
```

### 2026-09-07 — Session #2 — item(s): FC-cycle commissioning (meta)
- Baseline: n/a (documentation run — no repo code changes)
- Action: Front-End Overhaul Cycle (v4) commissioned into master §13 (owner decision + rulings:
  deep rebuild · full marketing site · master §13 + new registered sub-state files). Created and
  registered `EDUCRAFT_SUBSTATE_UI-CYCLE.md` (27 FC items, all OWNER-GATED on Phase 0) +
  `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md`. Merged UIS-01…11, H1–H6, V3-B7…B12, V3-D17/D19 into
  FC items (pointer rows in §1); H7 stays VERIFY-FIRST; FLAG-1 now consumed by cycle gate G5;
  §3.2 waves replaced by the cycle pointer; this file's spec blocks for merged families removed.
- Changed files ↔ items: EDUCRAFT_MASTER_SYSTEM.md (§13, §1.3 ladder, §12.2 registry, §12.3
  changelog) · EDUCRAFT_SUBSTATE_UI-CYCLE.md (new) · EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md (new) ·
  EDUCRAFT_SUBSTATE.md (v1.2, pointers, this entry)
- Dependencies: none (docs only)
- Gates: n/a; line budgets verified (cycle control 105 · cycle specs 183 — both < 500)
- State transitions: UIS-01…11 / H1–H6 / V3-B7…B12 / V3-D17 / V3-D19: READY → MERGED (→ FC items);
  27 FC items: — → OWNER-GATED (Phase 0)
- Owner flags: Phase 0 session next — the owner rules G1–G12 (master §13.4) before any FC item
- Lessons for master §7: none new
```

### 2026-09-07 — Session #3 — item(s): Front-End Overhaul Cycle — Wave 1 progress (see cycle file)
- Action: Phase 0 gate ruled by the owner (G1 dark anchor zones · G2 Clash Display + serif ·
  G11 Lenis · G12 no loader — master §13.4). Wave 1 executed to date: **FC-01, FC-03, FC-04,
  FC-05 DONE**; FC-02/06/07/08/09 READY. Per-item evidence lives in the cycle control file
  `EDUCRAFT_SUBSTATE_UI-CYCLE.md` §1 + §5 (Sessions #0–#5).
- Working-agreement amendment (owner): Playwright MCP authorized for precise web-access tasks
  only (master §1.7). All code changes remain uncommitted (owner handles git).
- Next: FC-06 (Cinematic theme strategy execution — G1 ruled), then FC-07/08/09/02 per ID order
```

### 2026-09-07 — Session #4 — item(s): FC-06 (Cinematic theme strategy — see cycle file)
- Baseline: green (lint/tsc/build ✓ after the documented stale-`.next` dev-types wipe —
  V3-D21 P1-item-2 would end that ritual permanently; stays READY)
- Action: G1 Option B executed. globals.css ships the zone system (dark: custom-variant
  extended to `.dark-anchor *`; `.dark, .dark-anchor` comma-grouped night-palette block;
  `.dark-anchor` surface rule) and Hero.tsx is the proof conversion — one class on the
  section root makes it theme-independent dark; no other markup changed, copy byte-stable.
- Gates: lint ✓ tsc ✓ build ✓ (45/45); Playwright computed-style verification (light vs
  dark → zone values byte-identical; body flips normally; 0 console errors)
- State transitions: FC-06: READY → DONE (evidence: cycle control file §1 + §5 Session #6)
- Owner flags: hero now dark in light mode (interim seam to the themed Ecosystem below —
  FC-12's scope); hero canvas scene palette follows site theme until FC-10/FC-12 (flagged)
- Lessons for master §7: none new
- Next: FC-07 (page transitions + site-shell motion) or FC-08 (navbar v4) per ID order;
  FC-02 (Lenis) still READY; Wave 1 gates G3–G9 rule at Wave 2 entrance (master §13.4)
```

---

*End of sub-state. This file is the working surface — keep it truthful, current, and append-only where it says append-only.*

