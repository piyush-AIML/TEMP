# Educraft V2 — Current State (Production System Document)

> **Role of this document:** Experience System Architect's definitive record of the **current production state** — the single source of truth. A fresh session picks up the entire system (architecture, features, conventions, fixed bugs, pending inputs) from this file alone.
>
> **The document set** (this is #2 of 4):
> 1. [`Educraft_V1_Previous_State.md`](Educraft_V1_Previous_State.md) — what existed before V2 (compact)
> 2. **This file** — current state
> 3. [`Educraft_V3_Next_Version_Planner.md`](Educraft_V3_Next_Version_Planner.md) — all future work, tiered A–D
> 4. [`Educraft_V2_Experience_Web_Design_Implementation_Plan.md`](Educraft_V2_Experience_Web_Design_Implementation_Plan.md) — the 77-section design plan, **COMPLETED and archived**; do not re-read
>
> **Last verified:** 2026-08-30 · `npm run lint` ✓ · `tsc --noEmit` ✓ · `next build` ✓ (29 routes, all static except `/api/enquiry`)

---

## 1. System Identity

| | |
|---|---|
| **North star** | "Five paths. One learning ecosystem." — five pillars (Learn · Include · Thrive · Achieve · Excel) are the structural metaphor of the entire experience. |
| **Stack** | Next.js 16.3.1 (Turbopack, App Router) · React 19 · TypeScript · Tailwind CSS 4 · Three 0.185 + React Three Fiber 9.7 + Drei 10.7 · lucide-react · next-themes · zod 4 · clsx + tailwind-merge · tw-animate-css |
| **Fonts** | Sora 600/700 (display) · Manrope 400/500/600 (body) via `next/font` |
| **Audiences** | School leaders → "Talk to the Education Team" · Parents → "Find the right programme" · Students → "Explore your path" · Partners → "Partner with Educraft" |
| **V2 source plan** | `Educraft_V2_Experience_Web_Design_Implementation_Plan.md` — **COMPLETED** (archived). V1 prototype fully evolved per its Stage 1–15 roadmap; deferred items now live in the V3 planner (`Educraft_V3_Next_Version_Planner.md`). |

---

## 2. Route Map (16 pages + system routes)

```
/                                Homepage (12 sections, see §5.1)
/about                           Story, pillars, principles
/programmes                      Index — 5 programme cards w/ graphics
/programmes/[slug]               Detail ×5 (linguistics, inclusive-education,
                                 wellbeing-counseling, ai-digital-tech, neet-jee)
/for-schools · /for-parents · /for-students    Audience doors (shared AudiencePage)
/methodology                     5-step method, measurement principles
/impact                          Outcome chain, structural facts, evidence
/insights                        Index with category filter (client)
/insights/[slug]                 Article ×4 (SSG via generateStaticParams)
/careers · /partnerships · /contact · /privacy · /terms
/api/enquiry                     POST — real lead pipeline (see §7)
sitemap.xml · robots.txt         Generated (app/sitemap.ts, app/robots.ts — the
                                 static public/robots.txt was deleted on purpose)
/opengraph-image                 Homepage social preview (next/og)
/programmes/[slug]/opengraph-image   Per-programme social previews
```

**Shell:** `src/app/layout.tsx` (fonts, theme, metadata, Organization JSON-LD) → `src/app/(site)/layout.tsx` (EnquiryModalProvider → CursorProvider → SkipLink → Navbar → main#main-content → Footer → EnquiryModal → FloatingEnquiryButton). All marketing pages live under the `(site)` route group.

---

## 3. Design System

**Sources of truth (JS):** `src/design/colors.ts` · `typography.ts` (plan §6.2 scale + `typeStyle()` helper) · `motion.ts` (durations 100ms–1.2s, easings incl. baseline `cubic-bezier(0.22,1,0.36,1)`) · `tokens.ts` (4px spacing scale, radii, shadows, z-ladder base→cursor=120, layout gutters).

**CSS layer:** `src/app/globals.css`
- `@theme inline` maps everything to runtime CSS vars that flip under `.dark` (art-directed dark: deeper indigo canvas, brighter programme accents, not a color inversion).
- Programme accent system: `--ec-p-{learn,include,thrive,achieve,excel}` + `-soft` washes → Tailwind classes `text-ec-learn`, `bg-ec-learn-soft`, etc.
- Component classes: `container-site` (1440 max, 64/48/32/24px gutters) · `container-content` (1200) · `type-{display-xl…caption}` (clamped per §6.2) · `eyebrow` (+`eyebrow-rule`) · `card-surface` · `reveal-on-scroll` · `hero-enter`/`hero-enter-fade` (delay via `--hero-delay`) · `ambient-drift/pulse`.
- Global `prefers-reduced-motion` block kills all animation/transition durations and un-hides reveals — reduced-motion is handled at the CSS level, no JS branching needed.

**⚠ Critical Tailwind 4 rule:** dynamic class construction (`` `bg-ec-${x}` ``) does NOT generate CSS. All pillar→class mappings are written out literally in `src/lib/pillarStyles.ts` (`pillarTextClass`, `pillarBgClass`, `pillarSoftBgClass`, `pillarBorderClass`, `pillarAccentVar`/`pillarSoftVar` for SVG fills).

---

## 4. Content & Motion Architecture

**Content model** (`src/types/index.ts` + `src/data/`): `Programme` (slug, pillarId, name, tagline, promise, description, whyItMatters, audience[], outcomes[], highlights[], methodology[5], curriculum[], journey[6], activities[], support[], proof[], faqs[]) — fully content-driven UI, adding a programme needs zero component changes. Plus `Pillar`, `Testimonial`, `Insight` (7 categories), `NavigationItem`, `AudienceEntry`. Site-level content: `methodologySteps`, `studentJourneyStages` in `data/pillars.ts`. **No invented statistics anywhere** — proof is qualitative; structural facts only (5 verticals, 1 ecosystem, 4 audiences, 6 stages).

**Hooks** (`src/hooks/`):
- `useScrollProgress(ref, offsetTop?, mode: 'full' | 'visible')` — rAF-throttled. `'full'` (default): 0=enter, 1=full exit — use for pinned sections. `'visible'`: 1 = bottom edge reaches viewport bottom — use for path-draw sequences. Exports `clamp01`, `lerp`.
- `useReducedMotion` — single source of truth (consolidated from V1's per-scene duplicates).
- `useScrollLock` — reference-counted; multiple lockers compose.
- `useReveal({threshold, rootMargin, once})` — reveals instantly under reduced motion.
- `useParallax`, `useSectionProgress` (IntersectionObserver steps).

**Motion components** (`components/educraft/motion/`): `Reveal` (polymorphic via `createElement`; direction/delay/distance/duration) · `MagneticButton` (fine-pointer only, strength→clamped pull) · `CursorProvider` (fine-pointer + non-reduced-motion only; ring scales over interactive elements; contextual label via `data-cursor-label`, currently on ecosystem nodes).

---

## 5. Experience Feature Inventory

### 5.1 Homepage — narrative arc: Understand → Explore → Trust → Imagine → Choose → Act

| # | Section | Signature interaction | Notes |
|---|---|---|---|
| 01 | `Hero` | Staged entrance (0→1700ms via `--hero-delay`), scroll-linked: content rises, scene camera pulls back + nodes drift apart (`useScrollProgress` 'full' on hero) | Headline "Five paths. One learning ecosystem." WebGL hidden on mobile → SVG `Constellation`. Bottom fade + scroll cue. |
| 02 | `Ecosystem` | Interactive SVG map: 5 nodes around core, spokes draw on enter, hover/focus lights connection + updates right panel (aria-live), click → programme page | Mobile: stacked cards. Default active = Learn. `data-cursor-label="Explore"`. |
| 03 | `ProgrammeExplorer` | 550vh pinned scroll story (5 × 110vh): keyed crossfade panel, ProgrammeGraphic visual, progress rail + top bar | Mobile: horizontal snap cards. Uses 'full' mode. |
| 04 | `WhyDifferent` | Sticky left statement, numbered differentiators (01–05) | |
| 05 | `StudentJourney` | 552vh pinned (6 × 92vh): path self-draws (`strokeDashoffset=1-progress`), milestones light with icons | Mobile: vertical timeline. **Must never add `overflow-hidden` to the section — it breaks sticky pinning** (see §8.1). |
| 06 | `ProgrammeDeepDive` | Tabbed spotlight: curriculum modules, 5-step method, outcomes, proof line, CTAs | Client tab state, data-driven. |
| 07 | `Impact` | Outcome chain Confidence→Engagement→Skill→Readiness (numbered cards + arrows), structural facts (Stat), "how we build evidence" 5 pillars | Qualitative by design. |
| 08 | `AudienceEntryPoints` | Three doors (schools=indigo, parents=teal, students=gold) → audience pages | |
| 09 | `Methodology` | Path-draw with **calibrated pacing**: 'visible' mode, `draw = clamp01(progress * 1.1)`, node i lights at `((i+0.08)/5.5)*1.1` — completes ~84% through visible scroll | User-calibrated 2026-08-27 (was lagging behind scroll). |
| 10 | `Testimonials` | Editorial: 1 large primary quote (parallax drift) + 2 supporting. No carousel, no autoplay | Content is SEED — see §9.1. |
| 11 | `InsightsTeaser` | 3 latest articles (category, reading time, date) | |
| 12 | `FinalCTA` | Indigo close, SVG atmosphere (no second WebGL context — one canvas serves the page), magnetic gold CTA | |

### 5.2 Programme detail pages (`programme/ProgrammePage.tsx`, server component w/ client children)

Hero (accent eyebrow + ProgrammeGraphic) → why it matters → audience (3 cards) → 5-step method (numbered rows) → curriculum (modules w/ item checklists, topographic bg) → 6-stage journey cards → outcomes + activities (split) → support + proof → FAQ accordion (accessible, one-open) → indigo conversion close → related programmes (4). JSON-LD: Course + BreadcrumbList. Per-programme metadata + OG image.

### 5.3 WebGL architecture (`three/`) — one coordinated system

`core/CanvasShell` (frameloop pauses off-screen via `useSceneActive`; AdaptiveDpr; dpr [1,1.5]) · `core/CameraRig` (scroll+pointer eased targets) · `core/Lighting` (no per-node point lights — emissive + glow sprites). `primitives/`: Node (emissive sphere + halo ring), Orbit (torus), Connector (quadratic arc line), ParticleField (single buffer-geometry points), GeometryArtifact (wireframe), GlowLayer (canvas radial sprite, additive). `scenes/EcosystemScene`: core icosahedron + 3 orbit rings + 5 pillar nodes + connectors + artifacts + particles + Stars — **theme-aware colors** (reads next-themes resolvedTheme). V1's HeroScene/CourseOrbit3D/FloatingParticles were deleted (3 canvases → 1).

### 5.4 Navigation & shell details

Navbar: transparent → blurred+bordered on scroll (h-20→h-16), programmes mega menu (5 pillar rows + mini ecosystem SVG map + audience links) with hover + click toggle, Escape/outside-click close, focus return, route-change close, aria-expanded/controls, route-aware active states (`aria-current`), accessible mobile menu. Footer V2: closing statement "Build learning journeys that last.", CTA pair, 4 nav clusters, constellation + path-lines background, no social icons (waiting for real handles).

---

## 6. Enquiry System (production)

`POST /api/enquiry` pipeline: JSON parse → zod v4 `enquirySchema` (role enum, name/email/phone, programmeSlug, contactTime, message, `consent: z.literal(true)`, honeypot `website` max-0) → honeypot check (silent 200 without persisting) → per-IP rate limit (in-memory sliding window, 5 req / 10 min, `Retry-After` header) → deliver: `ENQUIRY_WEBHOOK_URL` fetch (5s AbortSignal timeout) if set + append JSONL to `data/enquiries.jsonl` (dir auto-created; gitignored) + structured console log. Client never determines success — server re-validates everything.

**Staged form** (`enquiry/EnquiryForm.tsx`): 3 steps (About you → What you're looking for → Contact preferences + review) + success state. Per-step zod validation, error association, autocomplete attrs (name/email/tel), sr-only step announcements + heading focus on step change, back/continue, loading + server-error + retry, honeypot field `sr-only`. Used by: modal (locked/general), contact page (`inline`). `EnquireButton` = client wrapper for server pages.

---

## 7. SEO Layer

`metadataBase` from `NEXT_PUBLIC_SITE_URL` (fallback `https://educraft.com` — set env for real domain). Per-route title/description/canonical. JSON-LD: EducationalOrganization (site-wide), Course + BreadcrumbList (programmes), Article (insights). `next/og` ImageResponse social previews (home + per-programme, pillar-accented). Sitemap covers all static + SSG routes. **Satori rule learned:** every div with multiple children inside an OG image needs explicit `display: 'flex'`.

---

## 8. Engineering Conventions & Fixed-Bug Ledger

### 8.1 Hard-won constraints (do not regress)
1. **`overflow-hidden` on a section ancestor breaks `position: sticky`** — it becomes the sticky element's scroll box. Pinned sections (StudentJourney, ProgrammeExplorer) must keep their section overflow visible; overflow only on the sticky inner.
2. **Hydration:** anything derived from next-themes' `theme` (or any post-mount state) in SSR'd markup must be gated on a `mounted` flag — ThemeToggleButton renders "Toggle theme" until mounted (fixed 2026-08-27 mismatch).
3. **zod v4 API:** `{ message }` param, not `{ errorMap }`; `path` is `PropertyKey[]`; don't import `SafeParseReturnType` — `flattenZodErrors` takes a structural type.
4. **R3F:** imperative scene-graph mutation inside `useFrame` needs `// eslint-disable-next-line react-hooks/immutability` (canonical pattern, not React state).
5. **Tailwind 4:** only literal class names in source (see §3 pillarStyles).
6. **tw-animate-css:** `animate-in` keyframes work on key-remount (used for stage/tab crossfades).
7. `THREE.Clock` deprecation warning is emitted by R3F 9.7.0 internals (latest stable) — harmless; disappears with R3F's next patch. Do not upgrade to 10.0 canary for it.

### 8.2 Fixed-bug ledger (2026-08-27)
| Bug | Cause | Fix |
|---|---|---|
| Student Journey blank zone after stage 2 | `overflow-hidden` on section broke pin; content scrolled away, progress ran invisibly over ~4 empty screens | Removed section overflow |
| Hydration mismatch (theme toggle aria-label/title) | next-themes resolves stored theme post-mount | `mounted`-gated label |
| Enquiry persistence ENOENT | `data/` dir missing | `mkdir recursive` in route |
| How-It-Works path never reached node 5 | progress measured entry→full-exit; draw completed off-screen | `visible` mode + 1.1× draw acceleration + retuned node thresholds |
| OG image prerender error | Satori needs `display:flex` on multi-child divs | Fixed headline wrapper |
| Stale `.next/types` tsc errors after file deletions | Cached validator | `rm -rf .next` before typecheck/build |

### 8.3 Verification loop
`npm run lint` → `npx tsc --noEmit` → `npm run build`. All three must pass before handing to the user for visual review. **Working agreement: the user performs all website viewing/accessing (browser, visual QA) and reports back — never launch browsers or curl the site from the assistant side.** (Persisted in assistant memory; `.claude/settings.local.json` still contains stale browser-automation allow-rules from an earlier session — harmless, superseded by this rule.)

---

## 9. Pending Stakeholder Inputs

1. **Testimonials** (`data/testimonials.ts`) — current 3 entries are clearly-marked SEED content; replace with real, verified quotes + consent before launch.
2. **Env vars:** `NEXT_PUBLIC_SITE_URL` (real domain), `ENQUIRY_WEBHOOK_URL` (CRM/email delivery; otherwise enquiries only log + JSONL).
3. **Verify business details:** hello@educraft.com · +91 80 4567 8900 · Bangalore, India (footer, contact page, structured data).
4. **Social handles** for the footer (currently intentionally absent — no dead `href="#"` links per plan §68).
5. Rate limiter is per-instance in-memory — needs a shared store (Redis/Upstash) before multi-instance deployment.

---

## 10. Next-Version Roadmap → `Educraft_V3_Next_Version_Planner.md`

All future work (V3 tiers A–D + protected design principles) lives in the **next version planner**: [`Educraft_V3_Next_Version_Planner.md`](Educraft_V3_Next_Version_Planner.md). Pending stakeholder inputs (§9) take precedence over Tier A items — clear them first.

---

## 11. Operational Notes

```bash
npm run dev        # local dev on :3000 (first compile ~14s is normal)
npm run lint       # eslint (react-hooks/immutability active)
npm run build      # Turbopack production build (29 routes)
npm start          # serve production build
```

- Enquiries land in `data/enquiries.jsonl` (gitignored — contains personal data).
- Theme persistence: next-themes localStorage; `enableSystem={false}`, `defaultTheme='light'`.
- The site is fully static except `/api/enquiry` — deployable to any Next.js host; set env vars at deploy time.
