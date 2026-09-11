# EDUCRAFT — SUB-STATE: Front-End Overhaul Cycle (v4) — Control Plane

**Edition:** v1.1 (Phase 0 rulings, 2026-09-07) · **Created:** 2026-09-07 (owner decision — master §12.3) · **Parent:** [`EDUCRAFT_MASTER_SYSTEM.md`](EDUCRAFT_MASTER_SYSTEM.md) **§13** (charter, premium bar, cycle laws, gate registry) · **Sibling:** [`EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md`](EDUCRAFT_SUBSTATE_UI-CYCLE_SPECS.md) (FC-* specs) · **Line budget:** ≤ 500 (master §12.2)

> **What this file is.** The control plane for the Front-End Overhaul Cycle: the FC queue, the wave plan, the OWNER-GATE registry mirror, and the append-only cycle ledger. The working agent mutates this file every cycle session (master §1.1 S5). **Phase 0 is DONE (2026-09-07) — Wave 1 (FC-01…09) is OPEN** (master §13.4 rulings); later waves open as their gates rule. Scope: full marketing site — homepage (12 sections) + programme pages ×5 + interior pages. Dashboard is out of scope.

---

## §1. FC Queue (master table)

States per master §1.2 (READY / ACTIVE / VERIFY / DONE / BLOCKED / OWNER-GATED / MERGED…). Items are `OWNER-GATED` while a §1.3 gate they depend on is OPEN; they flip `READY` when the owner rules.

| ID | Item | Wave | State | Depends on |
|---|---|---|---|---|
| FC-01 | Baseline verification + Lighthouse/CWV pre-measure | 1 | **DONE (2026-09-07 — inventory + synthetic run; field CWV still owner/Lighthouse)** | — |
| FC-02 | Smooth scroll — Lenis (`SmoothScrollProvider`) | 1 | **READY** (G11 ruled) | — |
| FC-03 | Token & CSS layer v4 (shadows/hairlines/glass/scale-up tokens) | 1 | **DONE** (2026-09-07) | — |
| FC-04 | Typography v4 (display face + serif accent) | 1 | **DONE** (2026-09-07) | — |
| FC-05 | Grain & atmosphere layer (grain, animated mesh, washes) | 1 | **DONE** (2026-09-07) | — |
| FC-06 | Cinematic theme strategy execution | 1 | **DONE (2026-09-07)** | — |
| FC-07 | Page transitions + site-shell motion | 1 | **READY** | — |
| FC-08 | Navbar v4 (pill + slogan + About-first + glass mega) | 1 | **READY** | — |
| FC-09 | Cursor v4 (ring/label restyle, extended labels) | 1 | **READY** | — |
| FC-10 | Hero v4 (three-zone + scene + lighting) | 2 | OWNER-GATED (Wave 2 gates) | FC-03/04/05/06 |
| FC-11 | Mouse-light pointer illumination | 2 | OWNER-GATED | FC-10 |
| FC-12 | Ecosystem v4 (computed positions + echo + restyle) | 2 | OWNER-GATED (G9 — Wave 2) | FC-03 |
| FC-13 | ProgrammeExplorer v4 | 2 | OWNER-GATED (G4, G5 — Wave 2) | FC-02/07 |
| FC-14 | WhyDifferent v4 (kinetic heading) | 2 | OWNER-GATED (G3 — Wave 2) | FC-03 |
| FC-15 | StudentJourney v4 (richer payoff) | 2 | OWNER-GATED (Wave 2) | FC-02 |
| FC-16 | ProgrammeDeepDive v4 (bento tabs) | 3 | OWNER-GATED (G5 — Wave 2/3) | FC-03 |
| FC-17 | Impact v4 (icons + count-up + bento + stepper) | 3 | OWNER-GATED (G8 — Wave 3) | FC-03 |
| FC-18 | AudienceEntryPoints v4 (disclosure + editorial) | 3 | OWNER-GATED (Wave 3) | — |
| FC-19 | Methodology v4 (inline step reveal) | 3 | OWNER-GATED (Wave 3) | — |
| FC-20 | Testimonials v4 (editorial restyle ± nudge) | 3 | OWNER-GATED (G7 — Wave 3) | — |
| FC-21 | InsightsTeaser v4 | 3 | OWNER-GATED (Wave 3) | — |
| FC-22 | FinalCTA v4 | 3 | OWNER-GATED (Wave 3) | — |
| FC-23 | PageHero v4 + interior editorial pass (10 pages) | 4 | OWNER-GATED (Wave 4) | FC-03/04 |
| FC-24 | Programme pages v4 (3D artifact + bento shells) | 4 | OWNER-GATED (G10 — Wave 4) | FC-23 |
| FC-25 | Footer v4 | 4 | OWNER-GATED (Wave 4) | FC-03/04 |
| FC-26 | Visual-regression harness (Playwright) | 5 | OWNER-GATED (Wave 5) | Wave 2+ surfaces |
| FC-27 | Cycle acceptance — WCAG re-audit + CWV re-measure | 5 | OWNER-GATED (Wave 5) | All |

**Queue health (v1.6):** 27 items — **4 READY (Wave 1 open) · 5 DONE (FC-01, FC-03, FC-04, FC-05, FC-06)** · 18 OWNER-GATED on their wave-entrance gates (master §13.4).

---

## §2. Waves (entrance gate → implement → gates → owner QA → closure)

| Wave | Name | Items | Entrance gate |
|---|---|---|---|
| Phase 0 | BENCHMARK GATE (doc-only) | Owner rules premium bar (§13.1) + G1–G12 (§13.4); recorded in master §13.4 + §3 here | — |
| 1 | Foundations | FC-01…09 | Phase 0 sign-off + G1/G2/G11/G12 ruled |
| 2 | Flagship narrative | FC-10…15 | Wave 1 closed + G3/G4/G5/G6/G9 ruled |
| 3 | Evidence & conversion | FC-16…22 | Wave 2 closed + G7/G8 ruled |
| 4 | Pages & shell | FC-23…25 | Wave 3 closed + G10 ruled |
| 5 | Acceptance | FC-26…27 | Wave 4 closed |

Every wave exits through: universal loop (§1.5) → item-type gates (reduced-motion / contrast / responsive / a11y parity / sticky integrity / hydration / dependency / content preservation) → **owner visual QA** → closure entry in §5. A wave does not open the next until the owner closes it; a §13.4 ruling may send any item back to `ACTIVE`.

---

## §3. OWNER-GATE registry mirror (authoritative record: master §13.4)

| # | Gate | State | Ruling (date · decision · reasoning) |
|---|---|---|---|
| G1 | THEME-STRATEGY | **RULED 2026-09-07** | Option B — dark cinematic anchor zones for the flagship act; light-default + art-directed dark preserved from Impact onward |
| G2 | TYPE-SYSTEM | **RULED 2026-09-07** | Clash Display (self-hosted WOFF2) + Instrument Serif italic accent + Manrope body |
| G3 | KINETIC-TYPE | OPEN — Wave 2 entrance | |
| G4 | PINNED-SPINE | OPEN — Wave 2 entrance | |
| G5 | EXPLORER-DEEPDIVE | OPEN — Wave 2 entrance | |
| G6 | SECTION-MAP | OPEN — Wave 2 entrance | |
| G7 | TESTIMONIAL-MOTION | OPEN — Wave 3 entrance | |
| G8 | COUNT-UP | OPEN — Wave 3 entrance | |
| G9 | ECOSYSTEM-PANEL | OPEN — Wave 2 entrance | |
| G10 | ONE-CANVAS-SCOPE | OPEN — Wave 4 entrance | |
| G11 | SCROLL-FEEL | **RULED 2026-09-07** | Lenis moderate inertia desktop; native scroll touch/mobile; reduced-motion off; anchors/keyboard/sticky preserved |
| G12 | PRELOADER | **RULED 2026-09-07** | No loader — staged hero entrance is the load moment |
| G13 | DATA-DRIVEN | RECORD-ONLY (preserved) | |
| G14 | ISOLATION | RECORD-ONLY (preserved) | |

---

## §4. Cycle laws quick reference (full text: master §13.3)

Phase-0-gate-first · wave-gated delivery · OWNER-GATE before workstream · library-first (§5) · custom scroll spine preserved (G4) · content preservation + audit · perf contract + measured CWV · reduced-motion systemic · one visual language (themed libraries) · 500-line sub-state budget · agents never visual-QA · kinetic-type cap = one heading (G3).

---

## §5. Cycle ledger (append-only — every cycle session adds one entry)

**Template:** `### [date] — item(s): [IDs]` → baseline · spec-vs-reality · files ↔ items · deps · gates · state transitions · owner flags · lessons for master §7.

**Entries:**

```text
### 2026-09-07 — Session #0 — item(s): cycle commissioning (meta)
- Action: cycle commissioned into master §13; control file + specs file created and registered;
  UIS/H/V3-B items merged into FC items with pointers in the primary sub-state.
- State: all 27 FC items OWNER-GATED (Phase 0 + per-item gates)
- Next: Phase 0 owner session — rule G1–G12; then Wave 1 (FC-01…09)
```

```text
### 2026-09-07 — Session #1 — item(s): Phase 0 gate rulings (meta)
- Action: owner ruled the four Wave-1 gates — G1 Option B (dark anchor zones) · G2 Clash Display +
  Instrument Serif + Manrope · G11 Lenis moderate/native-touch/reduced-motion-off · G12 no loader.
  Recorded in master §13.4 + §12.3.
- State transitions: FC-01…09: OWNER-GATED → READY (Wave 1 OPEN)
- Next: Wave 1 execution — S0 baseline (universal loop) then FC-01…09 in ID order (owner may
  reorder; FC-03 tokens is the natural first code item since everything composes onto it)
```

```text
### 2026-09-07 — Session #2 — item(s): FC-03 (Token & CSS layer v4)
- Baseline: green (lint/tsc/build ✓, S0)
- Spec-vs-reality: no conflicts — token architecture matched the spec exactly
- Changed files ↔ items: src/design/tokens.ts (key/ambient/layered shadow pairs) ·
  src/design/colors.ts (surface tokens: hairline light/dark + glass) ·
  src/app/globals.css (@theme inline mappings; --ec-hairline / --ec-shadow-* / --ec-glass-* in
  :root + .dark; .type-display-2xl +1 notch; .glass-surface / .glass-surface-strong) ·
  src/design/typography.ts (display2XL mirror) — all additive, no consumer yet
- Dependencies: none
- Gates: lint ✓ tsc ✓ build ✓; reduced-motion block untouched; hydration n/a (no markup);
  contrast n/a (no consumer yet); content n/a
- State transitions: FC-03: READY → ACTIVE → VERIFY → DONE
- Owner flags: none — visual confirmation happens naturally when FC-06/FC-08+ consume the tokens
- Lessons for master §7: none new
- Next: FC-04 (Typography v4 — G2 ruled) or FC-05 (grain/atmosphere) per ID order
```

```text
### 2026-09-07 — Session #3 — item(s): FC-01 (baseline + CWV pre-measure)
- Baseline: green
- Action: asset/weight inventory from the production build + synthetic CWV run via the
  Playwright MCP browser (owner-authorized precise measurement, §1.7 amendment) against the
  local `next start` production build.
- Inventory: JS total 2.6 MB raw across 40 chunks; largest = 874.8 KB three/R3F hero-scene
  chunk (dynamic — only the hero loads it) · 276.8/209/199.8 KB react-big-calendar/date-fns
  dashboard chunks (route-scoped) · CSS in .next/static/chunks (~1iag9h + 31enqk CSS files) ·
  fonts/media 0.1 MB (8 files, next/font subsets) · public/ logos 717/587 KB (→ FC-03 P2
  favicon note: logo.png used as tab icon at 587 KB — V3-D21 item 4 stands).
- Synthetic run (localhost prod build, no throttling — NOT field data): TTFB 14 ms · FCP
  872 ms · load ~3.0 s · CLS 0 · hero canvas mounted · 0 console errors (3 warnings: Chromium
  "Deprecated API" noise). LCP: not capturable in this Chromium build
  (PerformanceObserver.supportedEntryTypes lacks largest-contentful-paint) → field/PSI or
  Lighthouse run remains the owner's/FC-27's check.
- Changed files ↔ items: none (measurement + this record)
- Dependencies: none. Gates: honesty law — numbers labelled synthetic-local, not achieved
  field metrics (§1.6).
- State transitions: FC-01: READY → DONE (inventory + synthetic baseline recorded)
- Owner flags: field CWV baseline (PSI/Lighthouse on temp-tau-opal) still open if wanted
- Lessons for master §7: none new
- Next: FC-04 (Typography v4)
```

```text
### 2026-09-07 — Session #4 — item(s): FC-04 (Typography v4)
- Baseline: green
- Spec-vs-reality: no conflicts; the G2 ruling mapped cleanly onto the font architecture
- Action: retired Sora as the display face. Self-hosted **Clash Display** 500/600/700 WOFF2
  (Fontshare, ITF Free license — fetched from their CDN, vendored under
  src/app/fonts/clash-display/, next/font/local) · **Instrument Serif** italic+normal 400 via
  next/font/google (--font-serif-accent) · Manrope unchanged.
- Changed files ↔ items: src/app/layout.tsx (clash/serif loaders + body vars) ·
  src/app/globals.css (@theme: --font-display → var(--font-clash), --font-sans → manrope,
  --font-serif → var(--font-serif-accent); all 8 .type-* classes now var(--font-clash)) ·
  src/design/typography.ts (fonts map + doc) · 11 component files: --font-sora →
  --font-clash swap (all display-role refs; Sora gone repo-wide) · new vendored font files
- Dependencies: none added to package.json (font files vendored; next/font/google at build)
- Gates: lint ✓ tsc ✓ build ✓; runtime check via Playwright MCP (authorized precise check):
  hero H1 computed family = Clash Display 700; Instrument Serif 400 italic + Manrope in the
  loaded-face set; 0 console errors; hydration clean (SSR markup renders the same faces)
- State transitions: FC-04: READY → ACTIVE → VERIFY → DONE
- Owner flags: the first visual impression of Clash/Instrument Serif needs the owner's eyes
  (the type is live site-wide; every headline is now Clash — the accent-word pattern gets its
  first real usage in FC-10/FC-14)
- Lessons for master §7: none new
- Next: FC-05 (grain & atmosphere layer) per ID order
```

```text
### 2026-09-07 — Session #5 — item(s): FC-05 (Grain & atmosphere layer)
- Baseline: green
- Spec-vs-reality: no conflicts; GradientMesh consumers pass only className/colorClassName,
  so the SVG → layered-div rewrite was API-safe
- Changed files ↔ items: src/components/educraft/motion/GrainOverlay.tsx (new) ·
  SectionWash.tsx (new) · graphics/DecorativeSystems.tsx (GradientMesh v2: two
  transform-only radial drift layers; layer 1 currentColor via colorClassName, layer 2 the
  teal token via color-mix — no hardcoded hex) · src/app/globals.css (.grain-overlay fixed
  z-90 data-URI feTurbulence layer w/ per-theme opacity; .gradient-mesh-layer-a/-b +
  gradient-drift-a/b keyframes; .section-wash/-top/-bottom) · src/app/(site)/layout.tsx
  (GrainOverlay mounted; below modal z-100, above nav z-50)
- Dependencies: none (1 KB data-URI — no library is better)
- Gates: lint ✓ tsc ✓ build ✓; runtime check via Playwright MCP: grain fixed/pointer-events
  none/z-90/opacity .04/soft-light + data-URI bg present; mesh layers mounted with
  gradient-drift-a/b animations; mesh-a color resolves rgb(30,42,120) = --ec-indigo via
  currentColor; 0 console errors. Reduced-motion: animations killed by the global block.
- State transitions: FC-05: READY → ACTIVE → VERIFY → DONE
- Owner flags: grain intensity/soft-light feel is taste-level — owner QA when convenient;
  GradientMesh v2 drift (22s/28s) should be eyeballed on the hero + PageHero indigo variants
- Lessons for master §7: none new
- Next: FC-06 (Cinematic theme strategy execution — G1 ruled) per ID order
```

```text
### 2026-09-07 — Session #6 — item(s): FC-06 (Cinematic theme strategy execution)
- Baseline: green (lint/tsc/build ✓, S0 — after the documented stale-`.next` dev-types
  wipe, master §8)
- Spec-vs-reality: no conflicts — FC-03 glass tokens were already "dark-zone by design",
  confirming the G1 Option B token architecture; Hero matched its theme-adaptive profile
- Changed files ↔ items: src/app/globals.css (dark custom-variant extended to also match
  `.dark-anchor *`; `.dark, .dark-anchor` comma-grouped night-palette block so zones
  resolve the art-directed dark tokens in BOTH themes; `.dark-anchor` surface rule —
  color-scheme dark + canvas bg + ink default — in @layer components) ·
  src/components/educraft/landing/Hero.tsx (dark-anchor class on the section root +
  doc-comment note — the proof conversion; no other markup touched, copy byte-stable)
- Design decision: dark: variants firing inside `.dark-anchor` makes the zone an
  embedded dark island — existing dark:-pair markup converts by adding the class, no
  per-element pruning; outside zones nothing changes (variant still requires `.dark` or
  `.dark-anchor` ancestor). Zone palette mirrors .dark verbatim (owner-approved values,
  one visual language); zone-distinct values remain a lever for Wave-2 items if wanted.
- Dependencies: none. Gates: lint ✓ tsc ✓ build ✓ (45/45); computed-style verification
  via Playwright MCP (authorized precise check, §1.7) on `next start`: light theme —
  zone --ec-sky #151b36 / --background #0b0f1e, h1 rgb(255,255,255) via dark: in zone,
  accent #3fcbcf, body bg white (outside stays light); dark theme — zone values
  byte-identical, body #0b0f1e ⇒ theme-independent proof; color-scheme dark on zone;
  0 console errors. Contrast: zone text = .dark palette values already shipped (AA by
  construction: ink ~15:1, slate ~7.5:1, teal accents ≥7:1 on #0b0f1e).
- State transitions: FC-06: READY → ACTIVE → VERIFY → DONE
- Owner flags: (1) the hero now reads dark in LIGHT mode — first real look at the
  flagship dark act against the light rest of the page; interim seam at hero→Ecosystem
  (Ecosystem stays themed until FC-12) is expected. (2) The hero canvas scene still
  derives its palette from the SITE theme (EcosystemScene → resolvedTheme) — in light
  mode it renders its light palette inside the dark zone; scene re-theming belongs to
  FC-10/FC-12 file ownership, flagged for the owner's QA eye.
- Lessons for master §7: none new
- Next: FC-07 (Page transitions + site-shell motion — needs `motion`) or FC-08 (Navbar
  v4) per ID order; FC-02 (Lenis) remains READY
```

---

*End of cycle control file. Keep it truthful and current; every cycle session mutates it (S5).*
