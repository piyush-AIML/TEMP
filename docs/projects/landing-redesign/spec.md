The approved design spec for the "One Line" landing redesign — the homepage plus the four routes it hands off to; authoritative on design detail, with the build order in [`stages/stage-1.md`](stages/stage-1.md).

# Educraft — Landing Redesign Plan

**Status:** design approved in principle, ready for implementation planning
**Date:** 2026-09-12
**Scope:** the `(site)` homepage **plus** the four routes it hands off to — `/programmes`, `/programmes/[slug]`, `/methodology`, `/impact`
**Supersedes:** the landing-page sections of `EDUCRAFT_PRODUCTION.md` §13/§14 (Ecosystem, ProgrammeExplorer) and §25 Tier B (motion enhancements). `EDUCRAFT_PRODUCTION.md` remains the master doc and must be updated as this ships.

> This document is the design/spec. The step-by-step build order is a separate artefact produced by the writing-plans pass.

---

## 0. Decisions locked

| # | Decision | Chosen |
|---|---|---|
| 1 | Animation engine | **GSAP + Motion** (both; `@gsap/react` binding). Explicitly overrides TECH-STACK's "no GSAP" rule. |
| 2 | Compaction | **Radical — 5 acts**, 12 sections → 5 |
| 3 | Scope | Landing **+ handoff routes**; no route is deleted |
| 4 | Concept | **"One Line"** — retire the orbit, unify on the drawn-path language |
| 5 | NEET & JEE hue | **Rose `#C2185B`**, off brand indigo |
| 6 | Palette reach | **Full token migration** |
| 7 | Libraries | shadcn/ui + any 3D lib permitted; "no new library" rule lifted |

---

## 1. Diagnosis — measured, not asserted

### 1.1 The handoff is a vocabulary switch, not a timing bug

The first three sections say the same thing in three different visual languages:

| Section | What it renders |
|---|---|
| `Hero.tsx` | A WebGL scene of five orbiting nodes with connectors (`three/scenes/EcosystemScene.tsx`) |
| `Ecosystem.tsx` | "Five pillars. One connected system." + a **second** orbital node map (`graphics/EcosystemGraphic.tsx`) |
| `ProgrammeExplorer.tsx` | "One journey, five paths" — the same five again, pinned over **550vh** |

The hero's system floats in a `pointer-events-none` panel occupying the right 58% of the viewport and fades out on scroll. It does not connect to the section beneath it, and the section beneath it replaces it with a different-looking orbital map. **Nothing is broken mechanically — there is simply nothing joining them.**

Reinforcing evidence: the rest of the site already speaks one language — *the drawn path*. `StudentJourney` draws an SVG path through six stages; `Methodology` draws one through five steps; `ProgrammeGraphic` and `EcosystemGraphic` draw paths and nodes; `DecorativeSystems` ships `PathLines`. The hero is the sole exception.

### 1.2 Length and repetition

| Measure | Today |
|---|---|
| Sections on the homepage | 12 |
| Approximate desktop height | ~20+ screens |
| Longest pinned regions | `ProgrammeExplorer` 550vh, `StudentJourney` 552vh — **~11 screens between them** |
| `card-surface` boxes | **24**, plus ~9 nested boxes |
| Of those, in four consecutive sections | **18** (`ProgrammeDeepDive` → `Impact` → `AudienceEntryPoints` → `Methodology`) |
| Sections with zero cards | 3 of 12 |

Measured copy duplication:

| Duplicated content | Occurrences |
|---|---|
| "Portfolios, dashboards, and checkpoint(s)" | **4** |
| The five-specialist roster (one word swapped) | 2 |
| "move between paths without starting over" | 2 (verbatim) |
| The `Five X. One Y.` headline template | **5** |
| The four-value stat block | 2 (landing **and** `/impact`) |
| `methodologySteps` five titles | 2 (site-level **and** repeated per programme) |

### 1.3 A live content defect

`Impact.tsx:53-56` asserts `4 Audiences served — Schools · Parents · Students · Partners`, while `AudienceEntryPoints.tsx` says "Three doors" and renders 3, and `navigation.ts` defines exactly 3 `audienceEntries`. **`Partners` has no entry point.** The redesign resolves this to 3.

### 1.4 Accessibility failures (measured)

Contrast ratios against the canvases each token actually sits on:

| Token | Value | On white | Verdict |
|---|---|---|---|
| `--ec-teal` (`text-ec-teal` eyebrows) | `#00b3b8` | **2.58:1** | FAIL — the brand colour itself |
| `--ec-teal-dark` | `#00898d` | **4.23:1** | fails body text |
| `achieve` — AI & Digital | `#c58f1b` | **2.87:1** | FAIL |
| `learn` — Linguistics | `#00898d` | **4.23:1** | fails |
| `include` — Inclusive Ed | `#3b7dd8` | **4.11:1** | fails |
| `thrive` / `excel` | — | 5.39 / 12.67 | pass |
| `--ec-p-achieve-soft` on `--ec-canvas-deep` (dark) | `#2b2312` | **1.06:1** | invisible |
| `--ec-p-thrive-soft` on `--ec-canvas-deep` (dark) | `#1d1934` | **1.00:1** | invisible |
| `--ec-indigo` used for dark text | `#1e2a78` | **1.51:1** | invisible |

Dark mode is otherwise clean (every pillar accent ≥4.91:1). **Every failure is light-mode text or dark-mode wash.** `EDUCRAFT_PRODUCTION.md` §15 already flags this as an open audit item; these are the numbers.

### 1.5 The WebGL tree is hero-only

`src/components/educraft/three/**` (13 files) is reachable **only** from `landing/Hero.tsx`. Every `three` / `@react-three/fiber` / `@react-three/drei` import in the codebase is inside that directory. Nothing else — not programme pages, not the shell — touches it.

Consequence: retiring the orbit scene retires the whole WebGL dependency tree, **and with it the React `~19.2.8` pin**, which exists solely because `@react-three/fiber` 9.7.0 declares `peer react: ">=19 <19.3"` (TECH-STACK.md).

---

## 2. The concept — "One Line"

**Thesis:** the site already speaks the drawn-path language. Promote the path from a repeated motif to the page's connective tissue, and make the hero its *origin* rather than a container holding a decorative scene.

- The hero is not a section that holds a visual; it is the first frame of a continuous sequence.
- The line that enters the hero **is** the line that forks into the five pillars, **is** the line that carries the learner's journey, **is** the line that converges into the CTA.
- Identity lives in **nodes and typography**, not in a five-colour gradient on the strand. The strand stays one brand colour. See §6.4.

---

## 3. Architecture

### 3.1 The Line system

Not one giant `<svg>` across ~11.5 screens — that cannot survive pinning, background changes and reflow. Instead **one `LineStage` per act, bound by an entry/exit anchor contract**: each act's path begins exactly where the previous act's path ended, so the eye reads one continuous line while the DOM stays as small, independently understandable pieces.

```
Act 0 exit anchor  ==  Act 1 entry anchor
Act 1 exit anchor  ==  Act 2 entry anchor   …
```

| File | Responsibility | Depends on |
|---|---|---|
| `line/ anchors.ts` | The entry/exit contract **as functions of `N`** (§7.3), plus station positions | nothing |
| `line/ pathBuilders.ts` | Pure `(fromAnchor, toAnchor, shape) → path 'd'`. Testable without a DOM. | `anchors.ts` |
| `line/ LineStage.tsx` | Renders one act's `<svg>`; wires GSAP draw/pin; exposes `data-line-node` hooks | both, `lib/gsap.ts` |
| `line/ station.ts` | Pure calibration math: `stationPositions(N)`, `perStationVh(N)`, `drawAt(progress, i, N)` | `anchors.ts` |

**Technique:** every path carries `pathLength="1"`. Draw is then always `stroke-dasharray: 1` with `stroke-dashoffset: 1 → 0` — identical for every path regardless of real length. No `getTotalLength()`, no layout reads in the animation loop, one animated property per act.

**The fork is five separate draws from a shared origin — not a path morph.** One line arrives at a point; five lines grow out of it. This avoids any `d`-attribute tweening and therefore any dependency on MorphSVG, and it degrades cleanly to five pre-drawn lines under reduced motion.

### 3.2 The engine split — a rule, not a preference

GSAP and Motion will fight if both are allowed to touch the same property of the same element.

| Engine | Owns | Why |
|---|---|---|
| **GSAP + ScrollTrigger** | Anything **scrubbed or pinned** — line draw, act handoffs, the horizontal walk, pin release | Writes styles directly to the DOM; no React re-render per frame |
| **Motion** | Anything **discrete or state-driven** — headline line-masks, station enter/exit, panel crossfade (`AnimatePresence`), hover/tap | Declarative; trivial where GSAP is tedious |

**Rule: never both on the same property of the same element.** If an element appears to need both, it is two nested elements.

This split is also the fix for the current jank: `useScrollProgress` calls `setProgress` on every rAF tick, re-rendering the entire Hero subtree each frame.

**Registration lives in exactly one module:** `src/lib/gsap.ts` — client-only, idempotent (`registerPlugin` guarded), using `useGSAP` from `@gsap/react` for correct context revert/cleanup.

### 3.3 RSC boundary

The acts are client components (they animate). Each act is a `'use client'` shell that receives **server-rendered content as `children`/props**, so static copy stays server-rendered and only animated wrappers ship as client JS. Same RSC-node pattern already used in `dashboard/professor/courses/[courseId]/page.tsx`.

### 3.4 Target file layout

```
src/lib/gsap.ts                      NEW  single client-only registration, eases, plugin guards
src/components/educraft/line/        NEW  anchors.ts · pathBuilders.ts · station.ts · LineStage.tsx
src/components/educraft/acts/        NEW  Origin.tsx · FivePillars.tsx · Way.tsx · Proof.tsx · Doors.tsx
src/components/educraft/motion/      EXT  Stagger.tsx · MaskLine.tsx (Motion-based)
src/components/ui/                   NEW  shadcn primitives (unstyled behaviour)
src/design/scroll.ts                 NEW  pin lengths, dwell formula, breakpoint branches
src/lib/calibrate.ts                 NEW  dev-only ?calibrate=1 overlay
src/components/educraft/landing/*    RETIRED (§9)
```

---

## 4. The five acts

| | Today | Redesign |
|---|---|---|
| Sections | 12 | **5 acts** |
| Desktop height | ~20+ screens | **~11.5 screens** |
| `card-surface` on landing | 24 (+9 nested) | **0** |
| Pinned regions | 3 (Hero, 550vh, 552vh) | 2 (fork 70vh, walk 400vh) |

Heights below are desktop; tablet and mobile differ per §8.

### Act 0 — Origin (~170vh)

Copy stays **verbatim** — it is good; the staging was the problem. Eyebrow `Global Digital Education Platform`, H1 `Five paths. One learning ecosystem.`, the supporting paragraph, two CTAs, the trust line.

```
   ┌──────────────────────────────────────────────┐
   │                                   ╭─ strand enters
   │  GLOBAL DIGITAL EDUCATION          │
   │  ──────────────────                │
   │  Five paths.                       │  ← strand draws AS the headline's
   │  One learning ecosystem.           │    last line lands
   │                                    │
   │  From language and inclusion…      │
   │                                    │
   │  [Talk to us]  [Explore programmes]│
   │                                    │
   │  Five verticals · One trust umbrella
   │        ┌───────┬───────┬───────┬───┴───┬───────┐  ← five seed nodes
   │        ●       ●       ●       ●       ●       │    at the fold
   └──── SCROLL ────────────────────────────────────┘
        ↓ pinned 70vh: copy lifts + fades, ONE strand forks into FIVE
```

- No right-hand box. The strand enters top-right and descends, curving left.
- The H1's three lines use a Motion mask-reveal (translate inside `overflow-hidden`), staggered 80ms.
- A GSAP timeline draws the strand as the headline's final line lands, so the line visually continues the type.
- **Fork region (pinned 70vh):** hero content pins, copy lifts `y:-40` and fades to 0.25; the single strand forks into N strands (five separate draws from a shared origin). The strand ends are the seed nodes at the fold.
- **Copy fix:** `Explore Programmes` currently opens the *modal* while `View all programmes` *navigates* — the same words doing two jobs. Primary becomes **`Talk to us`** (modal), secondary **`Explore programmes`** (→ `/programmes`).

### Act 1 — Five Pillars (~510vh — the largest act, and it is the product)

**Desktop: pin + horizontal scrub.** A track of N stations, `x` tweened `0 → -(100 × (N−1))vw`, `scrub: 1`, `end` derived from `perStationVh(N)`. The strand runs horizontally through the track; each station's segment draws as it arrives.

Each station has **no container**:

- the pillar node sits **on** the strand, filled with the pillar's `graphic` tier
- pillar label in `eyebrow` style, at the pillar's `text` tier
- the programme name at `type-display-m` — the largest thing on screen
- tagline, then **2** highlights as an open list separated by `border-b` hairlines
- **one** link (`Read the full programme`). The current link + `Enquire` pair is dropped — `Enquire` was duplicated across three sections.
- the pillar's `soft` tier as a **full-bleed vertical band** behind the active station — a band, not a box

The progress rail is **N real `<button>`s** that scroll to their station (`sr-only` label + visual dot). Not decorative dots.

**Then the journey ribbon (~110vh).** The N strands **converge back into one**, and the six stages — Curious → Supported → Practising → Confident → Capable → Ready — become six nodes *on that single continuing strand*, drawn left-to-right on scroll. Data: `studentJourneyStages` from `data/pillars.ts`.

This is the vertical/horizontal marriage: **horizontal to survey the paths, then one strand continues into the learner's journey.** It replaces `StudentJourney`'s 552vh pinned SVG with a 110vh ribbon.

### Act 2 — The Educraft Way (~190vh)

`WhyDifferent` + `Methodology` become **one argument**: the differentiators are the *why*, the five method steps are the *how*.

- **Kept nearly intact:** `WhyDifferent`'s ruled rows (`border-b` only, zero cards — one of the three card-free sections, and the strongest layout on the page). Its `01`–`05` numerals become nodes on a vertical strand.
- **Replaced:** `Methodology`'s 5 cards + separate SVG path draw → the five steps become five nodes on **that same continuing strand**, drawn top-to-bottom, description beside each.
- **De-duplicated:** "Portfolios, dashboards, and checkpoints" ×4 → one statement. The five-specialist roster (stated twice, one word swapped) → once. The five `proofPillars` (People/Process/Evidence/Partnerships/Outcomes) overlap the differentiators almost entirely → **cut**, with Evidence and Partnerships folded into Act 3.

### Act 3 — Proof (~150vh)

The strand becomes a **horizontal axis with tick marks** — an evidence scale.

- **Impact chain** (Confidence → Engagement → Skill → Readiness): four stations on the axis, replacing four cards.
- **The stat row** is already unboxed (`border-y border-ec-border py-10`) and already good — keep it, but **fix the defect** of §1.3: `4 Audiences served — Schools · Parents · Students · Partners` becomes `3 · Schools · Parents · Students`.
- **Testimonials:** the primary quote becomes a **large pull-quote in open space**; the two supporting quotes become marginalia under hairline rules — replacing three cards.
- **Carried caveat:** these remain **SEED testimonials** (`data/testimonials.ts` carries an explicit in-file warning; `EDUCRAFT_PRODUCTION.md` §22 lists them as a launch blocker). A design that leans harder on them as proof makes replacing them *more* urgent, not less.

### Act 4 — Doors + Close (~130vh)

The strand **converges to a single point**, and that point is the CTA.

- **Three doors** are three columns separated by **vertical hairline rules**, not three cards. Each uses `a.headline` and `a.ctaLabel` from `data/navigation.ts` — fields the current component imports but never renders. Benefits trimmed 4 → 2.
- **`FinalCTA`** keeps its dark full-bleed band (the only card-free closer, and it works, and it is the only section using `py-24 md:py-36`). The strand terminates inside it as a single node that becomes the button.

---

## 5. What is retired, and where the content goes

**No route is deleted.** Routes are preserved and receive the elevated treatment in the handoff pass.

| Component | Fate | Content destination |
|---|---|---|
| `landing/Hero.tsx` | Rebuilt as `acts/Origin.tsx` | — |
| `landing/Ecosystem.tsx` | **Retired** | Absorbed into Act 1 |
| `landing/ProgrammeExplorer.tsx` | **Retired** | Absorbed into Act 1 |
| `landing/StudentJourney.tsx` | **Retired as a section** | Six stages survive as Act 1's journey ribbon |
| `landing/WhyDifferent.tsx` | Merged into Act 2 | — |
| `landing/Methodology.tsx` | Merged into Act 2 | `/methodology` keeps the full treatment |
| `landing/Impact.tsx` | Rebuilt as Act 3 | `/impact` keeps the full treatment |
| `landing/Testimonials.tsx` | Rebuilt as Act 3 | — |
| `landing/AudienceEntryPoints.tsx` | Rebuilt as Act 4 | — |
| `landing/FinalCTA.tsx` | Kept, strand terminates in it | — |
| `landing/ProgrammeDeepDive.tsx` | **Off the landing page** | `/programmes/[slug]` already holds this richer |
| `landing/InsightsTeaser.tsx` | **Off the landing page** | `/insights` (SEO surface retained) |
| `graphics/EcosystemGraphic.tsx` | **Retired** (only consumer was `Ecosystem.tsx`) | — |
| `three/**` (13 files) + `useSceneActive` | **Retired** (reachable only from `Hero.tsx`) | — |
| `hooks/useScrollProgress`, `useParallax` | Retired once GSAP replaces them | — |

**Kept:** `graphics/ProgrammeGraphic` (4 consumers incl. `/programmes` and `ProgrammePage`), `graphics/DecorativeSystems` (`Constellation`/`GradientMesh`/`PathLines`/`TopographicLines` — site-wide furniture: Navbar, Footer, PageHero, programme pages, insights), and every dashboard component.

---

## 6. Palette v2 — calibrated

### 6.1 Pillar accents (three tiers each, measured)

"worst light" = minimum across **all four** light canvases (`#ffffff`, `--ec-canvas-soft`, `--ec-canvas-deep`, `--ec-sky`). "worst dark" = minimum across `#0b0f1e`, `#10152a`, `#141b38`.

| Pillar | text (light) | worst light | text (dark) | worst dark | graphic (light) | graphic (dark) |
|---|---|---|---|---|---|---|
| `learn` · Linguistics | `#0C7078` | **5.19:1** | `#4FD4DC` | **9.47:1** | `#12A0AC` (3.16) | `#2FBAC4` (8.12) |
| `include` · Inclusive Ed | `#2B5FD9` | **5.00:1** | `#8FB4F5` | **8.05:1** | `#4C82E8` (3.71) | `#6E9BEE` (6.89) |
| `thrive` · Wellbeing | `#6B3FC4` | **5.97:1** | `#B49BEE` | **7.13:1** | `#8B62D9` (4.33) | `#9E7FE4` (6.00) |
| `achieve` · AI & Digital | `#8A5A00` | **5.28:1** | `#F5C95E` | **10.77:1** | `#B8860B` (3.25) | `#E8B94A` (10.41) |
| `excel` · NEET & JEE | `#C2185B` | **5.23:1** | `#F285A8` | **6.99:1** | `#E0437C` (3.99) | `#EC6A99` (6.44) |

Every text tier clears **AA (4.5:1)** on every canvas in both themes. Every graphic tier clears the **3:1** non-text/UI threshold. `achieve` is the reason a three-tier model is necessary: gold at full brightness is unusable as text (`#F4B942` = 1.77:1), so text drops to a deep amber while bright gold survives for graphics only.

### 6.2 Brand chrome

| Token | Light | Dark | Note |
|---|---|---|---|
| indigo (primary) | `#1E2A78` (12.67) | `#3B4896` fill | today's `#1E2A78` on dark is **1.51:1** — invisible. **Corrected during implementation:** an earlier draft specified a `#8E9AE0` dark text partner, but no consumer needed it, and the test was left asserting AA for a hex `globals.css` never painted — the "passes the suite and renders nothing" class. The token was dropped rather than emitted for nothing; see §6.6. |
| teal (text) | `#0C7078` (5.83) | `#4FD4DC` (10.70) | fixes the `text-ec-teal` failure |
| teal (graphic) | `#12A0AC` (3.16) | `#2FBAC4` (8.12) | for strokes, nodes, the strand |
| slate | `#4A5468` (7.61) | `#9AA3C0` (7.60) | |
| gold (highlight) | `#8A5A00` (5.93) | `#F5C95E` (12.17) | |

**Teal splits into text and graphic tiers.** One vivid teal cannot serve both — `#00b3b8` is 2.58:1 as text but visually correct as a stroke. This split is what makes `text-ec-teal` usable at all.

### 6.3 Soft washes — the dark-mode fix

Measured against `--ec-canvas-deep` `#141b38`: `thrive` **1.00**, `excel` **1.02**, `include` **1.04** — three of five were indistinguishable from the canvas.

**An earlier draft of this section asked for every wash to land in a 1.15–1.25 band on *both* dark canvases. That is mathematically impossible**, and an implementer caught it. Because `#0b0f1e` is darker than `#141b38`, any given wash scores *strictly higher* against it — the ratio between the two scores is a constant **1.1292**. So a single hex cannot simultaneously satisfy `≤1.25` on the darker canvas (which needs luminance `L ≤ 0.0188`) and `≥1.15` on the lighter one (which needs `L ≥ 0.0215`).

**The correct, achievable requirement**, now enforced by test:

| Floor | Canvas | Why this value |
|---|---|---|
| **≥ 1.15** | `#0b0f1e` (darkest) | the band's meaningful lower bound — below this a wash reads as canvas |
| **≥ 1.02** | `#141b38` (lighter) | the derived equivalent: `1.15 ÷ 1.1292 ≈ 1.017`, rounded up |

There is deliberately **no upper bound**: on the lighter canvas a wash that clears 1.15 on the darker one necessarily scores higher than 1.25, and that is correct behaviour, not a defect — it is a tint against a lighter surface.

Two values had to be corrected to meet these floors. `thrive` `#1E1836` scored **1.0036** on the lighter canvas — as invisible as the wash it replaced — and `excel` `#331423` scored 1.0173; both were lifted along their own hue to **`#221B3C`** (1.1714 / 1.0373) and **`#391627`** (1.1968 / 1.0598). All five washes now clear both floors.

### 6.4 Two properties that make it a system

- **Equi-luminant.** The five text tiers' relative luminance spans only **0.030** — no pillar shouts louder than another.
- **Hue spread: 39° · 184° · 222° · 260° · 336°.** Well separated, *except* the cool cluster (cyan → blue → violet at ~40° apart).

### 6.5 Two honest caveats

**Equi-luminance has a cost.** Cyan `learn` and rose `excel` differ in hue but not in lightness, so they can converge for red-green colour-blind readers. **This is mitigated by a hard rule, not a hope: a pillar accent is never the only signal.** Every accent ships alongside its text label, and the strand never encodes meaning by colour alone.

**Where identity lives on the strand.** The strand stays **one brand colour** (`--ec-teal-graphic`); identity lives in each station's **node and label**. A five-hue gradient along the strand is the tempting choice and the wrong one — it reads as a chart legend, not a premium system, and is exactly the "decoration for its own sake" the design principles forbid.

### 6.6 Roles are explicit, and two of them are not what they look like

Three corrections the implementation forced, each worth carrying forward:

**Gold is a FILL family, not a text family.** `--ec-gold` is the primary CTA's background, paired with `text-ec-indigo-dark` (`Button.tsx`'s `primary` variant: `bg-ec-gold text-ec-indigo-dark hover:bg-ec-gold-dark`). Treating it as a text token and darkening it for AA dropped that pair from **8.83:1 to 2.64:1** (hover 5.45:1 → 1.86:1). It keeps its fill tier; **gold-as-text on a light surface is a separate, pre-existing problem** (`text-ec-gold` on white is 1.77:1) deferred to Stage 3, which redesigns Footer, FinalCTA and ProgrammePage.

**Teal splits into text and graphic tiers** — one vivid teal cannot serve both, since `#00b3b8` reads correctly as a stroke but measures 2.58:1 as text.

**The test must assert token-against-token pairs, not only tokens against canvases.** The original assertion set measured every token against its backgrounds, and so was structurally blind to a broken foreground/background pair — which is how 34 green assertions coexisted with a 2.64:1 button. The CTA pairing is now asserted directly, in both themes.

**And the mirror invariant is one-directional.** Every value in `colors.ts` must exist in `globals.css` (that file is the test source; the CSS is what paints). The reverse does **not** hold: `--ec-indigo-light`, `--ec-teal-dark` and `.dark --ec-indigo` are ramp steps kept deliberately with no `colors.ts` counterpart. A sweep script must expect those or it will report false positives.

---

## 7. Extensibility — introducing a new course, programme, or pillar

### 7.1 The three paths are fundamentally different

| | New **course** | New **programme** | New **pillar** |
|---|---|---|---|
| What it is | a DB row (`Course`) | TS data (`programmes.ts`, ~240 lines) | a whole vertical |
| Created by | admin, at runtime | developer | developer |
| Needs deploy | **no** | yes | yes |
| Touches the landing page | **never** | changes a station's detail page | **changes the walk itself** |

**Rule: a course never touches the landing page.** A `Course` is a dashboard concept — admin creates it, assigns professors, students enrol. The landing page is *pillar*-driven. This boundary already holds; it is stated here so it is not eroded.

**Known constraint (not solved here):** `Course.vertical` must be one of the pillar slugs. A school wanting a course outside the five verticals has no path today. Resolution is deferred — it needs a product decision (allow an "Other" vertical, or require a pillar), and it does not block this work.

### 7.2 Today a sixth pillar needs 8+ edits, most of them pure mirroring

`types/index.ts` union → `data/pillars.ts` → `data/programmes.ts` → `design/colors.ts` → `globals.css` (×3 blocks: `@theme inline`, `:root`, `.dark`) → `pillarStyles.ts` (**×6 parallel maps**) → `validators/courses.ts` → every count-hardcoded landing component. **Nothing fails loudly if one is missed** — the sync is enforced by a comment that says "keep in sync".

### 7.3 The fix — derive, so `tsc` enforces completeness

**Derive the union from the data.** The load-bearing change:

```ts
// data/pillars.ts — the one source
export const pillars = [ { id:'learn', slug:'linguistics', name:'Learn', vertical:'Linguistics', … }, … ] as const;
export type PillarId = (typeof pillars)[number]['id'];
```

Every `Record<PillarId, …>` now **fails to compile** until the new key is added. The comment becomes a type error.

**Collapse six maps into one registry.** `pillarStyles.ts` becomes a single `pillarAccent: Record<PillarId, { text, bg, softBg, border, accentVar, softVar, ring }>`, with thin re-exports (`pillarTextClass`, `pillarBgClass`, …) preserved so **no existing call site changes** — a low-risk migration rather than a 40-file refactor.

**Collapse the three names per pillar.** Today: `PillarId` `'learn'`, `Pillar.vertical` `'Linguistics'`, and the slug `'linguistics'` that the DB stores — and they already disagree (`'wellbeing-counseling'` US spelling vs `'Wellbeing & Counselling'` UK). One co-located record per pillar holds `id`/`slug`/`name`/`vertical`, and `COURSE_VERTICALS` **derives** from a tiny key-only module (preserving the validators' stated intent of not importing content prose).

**Make landing geometry a function of N.** `anchors.ts` and `station.ts` expose **functions of `pillars.length`**, positions interpolated between entry/exit anchors — not coordinate constants. And the walk scales its dwell so seven pillars does not produce a 630vh act:

```
perStationVh(N) = clamp(400 / N)  to the range [60, 80] vh
```

| N | per station | act total |
|---|---|---|
| 5 | 80vh | 400vh (as designed) |
| 6 | 67vh | 400vh |
| 7 | 60vh (clamped) | 420vh |
| 8 | 60vh (clamped) | 480vh |

The act stays ~4.5 screens regardless of pillar count.

**Reserve the next accents, pre-verified.** With the wheel at 39/184/222/260/336, the largest free gap is 39→184 (**145°**, midpoint ≈ **112°, green**) — that is slot 6. Slots 6 and 7 ship as **contrast-measured values exported from `colors.ts` but emitting no CSS** until a pillar uses them, so a future pillar never means inventing a hue under deadline. That is how palettes rot.

### 7.4 Runbook — adding a pillar

1. Add one object to `pillars` in `data/pillars.ts` (`id`, `slug`, `name`, `vertical`, `short`, `description`).
2. Add its accent object to `pillarAccent` in `lib/pillarStyles.ts`.
3. **Run `npx tsc --noEmit` and let the compiler enumerate the rest.** Every remaining gap is now a compile error, not a silent break. **Verified by dry-run 2026-09-12** — adding a sixth id produces exactly three errors, and the list below is what that run actually reported, not an estimate:

   | Error site | Why it fires |
   |---|---|
   | `lib/pillarStyles.ts` — `pillarAccent` | `Record<PillarId, PillarAccentClasses>` is a checked object literal; the new key is missing. **The back-compat re-exports below it need no edit** — they are `Object.fromEntries(...)` derivations of `pillarAccent`, so they inherit the new key automatically |
   | `components/educraft/graphics/EcosystemGraphic.tsx` — `POSITIONS` | a second `Record<PillarId, {x,y}>` literal. *(This site is why the runbook says "let the compiler enumerate" rather than listing files: it was missed by the first draft of this list. It disappears once `EcosystemGraphic` is retired in Stage 2.)* |
   | `lib/validators/courses.ts` — the `_VerticalsMatchPillarSlugs` assertion | surfaces as `Type 'true' is not assignable to type 'never'` — the bidirectional slug check firing exactly as designed |

   Then, separately from `tsc` (these are **not** compile errors and must be done deliberately):
   - `globals.css` — add the pillar's `--ec-p-*`, `-graphic` and `-soft` vars to `@theme inline`, `:root` and `.dark`
   - `data/programmes.ts` — add the programme, or the station renders without a link target
4. Re-run the palette contrast test (`§10.3`) — it fails if the new accent misses AA.
5. Nothing in the acts changes. The walk, fork, rail and ribbon derive from `pillars.length`, and `perStationVh(N)` keeps the act ~4 screens tall.

---

## 8. Responsive contract

**One governing rule: the thread always runs parallel to the axis you are scrolling.**

| Breakpoint | Hero fork | Five-pillar walk | Thread |
|---|---|---|---|
| **≥1024px** | pinned, fork vertical then rotates | **pin + horizontal scrub** | horizontal |
| **640–1023px** | fork still happens | **no pin, no scrub** — vertical spine, stations stacked | vertical |
| **<640px** | simplified vertical fall | **native `overflow-x snap-x` swipe** | horizontal, inside the swipe track |

Two decisions worth defending:

- **Tablet deliberately does not get the horizontal scrub.** Pin-plus-horizontal on a 768px viewport is cramped and fights the browser's own gestures. Tablet gets the story without the mechanic.
- **Mobile uses native CSS overflow-snap, not ScrollTrigger pin.** A pinned horizontal track on touch is how you produce the classic trap where vertical page scroll stops working. Native snap cannot do that, and the pattern is already proven in this codebase.

No layout may depend on a fixed pillar count. Grids like `lg:grid-cols-5` become `lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]` or a computed inline `gridTemplateColumns`.

---

## 9. Accessibility & reduced motion — contracts

The site currently guarantees reduced motion at the CSS layer. **Once GSAP drives, CSS can no longer make that guarantee** — `gsap.matchMedia()` takes over:

```
(prefers-reduced-motion: reduce) →
  no pin · no scrub · no horizontal track · all strands rendered fully drawn (dashoffset 0)
  every act becomes a plain vertical document in identical DOM order
```

That is not a degraded fallback — it is the same page, the same words, in the order a screen reader already needs.

| Requirement | Contract |
|---|---|
| The strand | `aria-hidden="true"`. **Every word is real DOM text** in logical order. The animation is decoration over a document that already works without it. |
| Progress rail | **Real `<button>`s** that scroll to their station. Keyboard users walk the pillars with `Tab` and `←`/`→`. |
| Scroll | **No scroll-jacking.** Native scroll + `scrub` only. The user can always flick past the whole act. |
| Focus | Never moves without user action. Pinned panel swaps announce via a polite live region. |
| Colour | A pillar accent is never the only signal (§6.5). |
| Touch | No gesture conflict — native snap, never a pinned track (§8). |

---

## 10. Calibration & verification

Because the working agreement is that the assistant does not open a browser, calibration cannot be "it looked right". It is **encoded as math with tests**, plus a tool for the human pass.

### 10.1 Calibrated as pure functions (testable without a DOM)

| Function | Purpose |
|---|---|
| `stationPositions(N)` | anchor geometry |
| `perStationVh(N)` | the §7.3 dwell formula |
| `pathFor(from, to, shape)` | path strings |
| `assertContinuity(acts)` | **each act's exit anchor equals the next act's entry anchor** |
| `drawAt(progress, i, N)` | rail/draw fractions — replaces `Methodology`'s hardcoded `/ 5.5` |
| `contrastRatio(a, b)` | the §6 table as a test, so a future palette edit cannot silently regress AA |

These run under **Vitest** — which `EDUCRAFT_PRODUCTION.md` already names as Stage 5 work, so this is that work arriving early rather than new scope.

### 10.2 Timing, from the existing tokens (`design/motion.ts` stays the single source)

| Motion | Value | Token |
|---|---|---|
| headline line stagger | 80ms | between `fast` and `instant` |
| station content in | 400ms | `emphasis` |
| walk scrub smoothing | `scrub: 1` | — |
| ribbon draw | 700ms | `reveal` |
| UI feedback ceiling | ≤160ms | `fast` |

GSAP easing uses its built-in `power3.out` ≈ `cubic-bezier(0.215, 0.61, 0.355, 1)`, within a hair of the existing `motion.easing.out` `(0.22, 1, 0.36, 1)`. The mapping is documented in `lib/gsap.ts`; **no easing plugin dependency.**

### 10.3 The calibration overlay

`?calibrate=1` (dev-only, stripped in production) prints live scrub progress, active station index, line draw fraction, and the active breakpoint branch. This turns visual QA from *"it felt off"* into *"at station 3 the strand reads 0.62"* — a report that can be acted on.

### 10.4 Mechanical gates (every change)

```bash
npx tsc --noEmit && npm run lint && npm run build
```

All three must pass. After deleting or renaming files, `rm -rf .next` first (§19 of the master doc) — and **never while a dev server is running**.

### 10.5 The human pass — yours

A numbered QA checklist per breakpoint, per theme, and under reduced motion is produced with the implementation plan.

---

## 11. Interactive components, shadcn, and libraries

### 11.1 shadcn slots in without a theming fight

`globals.css` **already defines the complete shadcn variable contract** — `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring` — and `components.json` is already configured (`new-york`, RSC, `@/components/ui`, cssVariables). shadcn primitives therefore **inherit the Educraft palette automatically**.

**The rule: shadcn supplies *behaviour*, never *look*.**

| Adopt (a11y primitives — hand-rolling these is where bugs live) | Keep (branded, already good) |
|---|---|
| `Dialog` — enquiry modal: focus trap, escape, scroll-lock, `aria-modal` | `Button`, `SectionHeading`, `Eyebrow`, `Card` |
| `Accordion` — FAQ: correct `aria-expanded`, roving focus | `EmptyState`, `Stat`, `MaterialFeed` |
| `Tabs` — handoff-route view toggles | the `DashboardShell` |
| `Popover` / `Tooltip` — station labels, journey ribbon | |

`components/ui/` = unstyled primitives. `components/educraft/ui/` = branded wrappers. Two folders, one direction of dependency.

**Not adopting `react-hook-form`.** The codebase has a settled server-action contract (`useActionState` + `ActionResult` + zod at the edge). RHF would duplicate that validation state for no gain; the one awkward input (email chips) already has a working component. Primitives, not a new form stack.

### 11.2 Dependency changes

| Action | Package | Note |
|---|---|---|
| add | `gsap` 3.15 | ScrollTrigger free under the standard license |
| add | `@gsap/react` | official React binding; correct context revert |
| add | `motion` 13.2 | peer `react ^18 \|\| ^19` — compatible with the current pin |
| add | shadcn deps | `@radix-ui/*` per component, `class-variance-authority` (`clsx`, `tailwind-merge`, `lucide-react` already present) |
| add (dev) | `vitest` | the pure-function tests of §10.1 |
| **remove** | `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` | §1.5 — the tree is hero-only |
| **relax** | `react` / `react-dom` | `~19.2.8` → `^19`, and `@types/react*` unpinned — **only after** R3F is gone |

Removing R3F is a net JS win on the landing page even after adding GSAP + Motion, since the hero currently ships a `dynamic({ ssr:false })` WebGL bundle.

### 11.3 Interactive component redesigns

Every interactive component on the landing surface and the handoff routes is redesigned. The governing idea: **the nav becomes a miniature of Act 1**, and the conversion path stops being a generic form.

#### `Navbar` + mega menu

Today it is a *fourth* representation of the five pillars (after the hero scene, the Ecosystem map, and the Explorer), styled independently of all three.

- The five entries adopt the **same node + label device** as Act 1's stations — accent dot (graphic tier) + pillar name (`text` tier). The menu therefore reads as a miniature of the walk, so the vocabulary is consistent from the first interaction.
- Open/close moves from the current CSS-transition to **Motion** with `AnimatePresence`, keeping the existing `aria-expanded` semantics.
- Add **arrow-key navigation** across the five entries and **focus-into-menu on open / return-to-trigger on Escape** — neither exists today.
- Sticky behaviour gains a scroll-state transition (transparent over the hero, solid after Act 0) driven by a single ScrollTrigger, so the navbar participates in the act structure rather than floating above it.

#### Enquiry modal + form — the conversion moment

- **`shadcn/ui` `Dialog`** replaces the hand-rolled modal, supplying focus trap, Escape, scroll-lock, `aria-modal`, and portal layering.
- The form **keeps** `useActionState` + the existing zod validator + the server action. Only the shell changes (§11.1).
- Enter/exit moves to Motion, replacing the `animate-in` keyframe remount.
- Restyled to the v2 palette and type scale; the modal is where the darkest treatment on the site is justified, so it echoes `FinalCTA`'s dark band and terminates the strand into its heading.
- `EnquiryForm` fields keep their current names and validation messages — no server-side contract change.

#### `FloatingEnquiryButton`

The user's complaint about the hero was a *floating* element that connects to nothing. This button is the same pattern, and it currently competes with the hero's own CTAs and drifts over the strand.

- **It appears only after the user passes Act 0**, so it never duplicates the hero CTAs and never overlays the fork.
- It enters with Motion, and it retracts when the enquiry modal opens.
- It stays `aria-hidden` until visible, so it is not announced before it exists.

#### `FaqAccordion`

- **`shadcn/ui` `Accordion`** (Radix) — correct `aria-expanded`/`aria-controls`, roving focus, and height animation that does not fight the reveal system.
- Restyled to hairline rules between items rather than boxed rows, matching Act 2.

#### `Button` / `MagneticButton`

- `MagneticButton`'s hand-rolled magnetic physics is **replaced by Motion springs** (`whileHover` / `whileTap` + `useSpring`): less code, no `getBoundingClientRect` per pointer move, and it respects reduced motion for free.
- `Button` variants are re-tuned to the v2 palette, and every variant gains a `focus-visible` ring built from `--ec-focus` at a consistent 2px/2px offset (the current styles vary per call site).

#### `ThemeToggle`

- Keeps its existing `mounted` gate (it prevents a real hydration mismatch) and is restyled only. Its `aria-label` bridging stays.

#### `CursorProvider`

Flagged for retirement, not redesigned — see §13.

---

## 12. The handoff routes

Scope is the landing page **plus** these four routes (decision 3 in §0). "Elevated" means concretely: the same palette, the same type scale, the strand as a real structural element, and `card-surface` replaced by the devices of §6.5.

**One rule makes all four coherent: the strand takes the colour of the scope it is in.** Brand teal at the *ecosystem* level (landing, `/programmes`, `/methodology`, `/impact`); the pillar's own **graphic** tier at the *programme* level, because such a page is entirely about that one pillar. That is a principle, not a per-page choice.

| Route | Today | Treatment |
|---|---|---|
| `/programmes` | `ProgrammeGraphic` + `Constellation`, five entries | The same strand/node device as Act 1, laid out **vertically** — so arriving from the homepage's horizontal walk feels like the same world rotated. `LineStage` with a vertical spine; each row is node + pillar label + programme name + tagline + link. **No cards.** |
| `/programmes/[slug]` | `ProgrammePage.tsx` — long stacked sections (curriculum, method, outcomes, journey, FAQs) | The strand continues as a **vertical spine with a node per section**, and a sticky rail showing position. This is where `ProgrammeDeepDive`'s "look inside a programme" content lands (§5), so it must be the definitive deep-dive: pass `LineStage` the pillar's accent (the one place the strand carries a pillar colour). Its section rail replaces the current plain stacked scroll. |
| `/methodology` | `TopographicLines` + the five steps | The **full-scale version of Act 2's method path**. Act 2 compresses the five steps to nodes on a strand; this page deepens each step with the detail the act omits. Same draw mechanic, more room. |
| `/impact` | `Constellation`-era layout; **repeats the four-value stat block verbatim from the landing page** (§1.2) | The **evidence axis at full scale**. The stat block is **de-duplicated against the homepage**: the landing page carries three headline stats, `/impact` carries the full ledger — the two must not restate each other. **Also carries the §1.3 fix**: `4 Audiences served … Partners` → `3 · Schools · Parents · Students`. |

`/about`, `/insights`, the `/for-*` pages, `/contact`, `/careers`, `/partnerships`, and the legal pages are **out of scope** (decision 3 in §0) and unchanged.

---

## 13. Open items

| # | Item | Owner |
|---|---|---|
| 1 | ~~**`CursorProvider` (custom cursor)** — proposed for retirement~~ **RESOLVED 2026-09-12: retired** — reads as jank more often than premium, fights touch and reduced-motion users, and is the likeliest thing to make the redesign feel heavier | — |
| 2 | ~~Act 1 dwell~~ **RESOLVED 2026-09-12: 80vh/station** (400vh act, `clamp(400/N)` to `[60, 80]`) — takes another half-screen off the page while keeping the five stations readable. Still the single tunable knob if the pace reads wrong in QA | — |
| 3 | `Course.vertical` cannot express a course outside the five pillars (§7.1) — needs a product decision when it arises | later |
| 4 | Seed testimonials remain a **launch blocker** (§22) and this design leans on them harder | you |
| 5 | ~~`EDUCRAFT_PRODUCTION.md` §2/§24 stale~~ **RESOLVED 2026-09-12** — §2's version line corrected to `29c96a6`, §24.8's "awaiting commit" corrected, and §26 added as the master-side reference. The Vercel-deploy commit claim and `/impact`'s stat claim were **not** re-verified (owner's check) | — |
| 6 | The four handoff routes get their elevated pass in this work — if their budget is cut, the seam between the new homepage and the old `/methodology` will be visible | you |

---

## 14. Definition of done

- Homepage renders **5 acts**; no `card-surface` on the landing page.
- Desktop height reduced from ~20+ screens to **~11.5**; no pinned region over 400vh.
- The strand is continuously present from hero to CTA, with `assertContinuity` passing.
- Every pillar accent and the full text tier set clears **AA on every canvas in both themes**, enforced by test.
- Reduced motion renders a plain vertical document, all strands drawn, identical DOM order — verified.
- Mobile uses native snap; no pinned horizontal track on touch; vertical page scroll always works.
- **The four handoff routes carry the new system** (§12): the strand is structural on each, `/programmes` reads as the walk rotated vertical, and `/impact`'s stat block no longer restates the homepage.
- **The §1.3 defect is fixed** in both places it appears: `4 Audiences … Partners` → `3 · Schools · Parents · Students`.
- **Interactive components redesigned** (§11.3): enquiry modal on shadcn `Dialog`, FAQ on shadcn `Accordion`, mega menu mirrors the Act 1 node device with arrow-key and focus management, `FloatingEnquiryButton` gated to post-Act-0, magnetic physics replaced by Motion springs.
- `tsc` / `lint` / `build` clean; Vitest suite green.
- **Adding a 6th pillar produces compile errors, not silence** (§7.4 runbook verified by dry-run).
- No route deleted.
- `TECH-STACK.md` and `EDUCRAFT_PRODUCTION.md` updated, including the removed R3F/React-pin note.
