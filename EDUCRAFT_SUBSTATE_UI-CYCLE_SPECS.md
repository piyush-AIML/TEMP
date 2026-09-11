# EDUCRAFT — SUB-STATE: Front-End Overhaul Cycle — FC Execution Specs

**Edition:** v1.0 · **Created:** 2026-09-07 · **Parent:** [`EDUCRAFT_MASTER_SYSTEM.md`](EDUCRAFT_MASTER_SYSTEM.md) **§13** · **Sibling:** [`EDUCRAFT_SUBSTATE_UI-CYCLE.md`](EDUCRAFT_SUBSTATE_UI-CYCLE.md) (queue/waves/gates) · **Line budget:** ≤ 500 (master §12.2)

> **Shared context for every FC spec.** Master §13.1 (premium bar) + §13.2 (design direction v4) + §13.3 (cycle laws) + §11.4–§11.5 (hero/landing direction + acceptance bar) bind all items. Code style: single quotes, no semicolons, PascalCase default exports, sparse comments (§7). Every spec was written against the live repo — pipeline S3 step (b) (verify current code state) always applies. All items are `OWNER-GATED` until Phase 0 + their named gates rule (control file §1/§3). Content-preservation gate applies to every recomposition — no copy/stat/bullet deleted. Dashboard untouched (DASH family). Merged-item heritage is noted per spec (`← UIS-xx / Hx / V3-Bx`).

## §1. Wave 1 — Foundations (FC-01…09)

**FC-01 · Baseline verification + CWV pre-measure — `OWNER-GATED (Phase 0)`**
- Direction: record the before-state: universal loop green; Lighthouse/CWV pre-measure (LCP/CLS/INP) + bundle inspection on the current build; page-by-page asset/weight inventory. The honesty law binds: numbers recorded, never assumed.
- Files: docs → cycle ledger §5; measurements stored with the report.
- Libraries: none.
- Invariants: none (measurement only).
- Accept: recorded baseline numbers + asset inventory; loop green. (`← V3-D17` pre-slice.)

**FC-02 · Smooth scroll — Lenis — `OWNER-GATED (G11)`**
- Direction: `lenis` as the site-wide scroll base in a `SmoothScrollProvider` (client, mounted in `(site)/layout.tsx`). Disabled under `prefers-reduced-motion` and on touch devices (native scroll). Anchors + sticky-header offset via `lenis.scrollTo`; keyboard and native scrollTop preserved (Lenis never replaces native scrolling semantics). No scroll-jacking: CSS `sticky` pinning untouched.
- Files: `src/components/educraft/motion/SmoothScrollProvider.tsx` (new) · `src/app/(site)/layout.tsx`.
- Libraries: `lenis` (MIT). Invariants: reduced-motion systemic (§5.4 law 3); sticky law (§7 rule 1); G4 spine untouched.
- Accept: inertial scroll with easing preset per G11 ruling; off on touch/reduced-motion; anchors work; no layout shift; dependency listed in report. (`← V3-B10`.)

**FC-03 · Token & CSS layer v4 — `OWNER-GATED`**
- Direction: extend the token system (never replace): layered ambient+key shadow pair in `design/tokens.ts` `shadows`; hairline-rule token; glass surface tokens (dark-zone); display scale-up utilities in `globals.css` `.type-*` ladder (+1 notch); `min-h-[100dvh]` conveniences. Banned-generic audit: remove any 1px-gray-border / harsh-shadow / `linear` leftovers as encountered.
- Files: `src/design/tokens.ts` · `src/app/globals.css` (additive sections) · `src/design/colors.ts` if glass/rule tokens live there.
- Libraries: none. Invariants: Tailwind-4 literal classes (§7 rule 5); `--ec-*` names stable; reduced-motion block untouched.
- Accept: tokens compile; existing components unchanged visually where not yet touched by later FC items; contrast both themes.

**FC-04 · Typography v4 — `OWNER-GATED (G2)`**
- Direction: per G2 ruling adopt the display + accent faces (recommended: Clash Display via `next/font/local` self-hosted WOFF2 + Instrument Serif italic accent via `next/font/google`; Manrope body stays). Update `design/typography.ts` (fonts, display scale: H1 `clamp(3.25rem,7.5vw,7.5rem)` lh .92 tracking −0.04em) + `globals.css` `.type-*` + `layout.tsx` font variables. Accent-word usage: one italic serif word per major headline (house pattern), not decoration-on-everything.
- Files: `src/design/typography.ts` · `src/app/globals.css` · `src/app/layout.tsx` · font assets under `src/app/fonts/` or `public/fonts/`.
- Libraries: font packages/files only (ITF Free / SIL OFL); `size-adjust` fallback metrics to protect CLS.
- Invariants: one type system; no arbitrary font sizes; loading via `next/font` with `display: swap` + preload.
- Accept: faces render in both themes; no CLS regression at the fold; banned-font list respected. (`← H-family type direction`.)

**FC-05 · Grain & atmosphere layer — `OWNER-GATED`**
- Direction: fixed `GrainOverlay` (SVG `feTurbulence` data-URI, ~1 KB, `pointer-events-none`, `aria-hidden`, opacity ~0.035, soft-light per theme) mounted once in `(site)/layout.tsx`; `GradientMesh` upgraded to two slow transform-only radial layers; section-transition washes (light→dark boundaries) as a shared `SectionWash` primitive on the atmosphere layer.
- Files: `src/components/educraft/motion/GrainOverlay.tsx` (new) · `graphics/DecorativeSystems.tsx` (GradientMesh v2) · `src/components/educraft/motion/SectionWash.tsx` (new) · `(site)/layout.tsx`.
- Libraries: none (1 KB data-URI — no library is better). Invariants: aria-hidden + pointer-events-none; reduced-motion (grain is static — no motion to gate).
- Accept: grain visible-but-subtle both themes; zero interaction/a11y impact; no perf regression. (`← UIS-11, V3-B8`.)

**FC-06 · Cinematic theme strategy execution — `OWNER-GATED (G1)`**
- Direction: implement the G1 ruling. Recommended Option B — dark cinematic anchor zones: flagship act (Hero → Ecosystem → ProgrammeExplorer → WhyDifferent → StudentJourney) becomes theme-independent dark with local surface tokens; Impact onward returns to themed light/dark content. Options A/C implemented if ruled.
- Files: `globals.css` (anchor-zone tokens + `.dark-anchor` zone class) · per-section files in Wave 2 consume the zones; this item ships the zone system + Hero conversion proof.
- Libraries: none. Invariants: `next-themes` mechanics + `mounted`-gate (§7 rule 2); contrast law in both themes for everything outside anchor zones.
- Accept: zone system in place; one flagship section converted as proof; no component outside the act affected.

**FC-07 · Page transitions + site-shell motion — `OWNER-GATED`**
- Direction: route-change transition wrapper (client, keyed on `pathname`, `AnimatePresence` fade/slide micro with shared-element candidate later); scroll restoration to top on route change; respects reduced-motion (skip entirely) and the mega-menu route-change close behavior.
- Files: `src/components/educraft/motion/PageTransition.tsx` (new) · `src/app/(site)/layout.tsx`.
- Libraries: `motion` (MIT) — import `motion/react`. Invariants: hydration (§7 rule 2); menu close-on-route-change preserved; SSG untouched.
- Accept: transitions present between marketing routes; reduced-motion skips; no scroll/hydration glitches.

**FC-08 · Navbar v4 — `OWNER-GATED`**
- Direction: floating inset pill nav (not edge-to-edge — premium bar), glass on scroll, h-20→h-16 retained; slogan "Empowering Schools, Empowering Students" under the logo (exact text, brand type); nav order About first (desktop + mobile); mega menu restyled (glass panel, bento programme rows, mini-map kept); full a11y contract preserved.
- Files: `src/components/educraft/layout/Navbar.tsx` · `src/data/navigation.ts` (order) · `src/components/educraft/layout/MegaMenuMap.tsx` if split.
- Libraries: none required (CSS/glass); Radix DropdownMenu permitted if the mega behavior needs it (§5). Invariants: Escape/outside-click/focus-return/`aria-expanded`/`aria-current`; mounted-gated theme toggle.
- Accept: About first everywhere; slogan exact; pill layout at all breakpoints; keyboard path provably unchanged. (`← H5, H6`.)

**FC-09 · Cursor v4 — `OWNER-GATED`**
- Direction: restyle `CursorProvider` ring + label pill in the new type; extend `data-cursor-label` targets (explorer cards "Explore", insights cards "Read", deep-dive tabs); fine-pointer + non-reduced-motion only (unchanged mechanism).
- Files: `src/components/educraft/motion/CursorProvider.tsx` · landing components adding labels.
- Libraries: none. Invariants: mechanism + gating unchanged.
- Accept: restyled cursor + extended labels; touch/reduced-motion unaffected. (`← V3-B7`.)

## §2. Wave 2 — Flagship narrative (FC-10…15)

**FC-10 · Hero v4 — `OWNER-GATED (G3 alt)`**
- Direction: three-zone editorial composition (left message / centered scene / right supporting) per H1; scene upgrade: drei `<Environment>` (Poly Haven CC0 HDRI or preset), materially distinct surfaces (frosted glass via `MeshTransmissionMaterial`, brushed/soft metallic, restrained emissive), key/fill/rim feel, depth separation; semantic programme representations per §11.4 with real names from `data/programmes.ts` where the audit supports it; kinetic H1 only if G3 picks the Hero; scroll-linked pull-back retained; mobile keeps SVG `Constellation` fallback; `min-h-[100dvh]`.
- Files: `src/components/educraft/landing/Hero.tsx` · `three/scenes/EcosystemScene.tsx` · `three/primitives/*` (reuse, extend only) · three/material helpers.
- Libraries: drei components (already dep) + optional CC0 HDRI asset. Invariants: one canvas (§6.5); CanvasShell frameloop-pause + `AdaptiveDpr [1,1.5]`; hydration gate; reduced-motion; LCP budget (assets lazy).
- Accept: composition balanced at 1440/1280/1024; deliberate mobile stack; scene reads premium + semantic, not toy-like; loop green + LCP within budget. (`← H1, H2, H3`.)

**FC-11 · Mouse-light pointer illumination — `OWNER-GATED`**
- Direction: pointer as localized soft light over dark text zones (Hero + anchor zones): CSS radial gradient via custom properties + rAF easing lag; limited radius, soft falloff, readability preserved; disabled on touch/reduced-motion; doesn't fight the custom cursor ring.
- Files: `src/components/educraft/motion/MouseLight.tsx` (new) · consumed by Hero / anchor zones.
- Libraries: none (CSS-first per §11.4). Invariants: no per-frame DOM churn per character; reduced-motion.
- Accept: smooth subtle illumination; no readability loss; no perf regression; disabled where required. (`← H4`.)

**FC-12 · Ecosystem v4 — `OWNER-GATED (G9)`**
- Direction: replace hardcoded `POSITIONS` with a pure radial-compute function (equal angular spacing, offset preserving the current visual orientation — UIS-06 math); decorative node echo at the active node's computed position (aria-hidden, pointer-events-none, pillar accent via `pillarStyles.ts` — UIS-07); restyle per the v4 language + anchor-zone treatment per G1.
- Files: `src/components/educraft/graphics/EcosystemGraphic.tsx` · `src/components/educraft/landing/Ecosystem.tsx`.
- Libraries: none (computed geometry is fully known). Invariants: **`aria-live` panel markup/content/default-Learn unchanged or per G9 ruling**; Tailwind-4 literal classes; 6-pillar test passes then reverts.
- Accept: computed layout visually parity at 5; echo tracks active node; a11y panel verified; reduced-motion. (`← UIS-06, UIS-07`.)

**FC-13 · ProgrammeExplorer v4 — `OWNER-GATED (G4, G5)`**
- Direction: keep the 550vh CSS-sticky pin + mobile snap cards (laws). Upgrade the idiom: GSAP timeline handover per programme (mask reveal, word-stagger title, `ProgrammeGraphic` parallax), bento content panel, refined progress rail + bar — one shared progress value still drives everything; differentiate from DeepDive per G5.
- Files: `src/components/educraft/landing/ProgrammeExplorer.tsx` (panel internals) · motion helpers.
- Libraries: `gsap` + `@gsap/react` (free commercial; register once). Invariants: **no `overflow-hidden` on pinned ancestors (§7 rule 1)**; single progress value per pinned section; sticky integrity gate mandatory at exit.
- Accept: handover choreography smooth; mobile snap intact; sticky verified at all breakpoints; content-loss audit. (`← V3-B12 means; FLAG-1 via G5`.)

**FC-14 · WhyDifferent v4 — `OWNER-GATED (G3)`**
- Direction: sticky left statement at display scale; hairline-ruled editorial rows with hover accent; if G3 picks this heading — the site's single kinetic-type treatment (GSAP SplitText or `motion` word reveal, mask-based, reduced-motion renders final state instantly).
- Files: `src/components/educraft/landing/WhyDifferent.tsx`.
- Libraries: `gsap` SplitText or `motion` per choice. Invariants: kinetic cap = exactly one heading site-wide (§7 rule 10 / G3); reduced-motion instant.
- Accept: editorial list kept (not card-ified); one kinetic heading only. (`← UIS-09`.)

**FC-15 · StudentJourney v4 — `OWNER-GATED`**
- Direction: keep the 552vh pin + single `useScrollProgress` + calibrated path self-draw (invariants). Richer payoff: milestone ring-pulse + expanding inline detail at thresholds, a subtle progress meter, ambient background parallax; mobile vertical timeline + disclosure pattern retained.
- Files: `src/components/educraft/landing/StudentJourney.tsx` (may extract JourneyPath/Meter subcomponents).
- Libraries: none required; `motion` allowed for local pulses. Invariants: sticky law; single progress value; reduced-motion; mobile timeline.
- Accept: payoff richer without desync; mobile progressive; no overflow regressions.

## §3. Wave 3 — Evidence & conversion (FC-16…22)

**FC-16 · ProgrammeDeepDive v4 — `OWNER-GATED (G5)`**
- Direction: keep single-sourced tabbed spotlight; new chrome per G5 (default option (a): differentiate idiom from Explorer) — bento tab panels, Framer `layoutId` tab indicator, staggered curriculum checklist; accent-consistent.
- Files: `src/components/educraft/landing/ProgrammeDeepDive.tsx`.
- Libraries: `motion` (layoutId). Invariants: content single-sourcing; a11y tab pattern; content-loss audit.
- Accept: distinct from Explorer per G5; keyboard/aria parity; all curriculum copy reachable. (`← FLAG-1 via G5`.)

**FC-17 · Impact v4 — `OWNER-GATED (G8)`**
- Direction: four distinct semantic lucide icons (Confidence/Engagement/Skill/Readiness — UIS-02); `useCountUp` hook (house idiom: rAF, IO-gated, reduced-motion instant, hydration-safe) wired via optional `Stat` prop `animated` used only here (UIS-01/03); outcome chain as connected stepper (SVG line-draw idiom); evidence row → gapless asymmetric bento (UIS-04).
- Files: `src/hooks/useCountUp.ts` (new) · `src/components/educraft/ui/Stat.tsx` (optional prop) · `src/components/educraft/landing/Impact.tsx`.
- Libraries: none (custom hook matches house conventions; `motion` spring permitted if judged better). Invariants: no invented numbers — count-up on the real 5/1/4/6 facts only (G8); other `Stat` consumers unchanged.
- Accept: 4 distinct icons; stats animate in Impact only; hydration-safe; content preserved. (`← UIS-01…04`.)

**FC-18 · AudienceEntryPoints v4 — `OWNER-GATED`**
- Direction: disclosure compaction (one panel open, `grid-rows 0fr↔1fr`, `aria-expanded`/`aria-controls` — the `FaqAccordion` idiom) in editorial framing; per-audience accents preserved via literal maps; all copy reachable.
- Files: `src/components/educraft/landing/AudienceEntryPoints.tsx`.
- Libraries: none (house idiom); Radix Tabs permitted if judged better (§5). Invariants: content preservation; keyboard parity; 44px targets.
- Accept: meaningfully shorter section; all bullets reachable; a11y parity gate. (`← UIS-08`.)

**FC-19 · Methodology v4 — `OWNER-GATED`**
- Direction: remove the duplicated step-card row; reveal each step's title + description inline at its node keyed to the existing calibrated thresholds (1.1× pacing untouched); no second progress mechanism.
- Files: `src/components/educraft/landing/Methodology.tsx`.
- Libraries: none. Invariants: `'visible'`-mode draw + thresholds + node-lit logic byte-stable; content-loss audit lists every step copy's new home.
- Accept: duplication gone; every step copy present once; draw calibration unchanged. (`← UIS-05`.)

**FC-20 · Testimonials v4 — `OWNER-GATED (G7)`**
- Direction: editorial restyle per premium bar — larger primary quote, oversized quote glyph, hairline rules, grain; optional subtle drag/scroll nudge only if G7 allows (autoplay remains banned).
- Files: `src/components/educraft/landing/Testimonials.tsx`.
- Libraries: none (or `motion` for the nudge if ruled). Invariants: editorial non-carousel (G7); SEED content untouched (BLK-01 owns replacement).
- Accept: restyle coherent; content byte-stable; reduced-motion. (`← V3-B9`.)

**FC-21 · InsightsTeaser v4 — `OWNER-GATED`**
- Direction: asymmetric 1-featured + 2-stacked editorial cards; category chip + date; gradient/cover per category; hover title-shift.
- Files: `src/components/educraft/landing/InsightsTeaser.tsx`.
- Libraries: none. Invariants: data-driven from `insights.ts`; link integrity.
- Accept: no uniform row; all 3 links intact; responsive sweep.

**FC-22 · FinalCTA v4 — `OWNER-GATED`**
- Direction: keep indigo close + single-canvas SVG atmosphere; magnetic gold CTA; grain; wash into footer; display-scale statement.
- Files: `src/components/educraft/landing/FinalCTA.tsx`.
- Libraries: none. Invariants: no second canvas (§6.5); contrast (gold on indigo both themes).
- Accept: restyled close; CTA works; no canvas change.

## §4. Wave 4 — Pages & shell (FC-23…25)

**FC-23 · PageHero v4 + interior editorial pass — `OWNER-GATED`**
- Direction: PageHero v4 (`PageHero.tsx`: bigger display, editorial eyebrow, variant backgrounds light/indigo/dark-anchor, grain, scroll-reveal lead); shared `SectionShell` pattern (eyebrow + display + lead + slot); apply across the 10 interior pages (about / methodology / impact / insights / audience doors / contact / careers / partnerships / privacy / terms) with per-page content unchanged; insights keeps its category-filter logic.
- Files: `src/components/educraft/layout/PageHero.tsx` · new `SectionShell` · the interior page compositions (server components) · `pages/AudiencePage.tsx`.
- Libraries: none. Invariants: content preservation (page copy byte-stable except type/presentation); SSG route count unchanged; form/modal untouched.
- Accept: coherent page language across all 10; every route builds; content audit clean.

**FC-24 · Programme pages v4 — `OWNER-GATED (G10)`**
- Direction: `ProgrammePage.tsx` shell upgrades — new ProgrammeHero (accent eyebrow, display name, tagline, restrained 3D artifact per G10 via new `three/scenes/ProgrammeArtifactScene.tsx` composed from existing primitives, one-canvas-law-checked, perf contract copied); curriculum → gapless bento; journey stepper; editorial splits; FAQ + conversion + related kept.
- Files: `src/components/educraft/programme/ProgrammePage.tsx` · `three/scenes/ProgrammeArtifactScene.tsx` (new) · relevant section subcomponents.
- Libraries: drei components (already dep). Invariants: **never co-mounted with the hero canvas (different routes — verify)**; CanvasShell frameloop-pause + dpr contract; SSG ×5 build-green; JSON-LD/metadata untouched.
- Accept: artifact restrained + theme-aware; 5 SSG routes build; perf contract identical. (`← UIS-10`.)

**FC-25 · Footer v4 — `OWNER-GATED`**
- Direction: display-scale closing statement, 4 clusters, constellation/path-lines restyled with v4 type + grain; bottom bar with sign-in link kept.
- Files: `src/components/educraft/layout/Footer.tsx`.
- Libraries: none. Invariants: server component stays server; no social icons (BLK-04 owns).
- Accept: restyled footer; links intact; contrast both themes.

## §5. Wave 5 — Acceptance (FC-26…27)

**FC-26 · Visual-regression harness — `OWNER-GATED`**
- Direction: Playwright visual-regression setup with owner-approved baselines (homepage sections, programme page, dark mode, breakpoints) — the slice of V3-D16 that mid-rebuild baselines protect; screenshots + diffs in the §1.6 report.
- Files: `playwright.config.ts` extension · `tests/e2e/visual/` (new).
- Libraries: `@playwright/test` (dev). Invariants: no CI until owner authorizes runs (§1.7/§24.10 pattern).
- Accept: harness captures the post-wave surfaces; baselines owner-approved.

**FC-27 · Cycle acceptance — WCAG re-audit + CWV re-measure — `OWNER-GATED`**
- Direction: full WCAG 2.2 AA pass over rebuilt surfaces (keyboard walk, screen-reader, contrast incl. accent gold-on-light, new dark-anchor zones); Lighthouse/CWV re-measure vs FC-01 baseline; verify §13.1 hard requirements; produce the cycle completion report.
- Files: audit + report → cycle ledger + master §12.3 note.
- Libraries: none. Invariants: honesty law — only measured numbers.
- Accept: audit clean or items logged with owners; CWV targets met or regressions named; cycle closes. (`← V3-D19`.)

---

*End of cycle specs. Specs are execution-complete; code state verification (S3-b) always applies. Gate rulings (control file §3) outrank spec text on conflict.*
