# Educraft — Production System

## 0. Document Authority

- **Authority:** Verified against the live repository on 2026-09-04 — source tree (§5) from a direct file listing, git remote `piyush-AIML/TEMP`, route set unchanged since the 2026-08-30 build — and re-verified by the full loop on 2026-09-04/2026-09-05 across every dashboard stage: `npm run lint` ✓ · `npx tsc --noEmit` ✓ · `npm run build` ✓ (29 marketing routes static except `/api/enquiry`; dashboard routes dynamic). The original body was consolidated from `prod.md` and cross-checked against the archived V2 plan and V1 record.
- **Purpose:** The **master document** for Educraft — current production state, conventions, blockers, background roadmap, and the two implementation projects (Dashboard, §24; Marketing Site UI-UX Upgrade, §28). A fresh session should be able to pick up the entire system from this file alone, without opening any other documentation.
- **Two-document system (introduced 2026-09-07):** this file is the *global master* — everything permanent (code state, architecture, conventions, ledgers, decision records, project specs). [`PROJECT_STATE.md`](PROJECT_STATE.md) is the *sub-state file* — the volatile layer: live snapshot (commit/deploy/accounts/env), per-track status, open owner checks, session checklist. **Governance R1 (owner-set 2026-09-07) — master-first:** whenever new information is introduced — a fact, a decision, shipped work, a correction, or a rule change — it is written into **this file first** (at its proper section); sub-state files are then created/updated/synced from it. This file must never lag the repo (the stale-commit row that §2 carried before 2026-09-07 was exactly a master-lag failure).
- **Supersedes and replaces (content absorbed, originals deleted):** `prod.md`, `README.md` (kept as a short GitHub pointer only), `Educraft_V1_Previous_State.md` (facts → §23), `Educraft_V2_Experience_Web_Design_Implementation_Plan.md` (archived; do not re-read or plan from it), `Educraft_V3_Next_Version_Planner.md` (→ §25) — all 2026-09-04 — and, 2026-09-07: `AGENT_CONTEXT.md` (verified internals → §5.1/§6/§12; rules → §18; decisions & recipes → §27), `ARCHITECTURE_REVIEW.md` (→ §26 hygiene ledger, statused), `Dashboard-Implementation-Plan.md` + `Dashboard-Stages-2-5-Implementation-Plan.md` (→ §24; Stage 5 execution detail → §24.10), and the three marketing-upgrade docs `UI-UX UPGRADE.md`, `landing_page_redesign_agent_prompt.md`, `site_sections_ui_upgrade_agent_prompt.md` (requirements distilled, reality-annotated and re-grounded → §28). `README.md` and `TECH-STACK.md` remain as short pointers (untouched).
- **What is NOT source of truth here:** The V2 plan was a *design proposal*. Large parts of it were never built or were built differently than proposed — notably `ProgrammeScene` and `CTAAtmosphere` (planned WebGL scenes; the shipped system uses SVG for both, see §10), GSAP/ScrollTrigger, Lenis smooth-scroll, analytics, error monitoring, and the entire automated test suite. Nothing in the V2 plan should be treated as implemented unless it is explicitly confirmed in this document. §25 roadmap items and §28 upgrade requirements are intent only — never current state.
- **Open verification items (`VERIFY`):** only the business contact details in §12 and §22 remain (a stakeholder input, not a code matter). Repository slug, file tree, and route inventory are confirmed from the live repo. Commit/deploy/account state: see `PROJECT_STATE.md` §1.
- **Document governance rules (owner-set 2026-09-07):**
  - **R1 — Master-first updates.** New information lands in this file first; sub-state files sync from it. (Full statement in the two-document-system bullet above.)
  - **R2 — Sub-state files may multiply.** When a topic outgrows `PROJECT_STATE.md` (a third project track, a long-running QA campaign, a new workstream), create additional sub-state files — each must (a) open with a pointer to this file and its purpose, (b) cross-link its sibling sub-state files, and (c) be registered in this section. All sub-state files revolve around this master and defer to it on any conflict.
  - **R3 — Rule-change protocol.** When new information would change a core rule — this document's conventions (§18), its decisions (§27), a project spec, the working agreements (§20), or the doc governance itself — do **not** reject it outright. Raise it to the owner for an opinion (with a neutral statement of the proposed change and any concerns), and if the owner agrees, amend the rules to the new information and record the change here with its date.
  - **Living-docs registry:** `EDUCRAFT_PRODUCTION.md` (this master) · `PROJECT_STATE.md` (sub-state, created 2026-09-07) · `README.md` + `TECH-STACK.md` (pointers, untouched). New sub-state files register here (R2c).
  - **Planned supersession (owner announcement, 2026-09-07):** the owner will enforce a **new knowledge-management system with a fully new architecture**. When its material/rules are provided: adopt them as authoritative, change any older rules (incl. this document system's R1–R3) that conflict, and update assistant memory to obey the new system. Existing-project information is ported into the new system **only where it mismatches** the new system's content — no wholesale copying; reconciliation, not migration. Ambiguous conflict points are arbitrated by the owner before changes are applied.

---

## 1. Product Identity & Vision

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

---

## 2. Current Release / Verification State

| | |
|---|---|
| **Version** | `Prod.ver-0.1.0` was the theme-aware brand-lockup swap (`public/logo.png` / `logo-dark.png` replacing the GraduationCap+wordmark lockup and `public/logo.svg`, plus Navbar, Footer, and `layout.tsx` icon updates); no marketing route changes since 0.0.2. Dashboard work is committed by the owner under `Prod-version:0.1.x` tags — latest **`29c96a6` `Prod-version:0.1.3 -- Course Allocation & Student Enrollment Rework`** (2026-09-05: the §24.8 course-setup rework — enrollment notifications, normalized emails, hardened course domain, full admin course management; preceded by `6f91f33` `0.1.2 -- Course Allocation` and `7276481` `-- Minor UI changes`, all pushed live). **Live commit/deploy/account state lives in [`PROJECT_STATE.md`](PROJECT_STATE.md) §1 — update it there, not here.** |
| **Last verified** | 2026-09-05 (Stage 4 loop) — `npm run lint` ✓ · `npx tsc --noEmit` ✓ · `npm run build` ✓ |
| **Route count** | 29 routes total — 16 marketing pages, 5 programme detail pages included in that count, plus system routes; all statically generated except `POST /api/enquiry` |
| **Origin** | V1 was a single-page landing prototype (see §23). V2 fully implemented the 77-section design plan (now deleted — content absorbed; treat as archived). Deferred V2 items live in the background roadmap, §25. |
| **Next projects** | **Track A — Dashboard Stage 5 (QA & Deploy): next** — Stages 0–4 + the course-setup rework shipped (commit `29c96a6` / 0.1.3; per-stage records §24.8; Stage 5 scope §24.5, detailed execution plan §24.10). **Track B — Marketing Site UI-UX Upgrade: spec only, no code started** — requirements distilled, reality-annotated and re-grounded in §28; owner product decisions pending. Live status of both tracks: [`PROJECT_STATE.md`](PROJECT_STATE.md) §2–§3 |

---

## 3. Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.3.1** (App Router, Turbopack) |
| UI | React **19**, TypeScript |
| Styling | Tailwind CSS **4** (see §6 for the critical dynamic-class constraint) |
| 3D | Three **0.185** + React Three Fiber **9.7** + Drei **10.7** |
| Icons | lucide-react |
| Theming | next-themes (`enableSystem={false}`, `defaultTheme='light'`, localStorage persistence) |
| Validation | zod **4** (note API differences from v3 — §18) |
| Calendar UI | react-big-calendar **1.20** — dashboard meetings + schedule calendar (§24.8 Stage 3) |
| Dates | date-fns **4.4** — RBC `dateFnsLocalizer` (named imports only; v3/v4 `exports` maps reject v2-style deep imports) |
| Utilities | clsx + tailwind-merge, tw-animate-css |
| Fonts | Sora 600/700 (display) · Manrope 400/500/600 (body), both via `next/font` |
| Node requirement | ≥ 20.9 |

**Deliberately NOT installed — do not assume anything on this list exists** (verified 2026-09-07 against `package.json`): framer-motion / motion / GSAP / ScrollTrigger / Lenis / Floating UI / Radix / shadcn / react-countup / react-hook-form / Redux and similar. Motion is hand-rolled (§11); `components.json` exists at the repo root but **no shadcn deps are installed** — the site ships hand-rolled `components/educraft/ui/` (open shadcn decision: §24.3). No analytics, no Sentry/error monitoring, and no test frameworks yet (Vitest + Playwright are planned for Dashboard Stage 5, §24.10). Docs that propose these libraries (e.g. §28's upgrade briefs) must not be trusted to mean they exist — adoption needs (a) a concrete gap against the custom system, (b) owner approval, and (c) pinning stays CSS `sticky` (never a GSAP pin).

---

## 4. Route & Application Architecture

```
/                                Homepage (12 sections, §8)
/about                           Story, pillars, principles
/programmes                      Index — 5 programme cards w/ graphics
/programmes/[slug]               Detail ×5: linguistics, inclusive-education,
                                  wellbeing-counseling, ai-digital-tech, neet-jee
/for-schools · /for-parents · /for-students   Audience doors (shared AudiencePage)
/methodology                     5-step method, measurement principles
/impact                          Outcome chain, structural facts, evidence
/insights                        Index with category filter (client)
/insights/[slug]                 Article ×4 (SSG via generateStaticParams)
/careers · /partnerships · /contact · /privacy · /terms
/api/enquiry                     POST — real lead pipeline (§13)
sitemap.xml · robots.txt         Generated (app/sitemap.ts, app/robots.ts —
                                  the static public/robots.txt was deleted on purpose)
/opengraph-image                 Homepage social preview (next/og)
/programmes/[slug]/opengraph-image   Per-programme social previews
```

**Shell hierarchy:** `src/app/layout.tsx` (fonts, theme, metadata, Organization JSON-LD) → `src/app/(site)/layout.tsx` (`EnquiryModalProvider` → `CursorProvider` → `SkipLink` → `Navbar` → `main#main-content` → `Footer` → `EnquiryModal` → `FloatingEnquiryButton`). All marketing pages live under the `(site)` route group.

---

## 5. Repository / Source Structure

Verified against a live file listing on 2026-09-04.

```
src/
├── app/
│   ├── api/enquiry/route.ts
│   ├── (site)/                 ← route group; holds the entire site shell (§4) —
│   │   │                         the homepage itself lives here as (site)/page.tsx
│   │   ├── page.tsx (home) · about/ · careers/ · contact/ · for-parents/ ·
│   │   │   for-schools/ · for-students/ · impact/ · insights/ · insights/[slug]/ ·
│   │   │   methodology/ · partnerships/ · privacy/ · programmes/ ·
│   │   │   programmes/[slug]/ · programmes/[slug]/opengraph-image.tsx · terms/
│   ├── layout.tsx · globals.css · opengraph-image.tsx · sitemap.ts · robots.ts
│
├── components/
│   ├── educraft/
│   │   ├── landing/            Hero · Ecosystem · ProgrammeExplorer · WhyDifferent ·
│   │   │                       StudentJourney · ProgrammeDeepDive · Impact ·
│   │   │                       AudienceEntryPoints · Methodology · Testimonials ·
│   │   │                       InsightsTeaser · FinalCTA   (§8)
│   │   ├── programme/          ProgrammePage.tsx — server component (children are
│   │   │                       client components)  (§9)
│   │   ├── insights/           InsightsList.tsx
│   │   ├── enquiry/            EnquiryForm.tsx · EnquiryModal.tsx (§13)
│   │   ├── layout/             Navbar · Footer · PageHero · SkipLink
│   │   ├── pages/              AudiencePage.tsx (shared by the 3 audience doors)
│   │   ├── graphics/           ProgrammeGraphic · EcosystemGraphic ·
│   │   │                       DecorativeSystems (dotted-constellation, topographic,
│   │   │                       path-lines — the reusable backgrounds of §6)
│   │   ├── motion/             Reveal · MagneticButton · CursorProvider (§11)
│   │   ├── three/              core/ (CanvasShell · CameraRig · Lighting) ·
│   │   │                       primitives/ (Node · Orbit · Connector · ParticleField ·
│   │   │                       GeometryArtifact · GlowLayer) · scenes/ (EcosystemScene) ·
│   │   │                       hooks/ (useSceneActive)   (§10)
│   │   └── ui/                 Button · Card · EnquireButton · Eyebrow ·
│   │                           FaqAccordion · FloatingEnquiryButton ·
│   │                           SectionHeading · Stat
│   ├── theme/                  ThemeProvider.tsx (next-themes wrapper, mounted-gated)
│   └── (no other groups)
│
├── context/                    EnquiryModalContext.tsx — EnquiryModalProvider; the
│                               modal, both forms, and FloatingEnquiryButton consume it
├── data/                       programmes.ts (each Programme carries its own faqs[] —
│                               there is no standalone faqs.ts) · pillars.ts ·
│                               navigation.ts · testimonials.ts · insights.ts ·
│                               enquiries.jsonl*  (*runtime lead log; gitignored, contains
│                               personal data — never commit)
├── design/                     tokens.ts · motion.ts · colors.ts · typography.ts
├── hooks/                      useReveal · useReducedMotion · useScrollProgress ·
│                               useParallax · useScrollLock · useSectionProgress
├── lib/                        validation.ts · rate-limit.ts · utils.ts · pillarStyles.ts
└── types/                      index.ts
```

Note on placement (differs from the original plan's sketch): `EnquireButton` and `FloatingEnquiryButton` live in `ui/` (not `enquiry/`), and `useSceneActive` lives under `three/hooks/` (not `src/hooks/`). Enquiry state lives in `src/context/`, not inside `components/`.

**Confirmed deviations from the original V2 plan:** `scenes/ProgrammeScene.tsx` and `scenes/CTAAtmosphere.tsx` were proposed but not built as WebGL — the shipped `FinalCTA` uses SVG atmosphere on the existing single canvas, and programme pages currently ship with no 3D (background-roadmap Tier B work, §25, not yet done).

### 5.1 Shared component & UI inventory (props/API, verified 2026-09-06)

**Buttons — `components/educraft/ui/Button.tsx`:** `buttonVariants({variant, size, className})`; variants `primary` (gold bg, indigo text, glow — the main CTA), `secondary` (teal outline → teal fill on hover), `ghost`, `solid` (indigo); sizes `sm/md/lg`. Exports `Button` (button + `loading` spinner), `ButtonLink` (plain `<a>`), `ButtonNextLink` (Next `<Link>`). Micro-interaction language: `hover:-translate-y-0.5`, child icons move via `group-hover:translate-x-1`, press `active:scale-[0.98]`; `focus-visible` outline indigo/teal.

**Small primitives (`ui/`):** `Card` (thin `card-surface` wrapper — 27 lines; currently **0 importers**, see §26 C1) · `Eyebrow` (teal default; CSS class `eyebrow` + `eyebrow-rule` = 1.5rem rule via `::before`) · `SectionHeading` `{eyebrow,title,subtext,align:'center'|'left',as:'h2'|'h3'}` wrapped in `Reveal`, centered default (`max-w-3xl mx-auto text-center`), left for editorial rhythm (Testimonials) · `Stat` `{value,label,sub?,accentClassName?}` — **always renders label + optional sub under the value, never a bare digit** · `FaqAccordion` (one-open, `aria-expanded`/`aria-controls` + `role=region`, grid-rows 0fr↔1fr animation, Plus rotates 45°) · `EnquireButton` (client wrapper opening the modal) · `FloatingEnquiryButton` (fixed bottom/right modal trigger).

**Enquiry modal system:** `src/context/EnquiryModalContext.tsx` — provider + `openModal(lockedCourseSlug?)`/`closeModal()`/`isOpen`/`lockedCourseSlug`; body scroll locked while open (reference-counted `useScrollLock`). `enquiry/EnquiryModal.tsx` renders the modal; `EnquiryForm.tsx` is the staged form (used inline on `/contact` too). Success is decided server-side only (§13).

**Interior-page pieces:** `layout/PageHero.tsx` `{eyebrow,title,lead,variant:'light'|'indigo',align}` (indigo variant = gold eyebrow + GradientMesh/Constellation) · `pages/AudiencePage.tsx` renders all three audience routes from `audienceEntries` data · `insights/[slug]/page.tsx` is SSG via `generateStaticParams` (per-article metadata, Article JSON-LD, related articles). lucide icons are renderable inside SVG markup (`x/y/width/height` props — see StudentJourney).

---

## 6. Design System

**JS sources of truth:** `src/design/colors.ts` · `typography.ts` (§6.2-scale + `typeStyle()` helper) · `motion.ts` (durations 100ms–1.2s; baseline easing `cubic-bezier(0.22,1,0.36,1)`) · `tokens.ts` (4px spacing scale, radii, shadows, z-ladder base→cursor=120, layout gutters).

**CSS layer (`src/app/globals.css`):**
- `@theme inline` maps everything to runtime CSS vars that flip under `.dark`. Dark mode is art-directed, not inverted: deeper indigo canvas, brighter programme accents. (Light mode target: airy, educational, optimistic, soft sky backgrounds. Dark mode target: cinematic, atmospheric, deep indigo, subtle glow, restrained teal.)
- Programme accent system: `--ec-p-{learn,include,thrive,achieve,excel}` + `-soft` washes → Tailwind classes `text-ec-learn`, `bg-ec-learn-soft`, etc.
- Component classes: `container-site` (1440 max, 64/48/32/24px gutters) · `container-content` (1200) · `type-{display-xl…caption}` (clamped) · `eyebrow`(+`eyebrow-rule`) · `card-surface` · `reveal-on-scroll` · `hero-enter`/`hero-enter-fade` (delay via `--hero-delay`) · `ambient-drift`/`ambient-pulse`.
- Global `prefers-reduced-motion` block kills all animation/transition durations and un-hides reveals — reduced motion is a CSS-level guarantee, not JS-conditional.

**Critical Tailwind 4 constraint:** dynamic class construction (`` `bg-ec-${x}` ``) does **not** generate CSS at build time. All pillar→class mappings must be written literally in `src/lib/pillarStyles.ts` (`pillarTextClass`, `pillarBgClass`, `pillarSoftBgClass`, `pillarBorderClass`, `pillarAccentVar`/`pillarSoftVar` for SVG fills).

**Decorative background systems** (reusable, not redrawn per-section): dotted-constellation (hero mobile fallback, ecosystem sections), topographic lines (curriculum background), path lines (footer, section transitions). Each is a shared component, not bespoke per instance.

### 6.1 Verified design tokens (values from live `globals.css` + `design/*`, 2026-09-06)

Brand colors (light → dark; tokens flip under `.dark` — never hardcode hex in components):

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--ec-indigo` | `#1e2a78` | `#3b4896` | brand primary / headings / solid buttons |
| `--ec-teal` | `#00b3b8` | `#00b3b8` | secondary accent, path draws, links |
| `--ec-gold` | `#f4b942` | `#f4b942` | primary CTA bg, captions (`--ec-gold-dark` `#c58f1b` in light for text) |
| `--ec-canvas` / `-soft` / `-deep` | `#fff` / `#f6f9fc` / `#eaf3fb` | `#0b0f1e` / `#10152a` / `#141b38` | section canvas rhythm |
| `--ec-ink` / `--ec-slate` | `#12172e` / `#5b6478` | `#e8ecfb` / `#9aa3c0` | headings / body-muted |
| `--ec-border` / `--ec-focus` | `#e4e9f2` / `#1e2a78` | `#232b4d` / `#7c86c9` | dividers / focus outline |
| `--background`/`--card` etc. | white-based | deep indigo (`--card #12172e`) | page/card surfaces (drives `card-surface`) |

Pillar accents — `--ec-p-{learn,include,thrive,achieve,excel}` + `-soft` (light main = the accessible "strong" variant; dark mode brightens for contrast on indigo):

| Pillar | Light main | Light soft | Dark main | Dark soft |
|---|---|---|---|---|
| learn (teal) | `#00898d` | `#dff5f6` | `#3fcbcf` | `#122a34` |
| include (blue) | `#3b7dd8` | `#e7effb` | `#7fa8e8` | `#16233d` |
| thrive (violet) | `#6f5cb8` | `#efebfa` | `#a795e8` | `#1d1934` |
| achieve (gold) | `#c58f1b` | `#fbf0d9` | `#f8cd73` | `#2b2312` |
| excel (indigo) | `#1e2a78` | `#e8ebf8` | `#7c86c9` | `#161c3a` |

Classes: `text-ec-learn`, `bg-ec-thrive-soft`, `border-ec-achieve`, … — only via the literal maps in `src/lib/pillarStyles.ts` (§18 rule 5). SVG fills use `pillarAccentVar[id]`/`pillarSoftVar[id]` (CSS var strings). Semantic `--ec-success/warning/error/info` brighten in dark; `color-scheme` set per theme.

### 6.2 Typography, tokens & containers (verified)

- Fonts: Sora (display 700) / Manrope (body 400–600) via `next/font` → `--font-sora` / `--font-manrope`.
- Type scale (globals classes matching `design/typography.ts`): `.type-display-xl` `clamp(3rem…5.25rem)` lh .95 down to `.type-heading-s` `clamp(1.25rem…1.375rem)` lh 1.22; body `body-l 1.25rem/1.55` · `body-m 1.0625rem/1.6` · `body-s .875rem/1.5` · `caption .75rem/1.3` (500). Use classes or `typeStyle('displayXL')` — never arbitrary font sizes. Reading measure ≈55ch.
- `design/tokens.ts`: 4px spacing scale `[0,4,8,12,16,24,32,48,64,80,96,128,160,192]`; radii `sm .5rem … 2xl 2rem, pill`; shadows `subtle/card/elevated/gold/teal` (indigo-tinted); **z-ladder `base 0 · raised 10 · sticky 30 · nav 50 · overlay 90 · modal 100 · cursor 120`**; gutters 24/32/48/64; breakpoints 640/768/1024/1280/1440.
- Container classes: `.container-site` (1440 max, gutters step up at 768/1024/1440) · `.container-content` (1200).
- Utility/keyframe classes (globals): `reveal-on-scroll` (+`.revealed`, `reveal-delay`) · `hero-enter` / `hero-enter-fade` (delay via `--hero-delay`) · `ambient-drift` / `ambient-pulse` · `no-scrollbar` · global smooth scroll + slim custom scrollbar · `:focus-visible` outline `var(--ec-focus)` 2px/2px.
- Decorative system components (`graphics/DecorativeSystems.tsx`, aria-hidden, theme-aware `currentColor`): **A GradientMesh** (soft radial wash — hero/PageHero indigo) · **B Constellation** (dotted map — ecosystem sections) · **C TopographicLines** (rings — curriculum/Impact) · **D GridPattern** (engineering grid — sparing) · **E PathLines** (journey dashes — footer/transitions). Usage: `<Constellation className="opacity-60" colorClassName="text-ec-teal" />`. Do not redraw per section.

---

## 7. Content & Data Architecture

**Content model** (`src/types/index.ts` + `src/data/`): `Programme` (slug, pillarId, name, tagline, promise, description, whyItMatters, audience[], outcomes[], highlights[], methodology[5], curriculum[], journey[6], activities[], support[], proof[], faqs[]) is fully content-driven — adding a programme requires zero component changes. Also `Pillar`, `Testimonial`, `Insight` (7 categories), `NavigationItem`, `AudienceEntry`. Site-level content (`methodologySteps`, `studentJourneyStages`) lives in `data/pillars.ts`.

**No invented statistics anywhere.** Proof is qualitative; structural facts only (5 verticals, 1 ecosystem, 4 audiences, 6 journey stages).

---

## 8. Homepage Architecture

Narrative arc: **Understand → Explore → Trust → Imagine → Choose → Act.**

| # | Section | Signature interaction | Notes |
|---|---|---|---|
| 01 | `Hero` | Staged entrance (0→1700ms via `--hero-delay`); scroll-linked content rise + camera pull-back + node drift (`useScrollProgress` `'full'` mode) | Headline "Five paths. One learning ecosystem." WebGL hidden on mobile → SVG `Constellation` fallback. Bottom fade + scroll cue. |
| 02 | `Ecosystem` | Interactive SVG map: 5 nodes around a core, spokes draw on enter, hover/focus lights the connection + updates an `aria-live` right panel, click → programme page | Mobile: stacked cards. Default active = Learn. `data-cursor-label="Explore"`. |
| 03 | `ProgrammeExplorer` | 550vh pinned scroll story (5 × 110vh): keyed crossfade panel, `ProgrammeGraphic` visual, progress rail + top bar | Mobile: horizontal snap cards. Uses `'full'` mode. |
| 04 | `WhyDifferent` | Sticky left statement, numbered differentiators (01–05) | |
| 05 | `StudentJourney` | 552vh pinned (6 × 92vh): path self-draws (`strokeDashoffset = 1-progress`), milestones light with icons | Mobile: vertical timeline. **Must never gain `overflow-hidden` on the section — breaks sticky pinning (§18).** |
| 06 | `ProgrammeDeepDive` | Tabbed spotlight: curriculum modules, 5-step method, outcomes, proof line, CTAs | Client tab state, data-driven. |
| 07 | `Impact` | Outcome chain Confidence→Engagement→Skill→Readiness (numbered cards + arrows), structural facts, "how we build evidence" (5 pillars) | Qualitative by design. |
| 08 | `AudienceEntryPoints` | Three doors — schools=indigo, parents=teal, students=gold → audience pages | |
| 09 | `Methodology` | Path-draw, calibrated pacing: `'visible'` mode, `draw = clamp01(progress * 1.1)`, node *i* lights at `((i+0.08)/5.5)*1.1` — completes ~84% through visible scroll | User-calibrated 2026-08-27 (was lagging scroll before the 1.1× tuning). |
| 10 | `Testimonials` | Editorial: 1 large primary quote (parallax drift) + 2 supporting. No carousel, no autoplay | Content is SEED (§22). |
| 11 | `InsightsTeaser` | 3 latest articles (category, reading time, date) | |
| 12 | `FinalCTA` | Indigo close, SVG atmosphere on the existing single canvas (no second WebGL context), magnetic gold CTA | |

---

## 9. Programme Architecture

`programme/ProgrammePage.tsx` (server component with client children):

Hero (accent eyebrow + `ProgrammeGraphic`) → why it matters → audience (3 cards) → 5-step method (numbered rows) → curriculum (modules with item checklists, topographic background) → 6-stage journey cards → outcomes + activities (split) → support + proof → FAQ accordion (accessible, one-open) → indigo conversion close → related programmes (4).

JSON-LD: `Course` + `BreadcrumbList`. Per-programme metadata and OG image.

---

## 10. WebGL / Graphics Architecture

One coordinated system in `three/` (V1's `HeroScene`/`CourseOrbit3D`/`FloatingParticles` — three separate canvases — were deleted; V2 consolidated to one):

- `core/CanvasShell` — frameloop pauses off-screen via `useSceneActive`; `AdaptiveDpr`; `dpr [1, 1.5]`.
- `core/CameraRig` — scroll + pointer, eased targets.
- `core/Lighting` — no per-node point lights; emissive materials + glow sprites instead.
- `primitives/`: `Node` (emissive sphere + halo ring), `Orbit` (torus), `Connector` (quadratic arc line), `ParticleField` (single buffer-geometry points), `GeometryArtifact` (wireframe), `GlowLayer` (canvas radial sprite, additive).
- `scenes/EcosystemScene` — core icosahedron + 3 orbit rings + 5 pillar nodes + connectors + artifacts + particles + Stars. **Theme-aware**: reads next-themes `resolvedTheme` and recolors accordingly.

**Not shipped as WebGL** (see §5 deviations): programme-page 3D accents (planned, V3 Tier B item 11 — at most one restrained `GeometryArtifact` per hero when built, reusing existing primitives, never a per-page canvas) and a dedicated `CTAAtmosphere` scene (FinalCTA uses SVG instead, deliberately, to avoid a second WebGL context).

---

## 11. Motion / Interaction Architecture

**Hooks (`src/hooks/`):**
- `useScrollProgress(ref, offsetTop?, mode: 'full' | 'visible')` — rAF-throttled. `'full'` (default): 0 = enter, 1 = full exit — use for pinned sections. `'visible'`: 1 = bottom edge reaches viewport bottom — use for path-draw sequences. Exports `clamp01`, `lerp`.
- `useReducedMotion` — single consolidated source of truth (V1 had per-scene duplicates).
- `useScrollLock` — reference-counted; multiple lockers compose safely.
- `useReveal({threshold, rootMargin, once})` — reveals instantly under reduced motion.
- `useParallax`, `useSectionProgress` (IntersectionObserver steps).

**Motion components (`components/educraft/motion/`):** `Reveal` (polymorphic via `createElement`; direction/delay/distance/duration) · `MagneticButton` (fine-pointer only, strength clamped) · `CursorProvider` (fine-pointer + non-reduced-motion only; ring scales over interactive elements; contextual label via `data-cursor-label`, currently used on ecosystem nodes).

**Motion language conventions:** hover micro-interactions 150–250 ms with `ease-out-soft`; keyed content swaps = `animate-in … duration-300` on remount (§18 rule 6); scroll choreography = direct progress mapping (no tween library); buttons hover-lift + child-icon `group-hover` shifts.

---

## 12. Navigation / Shell / Brand

**Navbar:** transparent → blurred+bordered on scroll (`h-20`→`h-16`); programmes mega menu (5 pillar rows + mini ecosystem SVG map + audience links) opens on hover + click, closes on Escape/outside-click/route-change with focus return; `aria-expanded`/`aria-controls`; route-aware active states (`aria-current`); accessible mobile menu. **Dashboard sign-in entry (added 2026-09-04, post-Stage-1 by user request):** a "Sign in" text link sits in the desktop nav (next to the Enquire CTA), the mobile menu (above Enquire), and the footer bottom bar — all pointing at `/dashboard`, which dispatches signed-in users to their role root and sends signed-out visitors to the Clerk `/sign-in` page via `proxy.ts`. Deliberately no sign-up link anywhere: sign-ups are invite-only. **Invite flow (2026-09-05, app-driven):** invitations are sent from the dashboard — an `admin` invites professors and students, a `professor` invites only students (policy in `INVITE_ROLES_BY_INVITER`, `src/lib/validators/auth.ts`) — via the Clerk Invitations API with `publicMetadata: { role }`; on acceptance Clerk copies the role into the new user's publicMetadata, so `getCurrentUser()` accepts them on first hit (no webhook needed). The pre-2026-09-05 path (manual account creation in the Clerk dashboard + hand-set `publicMetadata.role`) still applies to the owner's own account — **to use the admin area, set your own Clerk user's `publicMetadata.role` to `"admin"`** (Clerk dashboard → Users → edit → public metadata); a self-service sign-up would create role-less users that `getCurrentUser()` rejects.

**Footer V2:** closing statement "Build learning journeys that last.", CTA pair, 4 nav clusters, constellation + path-lines background. No social icons — deliberately absent until real handles exist (no dead `href="#"` links).

**Brand lockup** (theme-aware, swapped 2026-08-30): light mode renders `public/logo.png` (2135×736); dark mode renders `public/logo-dark.png` (2172×724) via CSS class switch (`dark:hidden` / `hidden dark:block`) — no JS/hydration gating needed. Sizes: Navbar `h-11 md:h-14`, Footer `h-14 md:h-16`. This replaced an earlier GraduationCap+wordmark lockup and the `public/logo.svg` favicon — **verified 2026-09-04: no residual references to the old lockup remain** (`layout.tsx` icon is `/logo.png`; source grep is clean).

`hello@educraft.com` / `+91 80 4567 8900` / Bangalore, India appear in footer, contact page, and structured data — **VERIFY, not yet stakeholder-confirmed** (§22).

---

## 13. Enquiry / Lead Pipeline

`POST /api/enquiry` pipeline: JSON parse → zod v4 `enquirySchema` (role enum, name/email/phone, `programmeSlug`, `contactTime`, `message`, `consent: z.literal(true)`, honeypot field `website` max length 0) → honeypot check (silent `200` without persisting) → per-IP rate limit (in-memory sliding window, 5 req / 10 min, `Retry-After` header) → delivery: `ENQUIRY_WEBHOOK_URL` fetch with 5s `AbortSignal` timeout if set, plus append to `data/enquiries.jsonl` (dir auto-created, gitignored — contains personal data), plus structured console log. **The client never determines success — the server re-validates everything.**

**Staged form** (`enquiry/EnquiryForm.tsx`): 3 steps (About you → What you're looking for → Contact preferences + review) + success state. Per-step zod validation, error association, autocomplete attrs (name/email/tel), sr-only step announcements + heading focus on step change, back/continue, loading + server-error + retry states, honeypot field marked `sr-only`. Used by the modal (locked/general) and the contact page (`inline`). `EnquireButton` is the client wrapper for server-rendered pages.

**Known limitation:** rate limiting is per-instance in-memory — needs a shared store (Redis/Upstash) before multi-instance deployment (§22).

---

## 14. SEO / Metadata

`metadataBase` from `NEXT_PUBLIC_SITE_URL` (falls back to `https://educraft.com` — set the env var for the real domain). Per-route title/description/canonical. JSON-LD: `EducationalOrganization` (site-wide), `Course` + `BreadcrumbList` (programmes), `Article` (insights). `next/og` `ImageResponse` social previews for home + per-programme, pillar-accented. Sitemap covers all static + SSG routes.

**Satori rule (learned the hard way):** every `div` with multiple children inside an OG image must have explicit `display: 'flex'`, or the prerender throws.

**Not yet shipped:** insight-article OG images (`insights/[slug]/opengraph-image.tsx`) — the only content type currently missing a social preview (V3 Tier B item 6).

---

## 15. Accessibility

**Shipped:** semantic landmarks, skip link, logical heading hierarchy, keyboard navigation including the mega menu (Escape/outside-click close, focus return), accessible dialogs (focus trap on `EnquiryModal`), `aria-live` panel on the Ecosystem section, `aria-current` for route-aware nav state, `aria-expanded`/`aria-controls` on menus, form errors associated with inputs, sr-only step announcements in the enquiry flow, `mounted`-gated theme toggle to avoid mismatch. Reduced motion is enforced globally at the CSS level (`prefers-reduced-motion` kills animation/transition durations and un-hides reveal content), not per-component JS branching.

**Not yet verified:** a formal WCAG 2.2 AA audit pass (keyboard-only walk of mega menu + staged form, screen-reader pass, contrast check of programme accents — especially `achieve` gold on light backgrounds) is still open (V3 Tier D item 19). Treat current accessibility as *implemented-by-convention*, not *audited*.

---

## 16. Performance

**Shipped optimizations:** single coordinated WebGL canvas (not one per section/page); frameloop pauses when a scene is off-screen (`useSceneActive`); `AdaptiveDpr` with a `[1, 1.5]` clamp; no per-node point lights (emissive + glow sprites instead); reduced-motion short-circuits animation entirely; the site is static except one API route.

**Goals, not yet field-verified:** LCP < 2.5s, CLS < 0.1, INP < 200ms — these are targets carried from the original plan. No Lighthouse baseline or real-device Core Web Vitals field data has been recorded yet (V3 Tier D item 17). Do not report these numbers as achieved without measuring.

---

## 17. Security / Data Handling

- Enquiry API re-validates everything server-side; the client cannot force a success state.
- Honeypot field returns a silent `200` without persisting spam submissions.
- Rate limiting is in-memory and **per-instance only** — not safe as-is for a multi-instance deployment (§22).
- `data/enquiries.jsonl` contains personal data and is gitignored.
- No analytics and no error monitoring (Sentry or otherwise) are currently wired in — both are Tier A roadmap items, not present today. Do not assume telemetry exists.
- No secrets, API keys, or credentials are stored in the documented content model; environment variables are limited to `NEXT_PUBLIC_SITE_URL` and `ENQUIRY_WEBHOOK_URL` (§21).

---

## 18. Engineering Constraints

Hard-won, do-not-regress rules (source of the fixed-bug ledger in §19):

1. **`overflow-hidden` on a pinned-section ancestor breaks `position: sticky`** — it becomes the sticky element's scroll box. `StudentJourney` and `ProgrammeExplorer` must keep section-level overflow visible; overflow handling belongs only on the sticky inner element.
2. **Hydration:** anything derived from next-themes' `theme` (or any other post-mount state) inside SSR'd markup must be gated on a `mounted` flag.
3. **zod v4 API:** use `{ message }`, not `{ errorMap }`; `path` is `PropertyKey[]`; don't import `SafeParseReturnType` — `flattenZodErrors` takes a structural type.
4. **R3F:** imperative scene-graph mutation inside `useFrame` needs `// eslint-disable-next-line react-hooks/immutability` — this is the canonical pattern here, not React state.
5. **Tailwind 4:** only literal class names in source — no dynamically constructed class strings (§6).
6. **tw-animate-css:** `animate-in` keyframes only fire on key-remount (used for stage/tab crossfades).
7. `THREE.Clock` deprecation warning is emitted by R3F 9.7.0 internals (latest stable) — harmless, disappears with R3F's next patch. Do not upgrade to a 10.0 canary just to silence it.
8. **Route groups never contribute URL segments** — `(dashboard)/professor/page.tsx` is served at `/professor`, and a page.tsx at a group root resolves at the group's URL root (`(dashboard)/page.tsx` collides with `(site)/page.tsx` at `/`). To own a URL prefix, use a **real folder** (`dashboard/`). Also: Clerk v7 `auth()` **throws** on any route its middleware/proxy matcher didn't cover — keep the auth matcher aligned with real routes.
9. **Server/client discipline** — DB reads live in `'server-only'` modules (`lib/dashboard/`) with role-explicit names (`getStudent*` / `getProfessor*`); mutations are thin Server Actions (`lib/actions/`, `'use server'`) that only `requireRole` → zod-v4 validate → call a plain domain fn in `lib/domain/` (explicit userId params, `DomainError` codes, ownership checks, `$transaction`, P2002 mapping) → `revalidatePath` both role layouts. Client components never import server-only modules (the `'server-only'` package guardrail fails the build). Dashboard 404s via `notFound()` for non-owned resources — never an existence oracle ("Course not found." for missing AND not-owned).
10. **Time handling** — DB stores UTC; UI displays Asia/Kolkata wall time via `lib/ist.ts` + module-cached `Intl.DateTimeFormat`; `<input type="datetime-local">` values are IST wall times validated lexicographically and converted with `istWallTimeToUtc`. Never derive calendar dates from UTC `Date` getters (a 23:30 UTC session is 05:00 the next IST day).
11. **Code style & ESLint 9** — single quotes, no semicolons, PascalCase default-export components, feature folders, sparse meaningful comments (match neighbors). Config: `next/core-web-vitals` + `next/typescript` presets with many rules OFF (no-unused-vars, exhaustive-deps, purity, set-state-in-effect, no-explicit-any, display-name…); the active rules that bite are `react-hooks/refs` (**no ref reads during render** — pass ref objects to components that read them in effects, or mirror to state) and `react-hooks/immutability` (R3F `useFrame` — canonical `// eslint-disable-next-line` pattern, not React state). `no-console` is off (console output is expected in dev flows).
12. **`.next` & tsconfig** — `tsconfig.json` includes both `.next/types/**` and `.next/dev/types/**`; an interrupted dev run can corrupt `.next/dev/types/*.d.ts` → `tsc` syntax errors until the `.next` wipe (with the dev server stopped — §20). Never treat `.next` as disposable while a dev server is live.

---

## 19. Fixed Bugs & Lessons

| Problem | Root Cause | Fix | Regression Rule |
|---|---|---|---|
| Student Journey blank zone after stage 2 | `overflow-hidden` on the section broke sticky pinning; content scrolled away while progress ran invisibly over ~4 empty screens | Removed section-level `overflow-hidden` | Never place `overflow-hidden` on a pinned/sticky section's ancestor — only on the sticky inner element |
| Hydration mismatch (theme toggle aria-label/title) | next-themes resolves the stored theme post-mount, so SSR and client markup disagree | `mounted`-gated label | Gate any next-themes-derived (or other post-mount) value behind a `mounted` check before rendering it into SSR'd markup |
| Enquiry persistence `ENOENT` | `data/` directory didn't exist | `mkdir` recursive inside the route handler | Never assume a write-target directory exists — create it recursively before writing |
| Methodology path-draw never reached node 5 | Progress was measured entry→full-exit (`'full'` mode); the draw animation completed off-screen before scroll ended | Switched to `'visible'` mode + 1.1× draw acceleration + retuned node thresholds | For path-draw sequences, use `'visible'` scroll-progress mode and calibrate against actual scroll distance — don't assume a linear 0→1 mapping lands exactly at scroll end |
| OG image prerender error | Satori requires `display: 'flex'` on every multi-child `div` inside a `next/og` `ImageResponse` | Fixed the headline wrapper | Always set explicit `display: 'flex'` on multi-child divs inside OG image markup |
| Stale `.next/types` `tsc` errors after file deletions | Cached type validator referenced deleted files | `rm -rf .next` before typecheck/build | After deleting or renaming files, run `rm -rf .next` before `tsc --noEmit` or `next build` — don't trust cached type info |
| Dashboard shell 404/500 after Stage 0 (auth routes "not found", `/professor` 500) | `(dashboard)` **route group** was assumed to create the `/dashboard` URL prefix; Next strips group names, so pages lived at bare `/professor` `/student` — `/dashboard/professor` matched only the proxy (404 signed-in) and bare paths ran `auth()` with no proxy coverage (Clerk v7 throws → 500) | Moved the shell into a real `src/app/dashboard/` folder; `/dashboard` role dispatch lives in `proxy.ts` (a group-root or root-level index page collides with `(site)/page.tsx` at `/`) | Route groups never add URL segments (§18 rule 8): use real folders for real URL prefixes, and keep every auth() call site covered by the proxy matcher; after structural folder moves, wipe `.next` and restart dev |

---

## 20. Verification / Development Workflow

```bash
npm install
npm run dev         # local dev on :3000 (first compile ~14s is normal)

# verification loop — all three must pass before shipping
npm run lint         # eslint (react-hooks/immutability rule active)
npx tsc --noEmit
npm run build         # prisma generate && next build — Turbopack production build

npm start            # serve the production build
```

**`npm run build` = `prisma generate && next build`** (since 2026-09-04): the Prisma client at `src/generated/prisma/` is gitignored build output, so every build — local or Vercel — regenerates it first. `prisma generate` auto-loads `prisma7.config.ts` (Prisma 7 CLI discovers it by name; on Vercel the config's `.env.local` dotenv load no-ops and `DATABASE_URL` comes from Vercel's injected env — generate never touches the DB anyway). The generated client is also excluded from eslint (`src/generated/**` in `eslint.config.mjs` ignores — its own disable-directive headers trip ESLint 9's config-level `reportUnusedDisableDirectives`, which no rule setting can silence).

If stale `.next/types` causes deletion-related tsc errors: `rm -rf .next && npx tsc --noEmit && npm run build`. **Operational lesson (2026-09-05): never wipe or rebuild `.next` while the owner's `npm run dev` is running** — a dev server whose `.next` is deleted under it loses route registrations and serves 404s for existing dynamic routes until restarted. Wipes belong in a turn where no dev server is live; when in doubt, ask the owner to restart dev (`Ctrl+C`, `npm run dev`) after any structural change.

**Working agreement:** the user performs all website viewing/visual QA (browser access, screenshots) and reports back. The assistant never launches a browser or curls the site itself. (This is persisted in assistant memory. A stale `.claude/settings.local.json` browser-automation allow-list from an earlier session — CDP/curl/taskkill rules for a long-dead localhost:9222 debugging flow — was **deleted 2026-09-04**; no current workflow uses it.)

**Operational traps (2026-09-06):** (1) `react-hooks/refs` forbids render-time ref reads — popover/anchor code must use ref objects or state-held elements (§18 rule 11). (2) Interrupted `npm run dev` corrupts `.next/dev/types/*.d.ts` → `tsc` fails until the wipe (server stopped). (3) A floating card positioned in one coordinate space while its containing block is another clips silently — position in the space you anchor to (viewport space is the safe default).

**Reporting format for completed work (required):** changed files ↔ requirement mapping; removals + content-loss audit; motion before/after per section; responsive/perf results; content decisions needing the owner flagged explicitly. Never claim done without the verification loop green.

---

## 21. Deployment / Environment

The site is static except `/api/enquiry` — deployable to any Next.js host.

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical production domain (metadata, sitemap, OG images). Falls back to `https://educraft.com` |
| `ENQUIRY_WEBHOOK_URL` | Where enquiries are delivered (CRM/email). Without it, enquiries are only appended to `data/enquiries.jsonl` + logged |

On Vercel: import the repo, set the env vars above, deploy. No other env vars are required to run the site.

---

## 22. Current Production Blockers

Pre-launch stakeholder inputs — these take precedence over all V3 roadmap work:

1. **Testimonials** (`data/testimonials.ts`) — current 3 entries are clearly-marked SEED content; must be replaced with real, verified, consented quotes before launch.
2. **Env vars** — `NEXT_PUBLIC_SITE_URL` (real domain) and `ENQUIRY_WEBHOOK_URL` (CRM/email delivery) are unset in the documented baseline.
3. **Business details** — `hello@educraft.com`, `+91 80 4567 8900`, Bangalore, India (footer, contact page, structured data) — `VERIFY`, not yet stakeholder-confirmed.
4. **Social handles** — intentionally absent from the footer (no dead `href="#"` links) until real handles exist.
5. **Rate limiter** — per-instance in-memory only; needs a shared store (Redis/Upstash) before any multi-instance deployment.
6. **Role-less sign-in trap (auth flow) — UNRESOLVED, reported 2026-09-05 by the owner during demo prep.** Signing in with an email that has no Clerk account succeeds anyway: the Clerk instance is in **Open mode**, not Restricted, so uninvited emails create accounts — and Clerk-created accounts carry no `publicMetadata.role`. The `/dashboard` proxy dispatch then silently redirects to `/` (`src/proxy.ts` — `parsed.success ? ROLE_LANDING[...] : '/'`), the Clerk session stays live, and the marketing site has no sign-out affordance — so the next visit to `/sign-in` is blocked by the active session and the user is stranded until they clear site cookies. Deep links into `/dashboard/<role>` by a role-less user hit a 500 instead (getCurrentUser throws its role-missing setup error inside `requireRole`). **Agreed fix direction (not implemented):** (a) instance-level — Clerk Dashboard → User & Authentication → Restrictions → enable **Restricted (invite-only) mode**, so unregistered emails can never create accounts and sign-in fails honestly at the Clerk page; (b) app-level — role-less dispatch shows an honest "no role — Educraft access is by invitation" page with a Sign out button (proxy `/dashboard` branch + `requireRole` redirect instead of the throw), so no session can strand regardless of instance mode. Known related fact: junk role-less accounts created this way must be deleted manually in Clerk Dashboard → Users.

---

## 23. Minimal Historical Context

V1 was a single-page landing prototype (`src/app/page.tsx`, anchor navigation only): 3 separate R3F scenes (`HeroScene`, `CourseOrbit3D`, `FloatingParticles`), 5 course-vertical cards, a client-side-simulated enquiry modal with no backend, basic `useReveal` fades, light mode only, static `public/robots.txt` for SEO. Repository is `piyush-AIML/TEMP` (confirmed current 2026-09-04 via `git remote`).

Commit chronology: `6207784` initial commit → `4f8ad7f` prototype work → `0a46152` cleanup for public deployment (removed scratch: `worklog.md`, `upload/`, `download/`) → `80ea2ad` V2 LIGHT&DARK MODE (V2 implementation begins) → `cfdb5fa` `Prod.ver-0.0.1` → `901bcbb` `Prod.ver-0.0.2` → `1405a06` doc restructure (created the four-doc set + branding SVGs; consolidated into this file on 2026-09-04) → `77b2217` `Prod.ver-0.1.0` (brand lockup, §12).

| V1 | V2 (current) |
|---|---|
| One landing page | 16 pages + API |
| Decorative 3D, 3 canvases | One coordinated theme-aware scene system |
| Cards as primary pattern | Editorial modules, pinned scroll storytelling, SVG path-draws |
| Simulated enquiry form | Production lead pipeline (§13) |
| Basic reveal animations | Full motion system (§11) |
| Light mode only | Art-directed light/dark theme system |
| Hard-coded content | Content-driven UI from typed data models (§7) |

V2's design principles (non-negotiable — they live on in §25): visuals must explain learning/progress/connection, never decorate for its own sake; one great scene beats three mediocre ones; avoid endless rounded cards, all-centered sections, autoplay carousels, glassmorphism, stock-looking art, and invented numbers.

---

## 24. Next Implementation Project — Student & Professor Dashboard

> **Status:** Stages 2–4 shipped 2026-09-05 (§24.8): Professor Core · AWS S3 storage (smoke gate passed; browser E2E remains the owner's check) · invite flow + minimal admin area · Stage 3 Meetings & Planner · **Stage 4 Polish — SHIPPED 2026-09-05** (mobile drawer, student notification-preferences editor, first loading/error/not-found boundaries, access-control audit clean — §24.8). **Course-setup slice — SHIPPED 2026-09-05** (the long-open gap is closed: professor "Enroll student" on the Roster tab + admin course creation with professor assignment; the seed is no longer the only writer of `CourseProfessors`/`Enrollment` rows — §24.8), **then reworked the same day** (owner-reported usage flaws → enrollment notifications, normalized emails, hardened domain, and the full post-creation management surface — see the final §24.8 block) **and committed as `29c96a6` / `Prod-version:0.1.3`**. **Next: Stage 5 — QA & Deploy** (§24.5 scope; execution detail absorbed into §24.10 from the deleted Stages-2-5 plan file). The project is an authenticated, role-based dashboard module on top of this site — the existing marketing site stays untouched. **Live status, open owner checks and deploy state: [`PROJECT_STATE.md`](PROJECT_STATE.md) §2.** (Route-group history note, §24.4: early plan labels used `(marketing)`; this repo's actual group is `(site)`, and the shell is a real `dashboard/` folder.)
> **Current live deploy (staging/preview domain):** `temp-tau-opal.vercel.app` — running `29c96a6` (0.1.3, incl. the course-setup rework) since 2026-09-05, owner-verified working after deploy (an earlier local 404 report was stale-dev-server artifact, not code — §20 operational note). Production domain still unset — see §22 blockers, env var `NEXT_PUBLIC_SITE_URL`. **Current deploy state: `PROJECT_STATE.md` §1.**

### 24.1 Goals & Non-Goals

**Goals**
- One codebase, two role experiences: `Student` and `Professor` (room for `Admin` later).
- Students see: profile, enrolled courses, upcoming classes, notifications, and remarks/materials the professor has posted for their course(s).
- Professors see: their courses, upcoming classes, a notes/updates delivery system, upcoming meetings, and a coursework planner with completion tracking.
- Reuses the existing Next.js app, design system, and Vercel deployment — a new authenticated section (`/dashboard/...`), not a separate app.
- Data is real (persisted), not mocked — professors post something, students see it, with reasonable latency.

**Non-Goals (v1):** video conferencing/live class hosting (link out to Zoom/Meet); payments/billing; native mobile app (responsive web is enough); complex grading/LMS (quizzes, grade books) — flagged as a future phase.

### 24.2 Actors & Core Entities

**Actors:** Student, Professor, Admin (minimal invitation area shipped 2026-09-05; full admin console is Stage 6 backlog)

| Entity | Key fields |
|---|---|
| `User` | id, name, email, role (`student`/`professor`/`admin`), avatarUrl, createdAt |
| `Course` | id, title, code, vertical (maps to the site's five pillars/verticals), professorId, description |
| `Enrollment` | id, studentId, courseId, status, enrolledAt |
| `ClassSession` | id, courseId, startsAt, endsAt, mode (online/in-person), link/location, status |
| `Material` | id, courseId, uploadedBy, type (note/remark/file/link), title, body, fileUrl, visibility, createdAt |
| `Notification` | id, userId, type, title, body, relatedEntity, read (bool), createdAt |
| `Meeting` | id, professorId, title, withWhom (student/parent/other), startsAt, endsAt, link, status |
| `Task` (coursework planner) | id, courseId, title, description, dueDate, weight/priority, status (todo/in-progress/done), createdBy |
| `CompletionLog` | id, courseId, taskId, percentComplete, updatedAt — feeds the "completion monitor" |

Maps 1:1 onto normal relational tables (Postgres).

### 24.3 Tech Stack Decisions (recommendations, not yet decided)

Existing stack it must extend: Next.js 16 (App Router, Turbopack) · React 19 · TS · Tailwind 4 · zod 4 · lucide · next-themes — same repo, same Vercel project.

| Concern | Recommended choice | Why / note |
|---|---|---|
| Auth | **Clerk** (decided 2026-09-04) | Roles via `publicMetadata` = the single source of truth, read server-side via `clerkClient()` (never session claims). See §24.8 for the resolution. |
| Database | **PostgreSQL** via Neon or Supabase | Relational fits; generous free tiers; works with Vercel. Supabase adds built-in realtime + storage if wanted. |
| ORM | **Prisma** | Type-safe, migrations, works with Route Handlers/Server Actions. |
| File uploads | UploadThing or Supabase Storage | Avoids hand-rolled S3 signing for v1. |
| Realtime notifications | **Polling + DB-backed `Notification` table first**; Supabase Realtime/Pusher only if instant push is truly needed | Don't over-engineer v1. |
| Data fetching | RSC + Server Actions for most CRUD; TanStack Query client-side only where optimistic updates/polling are needed (notification bell) | |
| Styling/UI | Reuse existing Tailwind 4 setup. **shadcn/ui status:** `components.json` config exists at repo root but **no shadcn deps are installed** (no radix/cva in package.json) — the site ships hand-rolled `components/educraft/ui/`. Decide: install shadcn for data-heavy widgets (tables/calendars/modals) or keep hand-rolling in the same visual language | New-york style, lucide icon library, aliases point at `@/components/ui` etc. |
| Calendar/scheduling UI | react-big-calendar or FullCalendar | Upcoming classes / meetings views. |
| Forms | React Hook Form + zod (professor-side forms: tasks, materials, classes) | zod v4 already in the stack; RHF is new. |

> Rule of thumb: **no new framework** for the dashboard. Extend this app with a new real `dashboard/` folder — navigation, theming, deployment stay unified. (Not a route group: groups never add URL segments — see §18 rule 8.)

**Stage 0 built state (2026-09-04) — versions as actually installed:** Prisma **7.10** (`prisma-client` generator emitting to `src/generated/prisma` — gitignored, regenerate via `npm run db:generate`; CLI config is `prisma7.config.ts`, which loads `.env.local` via dotenv; **driver adapter required** → `@prisma/adapter-neon` + `ws` — Node < 22 has no global `WebSocket`, wired once in `src/lib/prisma-client.ts`). Clerk **7.9** (`clerkClient()` is **async** — `await clerkClient()`; auth file is **`src/proxy.ts`** — Next 16 deprecated the `middleware.ts` filename; `createRouteMatcher` is deprecated in v7 — the role layouts' `requireRole()` already gives resource-based checks, so the matcher only gates signed-out redirects and can be dropped later). `DATABASE_URL` is a single Neon **direct** URL.

### 24.4 High-Level Architecture

```
src/ (this repo — verified 2026-09-04)
├── proxy.ts                     auth boundary (Next 16 name; middleware.ts is deprecated)
├── app/
│   ├── (site)/                  ← existing public site, untouched (route group — NEVER a URL prefix)
│   ├── (auth)/  sign-in/[[...sign-in]]/
│   ├── dashboard/               ← REAL folder (a route group here would serve /professor, not /dashboard/professor)
│   │   ├── layout.tsx           ClerkProvider + noindex robots; no page at /dashboard itself —
│   │   │                        role dispatch happens in proxy.ts (sign-in's fallbackRedirectUrl = /dashboard)
│   │   ├── student/             page.tsx (overview) · courses/ · schedule/ ·
│   │   │                        notifications/ · profile/
│   │   ├── professor/           page.tsx (overview) · courses/ · schedule/ · invite/ ·
│   │   │                        meetings/ · profile/   (Stage 2+: courses/[courseId]/materials ·
│   │   │                        planner · students)
│   │   └── admin/               (since 2026-09-05) page.tsx (invitation hub) · invite/
│   └── api/                     Route Handlers only where needed (webhooks, file callbacks)
├── lib/                         auth.ts · db.ts · prisma-client.ts (factory: adapter + ws) ·
│                                validators/auth.ts (zod v4 publicMetadata schema)
├── prisma/                      schema.prisma · seed.ts (email-keyed, idempotent — links demo data
│                                to the real walkthrough accounts)
└── components/                  dashboard/ (DashboardShell — desktop sidebar + mobile drawer,
                                 navItems, DashboardSkeleton, NotificationPrefsEditor, etc.) —
                                 hand-rolled
```

**Route protection:** `src/proxy.ts` (Clerk, matcher `'/dashboard/:path*'`, `signInUrl: '/sign-in'`) redirects signed-out users; every dashboard page/layout calls `requireRole()` (`lib/auth.ts`) server-side — a non-`student` hitting `/dashboard/student/*` is redirected to their own role root. `auth()` without proxy coverage **throws** (Clerk v7) — keep matchers aligned with real routes.

**Data flow (professor posts a remark):** form on `professor/courses/[id]/materials` → Server Action `createMaterial()` → writes `Material`, inserts `Notification` rows for every enrolled student → student bell polls and shows it; the course page lists it under Materials & Remarks.

### 24.5 Multi-Stage Roadmap

| Stage | Scope | Exit criteria |
|---|---|---|
| **0 — Foundations** — ✅ **DONE 2026-09-04** (schema + migration live on Neon; Clerk 7.9 + roles via publicMetadata; lazy-upsert users; seed attached to the real demo accounts; shells verified working for both roles) | A logged-in student and professor each land on an empty but correctly-scoped dashboard shell — **met** |
| **1 — Student Core** — ✅ **DONE 2026-09-04** (real-data student pages; profile, courses, per-course detail, schedule, overview — all DB reads, no mutations; absorb note in §24.8) | Profile (view/edit); My Courses; Upcoming Classes (from `ClassSession` for enrolled courses, sorted by `startsAt`); Materials & Remarks per course (read-only; seeded data until Stage 2) | Student sees real enrollment data + upcoming-class schedule end-to-end from the DB — **met** |
| **2 — Professor Core** — ✅ **DONE 2026-09-05** (real professor pages incl. per-course tabs, first Server Actions, notification system with polling bell; absorb note in §24.8) | My Courses overview with roster per course; create/edit `ClassSession` → immediately visible to enrolled students; materials/notes upload (text + file) → triggers `Notification` rows; notification bell (polling) on both dashboards | Professor schedules a class and posts a remark; the enrolled student sees both without a page reload (or on next poll) |
| **3 — Meetings & Planner** (1–1.5 wk) | Meetings schedule/view (students/parents/colleagues) with simple calendar view; Coursework Planner (`Task`s with due dates/status); Completion Monitor (per-course % of tasks done, bar/donut chart from `CompletionLog`/`Task.status`) | Professor can plan tasks and see completion % update as tasks move to done |
| **4 — Polish** — ✅ **DONE 2026-09-05** (mobile drawer, student prefs editor, first loading/error/not-found boundaries, small-screen fixes; audit findings absorbed into §24.8) | Notification preferences; empty states, loading skeletons, error boundaries; mobile pass (sidebar → bottom nav/drawer); access-control audit — students can never hit professor-only Server Actions/routes (test by hitting URLs directly) | Coherent on mobile; role boundaries enforced server-side, not just hidden in UI — **met** |
| **5 — QA & Deploy** (0.5–1 wk) | Integration tests for critical paths (enroll → see class; post material → student notified; create task → completion updates); seed/demo data walkthrough; Vercel preview + staging DB; merge to production with the same Prisma migration; rollback plan (feature-flag the dashboard nav link if needed) | Feature live on the real domain behind auth |
| **6 — Future / post-v1** | Realtime push (Supabase Realtime/Pusher); **Parent view** (read-only window into a student's dashboard — ties into the existing For-Parents audience door); attendance per `ClassSession`; gradebook/assessment scores; calendar sync (.ics/Google); admin console for users/courses/enrollments | — |

**v1 estimate: ~5.5–7 weeks** steady/focused.

### 24.6 Suggested Server-Action Surface

`courses.ts`: `getMyCourses()`, `getCourseById()`, `createCourse()` (professor), `enrollStudent()` (admin/professor) · `sessions.ts`: `getUpcomingClasses()`, `createClassSession()`, `updateClassSession()`, `cancelClassSession()` · `materials.ts`: `getCourseMaterials()`, `createMaterial()`, `deleteMaterial()` · `notifications.ts`: `getMyNotifications()`, `markAsRead()`, `createNotification()` (internal, called by other actions) · `meetings.ts`: `getUpcomingMeetings()`, `createMeeting()`, `updateMeeting()` · `tasks.ts`: `getCourseTasks()`, `createTask()`, `updateTaskStatus()`, `getCourseCompletion()` · `profile.ts`: `getProfile()`, `updateProfile()`. Implement as Server Actions unless a Route Handler is genuinely needed (webhooks, file-upload callbacks).

### 24.7 Suggested Component Inventory

**Shared:** `DashboardShell`, `Sidebar` (role-aware), `NotificationBell`, `StatCard`, `EmptyState`, `DataTable`, `ScheduleList`, `CalendarView`
**Student:** `EnrolledCourseCard`, `MaterialFeed`, `ProfileForm`
**Professor:** `CourseRosterTable`, `ClassSessionForm`, `MaterialComposer`, `MeetingScheduler`, `TaskBoard` (Kanban: todo/in-progress/done), `CompletionChart`

### 24.8 Decisions (resolved 2026-09-04 — Stage 0 shipped)

1. **Auth provider — RESOLVED: Clerk** (accepted: vendor lock-in + per-MAU cost past free tier). Shapes the `User` model: `User.id` = Clerk user id; role = Clerk `publicMetadata` (`{"role": "student"|"professor"|"admin"}`), **single source of truth** — mirrored into DB `User.role` write-through, always read via `clerkClient()` server-side, never session token claims (claims go stale until re-sign-in). DB `User` rows sync via **lazy upsert + adopt-by-email** on first dashboard hit; Clerk webhook sync deferred to Stage 5.
2. **Course ↔ professor cardinality — RESOLVED: many-to-many** (`CourseProfessors` join table). Co-taught courses supported; every course-ownership check goes through the join. A professor can teach across verticals.
3. Notification delivery: polling is fine for v1 — no websockets until the lag is actually felt. (unchanged)
4. File storage limits: provider choice deferred to Stage 2 (materials upload); nothing installed in Stage 0. (unchanged)
5. **Isolation:** the `(dashboard)` group is fully isolated (separate layout + data fetching) so a dashboard bug can never take down the marketing pages that drive enquiries. Stage 0 makes zero marketing-page changes. (unchanged)

**Stage 0 complete — absorbed from `Dashboard-Stage0-Implementation-Plan.md` (deleted 2026-09-04, same lifecycle as the archived V2 plan).** What shipped beyond the decisions above: role dispatch for `/dashboard` lives in `src/proxy.ts` (no index page — a group/root-level page collides with `(site)/page.tsx`); real folder `src/app/dashboard/` (route-group correction, §18 rule 8 + §19 ledger); demo walkthrough accounts are the owner's real Clerk users — professor `piyush.ghosal.ai@gmail.com`, student `pika38212@gmail.com` (both roled via publicMetadata; seed links demo data by these emails, not the placeholder `.test` addresses from the plan). Clerk webhook sync, file storage, `Material.visibility`, mobile drawer polish remain deferred as planned (the admin role gained a minimal invitation area 2026-09-05 — see below).

**Stage 1 — Student Core complete (2026-09-04).** All five student routes now show real DB data; zero mutations (notification bell still Stage 2). Decisions and shipped shape:
- **Profile** = view mirror (avatar/name/email/role/"Dashboard member since" — the DB row's `createdAt`, honestly labelled as first dashboard visit) + embedded Clerk `<UserProfile routing="hash" />` portal (path routing would navigate to a nonexistent `/user` route). Identity edits stay Clerk-owned; the mirror refreshes on the next hit. Clerk's own theme accepted for now (polish deferred to Stage 4).
- **Query layer** in `src/lib/dashboard/` — `courses.ts` · `sessions.ts` · `materials.ts` · `profile.ts` · `format.ts` (`'server-only'`; **role-explicit names** — `getStudentEnrolledCourses`, `getStudentUpcomingSessions`, `getStudentCourseWithAccess`, `getStudentStats`, `getProfileRecord`, `getCourseMaterials` — so Stage 2's professor reads and the §24.6 mutation actions under `lib/actions/` slot alongside without collisions). Every query scopes by ACTIVE enrollment server-side via relation filters; the course-detail page 404s (notFound) for anything else. Reads only — no Server Actions yet.
- **Access & dedupe:** `getCurrentUser` in `src/lib/auth.ts` is now wrapped in React `cache()` — a layout's `requireRole()` and its page share one Clerk fetch + one mirror-upsert per request (also closes a first-visit P2002 race between concurrent upserts).
- **Course pages:** `/dashboard/student/courses/[courseId]` is new; `generateMetadata` and the page share the access-checked lookup through a module-level `cache()`. Next 16 async `params` awaited in both. Course verticals map to programme names + pillar accents through `src/components/dashboard/coursePillar.ts` (literal class maps only — §18 rule 5; unknown vertical → neutral sky/indigo fallback).
- **Times:** DB stores UTC; display is Asia/Kolkata with an explicit IST label via module-cached `Intl.DateTimeFormat` instances in `format.ts`. Schedule day-grouping + Today/Tomorrow labels derive the IST calendar date through `Intl.formatToParts` — never UTC `Date` getters (a 23:30 UTC session is 05:00 the next day in IST).
- **Seed:** 3 demo materials per course (NOTE/REMARK/LINK; internal real URLs for LINKs; FILE deferred with the Stage 2 storage decision), `uploadedById` = demo professor, staggered `createdAt`, idempotent via per-course count check (documented edge: Material has no natural unique key).
- Verified 2026-09-04: lint ✓ · tsc ✓ · build ✓ (11 dynamic dashboard routes incl. `courses/[courseId]`); smoke-checked all query shapes against the live Neon DB. Student shell components: `StatCard`, `EmptyState`, `SessionItem`, `EnrolledCourseCard`, `MaterialFeed`, `ProfileSection`.

**Stage 2 — Professor Core complete (2026-09-05).** Professor routes are real end-to-end; first mutations and the notification system shipped.
- **Architecture: thin actions + testable domain.** `src/lib/actions/` (`'use server'`; `sessions.ts` · `materials.ts` · `notifications.ts`; shared `ActionResult` = `{ok:true,message?} | {ok:false,fieldErrors?|formError?}` in `actions/types.ts`) are orchestrators only — `requireRole('professor')` → zod v4 validate → call `src/lib/domain/` (plain async fns taking explicit professorId; ownership via `CourseProfessors` through `domain/ownership.ts`; `DomainError` codes; no existence oracle — "Course not found." for missing AND not-owned) → `revalidatePath` both role layouts. Integration tests in Stage 5 drive the domain layer directly (no Clerk).
- **File storage — provider-agnostic by user requirement; provider = AWS S3 since 2026-09-05** (was UploadThing — see §24.9; `uploadthing.ts` + deps deleted, no data migration needed as no object ever landed). `src/lib/storage/`: `types.ts` (`StorageProvider` interface: `createUpload/verifyUpload/getDownloadUrl/delete` + `StorageNotConfiguredError`), `s3.ts` (S3Provider — THE only `@aws-sdk/*` import; `@aws-sdk/client-s3` + `s3-request-presigner`: presigned `PutObjectCommand` with the **Content-Type signed in** (the client must send that exact header with raw bytes — no multipart), key = `materials/<24 random base64url bytes>` (plain opaque object key — no provider keygen recipe needed), `verifyUpload` HEADs a short presigned URL for real size, downloads via presigned `GetObjectCommand` 24h, deletes via `DeleteObjectCommand` (idempotent 204); env `S3_REGION/S3_BUCKET/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY`), `index.ts` (`getStorage()` factory on `STORAGE_PROVIDER`; unset/unknown → `DisabledStorage` with honest UI copy). DB rows store `fileProvider` + opaque `fileKey` + `fileMeta Json {name,size,mime}` — never URLs. Client uploads never touch our server (Vercel's 4.5 MB body cap): `FileDropzone` (generic, provider-agnostic, XHR progress) mints `createUploadToken` (ownership checked BEFORE signing) → PUTs raw bytes straight to the presigned URL → `completeFileUpload` (verify + persist + notify). Future provider swap = new adapter + `scripts/storage-migrate.ts` updating provider/key rows only. **Two migrations shipped:** `add_material_file_storage` (StorageProvider enum + 3 Material columns; `fileUrl` documented LINK-only) and `add_user_notification_prefs` (brought forward from Stage 4 — the notification builder reads prefs from day one; `notifPrefs Json?`, absent = all ON; `getCurrentUser` mirror never touches it).
- **Notifications.** `src/lib/notifications/`: `builder.ts` (PURE — `buildNotificationRows(recipients, event)` honors per-type prefs via `NOTIFICATION_PREF_MAP`; `parseNotifPrefs` shape-drift-safe) + `notify.ts` (server-only fan-out: `createCourseNotifications` — one ACTIVE-enrollment query incl. prefs → createMany; `createStudentNotification`). Events carry honest IST bodies via `formatSessionRange` ("Class rescheduled: … · Fri, 5 Sep · 11:00 am – 12:30 pm IST"). **Route handler `GET/POST /api/dashboard/notifications`** (nodejs runtime) with ownership-scoped mark-read; **proxy matcher extended to `/api/dashboard/:path*`** with a 401-JSON branch (never `auth.protect()` for fetch routes — §18 rule 8 ledger note). Client `NotificationBell` polls immediately + every 30 s, pauses on `document.hidden`, in both shells' headers; both role notifications pages are real (`NotificationList` server + `NotificationActions` client; professor page shows an honest "professor-facing notifications arrive in a future stage" note since all fan-out currently targets students).
- **Datetime contract (all forms):** `<input type="datetime-local">` values are IST wall times — regex-validated, range-checked lexicographically, converted via `istWallTimeToUtc` (`validators/datetime.ts`); prefills convert UTC→IST wall time client-side (`lib/ist.ts`, deliberately not server-only). Reused by every session/meeting/task form.
- **Professor pages:** overview (real stats/next/courses), courses grid, per-course management (`courses/[courseId]` — CourseTabs Overview/Roster/Sessions/Materials; server-rendered panels, client tab shell; SessionsManager with inline edit + two-step cancel, only SCHEDULED editable), schedule (create across courses + IST-grouped list), profile (mirror + shared `ProfileSection` — moved to `components/dashboard/`, both roles; professor stub's "Stage 1" label fixed). Student side: `notifications` page real; MaterialFeed FILE rows render signed download links + `formatBytes`.
- Verified 2026-09-05: lint ✓ · tsc ✓ · build ✓ (13 dynamic dashboard routes + `/api/dashboard/notifications`); DB smoke against live Neon (migration columns, professor counts 5/1/2/3, bogus-course → null, roster incl. prefs shape). Storage smoke gate ran 2026-09-05 against UploadThing and was **BLOCKED** by the free tier (§24.9) — provider then switched to **AWS S3** same day and the gate **PASSED** end-to-end against the live bucket (presigned PUT/HEAD/GET/delete; browser E2E still the owner's remaining check).

**Invite flow + minimal admin area (2026-09-05).** Sign-ups were invite-only from the start (no sign-up link anywhere); the invitation *mechanism* was previously manual account creation in the Clerk dashboard. Now app-driven and role-aware:
- **Policy (single source):** `INVITE_ROLES_BY_INVITER` in `src/lib/validators/auth.ts` — `admin` → professor + student; `professor` → student only. `inviteInputSchema` (zod v4) validates email + role; no role strings live anywhere else.
- **Action:** `src/lib/actions/invitations.ts` `createInvitation` — `requireRole('admin','professor')` → validate → re-check role against the inviter's allowed list (a tampered request cannot escalate) → Clerk `invitations.createInvitation({ emailAddress, publicMetadata: { role }, notify: true })`. Invitation `publicMetadata.role` lands in the user's publicMetadata on acceptance → `getCurrentUser()` accepts them on first dashboard hit (lazy mirror-upsert unchanged; no webhook needed).
- **UI:** shared `InviteUserForm` client component renders only the inviter's allowed roles (fixed "Student" chip for professors; Professor/Student cards for admins). Pages: `/dashboard/professor/invite` (professor nav, "+Invite" between Schedule and Notifications) and `/dashboard/admin/invite`.
- **Admin area (new — the role previously had no surface, `ROLE_HOME`/proxy landed it at `/`):** real folder `src/app/dashboard/admin/` (`layout.tsx` gated by `requireRole('admin')`; home = invitation hub; `ADMIN_NAV` = Overview + Invite). `DashboardShell` role union widened to `admin`; the notification bell is omitted for admin (no fan-out targets admins). `ROLE_HOME`/`ROLE_LANDING.admin` → `/dashboard/admin` (both maps updated).
- Verified 2026-09-05: lint ✓ · tsc ✓ · build ✓ (3 new routes: `/dashboard/admin`, `/dashboard/admin/invite`, `/dashboard/professor/invite`). Browser E2E remains the owner's check (admin/professor each send an invitation; invitee accepts and lands in the right dashboard).
- **Operational notes (learned live 2026-09-05):** Clerk **development instances send invitation mail from Clerk's shared sender domain — it lands in the recipient's spam** (verified: the invitation was created and the email sent; not a delivery failure). Set up a verified sending domain in Clerk once the production domain exists. Clerk's instance-level **"Invite-only access mode"** is recommended before launch — invitations alone don't restrict self-signup; the app merely hides the sign-up link and `getCurrentUser()` rejects role-less users.
- **Owner action to use it — DONE 2026-09-05 (verified live):** the demo account `piyush.ghosal.ai@gmail.com` now carries `publicMetadata.role: "admin"` (confirmed via Clerk API + DB); a second professor account exists from the invite E2E — `killerme69blank@gmail.com` (role `professor`, **no `CourseProfessors` links yet** — the course-assignment gap; its course pages 404 by design until assigned).
- **Course-assignment gap — CLOSED 2026-09-05 (course-setup slice):** invites create accounts only, but professor↔course (`CourseProfessors`) and student↔course (`Enrollment`, `@@unique([studentId, courseId])`, ACTIVE) rows now have real writers beyond the seed — see the slice block below.

**Stage 3 — Meetings & Planner complete (2026-09-05).** No new routes — the meetings `PlaceholderPage` stub was replaced in place, the Planner is a fifth `CourseTabs` panel on the existing per-course page, and student Coursework is a section on the existing course page. Meetings/tasks/CompletionLog tables and the MEETING/TASK_DUE notification types + prefs were all in the Stage 0 schema — **zero migrations shipped**. Decisions and shipped shape:
- **Meetings (`/dashboard/professor/meetings`):** schedule one-on-ones with `STUDENT`/`PARENT`/`OTHER` (student picker = distinct ACTIVE-enrolled students across owned courses via `getProfessorStudents`, so a stale pick can't outlive the enrollment), month/week calendar, and a manage list. Calendar = **react-big-calendar 1.20 + date-fns 4.4** (both new deps; §24.3's calendar-lib line now decided). **IST correctness strategy:** RBC is timezone-naive, so the client `CalendarView` maps every UTC ISO event through `utcIsoToIstLocalDate` (`lib/ist.ts`) — a local `Date` whose *wall components* are the IST wall components; server-side conversion would be wrong (Node runs UTC). Toolbar is fully replaced with hand-rolled Today/prev-next/Month-Week pills; RBC's stylesheet is imported first and overridden by `components/dashboard/calendar.css` (plain CSS on `var(--ec-*)` tokens — they flip under `.dark` with no media queries). Manage list mirrors `SessionsManager` (server RSC rows keyed by id, client edit-in-place + two-step cancel). **Notifications:** only STUDENT meetings notify — via `createStudentNotification` with copy naming the professor ("Meeting scheduled with Piyush · …", `relatedEntity` null → unlinked bell row); PARENT/OTHER meetings are quiet by design (no parent/other User row exists; the title carries identity). `domain/meetings.ts` verifies the STUDENT link is in the professor's roster (`STUDENT_NOT_IN_ROSTER`) before write.
- **Schedule page toggle:** the Stage 2 "A calendar/list toggle arrives with Stage 3" comment is honoured — `ScheduleViewToggle` on `/dashboard/professor/schedule` (default stays the list; calendar branch reuses `CalendarView` over `ClassSession`s).
- **Planner tab** (per-course, 5th tab after Materials): `TaskForm` (title/description/optional IST due date) + `TaskBoard` — three columns (To do/In progress/Done) with **no drag library** (status buttons are the interaction — a11y-clean, zero deps: Start → Mark done/Back to to-do → Reopen, edit-in-place, two-step delete). Tasks are course-wide by design (no per-student assignee in the schema — the whole class works the same plan). `Task` has no `createdAt` column (schema fact that shaped the DTO); ordering is `dueDate asc` (Postgres NULLs last) + `id`.
- **Completion monitor** (Planner tab + professor overview): built to the dataviz method — the per-course view is a part-to-whole stacked bar (DONE→IN_PROGRESS→TODO segments, 2px surface gaps via `calc(pct% - 2px)` on non-final segments, values in ink, legend chips with counts) over state tiles; the overview is a per-course **meter row** (single-ratio sequential — the state split is the monitor's question, not the overview's). Status hues are the `--ec-success/--ec-warning/slate` tokens; the palette validator run 2026-09-05 put amber↔green in the legal 6–8 CVD band — legal because every color carries a label + count. **The monitor counts live `Task.status` — never `CompletionLog`** (the log is a write-through ledger: `domain/tasks.ts` upserts `percentComplete` 0/50/100 on status change; reading it would be the drift trap).
- **Notifications — TASK_DUE:** fan-out to all ACTIVE-enrolled students (`createCourseNotifications`, `relatedEntity course:<id>` → deep-links to the course) only when a task is created *with* a due date or an update *changes the due date to a value* (set→cleared and unchanged stay silent — the materials "no noise" rule). Status changes make no noise.
- **Student read-only Coursework** (user-approved): new section between Upcoming classes and Materials on `/dashboard/student/courses/[courseId]` — `TaskItem` rows (status chip, `Due Fri, 5 Sep` with Today/Tomorrow labels, honest **Overdue** chip when past-due and not DONE, DONE rows muted + struck through). ACTIVE-enrollment-gated via `getStudentCourseTasks`.
- **Seed extension:** `prisma/seed.ts` gains an IST-exact `istTimeDaysFromNow` helper (UTC-arithmetic on the +05:30 offset, machine-tz independent — the *older session seeding's* machine-local smell is left untouched by choice) + 3 demo meetings (STUDENT/PARENT/OTHER) + 4 tasks per course across all statuses incl. one overdue TODO and one DONE (so the demo student sees every chip state and completion lands at 25%) + CompletionLog write-through rows; idempotent count guards like materials. Demo data present 2026-09-05: 3 meetings, 20 tasks, 10 completion logs.
- Verified 2026-09-05: lint ✓ · tsc ✓ · build ✓ (RBC + `calendar.css` confirm compiled into the calendar chunk; no new routes); `npm run db:seed` run twice — first 3 meetings/20 tasks/10 logs, second all-zero (idempotent). **Browser E2E remains the owner's check** (list): meetings calendar shows the 3 seeded meetings at IST wall times + toolbar works; create/cancel a STUDENT meeting → student bell shows it; schedule-page toggle; Planner add/move/edit/delete task → monitor + student Coursework + student `TASK_DUE` notification; overview meters match; a meeting with a roster-departed student edits without a silent flip.

**Stage 4 — Polish complete (2026-09-05).** Four workstreams, all decisions owner-approved during the session:
- **Mobile navigation — drawer (owner chose drawer over bottom nav):** `DashboardShell` reworked — the horizontally scrollable pill strip (7 professor items, ~3.5 visible at 400px) is gone; a hamburger (`lg:hidden`) opens a full-height drawer under the single-row header (~104px → 64px of mobile chrome). The marketing Navbar's panel pattern, **plus the a11y it lacks**: focus moves to the first nav link on open, Escape closes and returns focus to the toggle, route change closes it, body scroll locks while open (`useScrollLock`, reference-counted), `aria-expanded`/`aria-controls`, conditional mount so only one `aria-label='Dashboard'` landmark exists at a time. Drawer carries the role label, icon nav list and the user identity block (mobile previously had no name/email anywhere). Desktop sidebar untouched. Nav counts no longer matter (any role fits).
- **Notification preferences — student-only (owner chose honest-scope):** the prefs machinery existed since Stage 2 (schema Json, `parseNotifPrefs`, builder honours prefs, schema comment "editor UI ships in Stage 4") — nothing wrote `notifPrefs` before this. New: `validators/preferences.ts` (4-boolean full-shape schema), `getNotificationPrefs` read (dashboard/notifications.ts; absent → all-ON, same rule as fan-out), `updateNotificationPrefs` action (**student-gated** — every channel is a student event today; professor-facing announcements will ship their own channels in a future stage and extend the action), and `NotificationPrefsEditor` (four role="switch" rows — classes/materials/task-due/meetings — staged locally, single Save, dirty tracking, honest copy "apply from the next notification"). Placement: student Notifications page under the list; the professor notifications page keeps its "future stage" note with no inert editor.
- **Boundary files — the first in the repo** (marketing has none; the dashboard set the convention): `dashboard/loading.tsx` at the professor and student segments (`DashboardSkeleton`, role-agnostic shimmer — this is what makes the multi-query pages not blank-jank); `dashboard/error.tsx` (client, standalone branded "Something went wrong" + Try again/Back to dashboard — no telemetry exists, copy stays honest); `dashboard/not-found.tsx` (404 for the two course-detail `notFound()` calls and unmatched URLs — standalone, "never says which", sends users through `/dashboard` role dispatch). **`PlaceholderPage.tsx` deleted** — dead since Stage 3 made every route real (audit found zero importers).
- **Access-control audit — CLEAN, no fixes needed** (documented matrix): all 15 Server Actions gated by the correct `requireRole` (professor-only mutations; read-state notifications all three roles with ownership in the WHERE); role layouts gate every subtree; the two `[courseId]` pages additionally `notFound()` via cache()'d WithAccess lookups in `generateMetadata` + page; the two "trust the caller" modules (`getCourseMaterials`) are only reachable behind those same-request gates; zero client components import server-only modules (the `'server-only'` guardrail would fail the build); the only internal client fetch is the bell poll. Caveats recorded for future stages: an admin/course-listing page must gate before calling `getCourseMaterials`; `professor/invite` + `admin/invite` trust the layout only (fine — they read no role-sensitive data).
- **Small-screen fixes** (from the shell audit): `CompletionCourseRow` restructured (fixed-width label + count crushed the meter to ~16px at 400px → stacks below `sm`, three-column row above); `CalendarView` height responsive (`h-[440px] sm:h-[560px]`). Everything else audited already stacked/wrapped safely (RosterTable email column hides below `sm`, TaskBoard columns stack below `md`, all forms grid-stack).
- Verified 2026-09-05: lint ✓ · tsc ✓ · build ✓ (after `rm -rf .next` per the §19 deletion rule). **Browser E2E remains the owner's check** (list): drawer opens/closes on mobile with Escape + focus behaviour and route-change close; toggle the four prefs switches as the demo student, Save, then have the professor post a class/material — suppressed channels stay silent; loading skeleton flashes briefly on dashboard navigations; a bogus course URL shows the branded 404, and an error boundary pass is visible if a page ever throws; overview meter rows + calendar look right at ~400px width.
- **Follow-up (2026-09-05, owner-requested):** `StatCard` layout tweak — the label moved from under the number to sit **beside it** (baseline row, wrapping labels allowed) with the icon tile centred against the row. One shared component, so the student AND professor overview stat rows both changed; no other files touched. lint ✓ · tsc ✓ · build ✓ (commit `7276481`, which also deleted the committed `.tmp-*.ts` scratch checkers).

**Owner E2E status (2026-09-05, after `56327f0` went live on the preview):** the 404s reported from localhost were **not a code bug** — every course-detail query was replicated cleanly against the live DB and Clerk identities matched rows exactly; the cause was a stale local dev server whose `.next` had been wiped under it (§20 operational lesson). Confirmed working by the owner on the fresh deploy. Stage 3/4 checklists above remain open item-by-item (calendar/prefs/drawer specifics not yet individually confirmed); Stage 3 storage uploads + invite flow were exercised (evidence noted in §24.9 and the admin bullet above).

**Course-setup slice complete (2026-09-05) — the §24.6 `courses.ts` spec, shipped.** Closes the long-open assignment gap with the smallest possible surface:
- **Professor "Enroll student"** — new section at the top of the Roster tab (`/dashboard/professor/courses/[courseId]`): `EnrollStudentForm` (email input; `useActionState`; on success clears + `router.refresh()`s so the roster table and the meetings student picker repaint immediately). Domain: `enrollStudentForProfessor` (ownership-asserted) looks the email up as an **adopted User row** — students who never signed in once get the honest "no Educraft account yet — they need to accept an invitation and sign in first" error; non-student accounts are refused. Existing `DROPPED`/`COMPLETED` enrollments **reactivate to ACTIVE** (message says "enrolled again"); only an ACTIVE row errors as "already enrolled". No notification row: enrollment has no `NotificationType` (would need a migration — out of scope); the success copy carries the outcome.
- **Admin course creation with professor assignment** — new section on `/dashboard/admin` (`CourseForm`, client): code (upper-cased, `LING-101`-pattern), title, vertical (literal enum of the five programme slugs — validator stays dependency-free; kept in sync with `data/programmes.ts` + `pillarStyles.ts`), optional description, and **comma-separated professor emails** (M2M — co-teaching). Duplicate code → `COURSE_CODE_TAKEN`; unknown/non-professor emails → same honest sign-in-first error per address. The admin page also gained its first data query (`getAdminCourseList` in `dashboard/admin.ts`) and an "All courses" list (pillar accent, professors, ACTIVE count) below the form.
- **New modules:** `validators/courses.ts` (`enrollStudentInputSchema`, `createCourseInputSchema`, `COURSE_VERTICALS`) · `domain/courses.ts` · `actions/courses.ts` (`enrollStudent` professor-gated, `createCourse` admin-gated; enroll revalidates BOTH role layouts, create revalidates admin) · `dashboard/admin.ts`. DomainError codes added: `USER_NOT_FOUND` / `USER_NOT_STUDENT` / `USER_NOT_PROFESSOR` / `ALREADY_ENROLLED` / `COURSE_CODE_TAKEN`. No schema change, no migration, no seed change.
- Verified 2026-09-05: lint ✓ · tsc ✓ · build ✓ (commit `6f91f33`). **Browser E2E is the owner's check:** admin creates a course assigning `killerme69blank@gmail.com` → that professor sees it under My Courses and can open it; professor enrolls `pika38212@gmail.com` by email → roster row appears immediately, the student sees the course + Coursework etc. on next visit, and the meetings student picker gains them; unknown-email and duplicate-enroll error paths read honestly.

**Course-setup slice — REWORKED 2026-09-05 (working tree; awaiting the owner's commit — the original slice had usage flaws + flow blockers the owner hit: no enrollment feedback, case-sensitive email matching, the fragile comma-string professor field, and zero management after creation).** The rework:
- **Enrollment notifications.** `ENROLLMENT` NotificationType (migration `20260905164701_add_enrollment_notification`, applied on live Neon) + an `enrollment` pref channel (5th switch in the student prefs editor; exhaustive `NOTIFICATION_PREF_MAP`/prefs schema updated; absent stored key = ON, drift-safe). Fan-out on enroll AND re-enroll (`relatedEntity course:<id>` deep link) and on professor removal (no link — the student can no longer open it); copy names the course ("Enrolled in X (LING-101)" / "Removed from …").
- **Normalized emails everywhere in this slice.** Validators trim + lowercase (`normalizeEmail`), so DB lookups are case-insensitive by construction (`Student@Example.com` no longer misses).
- **Hardened domain** (`domain/courses.ts`): enroll's read-then-write runs in a `$transaction`; P2002 (code, composite keys) mapped to domain errors everywhere — no more raw 500s on races or duplicate emails; professor emails deduped + capped (8). Create is all-or-nothing with per-email reasons enumerated ("Could not assign: x@y.com (no Educraft account yet…); …"); adding to an *existing* course is partial-success with honest copy (added / already-assigned / failed). `updateCourseForAdmin` (code uniqueness excluding self), `unenrollStudentForProfessor` (soft `DROPPED`, reactivatable), `deleteCourseForAdmin` (collects FILE keys → best-effort storage deletes → row delete, FK cascades; accounts untouched). New DomainError codes: `COURSE_NOT_FOUND` / `NOT_ENROLLED` / `PROFESSOR_NOT_ASSIGNED` / `PROFESSOR_RESOLUTION_FAILED`.
- **Admin course surface** (this is where the "no management after creation" gaps closed): new `/dashboard/admin/courses` (create form + all-courses list with Manage rows) and `/dashboard/admin/courses/[courseId]` manage page — `CourseDetailsForm` (code/title/vertical/description edit), `ProfessorManager` (current professors with two-step remove — removing the last professor is allowed with explicit copy — + chip-based add), `DeleteCourseZone` (armed + typed-code confirmation; lists what cascades). Admin overview slimmed to CTA cards; `ADMIN_NAV` gains Courses. `getAdminCourseDetail` (dashboard/admin.ts) feeds the page; null → the dashboard 404.
- **Professor roster + forms:** `RosterTable` is now a client table with per-row two-step **Remove** (soft drop, honest copy); roster/professor pages copy notes the student notification. CourseForm v2 — chips replace the comma string (shared `EmailChipInput`: Enter/paste splitting, dedupe + lowercase on add, cap surfaced, repeated hidden inputs for `getAll`), code uppercases live, vertical demands a conscious choice (no silent prefill), fields + result banner reset after success. Banner hygiene (results hide as you retype) applied to CourseForm + EnrollStudentForm.
- Verified 2026-09-05: lint ✓ · tsc ✓ · build ✓ (admin routes emitted); smoke ✓ (pure-builder ENROLLMENT pref logic + read-only live-DB state checks). **Browser E2E remains the owner's check** (list): admin creates a course with chips → success names the professors, row appears under All courses; open Manage → edit code/title → header updates, `COURSE_CODE_TAKEN` when colliding; assign + remove professors incl. the last-one copy; delete flow (type code, wrong code stays disabled, correct deletes and returns to the list); professor Roster Remove → row leaves, student bell shows "Removed from …", re-enroll reactivates + notifies again; enrolled student's bell shows "Enrolled in …" and prefs' new Course enrollment switch gates all three.

---

## 24.9 Blocker — UploadThing free tier rejected private files → RESOLVED with AWS S3 (2026-09-05)

- **Original symptom (2026-09-05):** `npm run db:storage-smoke` failed at the ingest PUT with `400 {"error":"Private files are not allowed for free apps. Upgrade your app to a paid tier to enable private files."}` — UploadThing's free tier does not allow `x-ut-acl=private`.
- **Resolution — RESOLVED 2026-09-05: switched the storage provider to AWS S3.** `src/lib/storage/uploadthing.ts` (the only `uploadthing/*` import) and the `uploadthing` + `sqids` deps are **deleted**; a new `src/lib/storage/s3.ts` (`S3Provider`) serves the same `StorageProvider` interface with AWS SDK presigned URLs. The provider-agnostic architecture absorbed the swap with **zero domain/DB/UI changes** (rows already stored `fileProvider` + opaque `fileKey`; the Prisma `StorageProvider` enum already had `S3`; `domain/materials.ts` already casts `'UPLOADTHING' | 'S3'`). The only non-provider code change: `FileDropzone` + the smoke script now PUT **raw bytes with the signed Content-Type header** (S3 presigned PUTs sign headers; UploadThing had accepted multipart FormData).
- **Code state:** shipped + verified 2026-09-05 — lint ✓ · tsc ✓ · build ✓ (29 routes). **Storage smoke gate PASSED 2026-09-05** against the owner's live bucket `educraftbucket07` (`ap-southeast-2`): presigned PUT 200 → verifyUpload size match → signed GET body match → delete → verify-gone. **Browser visual E2E — executed 2026-09-05 by the owner** (evidence in the live DB: the demo student's notification feed received `New file: EDUCRAFT_PRODUCTION` ×2 and `New note: S3` rows from professor-side uploads). Remaining sub-check: the signed **download-link click-through** on the student side.
- **What works already:** the provider-agnostic layer, the direct PUT flow, the generic FileDropzone, and the FILE-row domain/query/UI paths. Env: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (mirrored in `.env.example`); unset/unknown `STORAGE_PROVIDER` still means the honest "uploads disabled" path. Live values 2026-09-05: `S3_REGION=ap-southeast-2`, `S3_BUCKET=educraftbucket07` (in `.env.local`, gitignored).

### 24.9.1 AWS setup (owner action — one-time; **completed 2026-09-05**, bucket `educraftbucket07` in `ap-southeast-2`)

1. **Bucket** — create in `S3_REGION`, name = `S3_BUCKET`. **Block all public access ON** (objects stay private; access is only via presigned URLs).
2. **IAM user** — create (or reuse) a user with **programmatic access only**; attach this inline policy (scoped to `materials/*` — the only key prefix the app writes; `HeadObject` is covered by `s3:GetObject`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
         "Resource": "arn:aws:s3:::<S3_BUCKET>/materials/*" }
     ]
   }
   ```
   Save the access key + secret into `.env.local` (`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`). Keys are long-lived — rotate them periodically; the inline policy keeps the blast radius to `materials/*`.
3. **CORS** on the bucket — browsers PUT directly to the presigned URL, so the origin must be allowed (`AllowedHeaders: *` is required so the browser may send the pinned `Content-Type`):
   ```json
   [{ "AllowedOrigins": ["http://localhost:3000", "https://temp-tau-opal.vercel.app", "https://educraft.com"],
      "AllowedMethods": ["PUT", "GET", "HEAD"], "AllowedHeaders": ["*"], "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000 }]
   ```
4. Set `STORAGE_PROVIDER=s3` in `.env.local`; run `npm run db:storage-smoke` — **PASSED 2026-09-05**; then do the browser check (professor → course → Materials → File tab → upload → student sees signed download link) — the remaining owner action. **Gotcha:** the dev server only reads `.env.local` at boot — restart `npm run dev` after env changes or the UI shows the stale "STORAGE_PROVIDER is not set" disabled copy.
5. **Vercel:** set the same five env vars in the project settings. Files already uploaded (none — the old gate never landed an object) would need a provider/key-row migration script; not needed now.

## 24.10 Stage 5 — QA & Deploy: detailed execution plan (absorbed 2026-09-07 from the deleted Stages-2-5 plan doc)

The integration tests drive the `lib/domain/` layer directly (no Clerk) — the §24.8 thin-actions + testable-domain architecture is what makes this possible.

**DevDeps (add once):** `npm i -D vitest@^5 @vitejs/plugin-react@^6 jsdom @playwright/test@^1.62 @clerk/testing@^2.2`

**Vitest unit — `vitest.config.mts`:** `defineConfig` from `vitest/config`; `plugins: [react()]`; alias `@` → `./src`; alias `'server-only'` → `tests/stubs/server-only.ts` (empty module — the `server-only` package throws outside RSC and `format.ts` imports it); jsdom default, `// @vitest-environment node` per-file for pure modules. Specs: `format.test.ts` (IST boundaries — 23:30 UTC → next IST day, Today/Tomorrow, range format) · `validators.test.ts` (datetime-local regex, lexical refine, mime/size caps) · `notifications-builder.test.ts` (pref filtering, null = all-on) · `pillar.test.ts` (5 verticals + unknown) · `storage.test.ts` (mock provider drives persist/complete domain logic; `DisabledStorage` typed error). Script `"test": "vitest run"`.

**Vitest integration (opt-in, NOT default CI) — `vitest.integration.config.ts`:** node env; `TEST_DATABASE_URL` from `.env.local`; same server-only stub. `tests/integration/course-loop.test.ts`: seed a unique trio (`it-{ts}@test.local`) → professor domain creates session/material → student queries see them → **student userId calling professor domain → denied** (role boundary at the domain layer) → notification rows exist only for the enrolled student → `getCourseCompletion` math → cleanup (cascades). Script `"test:integration"`.

**Playwright — `playwright.config.ts`:** webServer `npm run dev` (`reuseExistingServer: !process.env.CI`); projects: `setup` (`testMatch: auth.setup.ts`) → `student` / `professor` / `boundaries` (deps on setup; `storageState` under `playwright/.auth/`, **gitignored**). `auth.setup.ts`: **`clerkSetup()` belongs in the project file, NOT globalSetup** (env vars don't propagate otherwise — the #1 documented failure mode); `clerk.signIn({ page, signInParams: { strategy: 'password', identifier, password } })` per role with env creds `E2E_*_PASSWORD` in `.env.local`; `setupClerkTestingToken({ page })` only for the one real-UI spec. Dev Clerk instance only — never production keys. Specs: `auth.spec.ts` (signed-out `/dashboard` → `/sign-in`; UI sign-in once; role dispatch) · `loop.spec.ts` (professor creates class + NOTE → student sees the class on schedule + material on the course page + bell badge ≤ 30 s + mark-read clears) · `boundaries.spec.ts` (student GET professor routes → redirected; signed-out GET `/api/dashboard/notifications` → 401 JSON) · `mobile.spec.ts` (390×844). Script `"test:e2e": "playwright test"` — **runs are user-authorized per the working agreement (§20)**.

**Deploy checklist:** Vercel env = `DATABASE_URL`, Clerk keys, `STORAGE_PROVIDER=s3`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (bucket/IAM/CORS already done, §24.9.1) · `npx prisma migrate deploy` against the prod URL (additive-only — safe) · preview deploy on the staging domain first (same dev Neon acceptable at this scale) · rollback = revert the dashboard nav-link commit (no destructive schema to unwind). Docs: final §24 sync + runbook update in `PROJECT_STATE.md`.

**Gates:** `npm run test` ✓ · `npm run test:integration` ✓ (cleanup verified) · `npx playwright test` ✓ (user-authorized) · lint/tsc/build ✓ · deploy checklist executed. **User:** full manual walkthrough of both roles + the professor→student loop + mobile; approve the preview deploy.

**Stage 6 backlog (post-v1, §24.5):** realtime push · Parent view · attendance per `ClassSession` · gradebook/assessment scores · calendar sync (.ics/Google) · full admin console · CompletionLog student-side progress · S3 storage-migration + orphaned-upload cleanup scripts.

## 25. Background Roadmap — V3 Marketing-Site Enhancements

> Absorbed from the deleted `Educraft_V3_Next_Version_Planner.md` (2026-09-04). These are the deferred V2 items for the **marketing site**, tiered by priority. They remain valid background work; the Dashboard project (§24) is the current focus and §22 blockers take precedence over everything. Nothing here is current state.

### Tier A — Conversion & trust (before public launch)
1. Wire `ENQUIRY_WEBHOOK_URL` → CRM/transactional email (Resend, HubSpot, or similar) + internal notification channel.
2. Real testimonials + case studies; add verified outcome metrics to `/impact` only when real data exists.
3. Privacy-conscious analytics (Plausible/PostHog) implementing the plan's event map: `page_view, programme_view, programme_cta, enquiry_started, enquiry_completed, enquiry_error, nav_open, theme_changed, scroll_depth, insight_open`. Milestone-based scroll events only — never per-frame.
4. Error monitoring (Sentry) once public traffic exists.
5. `NEXT_PUBLIC_SITE_URL` to production domain; re-verify sitemap/canonicals/OG.

### Tier B — Experience upgrades
6. **Insights OG images** (`insights/[slug]/opengraph-image.tsx`) — the only content type missing social previews.
7. **Cursor labels** on more targets: explorer cards ("Explore"), insights cards ("Read"), deep-dive tabs.
8. **Section transition washes** where light→dark boundaries feel abrupt: `PathLines`/gradient washes on dark-zone entries (FinalCTA covered; ProgrammePage indigo close could get one).
9. **Testimonial movement:** subtle drag/scroll nudge on the primary quote — keep autoplay banned.
10. **Smooth scroll evaluation:** test native first; only adopt Lenis if it demonstrably improves the pinned sequences, with reduced-motion + anchor + keyboard guarantees.
11. **Programme page 3D accents:** at most one restrained `GeometryArtifact` per programme hero, reusing `three/` primitives — never a full canvas per page.
12. **GSAP/ScrollTrigger** only if choreography outgrows the current hooks — never for fades.

### Tier C — Content & growth
13. Insights: more articles, `/insights/[category]` pages, simple search; pagination when volume demands.
14. Headless-CMS migration path when non-technical editors need to publish — data files are already CMS-shaped.
15. i18n evaluation (multi-language) — large; only when international expansion is real.

### Tier D — Platform & QA
16. Tests: Vitest unit (validation, utils, rate-limit) + component (accordion, staged form, mega menu, theme toggle) + Playwright E2E (enquiry flow, navigation, mobile menu, reduced-motion behavior) + visual regression (homepage, programme pages, dark mode, breakpoints).
17. Lighthouse baseline + Core Web Vitals field data; bundle inspection; confirm LCP < 2.5s / CLS < 0.1 / INP < 200ms on real devices.
18. Shared rate-limit store for multi-instance deploys.
19. A11y audit pass: keyboard-only walk of mega menu + staged form, screen-reader pass, contrast check of programme accents (esp. `achieve` gold on light).
20. Dependency hygiene: adopt the R3F patch that clears the THREE.Clock warning when it ships.

### Design principles to protect (non-negotiable)
- Visuals must explain learning/progress/connection — never decoration for its own sake.
- One great scene beats three mediocre ones; motion needs a narrative purpose.
- Avoid: endless rounded cards, all-centered sections, autoplay carousels, glassmorphism, stock-looking art, invented numbers.
- Reduced-motion users get static compositions + functional transitions only (already systemic via CSS).

### Checklist for starting a work session
1. Read this file (master): §18 conventions/fixed-bug ledger, §20 verification loop, §22 blockers first — then [`PROJECT_STATE.md`](PROJECT_STATE.md) for the live snapshot, open checks, and the active stage.
2. If Dashboard work: §24, its §24.8 decisions, and §24.10 for Stage 5. If marketing-site UI-UX upgrade work: §28 spec (read §28.1–28.2 corrections first) + PROJECT_STATE.md §3. Otherwise pick the highest unblocked §25 Tier item.
3. Run `npm run lint` → `npx tsc --noEmit` → `npm run build` before and after changes (§20).
4. The user performs all website viewing/visual QA — never launch browsers or curl the site from the assistant side.
5. When a Tier item ships, move it to a "Done in V3.x" note here with the commit hash. When new information arrives (a §24/§28 stage completes, a decision lands, state changes): write it into **this file first** (governance R1, §0), then sync `PROJECT_STATE.md` status rows and open checks.

---

## 26. Architecture Hygiene Ledger

> Absorbed 2026-09-07 from the deleted `ARCHITECTURE_REVIEW.md` (2026-09-04, analysis only — no code changed). The review's verdict: the project is **clean and unusually disciplined**; nothing below is a blocker — a list of hygiene items and forward-looking improvements, most of them cheap. Findings are statused as of 2026-09-07; statuses marked *verified* were re-checked against the live config on that date.

**Clean areas (do not touch):** `(site)` route-group organization; feature-folder components 1:1 with homepage sections; `three/` core/primitives/scenes/hooks split with a single canvas; `design/` JS tokens + `globals.css` runtime vars; data-driven content (`types` → `data` → components); `@/*` alias discipline; decorative systems consolidated in `DecorativeSystems.tsx`; CSS-level reduced-motion.

### A. Correctness / deployment risk

| # | Finding | Status (2026-09-07) |
|---|---|---|
| A1 | `data/enquiries.jsonl` append breaks on serverless (Vercel FS is ephemeral/read-only) — the JSONL is a **dev-only** fallback; the webhook must be the sole production channel (§13/§21) | OPEN — resolve at/ before launch; linked to §22 |
| A2 | Naming collision root `data/` (runtime log) vs `src/data/` (content) — rename the runtime dir (e.g. `runtime/`) if it survives | OPEN / low — the log is unchanged today |
| A3 | Favicon is a ~601 KB PNG (`layout.tsx` sets `icons.icon` to `/logo.png`); ship a small `favicon.ico`/`.svg` | OPEN / cosmetic |

### B. Tooling config gotchas

| # | Finding | Status (2026-09-07) |
|---|---|---|
| B1 | ESLint flat-config `ignores` is not global — it still sits inside the trailing rules object (`eslint.config.mjs:55`, *verified*) so preset configs still match `.next`; move to a standalone leading block and add `.playwright-mcp/` | OPEN / 5 min |
| B2 | `tsconfig.json` still includes `.next/dev/types/**/*.ts` (*verified*) — dropping it would end most of the stale-`.next`-type `tsc` ritual (§19/§20); keep `.next/types` | OPEN / 5 min |
| B3 | `.env.example` missing while `.gitignore` carves it out | RESOLVED — exists, documents S3/Clerk/etc. |
| B4 | `components.json` (shadcn stub) exists with no shadcn deps installed | OPEN — decision parked in §24.3; don't leave it half-adopted |

### C. Dead / near-dead code (importers re-checked 2026-09-07)

| # | Item | Status |
|---|---|---|
| C1 | `components/educraft/ui/Card.tsx` — **0 importers** (the `card-surface` CSS class is what's used) | OPEN — delete or adopt |
| C2 | `hooks/useSectionProgress.ts` — **0 consumers** (docs once listed it as shipped; §11 still inventories it) | OPEN — delete or wire into a real section-step feature |
| C3 | 2× `Educraft Branding Showcase*.svg` at repo root (~237 KB each, unreferenced) — dedupe/move/delete | OPEN / root clutter |
| C4 | `.playwright-mcp/` — MCP snapshot scratch, untracked | OPEN — add to `.gitignore` |

In use, keep: `useScrollLock` (2 consumers), `useParallax` (1).

### D. Organization consistency (low priority)

- Providers split by convention: `EnquiryModalProvider` in `src/context/` vs `ThemeProvider` in `src/components/theme/` — pick one home (a top-level `src/providers/`) before adding another provider.
- `three/hooks/useSceneActive.ts` lives under the feature while all other hooks sit in `src/hooks/` — fine as locality; choose once.
- No barrel/index files anywhere — fine at current counts; revisit if the dashboard component set grows further.
- `tsconfig` loose spots: `strict: true` but `noImplicitAny: false`, `allowJs: true` on a 100% TS codebase — tighten during the Tier D QA pass (§25 T16–T19).

### E. Size watchlist (from the review, 2026-09-04)

`data/programmes.ts` 1,247 lines (split `programmes/*.ts` per slug if programmes grow) · `EnquiryForm.tsx` 528 (stage subcomponents if it grows) · `globals.css` 489 (fine below ~700) · `Navbar.tsx` 395 (extract `navbar/*` subcomponents if it grows again).

### F. Suggested priority (review's order, adjusted)

P1: B1, B2, C1, C2 (5–10 min each) → P2: D1 (do with any future provider work), A3, A2, C3, C4 → P3: A1 before launch; E/D4 during the §25 Tier D QA pass. The review's forward-looking dashboard advice (keep the root layout and `(site)` static; never add auth/DB to the root layout; scope the auth matcher) was **satisfied by design** (§24.4: dashboard isolated in a real folder behind `src/proxy.ts`).

---

## 27. Design Decisions & Rationale (decisions, not accidents)

> Absorbed 2026-09-07 from the deleted `AGENT_CONTEXT.md` (§14–§15). Made with the owner across V2 and the dashboard builds. Treat as constraints unless the owner overrides — and record any override in this file.

| Decision | Rationale | If you want to change it |
|---|---|---|
| **Custom motion system — no framer-motion / GSAP / Lenis** | Bundle discipline + one story for all animation: CSS tokens + rAF scroll hooks + IO reveals cover every shipped interaction; pinned scrub is smooth by construction (one progress value). §25 Tier B defers libraries until the hooks are outgrown — "never for fades" | Propose the concrete gap, get owner approval, add the dep in §3, keep CSS `sticky` pinning |
| **CSS `sticky` pinning for scroll stories** (no GSAP pin / no scroll-jacking) | Zero-JS layout primitive; resilient to fonts/images loading; the §18 rule 1 exists because this was hard-won (blank-zone bug history, §19) | Revisit only if choreography genuinely outgrows sticky; never via `overflow-hidden` workarounds |
| **One WebGL canvas, hero only** | Perf: frameloop pauses off-screen, dpr clamped; marketing stays fast/static; two canvases = GPU competition (explicitly avoided at FinalCTA) | Programme-page 3D = §25 Tier B 11 (max one restrained artifact, reuse primitives) — owner-gated |
| **Content = typed TS data files, no CMS** | Adding a programme/article is a data edit with zero component changes; types are the schema; CMS deferred until non-technical editors exist | CMS later (§25 Tier C 14); keep the data-first shapes |
| **No invented statistics** | Trust law of the brand: proof qualitative, numbers = structural facts only; fake charts would be an authenticity failure | Real, verified data supplied by the owner first — never decorative series (applies to §28 B6 proposals too) |
| **Ecosystem info = flow-layout `aria-live` panel** (default Learn, swaps per node) | Keyboard/screen-reader-safe, touch-safe, no pointer-corridor class of bugs; deliberate a11y choice | A floating-popover redesign (§28 B1) must keep aria parity + corridor handling + reduced motion; owner-approved direction only |
| **Marketing fully static & auth-free** (only `/api/enquiry` dynamic) | Speed + blast-radius isolation: marketing never touches Clerk/Prisma; the dashboard is isolated so its bugs cannot take down enquiries | Keep the boundaries; new marketing routes stay static where possible |
| **Invite-only sign-ups; role = Clerk `publicMetadata` read server-side** | Controlled growth; roles can't be self-asserted; Clerk is the authority, DB mirrors lazily | Instance Restricted mode + role-less page = agreed fix for §22 blocker #6 — not yet implemented |
| **Enquiry: staged form, server re-validation, honeypot, per-IP rate limit** | Client never trusted; spam handled cheaply; JSONL is the offline ledger | Webhook delivery (CRM) = §25 Tier A; shared rate-limit store before multi-instance |
| **Art-directed dark mode (token flip, not inversion)** | Two designed themes from one token set; `.dark` overrides only what must change | New colors = add light + dark token pairs in globals + `colors.ts` (any §28 "dark cinematic" direction must respect this — §28 H8) |
| **Light-mode accents are accessible "strong" variants** | WCAG AA on white (e.g. achieve gold `#c58f1b`); dark mode brightens for contrast on indigo | Never "brighten for looks" the light-mode mains |
| **One container/type/spacing system** (`container-site`, `type-*` clamps, 4px scale, z-ladder) | One cadence; sections vary by composition, not arbitrary grids/values | Per-section one-offs degrade the "one site" feel the §28 briefs demand |
| **Reduced motion enforced globally at CSS level (+ hook early-reveals)** | Systemic guarantee, not per-component hope; verified with the OS toggle | New motion must degrade under the same rule |
| **Hand-rolled UI (no shadcn/radix)** | One visual language straight from the marketing tokens; data-heavy dashboard widgets deliberately simple | shadcn decision still open in §24.3 — a real gap (complex tables/calendars) would re-open it |
| **Docs discipline: this master + `PROJECT_STATE.md`** | A fresh session can reconstruct the system from docs alone; state deltas never churn the master | When the repo moves, update these two files rather than adding another doc |

### 27.1 Practical recipes (patterns the codebase already follows)

- **Add a programme:** 1) entry in `data/programmes.ts` (all fields incl. `faqs[]`) + pillar colour exists; 2) a `ProgrammeGraphic` branch per pillar; 3) nothing else — nav mega, footer and pages are data-driven. Programme-page 3D stays off by policy.
- **Add an insight:** data entry (slug unique) → auto SSG; no component change.
- **Add a homepage section:** new `landing/X.tsx` (client only if interactive) using `SectionHeading`/`Reveal`/tokens → insert into `page.tsx` with a numbering comment → renumber later comments.
- **Add a pillar accent:** extend `colors.ts` (`programmeColors`) + globals `--ec-p-*`/`-soft` (light+dark) + `pillarStyles.ts` maps + the `PillarId` union in `types/index.ts` — then re-verify every literal map compiles (Tailwind 4).
- **Dashboard CRUD:** schema migration → `lib/validators/` schema → `lib/domain/` fn (ownership + transactions + DomainError) → `lib/actions/` Server Action (`requireRole`) → UI (form/table) → `revalidatePath` both role layouts → seed extension if demo data wanted.
- **Anything visual:** tokens/classes over inline values; motion via §11 layers; content via data files; verify contrast in light AND dark (accents flip).

---

## 28. Next Project — Marketing Site UI-UX Upgrade (spec; NOT started)

> **Status:** Requirements only. Three owner-supplied docs (`UI-UX UPGRADE.md` v1.0 — below-hero master plan; `landing_page_redesign_agent_prompt.md` — hero brief; `site_sections_ui_upgrade_agent_prompt.md` — below-hero brief) were consolidated here on 2026-09-07 and deleted. Live track status & pending owner decisions: [`PROJECT_STATE.md`](PROJECT_STATE.md) §3. Nothing in this section is implemented.

### 28.1 Provenance & how to read this spec

All three source docs were written **from screenshots of the live site without repo access**. Their section names, stack assumptions (e.g. "Framer Motion already a dependency", `--pillar-*` tokens), and several diagnoses are wrong. This section re-grounds every requirement in the real codebase (§5, §8, §11, §12 — names verified). Where a brief's *diagnosis* is wrong, its *intent* is kept but the implementation note says what not to change. Where a proposal duplicates something that already exists or is already a deliberate decision (§27), it says so and defers to the owner. **Do not re-derive "problems" from the old screenshots — §8's architecture table is the authority on what each section currently does.** The source briefs' own precedence rule ("the source brief wins on conflict") is superseded by this section.

### 28.2 Verified-reality correction table (brief claim → actual state)

| Screenshot-doc claim | Actual state (verified) |
|---|---|
| "Framer Motion already a dependency" / "one `useInView` fade idiom" | No animation libraries at all — custom hooks + CSS (§3, §11). `Reveal` is a deliberate base layer under per-section scroll choreography. |
| Section names ("Five Pillars / Learn–01/05 / Why Educraft / Inside a Programme / Outcomes & Evidence / Who Are You? / How It Works") | Those are eyebrow copy. Real files: `Ecosystem` / `ProgrammeExplorer` / `WhyDifferent` / `ProgrammeDeepDive` / `Impact` / `AudienceEntryPoints` / `Methodology` (§8). Plans must use real names + files. |
| "Static side card that never changes" (Ecosystem) | The panel is `aria-live` and reactively swaps content (default Learn) — *flow layout* (reserves space), not static. |
| "Learn–01/05 duplicates pillar content — delete" | `ProgrammeExplorer` is a flagship pinned story with its own payload, single-sourced from `programmes.ts`. Removal is a **product decision**, not cleanup (§28 B2). |
| "Same content authored three times" | Single sourcing already exists; sections render the same data differently. |
| "Stat digits with no labels (5·1·4·6)" | `Stat` renders value + label + sub for every digit (§5.1). |
| "Journey = six separately-triggered steps" | One continuous `useScrollProgress` value already drives path + milestones + narrative. |
| "How It Works duplicates the same steps in two components" | One component, one array, two idioms (path + card row) — deliberate today (§28 B8). |
| "Shared site-wide progress-dot rail exists" | Rails are internal to `ProgrammeExplorer` only — there is no site-wide dot rail to re-index. |
| "Backgrounds need consolidation (`AmbientBackdrop`)" | Already consolidated in `DecorativeSystems.tsx` (5 systems, §6.2). |
| Proposed hex palette (`#2DD4BF…`) and `--pillar-*` vars | Real accents are WCAG-conscious strong variants (`--ec-p-*`, §6.1) via `pillarStyles.ts`. |
| Proposed data/token files (`lib/motion-tokens.ts`, `lib/pillars.ts`, `journey-stages.ts`…) | Already exist under real names (`design/motion.ts`, `data/pillars.ts`, `data/programmes.ts` — the latter carries `faqs[]` and `journey[6]`) — don't duplicate. |
| "Learn–01/05" + "Inside a Programme" full-bleed "slides" with "right vertical dot rail" | Both are desktop **pinned scroll stories** (550vh / 552vh) with keyed crossfade panels + mobile horizontal-snap variants. |

### 28.3 Scope boundaries & hard constraints (from the briefs, kept)

- **Two workstreams:** *hero* (`landing_page_redesign_agent_prompt.md` scope — hero, nav, logo/slogan, dropdown) and *below-hero* (everything under the hero; the hero brief's items are off-limits to it). No workstream touches the other's scope; **Testimonials** is never restyled beyond spacing/rhythm.
- Removals must clear their route/anchor/nav references; no dead links; every changed file must map to a numbered requirement; no unrelated files reformatted.
- **Ground rules that override brief text:** (1) no new dependency without owner approval + a concrete gap (§28.6, §27 table); (2) motion stays on the custom system unless outgrown — never "for fades"; (3) pinning stays CSS `sticky`; (4) reduced-motion stays systemic; (5) no invented statistics (applies to B6); (6) §18 rules apply (literal Tailwind classes, sticky/overflow law, mounted-gating).

### 28.4 Requirement register

**Hero workstream** — real targets: `landing/Hero.tsx`, `three/scenes/EcosystemScene.tsx` + primitives (§10), `layout/Navbar.tsx`, brand lockup (§12), `data/navigation.ts`.

- **H1 — Hero composition: three-zone with the animation truly centered** (brief: left content / central animation / right content; responsive grid, no brittle absolute positioning; collapses cleanly at tablet/mobile). CURRENT: split composition — copy left, scene right at 58% ≥lg, content-over-scene mobile with the SVG `Constellation` fallback. Implementation note: `Hero` + scene layout are grid-driven today; a centered 3-zone is a layout retune of the existing hero, not a rebuild.
- **H2 — Replace the toy/space visual language with semantic programme objects.** CURRENT: `EcosystemScene` = core icosahedron + 3 orbit rings + 5 pillar nodes (emissive spheres + halo) + connectors + artifacts + particles; programme-specific imagery on marketing is pillar-accented **SVG** (`ProgrammeGraphic`). Requirement: each major node should read as one of the five real programmes with readable names where practical — reuse `three/` primitives, single canvas only, never a per-page canvas; programme identity comes from `data/programmes.ts` (never invented subject names). A design-direction change to the scene — owner-gated look & feel.
- **H3 — Lighting/material quality.** CURRENT: deliberately emissive + glow sprites, no per-node lights, `AdaptiveDpr` `[1,1.5]`, frameloop pause off-screen (§10, §27). Requirement: key/fill/rim feel, depth separation, restrained bloom, matte/glass/resin variety — achievable within the stack (env lighting, texture-based) but must keep the perf guarantees; measure before/after (§16 targets, §25 T17).
- **H4 — Mouse-light effect** (pointer acts as a soft localized light over dark text areas; eased lag; disabled for reduced-motion/touch). NEW feature. Implementation note: do with CSS vars + rAF on the custom system — no dependency needed; never per-frame DOM churn.
- **H5 — Brand slogan under the logo:** exact text **"Empowering Schools, Empowering Students"**, styled as a brand signature (letter-spacing, opacity — not body text). Placement decision needed (desktop nav logo block + hero? mobile?) and theme handling (logo has light/dark PNG variants). NOTE: footer's closing line ("Build learning journeys that last.") is separate and unchanged.
- **H6 — Navigation order: About first.** CURRENT order: Programmes (mega), Methodology, Impact, About, Insights (§12). Change = reorder `data/navigation.ts` for desktop AND mobile; keep the mega menu.
- **H7 — Program dropdown "jump" bug.** The brief describes the menu as unusable (page jumps when entering it). CURRENT (verified 2026-09-06, §12): hover + click open, Escape/outside-click/route-change close with focus return, `aria-expanded`/`aria-controls`, route-aware active states — **no corridor bug in the current build**. Action: verify live first; if a jump reproduces, fix the root cause per the brief's checklist (anchor `href="#"`, focus-restore, containing-block/overflow, pointer gaps, scroll-lock, remount-on-hover) — never timeouts alone; keep the a11y contract.
- **H8 — Visual direction: "dark, cinematic, premium" landing.** CONFLICT with the art-directed **light-default** theme (§6, §27: two designed themes, token flip). Product decision required: dark-only hero environment vs theme-aware-leaning-dark hero vs dark-first site-wide — and how it composes with light-mode marketing below the fold. Flagged in §28.7 D1.

**Below-hero workstream** — real targets from §8: `Ecosystem`, `ProgrammeExplorer`, `WhyDifferent`, `StudentJourney`, `ProgrammeDeepDive`, `Impact`, `AudienceEntryPoints`, `Methodology`, `Testimonials` (all `landing/*.tsx`).

- **B1 — Ecosystem interactive diagram.** Brief: radial layout computed from array length; floating popover anchored to the active node replaces the static side panel; popover morphs node→node, closes when nothing is active; touch tap-pin; CTAs ("Explore X" / "Enquire") in the popover; pointer-safe hover corridor; reduced-motion = cross-fade only. CURRENT: hardcoded 5-node `POSITIONS` around a core; `aria-live` flow panel (a11y-approved, §27); whole-node links to programme pages; mobile stacked cards. Notes: (a) any popover must keep or exceed aria parity, add corridor handling + reduced-motion; (b) "6th pillar = zero code change" is heavier than the brief assumed (PillarId union + literal maps in ~6 files — §27.1 recipe); (c) compute-radial is a genuine simplification only if 6+ verticals are planned — otherwise a visual choice. Owner-gated feature (D2-ish), highest-value item in the brief.
- **B2 — Remove `ProgrammeExplorer` ("Learn — 01/05").** CURRENT: flagship 550vh pinned story, single-sourced. **Product decision, not cleanup** (the section is one of the homepage's two signature interactions). If kept — no change. If removed: delete component + `page.tsx` entry + any anchors; content is single-sourced so nothing is lost; mobile horizontal-snap variant goes with it.
- **B3 — `WhyDifferent` polish** (editorial 01–05 list stays): thin left-accent rule per row (neutral — NOT pillar colors), hover dims sibling rows to ~60%, staggered `Reveal` entrance per row. Fits the existing system; low risk.
- **B4 — `StudentJourney` 3-zone.** Brief: left time meter + center winding path + right confidence meter, all on ONE scroll-progress value; floating stage label anchored to the active node; mobile collapses to a still-progressive column. CURRENT: 2-col (left keyed narrative + right path), one `useScrollProgress` `'full'` value already drives path/milestones/narrative; 552vh pinned; mobile vertical timeline. Adding the two meters + anchor-linked stage label is a real extension of the existing single-value architecture (adds visual readouts — no desync possible); must obey §18 rule 1 (no `overflow-hidden`) and keep the mobile timeline. Floating-label primitive does not exist yet — see §28.6.
- **B5 — Remove `ProgrammeDeepDive` ("Inside a Programme").** CURRENT: tabbed spotlight — curriculum modules, 5-step method, outcomes, proof line, CTAs — the homepage's in-depth layer; its curriculum content ALSO exists on the per-programme pages (§9). Content-loss flag is answered (content is not unique) — but removal removes the homepage depth story. **Product decision** (D2).
- **B6 — `Impact` ("Outcomes & Evidence") treatment.** Brief: four distinct icons + per-card mini-visualizations + asymmetric featured layout + labeled digits. CURRENT: four numbered cards **do share one `TrendingUp` icon** (real defect); `Stat` already always labels digits (brief's "bare digits" claim is wrong); all proof is qualitative by brand law. Actionable: distinct lucide icons per outcome + asymmetric/featured layout — without inventing data. Charts/sparklines need REAL verified metrics (owner decision D4; tied to §22 blocker 2 + §25 Tier A 2) — banned until then.
- **B7 — `AudienceEntryPoints` ("Who Are You") compactness.** CURRENT: three full-height door cards linking to **real audience pages** (`/for-schools|parents|students` via `AudiencePage`). The brief proposed tabs, unaware pages exist — collapsing three navigational doors into tabs changes IA. Options: compact-but-keep-doors (reduce card mass, keep per-audience accents — indigo/teal/gold exist) or true tabs (only if the audience pages are retired — owner decision D3).
- **B8 — `Methodology` ("How It Works") dedupe.** CURRENT: one component, one array, two idioms — calibrated scroll path-draw (5 nodes, `'visible'` mode, 1.1× tuning, §8 row 09) + the 5-card row below (deliberate today). Brief: merge into one scroll-linked component with the step description inline at the active node. Legitimate simplification — but the card row also serves non-scroll users and mobile; the path calibration (hard-won, §19) must not regress. **Product/design decision** (D5) then implementation reuses B4's pattern.
- **B9 — `Testimonials` / everything else:** spacing/rhythm harmonization only (§28.3). Note §22 blocker 1 (SEED content) still applies — unrelated to this project.

### 28.5 Build sequence (dependency-ordered; effort from the briefs, compressed)

S0 — **Audit/re-ground** (0.5–1 d): map every requirement above onto live code; confirm §28.2 corrections still hold; visual QA stays owner-side (§20). S1 — **Owner decisions** (§28.7) gate everything. S2 — **Shared primitives** where a real gap exists after decisions: mouse-light (H4); floating-info behavior + meters (B1/B4) — decide custom vs gated library (§28.6). S3 — **Hero workstream** H1–H7 (1–2 wk incl. scene direction). S4 — **Below-hero low-risk polish**: B3, B9 (0.5 d). S5 — **Below-hero feature work**: B1, B4, B6, B8 (+ removals B2/B5/B7 only if decided) (1–1.5 wk). S6 — **Responsive + reduced-motion + perf pass** (Lighthouse before/after; CLS/LCP targets §16). S7 — **Acceptance audit** vs §28.8 + completion report in the §20 reporting format. Total ≈ 2–4 focused weeks across both workstreams; marketing stays static + the verification loop (§20) stays green at every stage.

### 28.6 Dependency adoption gates

All of the following are ABSENT today (verified 2026-09-07) and were proposed by the briefs; each needs owner approval + a demonstrated gap against the custom system (§27), and none may change pinning to a JS pin:

| Candidate | Brief wanted it for | Current-stack equivalent | Gate note |
|---|---|---|---|
| GSAP + ScrollTrigger | pinned scrub (§2.3, "How It Works") | `useScrollProgress` + CSS `sticky` already ships both pinned stories | Outgrown only if new choreography proves it; never for fades. (License fact: GSAP incl. all plugins became 100% free for commercial use in April 2025 — cost is no longer an argument for or against) |
| Framer Motion | `AnimatePresence`/`layoutId` popover morph | keyed-remount crossfades (`tw-animate-css`, §18 rule 6); Reveal | Morph-between-anchors is the one candidate real gap (B1/B4) |
| Lenis | inertia smooth-scroll | native scroll today | Evaluate native first (§25 Tier B 10) |
| Floating UI | popover flip/shift positioning | no popover exists yet | Only if B1/B4 popovers are approved and hand-rolled positioning proves weak |
| Radix `Tabs` | audience tabs (B7) | `ProgrammeDeepDive` tab pattern is hand-rolled + accessible today | Only if B7 tabs are approved |
| react-countup | stat count-up (B6) | none | Cosmetic; skip unless requested; numbers stay real |

### 28.7 Product decisions awaiting the owner (mirrored in `PROJECT_STATE.md` §3)

D1 **Hero direction** (H8): how "dark, cinematic" composes with the light-default art-directed theme. *Recommendation:* theme-aware hero leaning dark + premium materials — the site keeps its two designed themes.
D2 **Section removals** (B2 `ProgrammeExplorer`, B5 `ProgrammeDeepDive`): *Recommendation:* keep both (they are the homepage's flagship interactions and single-sourced), pursue B1/B4 upgrades instead.
D3 **Audience doors vs tabs** (B7): *Recommendation:* keep the three real pages; compact the cards.
D4 **Impact metrics** (B6): charts only with real, verified data — until then distinct icons + asymmetric layout only. *Recommendation:* no invented numbers, ever.
D5 **How-It-Works merge** (B8): *Recommendation:* merge the card row into the scroll-linked description only if mobile + reduced-motion + keyboard access stay first-class; else keep both idioms.
D6 **Slogan placement** (H5): where "Empowering Schools, Empowering Students" renders (nav logo area and/or hero) and its dark/light behavior.
D7 **Dependency adoptions** per §28.6 — default is *no new dependencies*.

### 28.8 Consolidated acceptance criteria (briefs' checklists, deduped)

- Hero: 3-zone centered composition at desktop, deliberate stacked mobile order (message → animation → support → CTA); no brittle absolute positioning.
- Exact slogan text appears beneath the logo with intentional brand typography.
- Nav: About first (desktop + mobile); dropdown stable across viewport widths — moving the pointer from trigger into the menu causes **no scroll-position change**; keyboard/Escape behavior intact.
- Scene: no empty-planet/toy visual language as the dominant metaphor; objects carry programme meaning from real data; lighting has key/fill/rim + depth; colors restrained (teal/indigo/warm-accent discipline); camera slow (~8–15 s major rotations); reduced-motion static fallback.
- Mouse-light: subtle, smooth (eased lag), limited radius, text readability preserved, disabled for reduced-motion + no-pointer devices.
- Ecosystem: popover anchored to node (no fixed side panel), morphs between nodes, none visible when nothing is active, touch tap-pin + dismiss, CTAs reachable, aria parity ≥ current `aria-live` panel, corridor-safe, reduced-motion cross-fade.
- Journey: one shared progress value drives meters + path + label (verified in code); mobile still progressive.
- Impact: four distinct icons, no bare digits (labels always), asymmetric layout, no invented data.
- Who Are You / How It Works: per D3/D5 decisions with all original copy reachable and description in exactly one DOM location.
- Global: no two adjacent sections in scope share one template; one easing/timing vocabulary; generic fade-up no longer the default for rebuilt sections; background continuity through the page; no horizontal overflow at any breakpoint; reduced-motion verified with the OS toggle on; every changed file maps to a requirement; build/type-check/lint green. Owner visual QA + acceptance sign-off closes the project.

### 28.9 Resources (condensed from the briefs' directories)

Inspiration/moodboards: Awwwards (Culture & Education), SiteInspire (minimal/typography), Lapa Ninja, Godly (cinematic-scroll restraint), Mobbin (tab/segmented patterns) — pull 3–5 comparables per stage into the ticket before building. Assets (all CC0/MIT/OFL-commercial-safe, verify per item): Poly Pizza, Quaternius, Kenney, Poly Haven (HDRIs) — only if H2/H3 need external geometry/textures; lucide-react covers icon needs (distinct per-pillar/per-metric icons — §28 B6). License gate: free-tier exports with watermarks (Spline) are not acceptable for a client deliverable.
