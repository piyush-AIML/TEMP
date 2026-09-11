# EDUCRAFT — MASTER AGENT SYSTEM

**Edition:** v3.0 — Converged 2-File Agentic System · **Compiled:** 2026-09-07 · **Owner-authorized:** yes

> **What this file is.** The single static *constitution* for the entire Educraft system: product identity, technology stack, architecture laws, engineering constraints, the Library Empowerment Rule (§5), and the Workflow Engine (§1) that every agent session must run. It absorbs and **retires** five predecessor documents (supersession map in §12).
>
> **Its companion(s).** `EDUCRAFT_SUBSTATE.md` — the primary live work queue: every actionable item with an explicit state, full execution specs, dependency waves, the retraction/reversal ledger, and the session ledger. Additional sub-state files may be created when a sub-state file outgrows the 500-line budget (§12.2) — each links to this master and to its siblings and is registered in §12.2. The master says *what is and what may never be broken*; the sub-state says *what to do next and how*.
>
> **Supersedes and retires (all content absorbed — do not re-read, do not execute):**
> 1. `EDUCRAFT_PRODUCTION.md` (§0–§25 → here + sub-state)
> 2. `educraft_uiux_strategic_upgrade_plan.md` (decision memo → §5, §7, §11 + sub-state UIS family, FLAG-1, §4 ledger)
> 3. `educraft_homepage_v2_implementation_brief.md` (execution spec → sub-state UIS family specs verbatim)
> 4. `landing_page_redesign_agent_prompt.md` (hero brief → §11.4–11.5 + sub-state H family; its Appendix A arsenal → §5.3)
> 5. `site_sections_ui_upgrade_agent_prompt.md` (superseded brief → retraction ledger sub-state §4 only)
>
> **Precedence ladder:** Owner's live instruction > this master > the sub-state > repo `AGENT_CONTEXT.md` (implementation-detail handbook, if present in the repo — still valid where it does not conflict with this file) > nothing else. If any two documents disagree, the higher rung wins and the conflict must be logged in the sub-state session ledger.

---

## §0. System Architecture — How the 2-File Machine Works

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                        OWNER (human)                                     │
│   issues instructions · performs ALL visual QA · resolves OWNER-GATED    │
└───────────────▲──────────────────────────────────────────▲───────────────┘
                │ reports                                  │ decisions/flags
┌───────────────┴──────────────────────────────────────────┴───────────────┐
│                        AGENT SESSION                                     │
│                                                                          │
│   ┌────────────────────────┐        ┌─────────────────────────────────┐ │
│   │ EDUCRAFT_MASTER_SYSTEM │ reads  │ EDUCRAFT_SUBSTATE               │ │
│   │ (constitution, static) │ ─────► │ (live queue, mutated every run) │ │
│   │ §1 engine · §5 library │        │ §1 queue · §2 specs · §4 ledgers│ │
│   │ rule · §6–§9 laws      │        │ §5 archive · §6 session ledger  │ │
│   └────────────────────────┘        └─────────────────────────────────┘ │
│        │   writes code in the Educraft repo                              │
│        ▼                                                                 │
│   lint → tsc → build  (verification gate, §1.5)                          │
└──────────────────────────────────────────────────────────────────────────┘
```

| | **MASTER (this file)** | **SUBSTATE** |
|---|---|---|
| Mutability | Static by design. Amended only through the governance rule (§12.2) — a rule change must name the decision, the reasoning, and the date. | Dynamic by design. The working agent **must** update it every session: item states, session ledger entries, archive moves. |
| Contains | Identity, stack, laws, constraints, workflow engine, library rule, arsenal, design direction | Queue table, item specs, dependencies, waves, retraction/reversal ledger, completion archive, session ledger |
| Question it answers | "What is true, what is forbidden, how do I work?" | "What is next, how do I execute this item, what has already failed?" |
| Never contains | Task states, progress claims | Universal laws (it links to master sections instead of restating them) |

**Fresh-session read order:** master §0 → §1 → §5 → §7 → §9 → then sub-state §0 → §1 → the spec of the selected item → work.

---

## §1. The Workflow Engine (Pipeline + State Machine)

Every agent session runs the same seven-stage pipeline. The pipeline is deterministic; item selection is priority-driven; item execution is state-machine-driven.

### §1.1 Pipeline Stages

| Stage | Name | What happens |
|---|---|---|
| **S0** | BOOT | Read this master (§0, §1, §5, §7, §9 minimum). Read the sub-state queue (§1) and session ledger (§6). Run the verification loop (`npm run lint` → `npx tsc --noEmit` → `npm run build`) to establish a green baseline before touching anything. If the baseline is red, fixing it becomes the session's first item. |
| **S1** | RESOLVE | Build the session work set from the queue: every item not in `DONE`/`RETRACTED`/`REVERSED`, filtered by dependency readiness (§3 of sub-state) and precedence (§1.3). Check §9 blockers first — agent-actionable blockers preempt everything else. |
| **S2** | SELECT | Pick the **single highest-precedence unblocked item**. Never select `OWNER-GATED` items (flag them in the report instead). Never select more than one item per session unless they are same-family micro-items sharing a verification run. |
| **S3** | EXECUTE | For the selected item: (a) re-read its full spec in sub-state §2; (b) **verify current code state** — specs were written against a live repo and the repo may have moved; reconcile before coding, and if reality contradicts the spec, stop and log the conflict; (c) implement the smallest change that satisfies the spec, composing from the §5 arsenal and existing code before writing anything from scratch; (d) honor the scope-discipline triad (§1.4) on every edit. |
| **S4** | VERIFY | Run the verification gate (§1.5): the universal loop plus the item-type-specific gates. An item may not leave `VERIFY` until every applicable gate passes and is *evidenced* (command output, code inspection, diff). |
| **S5** | UPDATE STATE | Transition the item's state in the sub-state queue; append a dated, evidence-bearing entry to the session ledger (§6); move the item's spec to the archive (§5) if `DONE`; add any new lesson to the regression table conversation (new hard-won rules go to master §7 via §12.2, not into the sub-state). |
| **S6** | REPORT | Produce the diff-scope report (§1.6). Hand back to the owner for visual QA. Agents never claim visual completion — only the owner's eyes close the loop. |

### §1.2 Item State Machine

| State | Meaning | Allowed transitions |
|---|---|---|
| `READY` | Spec complete, no unmet dependencies; an agent may start it now. | → `ACTIVE` → `VERIFY` → `DONE`, or → `BLOCKED`/`OWNER-GATED` if reality intervenes |
| `VERIFY-FIRST` | A claim in the spec conflicts with a credible source; the agent must attempt to reproduce/verify the premise **in code** before implementing. If the premise fails to reproduce, close as `DONE (not-reproducible)` with evidence — do not invent work. | → `ACTIVE` or → `DONE` |
| `ACTIVE` | Currently being implemented in this session. | → `VERIFY` or back to `READY` (abandoned) |
| `VERIFY` | Implemented; passing through the verification gate. | → `DONE` or → `ACTIVE` (gate failed) |
| `DONE` | Implemented, verified, and accepted into the baseline. Recorded in sub-state §5 with date + evidence. | terminal |
| `BLOCKED` | Cannot proceed without an external input (owner action, stakeholder content, upstream release). The block reason must name *who* unblocks it. | → `READY` when unblocked |
| `OWNER-GATED` | A deliberate product/design decision reserved to the owner. Agents may prepare an analysis but must not implement. | → `READY` only by owner instruction |
| `CONDITIONAL` | Only executed if a named trigger condition fires (e.g., "only if X's design needs it"). | → `READY` when trigger confirmed, or → `DONE (skipped-by-design)` |
| `RETRACTED` | The premise is factually wrong; the work must never be done. Logged in sub-state §4. | terminal |
| `REVERSED` | A former standing rule that the owner has since overturned. Logged in sub-state §4.2; no longer blocks anything. | terminal |
| `DEFERRED` | Valid, intentionally parked behind everything else (large, or awaiting a real trigger like international expansion). | → `READY` by owner instruction |

### §1.3 Selection Precedence (the queue order)

When multiple items are selectable, take the highest rung:

1. **Agent-actionable `BLOCKED`-breakers** (e.g., a blocker the agent can remove in code)
2. **Dashboard Stage 5 (DASH-01)** — the dashboard track's named focus (dashboard work only)
3. **Front-End Overhaul Cycle — FC family in wave order** (§13; control file `EDUCRAFT_SUBSTATE_UI-CYCLE.md`) — the commissioned marketing-site v4 cycle; selectable once the Phase 0 gate is signed off. Replaces the former UIS/H/V3-B rungs — those items are MERGED into FC items (pointer rows in the primary sub-state §1)
4. **H7** (Program dropdown pointer-safety — `VERIFY-FIRST`, independent of the cycle)
5. **V3-A conversion & trust** (most are `BLOCKED` on owner inputs)
6. **V3-D platform & QA residuals** (V3-D16 test suite, V3-D20 upstream patch, V3-D21 hygiene — items merged into the cycle are not listed here)
7. **V3-C content & growth / `DEFERRED` items** (owner instruction only)

Tie-breakers: lower item number within a family; the owner's latest live instruction always outranks this table.

### §1.4 Scope-Discipline Triad (applies to every single edit)

Before every file edit, answer three questions:

1. **Which item ID does this change satisfy?** Every changed line must trace to a queue item.
2. **Is this the smallest change that satisfies it?**
3. **Does it alter anything already correct?** If yes and (1) doesn't require it, don't make it.

Forbidden everywhere, always: reformatting/reindenting untouched code; renaming working variables/props/files; drive-by rewrites; deleting comments/tests unrelated to the item; breaking unrelated pages. End every session with a diff-scope report (§1.6) — any hunk that cannot be paired with an item ID gets reverted before reporting.

### §1.5 Verification Gate

**Universal loop — all three must pass before any item leaves `VERIFY`:**

```bash
npm run lint          # eslint (react-hooks/immutability rule active)
npx tsc --noEmit
npm run build         # prisma generate && next build — Turbopack
```

**Item-type gates (run whichever apply):**

| Gate | Applies to | Requirement |
|---|---|---|
| Reduced-motion | any new/changed animation | Degrades correctly under the systemic CSS rule AND the OS toggle — verify, don't assume the global block catches it |
| Contrast | new icon/accent color | Passes in **both** light and dark themes |
| Responsive | any layout change | Sweep 640 / 768 / 1024 / 1280 / 1440 |
| A11y parity | anything touching interactive components | `aria-*` attributes, keyboard path, and focus behavior provably unchanged or improved |
| Sticky integrity | anything near `ProgrammeExplorer`/`StudentJourney` | No `overflow-hidden` added to any pinned-section ancestor |
| Hydration | any post-mount-derived value | `mounted`-gated; SSR markup identical to first client paint |
| Dependency | any `package.json` change | Listed in the diff-scope report with the item ID that justifies it (§5 rule) |
| Content preservation | any recomposition | No copy/stat/bullet deleted — only re-presented; content-loss audit included in report |

**Operational rules:** never wipe `.next` while a dev server is running (stop dev first; a dev server whose `.next` is deleted under it serves 404s until restarted). After file deletions/renames, `rm -rf .next` before tsc/build. Dev server only reads `.env.local` at boot — restart after env changes.

### §1.6 Reporting Contract (diff-scope report)

Every session ends with:

1. **Changed files ↔ item-ID mapping** — every file touched paired with the queue item(s) it satisfies; unmapped hunks reverted.
2. **Dependencies added/removed** — every `package.json` change named, licensed, and justified by an item ID (normal and expected under §5; no apology needed, just the record).
3. **Verification evidence** — universal loop results + each applicable item-type gate with its evidence.
4. **Spec-vs-reality conflicts** — anything found to differ from the sub-state spec, and how it was reconciled.
5. **Owner flags** — `OWNER-GATED` items encountered, design choices reserved to the owner (e.g., which heading gets the kinetic treatment), and anything the agent refused to guess.
6. **Sub-state mutations** — the exact state transitions and ledger entries written.

**Honesty law:** never claim a requirement complete unless implemented and verified in code; never report performance numbers (LCP/CLS/INP) as achieved without a recorded measurement.

### §1.7 Working Agreement (inviolable)

- **The owner performs all website viewing/visual QA.** Agents never launch a browser, never screenshot, never curl the live site. Deliver code + report; the owner's eyes close the loop. **Amendment (owner, 2026-09-07):** the agent may use the Playwright MCP browser for *precise, needed web-access tasks* (DOM/computed-style facts, reproducing a specific reported bug, console/network checks) — never for design judgment; everything visual or taste-level still goes to the owner (§12.3 changelog).
- Dropdown/pointer/scroll issues reported by the owner are accepted as ground truth about *symptoms*; their *diagnoses* still go through `VERIFY-FIRST` when a credible source says the mechanism may already be fixed (sub-state H7 protocol).
- Screenshots are never required to *locate* work — targets are identified from the repo structure, route config, and specs. A spec that can only be executed "by looking at the site" is malformed and must be flagged.

---

## §2. Product Identity & Vision

**North star:** *"Five paths. One learning ecosystem."* Educraft is a digital education platform unifying five verticals — linguistics, inclusive education, psychological counseling, AI & digital technologies, and NEET/JEE preparation — under one trust umbrella. The five pillars (**Learn · Include · Thrive · Achieve · Excel**) are not five unrelated offerings; they are the structural and visual metaphor for the entire site.

**Visual metaphor system** — used consistently across SVG illustrations, 3D scenes, backgrounds, and UI patterns:

| Element | Represents |
|---|---|
| **Path** | Progress, learning journeys, movement |
| **Node** | Programmes, milestones, ideas |
| **Layer** | Depth, knowledge, support |
| **Connection** | Ecosystem, relationships, interdisciplinary learning |
| **Growth** | Outcomes, confidence, capability |

**Experience qualities:** editorial rather than template-driven; warm, human, trustworthy, intelligent; premium without being decorative for its own sake; motion-rich without being distracting; content hierarchy drives design, not the reverse.

**Audiences, needs, and CTAs:**

| Audience | Needs | CTA |
|---|---|---|
| School leaders | Institutional credibility, programme breadth, partnership model, delivery quality, measurable outcomes | "Talk to the Education Team" |
| Parents | Safety/trust, individual student support, programme clarity, outcomes, how the journey works | "Find the right programme" |
| Students | Energy, future-oriented learning, tangible outcomes, confidence and belonging | "Explore your path" |
| Partners / organisations | Capability, scope, reach, partnership models, contact channel | "Partner with Educraft" |

**Homepage narrative arc:** Understand → Explore → Trust → Imagine → Choose → Act (section map in §6.3).

---

## §3. System Snapshot

| | |
|---|---|
| **Version** | `Prod.ver-0.1.0` (V2 marketing baseline). Dashboard work committed by the owner under `Prod-version:0.1.x` tags — latest **`29c96a6` `Prod-version:0.1.3 -- Course Allocation & Student Enrollment Rework`** (2026-09-05; preceded by `6f91f33` `0.1.2 -- Course Allocation` and `7276481` `-- Minor UI changes`). |
| **Last verified** | 2026-09-05 — `lint` ✓ · `tsc --noEmit` ✓ · `build` ✓ |
| **Routes** | 29 total — 16 marketing pages (incl. 5 programme detail pages) + system routes; all statically generated except `POST /api/enquiry` |
| **Live deploy** | `temp-tau-opal.vercel.app` (staging/preview). Production domain unset — §9 blocker BLK-02 |
| **Dashboard** | Stages 0–4 + course-setup slice **shipped** (2026-09-04/05); **Stage 5 — QA & Deploy is next** (§10, DASH-01) |
| **Demo accounts** | owner = **admin** `piyush.ghosal.ai@gmail.com` · professor `killerme69blank@gmail.com` · student `pika38212@gmail.com` — seed data is email-keyed to these accounts (5 courses, 3 demo materials/course, 3 meetings, 20 tasks, 10 completion logs; see sub-state §5) |
| **Origin** | V1 was a single-page landing prototype; V2 fully implemented the 77-section design plan; V3 = the roadmap items now living in the sub-state V3 families |

**Route map:**

```text
/                                Homepage (12 sections, §6.3)
/about                           Story, pillars, principles
/programmes                      Index — 5 programme cards w/ graphics
/programmes/[slug]               Detail ×5: linguistics, inclusive-education,
                                  wellbeing-counseling, ai-digital-tech, neet-jee
/for-schools · /for-parents · /for-students   Audience doors (shared AudiencePage)
/methodology · /impact           Method · outcome chain
/insights · /insights/[slug]     Index with category filter · Article ×4 (SSG)
/careers · /partnerships · /contact · /privacy · /terms
/api/enquiry                     POST — real lead pipeline (§6.8)
sitemap.xml · robots.txt         Generated (app/sitemap.ts, app/robots.ts)
/opengraph-image                 Homepage social preview (next/og)
/programmes/[slug]/opengraph-image   Per-programme social previews
/dashboard/...                   Authenticated role dashboards (§10)
```

**Shell hierarchy:** `src/app/layout.tsx` (fonts, theme, metadata, Organization JSON-LD) → `src/app/(site)/layout.tsx` (`EnquiryModalProvider` → `CursorProvider` → `SkipLink` → `Navbar` → `main#main-content` → `Footer` → `EnquiryModal` → `FloatingEnquiryButton`). All marketing pages live under the `(site)` route group.

**Source tree (load-bearing parts):**

```text
src/
├── proxy.ts                     Clerk auth boundary (Next 16 name — middleware.ts is deprecated)
├── app/                         (site)/ route group · (auth)/sign-in · dashboard/ (REAL folder) · api/
├── components/educraft/
│   ├── landing/                 Hero · Ecosystem · ProgrammeExplorer · WhyDifferent ·
│   │                            StudentJourney · ProgrammeDeepDive · Impact ·
│   │                            AudienceEntryPoints · Methodology · Testimonials ·
│   │                            InsightsTeaser · FinalCTA
│   ├── programme/               ProgrammePage.tsx (server component; client children)
│   ├── graphics/                ProgrammeGraphic · EcosystemGraphic · DecorativeSystems
│   ├── motion/                  Reveal · MagneticButton · CursorProvider
│   ├── three/                   core/ (CanvasShell·CameraRig·Lighting) · primitives/ (Node·Orbit·
│   │                            Connector·ParticleField·GeometryArtifact·GlowLayer) ·
│   │                            scenes/ (EcosystemScene) · hooks/ (useSceneActive)
│   └── ui/                      Button · Card · EnquireButton · Eyebrow · FaqAccordion ·
│                                FloatingEnquiryButton · SectionHeading · Stat
├── components/dashboard/        DashboardShell (sidebar + drawer) · NotificationBell · StatCard · etc.
├── context/                     EnquiryModalContext.tsx
├── data/                        programmes.ts (each Programme carries its own faqs[]) · pillars.ts ·
│                                navigation.ts · testimonials.ts · insights.ts ·
│                                enquiries.jsonl (runtime lead log — gitignored, personal data, never commit)
├── design/                      tokens.ts · motion.ts · colors.ts · typography.ts
├── hooks/                       useReveal · useReducedMotion · useScrollProgress · useParallax ·
│                                useScrollLock · useSectionProgress
├── lib/                         validation.ts · rate-limit.ts · utils.ts · pillarStyles.ts ·
│                                auth.ts · db.ts · prisma-client.ts · domain/ · actions/ ·
│                                storage/ (provider-agnostic; s3.ts) · notifications/ · validators/
└── types/                       index.ts
```

**Placement gotchas (deliberate, do not "fix"):** `EnquireButton`/`FloatingEnquiryButton` live in `ui/` (not `enquiry/`); `useSceneActive` lives under `three/hooks/` (not `src/hooks/`); enquiry state lives in `src/context/`. Route groups never contribute URL segments — `(dashboard)`-style grouping cannot create a `/dashboard` prefix; only a real folder can (§7 rule 8).

---

## §4. Technology Stack

| Layer | Choice | Version-critical notes |
|---|---|---|
| Framework | Next.js **16.3.1** (App Router, Turbopack) | Auth file is `src/proxy.ts` (middleware.ts deprecated); route groups never add URL segments |
| UI | React **19**, TypeScript | |
| Styling | Tailwind CSS **4** | Dynamic class construction does NOT compile — literal classes only (§6.1) |
| 3D | Three **0.185** + React Three Fiber **9.7** + Drei **10.7** | R3F 9.7.0 emits a harmless `THREE.Clock` deprecation warning — do not upgrade to a 10.0 canary to silence it |
| Icons | lucide-react | Installed |
| Theming | next-themes (`enableSystem={false}`, `defaultTheme='light'`, localStorage) | All theme-derived SSR markup must be `mounted`-gated |
| Validation | zod **4** | `{ message }` not `{ errorMap }`; `path` is `PropertyKey[]`; don't import `SafeParseReturnType` |
| Database | PostgreSQL (Neon) + Prisma **7.10** | `prisma-client` generator → `src/generated/prisma` (gitignored, regenerated by build); driver adapter `@prisma/adapter-neon` + `ws` wired in `lib/prisma-client.ts`; CLI config `prisma7.config.ts` |
| Auth | Clerk **7.9** | `clerkClient()` is async — `await clerkClient()`; roles via `publicMetadata`, read server-side via `clerkClient()`, never session claims; `auth()` throws on routes its matcher doesn't cover |
| Storage | AWS S3 (presigned URLs, provider-agnostic `lib/storage/`) | Replaced UploadThing 2026-09-05; env `S3_REGION/S3_BUCKET/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY` |
| Calendar UI | react-big-calendar **1.20** | Dashboard meetings/schedule |
| Dates | date-fns **4.4** | Named imports only — v3/v4 `exports` maps reject v2-style deep imports |
| Utilities | clsx + tailwind-merge, tw-animate-css | `animate-in` keyframes only fire on key-remount (used for stage/tab crossfades) |
| Fonts | Sora 600/700 (display) · Manrope 400/500/600 (body) via `next/font` | |
| Node | ≥ 20.9 | |

---

## §5. THE LIBRARY EMPOWERMENT RULE  ★ owner decision 2026-09-07

### §5.1 The Rule

**All previous restrictions on adopting third-party libraries, components, and assets are removed. Effective immediately, and without exception:**

1. **Full freedom.** Any library, component kit, headless-primitive set, motion engine, or pre-built asset may be used — shadcn/ui, Radix Primitives, Framer Motion (`motion`), GSAP, Lenis, Floating UI, TanStack, Recharts, vaul, sonner, cmdk, drei's full toolkit, CC0/stock 3D models, HDRIs, Lottie — **with no approval gate, no vetting ceremony, no license-check ritual, and no "demonstrated gap" test.** The agent's judgment is final.
2. **The default flips.** The agent must **resist building from scratch**. Before hand-writing a component, animation system, positioning utility, form controller, data table, calendar, dialog, dropdown, toast, or any UI primitive, the agent is required to first look for an existing, high-quality library or asset that provides it (§5.3 arsenal + a live search of the ecosystem). Hand-rolling is the *exception* that needs a reason — not the default that needs an exception.
3. **Why.** Pre-built, battle-tested resources make the product more authentic, more polished, and more reliable than agent-rolled approximations, and they free the agent's effort for what actually differentiates Educraft: its content, its data model, its choreography, and its visual identity.
4. **Reporting, not gating.** Every dependency added or removed is simply listed in the session's diff-scope report (§1.6) with the item ID that justified it. That is bookkeeping, not a barrier.
5. **Mixing is fine.** Library primitives and the existing hand-rolled system may coexist and compose (e.g., a Radix DropdownMenu inside the existing navbar styling; Framer Motion for a one-off entrance while `useScrollProgress` keeps driving pinned sections). There is no requirement to migrate wholesale and no requirement to stay pure.

### §5.2 What This Rule Explicitly Reverses

These former standing decisions are **overturned**; they are recorded in the sub-state ledger (§4.2) and must never be enforced again:

| Former rule | Where it lived | Status |
|---|---|---|
| "No new animation/positioning/UI library without a demonstrated gap — Framer Motion, GSAP, Lenis, Floating UI, Radix, shadcn remain unapproved" | old §18 rule 9 | **REVERSED** |
| "Hand-rolled UI / no shadcn/radix for marketing" | strategic memo §4.8 | **REVERSED** |
| "Do not add Framer Motion, GSAP, Lenis, Floating UI, Radix, or shadcn anywhere in this brief's scope" | homepage v2 brief §9, §11 | **REVERSED** |
| "No new npm dependency, anywhere, for any reason, without a separate owner conversation" | homepage v2 brief §11 | **REVERSED** |
| "Do not introduce a major new dependency unless there is a clear reason" (hero brief) | landing brief §0, §12 | **REVERSED** |
| "Custom motion system, no animation library" as a *protected decision* | strategic memo §3 | **REVERSED** (the custom system remains available and good — it is simply no longer mandatory) |
| GSAP/ScrollTrigger "reviewed — not adopted" | old §25 item 12 | **MOOT** — adoption is now free |
| shadcn/ui "Decide: install for data-heavy widgets or keep hand-rolling" | dashboard §24.3 | **RESOLVED: allowed** — `components.json` already exists at repo root; installing and theming shadcn is now a normal choice |
| Library recommendations in the two old briefs "conflict with the no-library rule and are not approved" | landing/site briefs | **MOOT** — the conflict no longer exists; those recommendations are simply available options |

### §5.3 The Ready Arsenal (curated, license-noted, pre-vetted by the source briefs)

License column is **information**, not a gate (§5.1). "Installed" = already in `package.json`.

**UI components & primitives**

| Library | License | Best use at Educraft |
|---|---|---|
| shadcn/ui | MIT | Dashboard widgets (data tables, dialogs, command menus); themed to Educraft tokens via CSS vars; `components.json` already present |
| Radix Primitives | MIT | Accessible headless behavior for dropdowns/popovers/tooltips/dialogs/tabs when hand-rolling a behavior is not worth it |
| Headless UI / Base UI | MIT | Alternatives to Radix where the API fits better |
| vaul | MIT | Bottom drawers (mobile surfaces) |
| sonner | MIT | Toasts (dashboard actions, form results) |
| cmdk | MIT | Command palettes (dashboard power-nav) |
| TanStack Table / TanStack Query | MIT | Dashboard tables; client-side polling/optimistic notifications (already the §10 plan) |
| Recharts | MIT | Dashboard completion/analytics charts |
| embla-carousel-react | MIT | Free-drag carousels — **note the design law: autoplay carousels stay banned (§6.3); drag/scroll-nudge only** |

**Motion & interaction**

| Library | License | Best use |
|---|---|---|
| Framer Motion (`motion`) | MIT | Layout animations, springs, text/entrance choreography, AnimatePresence transitions — complements the custom hooks |
| GSAP (+ ScrollTrigger, SplitText, MorphSVG, DrawSVG) | Free for commercial use (100% free since Webflow acquisition, 2025) | Timeline sequencing and complex choreography if/when the pinned stories need more than the current hooks give |
| Lenis | MIT | Smooth/inertia scrolling — pairs with ScrollTrigger; must respect reduced-motion and anchor/keyboard behavior (that is a design law, §6.3) |
| tsParticles | MIT | Lightweight ambient particles where the WebGL layer is not already doing particles |
| Lottie (lottie-react) | MIT (per-asset files vary) | Small 2D animated accents; check the specific asset file's license term on its page |

**3D, materials & assets**

| Resource | License | Best use |
|---|---|---|
| three / @react-three/fiber / drei | MIT (installed) | Hero + programme-page scenes; drei's `<Environment>` (HDRI reflections), `<MeshTransmissionMaterial>`/`<MeshDistortMaterial>` (frosted glass/resin), `<Float>`, `<Trail>`, `<Sparkles>`, `<ContactShadows>` directly serve the premium-dark art direction |
| Poly Haven HDRIs & models | CC0 | Studio/night/indoor environment maps for physically real reflections; low-poly models |
| Kenney.nl / Quaternius packs | CC0 | Ready low-poly geometry |
| Sketchfab | per-model (filter CC0 explicitly; avoid CC-BY-NC and "Editorial use only") | Occasional bespoke-feeling models without commissioning |
| Procedural composition (three primitives + drei materials) | — | Preferred for "abstract but semantically meaningful" course objects — zero license surface, tiny payload |

**Icons, type & content**

| Resource | License | Best use |
|---|---|---|
| lucide-react | ISC (installed) | Default icon system |
| Phosphor / Tabler / Heroicons | MIT | Alternate glyph sets when lucide lacks a specific semantic |
| Google Fonts / Fontsource | OFL | Self-hostable type additions (`next/font`) |
| TwAnimate / tailwindcss-animate | MIT | Already in stack via tw-animate-css |

### §5.4 What This Rule Does NOT Change

Library freedom is about **tools**. The following are **laws of the codebase and design** — correctness and identity, not tooling limits — and they bind library usage just as they bind hand-rolled code:

1. Engineering constraints §7 (all 10) — sticky/overflow law, hydration `mounted`-gate, zod v4 API, R3F immutability pattern, Tailwind 4 literal-class law, route-group law, Clerk matcher law, kinetic-type cap, `.next` hygiene.
2. One WebGL canvas per page (§6.5) — an architecture decision, not an anti-library rule; libraries cannot add a second independent canvas context.
3. Reduced-motion is a systemic guarantee (§6.10) — any library-driven animation must be configured to respect it (Framer Motion: `MotionConfig reducedMotion="user"` or equivalent; GSAP: honor the same media query; Lenis: disable under the media query).
4. No invented statistics (§6.2); no autoplay carousels (§6.3); no scroll-jacking — CSS `sticky` only (§6.3); testimonials stay editorial (§6.3).
5. One visual language (§6.1) — libraries get **themed into the token system** (pillars, type scale, spacing, radii); a component shipped with its library's default look is a defect, not a feature.
6. Server-authoritative data (§6.8, §10) — client libraries never determine success; the server re-validates everything.
7. Scope discipline (§1.4) — libraries are adopted *for items*, not as drive-by upgrades of working code.

### §5.5 The Anti-From-Scratch Reflex (behavioral directive)

For any new interactive/visual surface, run this order and stop at the first win:

```text
1. Does the repo already have it?            (components/educraft/ui, motion/, three/, hooks/)
2. Does the §5.3 arsenal cover it?           (shadcn · Radix · Framer · GSAP · drei · TanStack · …)
3. Does the wider ecosystem have a maintained, high-quality option?
4. Only then: hand-roll it — and record in the session ledger why 1–3 lost.
```

"Everything from scratch" is no longer a virtue in this project; it is a defect to be argued past step 3.

---

## §6. Architecture Laws (Design System & Subsystems)

### §6.1 Design System

**JS sources of truth:** `src/design/colors.ts` · `typography.ts` (type scale + `typeStyle()` helper) · `motion.ts` (durations 100ms–1.2s; baseline easing `cubic-bezier(0.22,1,0.36,1)`) · `tokens.ts` (4px spacing scale, radii, shadows, z-ladder base→cursor=120, layout gutters).

**CSS layer (`src/app/globals.css`):** `@theme inline` maps everything to runtime CSS vars that flip under `.dark`. Dark mode is **art-directed, not inverted**: deeper indigo canvas, brighter programme accents (light target: airy, educational, optimistic, soft sky; dark target: cinematic, atmospheric, deep indigo, subtle glow, restrained teal). Programme accent system `--ec-p-{learn,include,thrive,achieve,excel}` + `-soft` washes → classes `text-ec-learn`, `bg-ec-learn-soft`, etc. Component classes: `container-site` (1440 max, 64/48/32/24 gutters) · `container-content` (1200) · `type-{display-xl…caption}` (clamped) · `eyebrow`(+`eyebrow-rule`) · `card-surface` · `reveal-on-scroll` · `hero-enter`/`hero-enter-fade` (delay via `--hero-delay`) · `ambient-drift`/`ambient-pulse`.

**LAW — Tailwind 4 literal classes:** dynamic construction (`` `bg-ec-${x}` ``) generates no CSS at build time. Every pillar→class mapping is written literally in `src/lib/pillarStyles.ts` (`pillarTextClass`, `pillarBgClass`, `pillarSoftBgClass`, `pillarBorderClass`, `pillarAccentVar`/`pillarSoftVar` for SVG fills). Any new component — hand-rolled **or library-based** — routes pillar/accent classes through these maps.

**Decorative background systems** (shared, reused, never redrawn per-section): dotted-constellation, topographic lines, path lines, grid pattern, gradient mesh — each a shared component in `graphics/DecorativeSystems`.

### §6.2 Content & Data

Content model (`src/types/index.ts` + `src/data/`): `Programme` (slug, pillarId, name, tagline, promise, description, whyItMatters, audience[], outcomes[], highlights[], methodology[5], curriculum[], journey[6], activities[], support[], proof[], faqs[]) is fully content-driven — adding a programme requires **zero** component changes. Also `Pillar`, `Testimonial`, `Insight` (7 categories), `NavigationItem`, `AudienceEntry`. Site-level content (`methodologySteps`, `studentJourneyStages`) lives in `data/pillars.ts`.

**LAW — no invented statistics anywhere.** Proof is qualitative; the only numbers shown are real structural facts (5 verticals · 1 ecosystem · 4 audiences · 6 journey stages). Animation on those numbers (count-up) is a reveal treatment, never an implication of live data.

### §6.3 Homepage Architecture

| # | Section | Signature interaction | Notes |
|---|---|---|---|
| 01 | `Hero` | Staged entrance (0→1700ms via `--hero-delay`); scroll-linked content rise + camera pull-back + node drift (`useScrollProgress` `'full'`) | Headline "Five paths. One learning ecosystem." WebGL hidden on mobile → SVG `Constellation` fallback. Upgrade items: H1–H5 |
| 02 | `Ecosystem` | Interactive SVG map: 5 nodes around a core, spokes draw on enter, hover/focus lights the connection + updates an `aria-live` right panel, click → programme page | Mobile: stacked cards. Default = Learn. `data-cursor-label="Explore"`. Upgrade items: UIS-06/07 |
| 03 | `ProgrammeExplorer` | 550vh pinned scroll story (5 × 110vh): keyed crossfade panel, `ProgrammeGraphic`, progress rail | Mobile: horizontal snap cards. `'full'` mode. **Never gain `overflow-hidden` on ancestors** |
| 04 | `WhyDifferent` | Sticky left statement, numbered differentiators 01–05 | Kinetic-type candidate (UIS-09) |
| 05 | `StudentJourney` | 552vh pinned (6 × 92vh): path self-draws, milestones light | Mobile: vertical timeline. Same overflow law |
| 06 | `ProgrammeDeepDive` | Tabbed spotlight: curriculum, 5-step method, outcomes, proof, CTAs | Single-sourced — **not** a duplicate of 03 (see ledger) |
| 07 | `Impact` | Outcome chain Confidence→Engagement→Skill→Readiness, structural facts, evidence row | Upgrade items: UIS-02/03/04 |
| 08 | `AudienceEntryPoints` | Three doors — schools=indigo, parents=teal, students=gold | Upgrade item: UIS-08 |
| 09 | `Methodology` | Path-draw, calibrated: `'visible'` mode, `draw = clamp01(progress * 1.1)`, node *i* lights at `((i+0.08)/5.5)*1.1` (user-calibrated 2026-08-27) | Upgrade item: UIS-05 |
| 10 | `Testimonials` | Editorial: 1 primary parallax quote + 2 supporting. No carousel, no autoplay | Content is SEED (§9). **Do not touch structurally** |
| 11 | `InsightsTeaser` | 3 latest articles | |
| 12 | `FinalCTA` | Indigo close, SVG atmosphere on the existing single canvas, magnetic gold CTA | |

**Design principles (non-negotiable):** visuals explain learning/progress/connection, never decorate for their own sake; one great scene beats three mediocre ones; avoid endless rounded cards, all-centered sections, autoplay carousels, glassmorphism-for-its-own-sake, stock-looking art, invented numbers; reduced-motion users get static compositions + functional transitions; kinetic typography capped at exactly one heading site-wide (§7 rule 10); asymmetric bento composition is the preferred replacement for uniform equal-size card grids.

### §6.4 Programme Architecture

`programme/ProgrammePage.tsx` (server component, client children): Hero (accent eyebrow + `ProgrammeGraphic`) → why it matters → audience (3 cards) → 5-step method → curriculum (checklist modules, topographic background) → 6-stage journey cards → outcomes + activities → support + proof → FAQ accordion (accessible, one-open) → indigo conversion close → related programmes (4). JSON-LD: `Course` + `BreadcrumbList`; per-programme metadata + OG image.

### §6.5 WebGL / Graphics Laws

One coordinated system in `three/`:

- **LAW — one WebGL canvas per page.** V1's three separate canvases were deleted; do not reintroduce a second context anywhere. Programme-page 3D (UIS-10) mounts only because `/programmes/[slug]` and `/` are never simultaneously mounted.
- `core/CanvasShell` — frameloop pauses off-screen via `useSceneActive`; `AdaptiveDpr`; `dpr [1, 1.5]`. Any new scene copies this contract exactly.
- `core/CameraRig` — scroll + pointer, eased targets. `core/Lighting` — no per-node point lights; emissive materials + glow sprites.
- `primitives/`: `Node` · `Orbit` · `Connector` · `ParticleField` · `GeometryArtifact` · `GlowLayer`. New scenes are **new compositions of existing primitives**, not new primitive code.
- `scenes/EcosystemScene` — theme-aware: reads `resolvedTheme`, recolors accordingly. New scenes must be theme-aware the same way.

### §6.6 Motion Architecture

**Custom hooks (`src/hooks/`):** `useScrollProgress(ref, offsetTop?, mode: 'full' | 'visible')` — rAF-throttled; `'full'` = enter→full-exit (pinned sections); `'visible'` = bottom-edge-enters (path-draw sequences); exports `clamp01`, `lerp`. · `useReducedMotion` (single source of truth) · `useScrollLock` (reference-counted) · `useReveal({threshold, rootMargin, once})` (reveals instantly under reduced motion) · `useParallax` · `useSectionProgress`.

**Motion components:** `Reveal` (polymorphic; direction/delay/distance/duration) · `MagneticButton` (fine-pointer only, clamped) · `CursorProvider` (fine-pointer + non-reduced-motion; ring + `data-cursor-label`).

**Under the Library Rule (§5):** these hooks remain first-choice for scroll-choreography they already excel at; Framer Motion / GSAP are free to compose for layout animation, springs, entrance sequences, and one-off moments. Do not build a second scroll-progress mechanism where `useScrollProgress` already exists; do not wrap existing correct code in a library just because it is now permitted.

### §6.7 Navigation / Shell / Brand

**Navbar:** transparent → blurred+bordered on scroll (`h-20`→`h-16`); programmes mega menu (5 pillar rows + mini ecosystem SVG map + audience links) opens on hover + click, closes on Escape/outside-click/route-change with focus return; `aria-expanded`/`aria-controls`; route-aware `aria-current`; accessible mobile menu. "Sign in" link sits in desktop nav, mobile menu, and footer → `/dashboard` (role dispatch in `proxy.ts`; signed-out → Clerk `/sign-in`). No sign-up link anywhere — invite-only. Invite flow: `admin` invites professors+students, `professor` invites students (`INVITE_ROLES_BY_INVITER`, `lib/validators/auth.ts`), via Clerk Invitations API with `publicMetadata: { role }`. Owner's own admin access: set own Clerk user's `publicMetadata.role` to `"admin"` in the Clerk dashboard.

**Footer:** "Build learning journeys that last.", CTA pair, 4 nav clusters, constellation + path-lines background. No social icons until real handles exist (no dead `href="#"`).

**Brand lockup:** theme-aware swap — light `public/logo.png`, dark `public/logo-dark.png`, via CSS class switch (`dark:hidden` / `hidden dark:block`), no JS gating. Navbar `h-11 md:h-14`, Footer `h-14 md:h-16`.

**Business details** (`hello@educraft.com` / `+91 80 4567 8900` / Bangalore) — `VERIFY`, not stakeholder-confirmed (§9).

### §6.8 Enquiry / Lead Pipeline

`POST /api/enquiry`: JSON parse → zod v4 `enquirySchema` (role enum, name/email/phone, `programmeSlug`, `contactTime`, `message`, `consent: z.literal(true)`, honeypot `website` max length 0) → honeypot silent `200` → per-IP in-memory sliding-window rate limit (5 req / 10 min, `Retry-After`) → delivery: `ENQUIRY_WEBHOOK_URL` fetch (5s `AbortSignal`) + append `data/enquiries.jsonl` (gitignored, personal data) + structured log. **LAW: the client never determines success — the server re-validates everything.** Staged form (`EnquiryForm.tsx`): 3 steps + success; per-step zod, error association, autocomplete attrs, sr-only step announcements, loading/server-error/retry. Used by modal (locked/general) and contact page (`inline`). Rate limiter is per-instance — needs a shared store before multi-instance (§9).

### §6.9 SEO / Metadata

`metadataBase` from `NEXT_PUBLIC_SITE_URL` (fallback `https://educraft.com`). Per-route title/description/canonical. JSON-LD: `EducationalOrganization` (site-wide), `Course` + `BreadcrumbList` (programmes), `Article` (insights). `next/og` previews for home + programmes (insights articles are the only type missing one — V3-B6). **Satori rule:** every multi-child `div` inside an OG `ImageResponse` needs explicit `display: 'flex'` or prerender throws.

### §6.10 Accessibility

Shipped: semantic landmarks, skip link, logical headings, keyboard nav incl. mega menu (Escape/outside-click/focus return), focus-trapped `EnquiryModal`, `aria-live` Ecosystem panel, `aria-current`, `aria-expanded`/`aria-controls`, associated form errors, sr-only step announcements, `mounted`-gated theme toggle. **Reduced motion is enforced globally at the CSS level** (`prefers-reduced-motion` kills durations and un-hides reveals) — a guarantee, not a JS convention. Status: *implemented-by-convention, not audited* — formal WCAG 2.2 AA audit is V3-D19.

### §6.11 Performance

Shipped: single coordinated canvas; frameloop pause off-screen; `AdaptiveDpr` `[1, 1.5]`; no per-node point lights; reduced-motion short-circuit; static site except one API route. Targets (not yet measured — never report as achieved): LCP < 2.5s · CLS < 0.1 · INP < 200ms (V3-D17 baseline work).

### §6.12 Security & Data Handling

Enquiry API re-validates server-side; honeypot silent drop; rate limit per-instance only; `enquiries.jsonl` gitignored personal data; no analytics/error monitoring wired yet (Tier A items, not present — do not assume telemetry); env vars limited to `NEXT_PUBLIC_SITE_URL`, `ENQUIRY_WEBHOOK_URL` (+ dashboard's `DATABASE_URL`, `S3_*`, Clerk keys). S3: block-public-access ON, private objects, presigned URLs only; IAM scoped to `materials/*`.

---

## §7. Engineering Constraints & Regression Ledger

**The 10 do-not-regress rules** (source: fixed-bug ledger below; rule 9 rewritten 2026-09-07 by the Library Empowerment Rule):

1. **`overflow-hidden` on a pinned-section ancestor breaks `position: sticky`.** `StudentJourney` and `ProgrammeExplorer` keep section-level overflow visible; overflow handling belongs only on the sticky inner element.
2. **Hydration:** anything derived from next-themes' `theme` (or any post-mount state) inside SSR'd markup must be `mounted`-gated.
3. **zod v4 API:** `{ message }`, not `{ errorMap }`; `path` is `PropertyKey[]`; don't import `SafeParseReturnType` — `flattenZodErrors` takes a structural type.
4. **R3F:** imperative scene-graph mutation inside `useFrame` needs `// eslint-disable-next-line react-hooks/immutability` — canonical here, not React state.
5. **Tailwind 4:** literal class names only — no dynamic construction (§6.1).
6. **tw-animate-css:** `animate-in` keyframes only fire on key-remount (stage/tab crossfades).
7. **THREE.Clock warning** comes from R3F 9.7.0 internals — harmless; do not upgrade to a 10.0 canary to silence it.
8. **Route groups never contribute URL segments** — real folders own URL prefixes; a group-root `page.tsx` collides with `(site)/page.tsx` at `/`. Clerk v7 `auth()` **throws** on any route its proxy matcher didn't cover — keep matchers aligned with real routes; for fetch routes use a 401-JSON branch, never `auth.protect()`.
9. **~~No new animation/positioning/UI library without a demonstrated gap~~ → REPLACED by the Library Empowerment Rule (§5):** any library may be adopted freely; the default is to compose existing resources rather than hand-roll (§5.5); record additions in the diff-scope report. The engineering laws in §5.4 still bind how libraries are used.
10. **Kinetic-type treatment is capped at exactly one heading, site-wide** — overuse reads as "polish without substance." No heading currently uses it; this caps the first addition. (A design-restraint law — unaffected by §5.)

**Fixed-bug regression table:**

| Problem | Root cause | Fix | Standing rule |
|---|---|---|---|
| Student Journey blank zone after stage 2 | `overflow-hidden` on the section broke sticky pinning | Removed section-level overflow | Rule 1 |
| Hydration mismatch (theme toggle labels) | next-themes resolves post-mount | `mounted`-gated label | Rule 2 |
| Enquiry persistence `ENOENT` | `data/` didn't exist | `mkdir` recursive in handler | Never assume a write-target directory exists |
| Methodology path-draw never reached node 5 | `'full'` mode completed the draw off-screen | `'visible'` mode + 1.1× acceleration + retuned thresholds | Calibrate path-draw against actual scroll distance |
| OG image prerender error | Satori needs `display:'flex'` on multi-child divs | Fixed headline wrapper | §6.9 Satori rule |
| Stale `.next/types` tsc errors | Cached validator referenced deleted files | `rm -rf .next` before typecheck/build | .next hygiene after deletions |
| Dashboard shell 404/500 after Stage 0 | `(dashboard)` group stripped from URLs; bare paths uncovered by proxy | Real `src/app/dashboard/` folder; dispatch in `proxy.ts` | Rule 8 |
| UploadThing free tier rejected private files | `x-ut-acl=private` requires paid tier | Switched to S3 provider behind the same interface — zero domain/DB/UI change | Provider-agnostic storage absorbed the swap (design pattern to keep) |

---

## §8. Verification, Build & Deployment

```bash
npm install
npm run dev         # local dev on :3000 (first compile ~14s is normal)
npm run lint        # eslint (react-hooks/immutability active)
npx tsc --noEmit
npm run build       # prisma generate && next build — all three must pass before shipping
npm start           # serve the production build
```

- `npm run build` = `prisma generate && next build` (generated client is gitignored build output; regenerated every build, local and Vercel). The generated client is eslint-excluded (`src/generated/**`) — its disable-directive headers trip ESLint 9's config-level `reportUnusedDisableDirectives`.
- **Never wipe/rebuild `.next` while a dev server is running** — it loses route registrations and 404s existing dynamic routes until restart. Stale-`.next` tsc errors: `rm -rf .next && npx tsc --noEmit && npm run build`.
- Dev server reads `.env.local` only at boot — restart after env changes.

**Deployment (Vercel):** site is static except `/api/enquiry`; import repo → set env vars → deploy.

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical production domain (metadata, sitemap, OG) |
| `ENQUIRY_WEBHOOK_URL` | Enquiry delivery (CRM/email); without it, leads land in `data/enquiries.jsonl` + logs |
| `DATABASE_URL` | Neon Postgres direct URL (dashboard) |
| `STORAGE_PROVIDER` + `S3_REGION/S3_BUCKET/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY` | Dashboard material storage (S3; unset → honest "uploads disabled" path) |

AWS S3 config (completed 2026-09-05, bucket `educraftbucket07`, `ap-southeast-2`): block-all-public ON; IAM programmatic user scoped to `materials/*` (`s3:PutObject/GetObject/DeleteObject`); CORS for browser presigned PUTs (`AllowedHeaders: *`, expose `ETag`); smoke gate `npm run db:storage-smoke` PASSED. Presigned PUTs sign headers — clients PUT raw bytes with the signed Content-Type, never multipart.

---

## §9. Production Blockers (pre-launch — take precedence over all roadmap work)

| # | Blocker | Owner/Agent | Note |
|---|---|---|---|
| 1 | **Testimonials** — `data/testimonials.ts` holds clearly-marked SEED content; replace with real, verified, consented quotes | Stakeholder | Queue: BLK-01 |
| 2 | **Env vars** — `NEXT_PUBLIC_SITE_URL` (real domain), `ENQUIRY_WEBHOOK_URL` (CRM) unset | Owner | Queue: BLK-02 / V3-A1, V3-A5 |
| 3 | **Business details** — email/phone/city `VERIFY`, not stakeholder-confirmed | Stakeholder | Queue: BLK-03 |
| 4 | **Social handles** — absent by design until real handles exist | Stakeholder | Queue: BLK-04 |
| 5 | **Rate limiter** — in-memory, per-instance only; needs Redis/Upstash before multi-instance | Agent (when triggered) | Queue: BLK-05 = V3-D18 |
| 6 | **Role-less sign-in trap** — Clerk instance in Open mode lets uninvited emails create role-less accounts; dispatch silently redirects to `/`; stranded sessions; deep links 500 | Owner + Agent | Agreed fix direction: (a) Clerk Restricted (invite-only) mode; (b) app-level honest "no role" page with Sign out + `requireRole` redirect instead of throw. Queue: DASH-04 |

---

## §10. Dashboard Project — Standing Status

**Status:** Stages 0–1 shipped 2026-09-04; Stage 2 (Professor Core), Stage 3 (Meetings & Planner), Stage 4 (Polish), and the course-setup slice (created → then reworked same-day with enrollment notifications, normalized emails, hardened domain, full post-creation management surface) all shipped 2026-09-05. **Next: Stage 5 — QA & Deploy** (queue DASH-01). The existing marketing site stays untouched by dashboard work (isolation law: a dashboard bug can never take down the pages that drive enquiries). Live on staging `temp-tau-opal.vercel.app` at `29c96a6` (`Prod-version:0.1.3`).

**Shape:** one codebase, two role experiences (`Student`, `Professor`, minimal `Admin`), at real `/dashboard/*` URLs (real folder — §7 rule 8). Clerk auth; roles via `publicMetadata` single-source-of-truth read via `clerkClient()` server-side; DB mirror via lazy upsert + adopt-by-email. Prisma 7.10 + Neon; provider-agnostic storage (S3 since 2026-09-05); polling + DB-backed `Notification` table (no websockets until felt); thin Server Actions (`src/lib/actions/`) over a testable domain layer (`src/lib/domain/`, `DomainError` codes); IST datetime contract for all forms (`istWallTimeToUtc`).

**Entities:** `User` · `Course` (many-to-many professors via `CourseProfessors`) · `Enrollment` · `ClassSession` · `Material` · `Notification` (+ per-type prefs `notifPrefs Json?`) · `Meeting` · `Task` · `CompletionLog`.

**Key decisions (§24.8 ledger, still binding):** Clerk decided 2026-09-04 · many-to-many course↔professor · polling fine for v1 · storage provider-agnostic with provider column + opaque keys, never URLs · client uploads go browser→S3 presigned PUT (server never proxies bytes) · notification builder is pure + honors prefs from day one · integration tests in Stage 5 drive the domain layer directly (no Clerk).

**Stage 5 scope & exit criteria:** integration tests for critical paths (enroll → see class; post material → student notified; create task → completion updates); seed/demo-data walkthrough; Vercel preview + staging DB; merge to production with the same Prisma migration; rollback plan (feature-flag the dashboard nav link if needed). **Exit: feature live on the real domain behind auth** — which also requires BLK-02 (`NEXT_PUBLIC_SITE_URL`) to be resolved. Remaining owner checks: the browser E2E list (DASH-02) and the student-side signed download-link click-through (DASH-03).

**Library Rule effect here:** shadcn/ui (and any dashboard UI kit) is now an allowed default for data-heavy widgets — `components.json` exists at repo root. Anything installed must be themed into the existing dashboard visual language (§5.4 law 5).

---

## §11. Design Direction (Converged Visual Intelligence)

### §11.1 Diagnosis — why the site reads "good" rather than "beautiful"

The site's *engineering* is ahead of its *presentation*. The hard problems are already solved well: single-progress-value choreography, sticky pinning without scroll-jacking, accessible reactive panels, systemic reduced-motion. What holds it back:

- **One real extensibility bug:** `Ecosystem` node positions are a hardcoded `POSITIONS` object — adding a 6th pillar requires hand-editing coordinates (contradicts the data-driven model everywhere else).
- **Two uniform-card-grid instances** (`Impact` evidence row, `Methodology` step row) — the clearest "templated" signal.
- **One icon-reuse mistake:** all four `Impact` outcome chips share `TrendingUp`.
- **No single "wow" moment beyond the hero** — kinetic type, count-up, and dimensional payoffs absent.
- Presentation-level (not structural) gaps: `ProgrammeExplorer`'s idiom reads slightly generic; `StudentJourney`'s good progress signal deserves richer visible payoff; `AudienceEntryPoints` is taller than its content needs; `WhyDifferent` is under-designed relative to its claim.

Section-credit row (verified correct, do not "fix"): `Ecosystem`'s `aria-live` panel is reactive, not static; `StudentJourney` runs on one shared `useScrollProgress`; `Testimonials` is editorial by design; `DecorativeSystems` is a strong, underused asset needing disciplined reuse, not replacement.

### §11.2 Research-validated principles (2026 review — still current)

1. **Progressive disclosure** — reveal one idea at a time as you scroll; the pinned sections already do this structurally; give the signal richer payoff rather than replacing it.
2. **Kinetic typography is a rare hero-level moment** — one strong animated headline beats many; hence the site-wide cap of one (§7 rule 10).
3. **Bento grids are the better-regarded replacement** for uniform equal-size card rows — maps onto exactly the two weak sections.
4. **Lightweight 3D is mainstream only when restrained and performance-guarded** — the existing one-canvas + frameloop-pause + dpr-clamp discipline is exactly right; extend it carefully (UIS-10), never abandon it.
5. **Accessibility is foundational** — WCAG AA contrast, reduced-motion fallback on every animation, semantic structure.
6. **Restraint is itself the trend** — upgrades come from fixing the real gaps above, not from replacing the motion system or bolting on a library shelf. (The Library Rule changes *how* gaps may be closed — with the best tool available — not *whether* restraint governs.)

### §11.3 Protected Decisions (defend these)

No invented statistics · CSS `sticky` pinning, never scroll-jacking · one WebGL canvas (+ the approved programme-page composition) · `aria-live` ecosystem panel as the accessible source of truth · data-driven content, no CMS · marketing/dashboard isolation · editorial non-carousel testimonials · one container/type/spacing system · the custom motion hooks remain the spine of scroll choreography (libraries compose, not replace — §6.6). *(Removed from this list 2026-09-07: "custom motion system, no animation library" and "hand-rolled UI for marketing" — both reversed by §5.)*

### §11.4 Hero & Landing Visual Direction (spec source for H-family items)

**Target impression:** dark, cinematic, premium, sophisticated, educational; communicates premium · sophisticated · educational · modern · cinematic · intelligent · trustworthy · technologically advanced. Never: toy-like · cartoon-like · generic sci-fi · crypto-landing · random 3D experiment · children's game UI · "space planets around a logo" template.

**Three-zone hero composition:** LEFT content/messaging — CENTER the animation as the true visual anchor (not merely between two columns) — RIGHT supporting content. Responsive grid/flex with explicit breakpoints, no brittle absolute positioning; tablet reduces side columns proportionally; mobile stacks deliberately (brand/header → hero message → animation → supporting → CTA). Visual hierarchy: brand/nav → main message → central animation → supporting content → CTAs. Side columns never crowd or overlap the central object.

**Semantic programme visuals:** replace any empty decorative planets with real course/programme representations drawn from `data/programmes.ts`/`pillars.ts` — actual names as readable text where appropriate, each paired with a symbolic icon/emblem/small 3D artifact (abstraction allowed, but semantically meaningful: geometric structure for math-like rigor, molecular/lab for science, circuit/computational for tech, sculptural for arts, typographic for language). Premium physical/digital artifacts, one consistent design language. Compose from existing primitives + arsenal assets; never hand-model bespoke meshes when a procedural composition or CC0 asset satisfies it.

**Central system message:** multiple learning pathways → one connected learning ecosystem. Avoid generic planetary rings, excessive spheres, random floating primitives, rainbow materials, excessive bloom, screensaver movement. Prefer sculptural geometry, refined glass/metal/resin surfaces, controlled emissive accents, layered depth, meaningful paths, restrained particles, cinematic camera.

**Lighting/materials/depth:** strong soft key + subtle fill + controlled rim; realistic highlights and soft reflected illumination; foreground/midground/background separation; restrained bloom; believable contact/occlusion; environment lighting via HDRI (`<Environment>` + Poly Haven CC0) rather than hand-authored rigs. Materials: dark matte, brushed metal, frosted glass, resin, limited emissive — never uniformly glossy or neon. Color discipline: dominant dark navy/charcoal; secondary cool teal/cyan; tertiary warm accent sparingly.

**Animation principles:** motion has hierarchy and purpose — camera extremely slow with subtle parallax; main system rotation ~8–15s where looped; secondary objects slightly desynchronized; particles sparse and purposeful (travel connections, communicate flow). The loop tells the story: individual programmes → connection → shared ecosystem → continuous flow → loop. Typography blends into the environment: strong hierarchy, consistent spacing scale, controlled line lengths, primary contrast strong / supporting softer, no arbitrary text effects; hero message stays readable while animation runs.

**Mouse-light effect (H4):** pointer acts as a localized light source over dark content — soft-edged, plausible falloff, limited radius, smooth follow with easing lag, never a cursor-spotlight gimmick; text readability preserved. Implementation: least invasive path (CSS radial gradients/custom properties/pseudo-elements first; canvas/WebGL only if necessary); no expensive per-frame DOM mutation per character. Disabled/simplified on touch and low-power devices; respects reduced motion.

### §11.5 Acceptance Bar for Visual Work

A visual upgrade ships only when: composition balanced at common desktop widths; mobile/tablet usable and deliberate; brand elements (logo, slogan, nav) intact and intentional; visuals sophisticated rather than toy-like; lighting/reflections/depth believably improved; color restrained and premium; interaction effects smooth and subtle; no performance regression; reduced-motion respected; every changed line mapped to an item ID.

---

## §12. Governance, Supersession Map & Change Log

### §12.1 Supersession Map (proof of full absorption)

| Source document (retired) | Content now lives in |
|---|---|
| `EDUCRAFT_PRODUCTION.md` §0–§2 (authority, identity, release state) | here §0/§2/§3 |
| `EDUCRAFT_PRODUCTION.md` §3–§5 (stack, routes, source tree) | here §4/§3 |
| `EDUCRAFT_PRODUCTION.md` §6–§17 (design system, content, homepage, programmes, WebGL, motion, nav, enquiry, SEO, a11y, perf, security) | here §6 |
| `EDUCRAFT_PRODUCTION.md` §18–§19 (constraints, fixed bugs) | here §7 |
| `EDUCRAFT_PRODUCTION.md` §20–§21 (verification, deployment) | here §1.5/§1.7/§8 |
| `EDUCRAFT_PRODUCTION.md` §22 (blockers) | here §9 + sub-state BLK family |
| `EDUCRAFT_PRODUCTION.md` §23 (history) | here §3 origin row + sub-state §5 archive |
| `EDUCRAFT_PRODUCTION.md` §24 (dashboard project) | here §10 + sub-state DASH family |
| `EDUCRAFT_PRODUCTION.md` §25 (roadmap + principles + session checklist) | sub-state V3 families + here §6.3 principles + here §1.1 S0 |
| `educraft_uiux_strategic_upgrade_plan.md` §1–§3 (diagnosis, research, protected) | here §11.1–§11.3 |
| `educraft_uiux_strategic_upgrade_plan.md` §4 (rule changes 4.1–4.8) | here §5/§7/§11 + sub-state UIS specs |
| `educraft_uiux_strategic_upgrade_plan.md` §5 (flagged decision) | sub-state FLAG-1 |
| `educraft_uiux_strategic_upgrade_plan.md` §6 (phased plan) | sub-state §3 waves |
| `educraft_uiux_strategic_upgrade_plan.md` §7 (retractions) | sub-state §4.1 |
| `educraft_uiux_strategic_upgrade_plan.md` §8 (preserved/unlocked summary) | here §11.3 + sub-state §5 |
| `educraft_homepage_v2_implementation_brief.md` §0–§12 (full execution spec) | sub-state UIS-01…UIS-11 specs (verbatim-grade) |
| `landing_page_redesign_agent_prompt.md` §0–§18 (hero brief) | sub-state H1–H7 specs + here §11.4/§11.5 |
| `landing_page_redesign_agent_prompt.md` Appendix A (libraries/assets + licensing) | here §5.3 arsenal (licensing now informational, §5.1) |
| `site_sections_ui_upgrade_agent_prompt.md` (entire) | sub-state §4 retraction ledger (surviving valid ideas arrived via the corrected memo) |

### §12.2 Governance

- **Amending the master** requires an owner-authorized decision recorded in the change log below with: decision, reasoning, date, and the affected sections. Agents propose; only the owner disposes.
- **Amending the sub-state** is the working agent's normal duty (S5): states, ledger entries, archive moves — freely and mandatorily.
- **New hard-won lessons** graduate into master §7 via §12.2; the sub-state session ledger is their staging ground.
- **Conflict handling:** owner instruction > master > sub-state > repo `AGENT_CONTEXT.md` (if present). Log every resolved conflict in the session ledger.
- **Sub-state line budget (owner rule, 2026-09-07):** a sub-state file may not exceed **500 lines**. When a sub-state file crosses that budget, the session that notices must split it: partition the content into coherent units (by family or by concern), create the additional sub-state file(s), give each new file a header pointer to this master + cross-links to its sibling sub-state files, register every sub-state file in the registry below, and keep each file under 500 lines. The queue overview and session ledger stay in the primary sub-state file unless a split says otherwise.
- **Sub-state files registry:** `EDUCRAFT_SUBSTATE.md` — primary live work queue (created 2026-09-07, v1.1). · `EDUCRAFT_SUBSTATE_UI-CYCLE.md` — Front-End Overhaul Cycle control plane: FC queue table, waves, OWNER-GATE registry, cycle ledger (created 2026-09-07; parent: this master, §13). · `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md` — FC-* execution specs (created 2026-09-07; parent: this master §13; sibling of the cycle control file). New sub-state files register here with name · scope · creation date · parent (this master).

### §12.3 Change Log

| Date | Change | Authorization |
|---|---|---|
| 2026-09-07 | **v3.0 — Converged 2-File Agentic System created.** Five predecessor docs absorbed and retired. **Library Empowerment Rule enacted (§5): fully unrestricted library/component/asset adoption; from-scratch is the exception, not the default.** Old §18 rule 9, strategic-memo §4.8, and both briefs' dependency bans reversed; kinetic-type cap retained as design law. Workflow Engine (pipeline S0–S6 + item state machine) established. Dashboard shadcn question resolved as "allowed." | Owner decision, 2026-09-07 |
| 2026-09-07 | **v3.0 migration reconciliation.** Version facts corrected to `29c96a6` / 0.1.3 (§3, §10); demo-accounts row added (§3); 500-line sub-state budget enacted + sub-state registry created (§12.2); Stage 3/4 owner E2E checks folded into sub-state DASH-02; hygiene ledger ported as sub-state V3-D21; `EDUCRAFT_PRODUCTION.md` + `PROJECT_STATE.md` archived to `docs-archive/` (not deleted — owner chose archive); assistant memory migrated to this system. | Owner migration instruction + owner approval (archive, V3-D21, DASH-02 extension), 2026-09-07 |
| 2026-09-07 | **§13 Front-End Overhaul Cycle (v4) commissioned.** Full marketing-site rebuild to the Awwwards-tier premium bar (§13.1); deep-redesign depth — engineering rules (§7) untouched, design-restraint laws (§11.3) re-opened item-by-item via OWNER-GATEs G1–G14 (§13.4); Library Rule (§5) in force throughout. Precedence ladder amended (§1.3: UIS/H/V3-B rungs replaced by the FC family). Sub-state files `EDUCRAFT_SUBSTATE_UI-CYCLE.md` + `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md` registered (§12.2). Existing UIS-*/H*/V3-B* queue items MERGED into FC items with pointers (primary sub-state §1). **Code implementation starts only after the Phase 0 owner gate** (rulings on G1–G12). | Owner decision, 2026-09-07 |
| 2026-09-07 | **Phase 0 gate rulings (Wave 1).** Owner ruled G1 = dark cinematic anchor zones (Option B); G2 = Clash Display + Instrument Serif italic accent + Manrope; G11 = Lenis moderate inertia, native touch, reduced-motion off; G12 = no preloader. Wave 1 (FC-01…09) is OPEN; remaining gates rule at their wave entrances (§13.4). | Owner rulings, 2026-09-07 |
| 2026-09-07 | **Working-agreement amendment (§1.7).** Owner authorized agent use of the Playwright MCP browser for precise, needed web-access tasks (DOM/computed-style facts, reproducing a specific reported bug, console/network checks) — never for design judgment; all visual/taste-level QA remains the owner's. | Owner instruction, 2026-09-07 |
| 2026-09-07 | **§13 status sync (owner instruction).** Phase 0 marked complete; Wave 1 active — FC-01 (baseline + CWV pre-measure), FC-03 (token & CSS layer v4), FC-04 (typography v4: Clash Display + Instrument Serif + Manrope), FC-05 (grain & atmosphere layer) are DONE; FC-02/06/07/08/09 READY. Evidence in the cycle control file §1/§5. | Owner instruction, 2026-09-07 |

---

## §13. Front-End Overhaul Cycle (v4) — Commissioned

> **Status:** ACTIVE — COMMISSIONED 2026-09-07 (owner decision, §12.3). **Phase 0 complete (2026-09-07): Wave-1 gates ruled (G1/G2/G11/G12, §13.4) and Wave 1 is in progress — FC-01, FC-03, FC-04, FC-05 DONE** (per-item evidence in the cycle control file §1 + §5 ledger). Remaining gates (G3–G10) rule at their wave entrances (§13.4). Live queue, specs, waves and the cycle ledger live in the registered sub-state files (`EDUCRAFT_SUBSTATE_UI-CYCLE.md` + `..._SPECS.md`); this section is the static charter. Scope: the full marketing site — homepage (12 sections) + 5 programme pages + interior pages. Dashboard is out of scope (DASH family).

### §13.1 The Premium Bar (2026 Awwwards benchmark — distilled reference, owner-approved 2026-09-07)

**Standard stack.** Lenis (inertia scroll) + GSAP ScrollTrigger (scroll choreography) + Three.js; page transitions via View Transitions API / Framer-class patterns.

**Instant-fail list (banned; checked at every wave's owner QA):** Inter/Roboto/Arial fonts · thick-stroke generic icons · generic 1px gray borders · harsh drop shadows · linear / `ease-in-out` transitions · symmetric equal 3-column grids · edge-to-edge sticky navbars.

**Texture & depth (table stakes):** noise/film-grain overlay · mesh gradients · animated gradients · glassmorphism with backdrop blur (dark zones only) · layered soft shadows · blend modes · clip-path reveals.

**Layouts:** full-bleed heroes with H1 at 2–3 lines · gapless bento (`grid-flow-dense`) · asymmetric editorial splits (2:1 / 5:7) · horizontal scroll sequences · Z-axis stacked cards · `min-h-[100dvh]`, never `h-screen`.

**Typography as architecture:** display 120px+ / 15–25vw · kinetic/scroll-driven type (word staggers, line slides, scramble) · premium non-banned faces (Clash Display, PP Editorial New, Satoshi, Cabinet Grotesk, Geist, Plus Jakarta Sans, Outfit).

**Motion:** tiered (primary = narrative beats · secondary = entrances/micro · ambient = atmosphere) · magnetic buttons · RAF custom cursors · morphing shapes · page transitions · **restraint: when wow rises, navigation gets simpler.**

**3D:** limited scenes that support a narrative beat — never full-site 3D · particle fields, mouse-driven distortion, 3D typography with static fallbacks · **performance is the differentiator** (60fps, adaptive counts, fallbacks).

**Hard requirements (unchanged §6.10/§6.11):** WCAG 2.2 AA · systemic reduced-motion · 60fps scroll (transform/opacity only) · mobile-first 375/768/1440 · CWV LCP < 2.5s / CLS < 0.1 / INP < 200ms measured, never assumed (§1.6) · no invented data (§6.2).

### §13.2 Design Direction v4 — "Editorial Ecosystem"

**Working thesis:** Educraft's differentiator is *editorial confidence*: massive typography, restrained cinematic zones for the flagship narrative act, and asymmetric evidence composition — on the preserved foundation (token system, one-canvas WebGL, calibrated pinned stories).

- **Typography** (gate G2): display **Clash Display** (Fontshare, ITF Free license, self-hosted WOFF2 via `next/font/local`) + **Instrument Serif italic** accent word per headline (SIL OFL, `next/font/google`); body **Manrope stays**; alternative = Geist + Instrument Serif. Display scale up ~one notch; H1 → `clamp(3.25rem, 7.5vw, 7.5rem)`, lh .92, tracking −0.04em.
- **Color & texture:** the `--ec-*` token system + pillar accents are preserved (one visual language). Compose onto them: (1) fixed grain overlay (SVG `feTurbulence` data-URI, ~1 KB, opacity ~0.035, soft-light); (2) animated mesh gradients (two slow transform-only radial layers); (3) glass surfaces on dark zones only; (4) layered ambient+key shadows in `tokens.ts`; (5) hairline rules on premium surfaces.
- **Theme tension** (gate G1): recommended **Option B — dark cinematic anchor zones**: light-default preserved; the flagship act (Hero → Ecosystem → ProgrammeExplorer → WhyDifferent → StudentJourney) becomes theme-independent dark with local surface tokens, handing back to themed content at Impact. Options A (dark-first site-wide) and C (full parity) remain on the table.
- **Motion:** Lenis is the scroll base; `useScrollProgress` stays the spine of the two pinned stories + Methodology draw (gate G4 governs any migration); GSAP takes *new* choreography (panel handovers, kinetic type via SplitText, stepper draws); Framer `motion` takes entrances/layout/micro + page transitions (`MotionConfig reducedMotion="user"`). Durations stay sourced from `design/motion.ts`; linear/`ease-in-out` banned.
- **Layout:** uniform card rows → gapless asymmetric bento, editorial 2:1/5:7 splits, full-bleed statements, hairline-ruled lists. One container/type/spacing system preserved.

### §13.3 Cycle Laws (bind every FC item)

1. **Phase 0 gate first** — no FC implementation before the owner approves the premium bar (§13.1) and rules the gates needed for Wave 1 (§13.4).
2. **Wave-gated delivery** — entrance gate → implement → universal loop + item-type gates (§1.5) → owner visual QA (§1.7) → wave closure in the cycle ledger.
3. **OWNER-GATE first** — every §11.3 protected-decision conflict is a named gate ruled *before* its workstream starts; rulings append to §13.4.
4. **Library-first** — §5 in full force; every dependency listed in the diff-scope report (§1.6).
5. **Custom spine preserved** — `useScrollProgress` drives pinned stories unless G4 renegotiates.
6. **Content preservation** — no copy/stat/bullet deleted in any recomposition; content-loss audit per item.
7. **Perf contract** — scroll animations transform/opacity only; one-canvas + frameloop-pause + `AdaptiveDpr [1,1.5]` unchanged; CWV measured pre (FC-01) and post (FC-27).
8. **Reduced-motion systemic** — every library-driven animation honors the guarantee (Lenis off, GSAP `matchMedia`, `MotionConfig reducedMotion="user"`).
9. **One visual language** — libraries themed into `--ec-*` tokens; library-default looks are defects (§5.4 law 5).
10. **Sub-state budget** — cycle files respect §12.2 (500-line cap; split when crossed).
11. **Agents never visual-QA** — the owner closes every wave (§1.7).
12. **Kinetic-type cap** — exactly one heading site-wide (§7 rule 10) unless G3 rules otherwise.

### §13.4 Renegotiation Record — OWNER-GATE registry (append-only)

| # | Gate | Touches | Decision required before | Options presented |
|---|---|---|---|---|
| G1 | THEME-STRATEGY | one visual language / art-directed themes (§6.1) | FC-06 | A dark-first · **B dark cinematic anchor zones (rec.)** · C parity as-is |
| G2 | TYPE-SYSTEM | one type system (§11.3) | FC-04 | Clash Display + Instrument Serif accent (rec.) · Geist variant · keep Sora, scale up |
| G3 | KINETIC-TYPE | §7 rule 10 cap | FC-14 (or FC-10) | Cap stays one site-wide (rec.) vs one-per-page; heading pick: WhyDifferent vs Hero |
| G4 | PINNED-SPINE | custom hooks remain the scroll spine (§6.6/§11.3) | FC-13 | Keep `useScrollProgress` for pinned stories (rec.) vs migrate to GSAP pins |
| G5 | EXPLORER-DEEPDIVE | FLAG-1 (§2.6 sub-state) | FC-13/FC-16 | Keep both, differentiate harder (rec.) vs merge DeepDive into Explorer |
| G6 | SECTION-MAP | homepage architecture (§6.3) | Wave 2 | Any merge/removal/reorder beyond G5 — none proposed by default |
| G7 | TESTIMONIAL-MOTION | editorial non-carousel testimonials (§11.3) | FC-20 | Editorial restyle only (rec.) vs allow subtle drag/scroll nudge |
| G8 | COUNT-UP | no invented statistics (§6.2) | FC-17 | Count-up as reveal on the real 5/1/4/6 facts only (rec.); no new numbers |
| G9 | ECOSYSTEM-PANEL | `aria-live` panel = accessible source of truth (§11.3) | FC-12 | Panel visual restyle allowed, content/markup stable (rec.) vs byte-stable |
| G10 | ONE-CANVAS-SCOPE | one WebGL canvas (§6.5) | FC-24 | Confirm the route-scoped programme-page artifact remains wanted under the law (rec.) |
| G11 | SCROLL-FEEL | scroll experience | FC-02 | Lenis intensity/duration preset; mobile = native touch (rec.) |
| G12 | PRELOADER | CWV discipline (§6.11) | Wave 1 | No loader; staged hero entrance (rec.) vs branded loader (LCP trade-off) |
| G13 | DATA-DRIVEN | data-driven content, no CMS (§11.3) | — | Record only — preserved; no conflict proposed |
| G14 | ISOLATION | marketing/dashboard isolation (§11.3) | — | Record only — preserved; no conflict proposed |

Rulings append here with date + reasoning (owner-authorized). All §7 engineering rules are **not renegotiable** and bind every FC item regardless of gate outcome.

**Rulings — Phase 0 (2026-09-07, owner):**

| Gate | Ruling | Reasoning |
|---|---|---|
| G1 THEME-STRATEGY | **Option B — dark cinematic anchor zones.** Flagship act (Hero → Ecosystem → ProgrammeExplorer → WhyDifferent → StudentJourney) becomes a theme-independent dark zone with local surface tokens; light-default + art-directed dark preserved from Impact onward. | Recommended option accepted (localizes risk to the flagship act; cinematic direction gets its stage) |
| G2 TYPE-SYSTEM | **Clash Display** (Fontshare, ITF Free; self-hosted WOFF2 via `next/font/local`) for display + **Instrument Serif italic** accent word per major headline (SIL OFL, `next/font/google`) + **Manrope body stays**. | Recommended option accepted (max editorial character, premium-bar face) |
| G11 SCROLL-FEEL | **Lenis, moderate inertia** on desktop; native scroll on touch/mobile; disabled under `prefers-reduced-motion`; anchors + keyboard + sticky semantics preserved. | Recommended option accepted |
| G12 PRELOADER | **No loader.** Staged hero entrance is the load moment; CWV discipline first. | Recommended option accepted |

Remaining gates (G3, G4, G5, G6, G7, G8, G9, G10) rule at their wave entrances — Wave 2 (G3/G4/G5/G6/G9), Wave 3 (G7/G8), Wave 4 (G10).

### §13.5 File pointers & precedence

- Cycle control file: `EDUCRAFT_SUBSTATE_UI-CYCLE.md` (queue, waves, gate registry mirror, cycle ledger).
- Cycle specs: `EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md` (FC-01…FC-27 execution specs).
- Precedence: owner instruction > master > sub-state (§12.2); within the cycle, the §13.4 gate rulings outrank conflicting spec text. Wave order and gates: the cycle control file.
| 2026-09-06 | (inherited) UI/UX strategic review synced: Ecosystem fix, Impact icons, useCountUp, bento composition, audience compaction, kinetic cap, programme-page 3D approved | Owner memo |
| 2026-09-04/05 | (inherited) Dashboard Stages 0–4 + course-setup slice shipped; storage switched to AWS S3 | Owner |

