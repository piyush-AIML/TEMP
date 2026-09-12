# History & lessons

Why the codebase looks the way it does — the fixed-bug ledger, the V2 plan's never-built list, the V1→V2 chronology, and the 2026-09-04 architecture review's findings.

## Fixed bugs & lessons

| Problem | Root Cause | Fix | Regression Rule |
|---|---|---|---|
| Student Journey blank zone after stage 2 | `overflow-hidden` on the section broke sticky pinning; content scrolled away while progress ran invisibly over ~4 empty screens | Removed section-level `overflow-hidden` | Never place `overflow-hidden` on a pinned/sticky section's ancestor — only on the sticky inner element |
| Hydration mismatch (theme toggle aria-label/title) | next-themes resolves the stored theme post-mount, so SSR and client markup disagree | `mounted`-gated label | Gate any next-themes-derived (or other post-mount) value behind a `mounted` check before rendering it into SSR'd markup |
| Enquiry persistence `ENOENT` | `data/` directory didn't exist | `mkdir` recursive inside the route handler | Never assume a write-target directory exists — create it recursively before writing |
| Methodology path-draw never reached node 5 | Progress was measured entry→full-exit (`'full'` mode); the draw animation completed off-screen before scroll ended | Switched to `'visible'` mode + 1.1× draw acceleration + retuned node thresholds | For path-draw sequences, use `'visible'` scroll-progress mode and calibrate against actual scroll distance — don't assume a linear 0→1 mapping lands exactly at scroll end |
| OG image prerender error | Satori requires `display: 'flex'` on every multi-child `div` inside a `next/og` `ImageResponse` | Fixed the headline wrapper | Always set explicit `display: 'flex'` on multi-child divs inside OG image markup |
| Stale `.next/types` `tsc` errors after file deletions | Cached type validator referenced deleted files | `rm -rf .next` before typecheck/build | After deleting or renaming files, run `rm -rf .next` before `tsc --noEmit` or `next build` — don't trust cached type info |
| Dashboard shell 404/500 after Stage 0 (auth routes "not found", `/professor` 500) | `(dashboard)` **route group** was assumed to create the `/dashboard` URL prefix; Next strips group names, so pages lived at bare `/professor` `/student` — `/dashboard/professor` matched only the proxy (404 signed-in) and bare paths ran `auth()` with no proxy coverage (Clerk v7 throws → 500) | Moved the shell into a real `src/app/dashboard/` folder; `/dashboard` role dispatch lives in `proxy.ts` (a group-root or root-level index page collides with `(site)/page.tsx` at `/`) | Route groups never add URL segments: use real folders for real URL prefixes, and keep every `auth()` call site covered by the proxy matcher; after structural folder moves, wipe `.next` and restart dev |

The full engineering-rule set these bug fixes produced is in [../architecture/layering.md](../architecture/layering.md) and [verification.md](verification.md).

## Never built from the V2 plan

The V2 plan was a *design proposal*. Large parts of it were never built or were built differently than proposed — notably **`ProgrammeScene` and `CTAAtmosphere`** (planned WebGL scenes; the shipped system uses SVG for both), **GSAP/ScrollTrigger**, **Lenis smooth-scroll**, **analytics**, **error monitoring**, and **the entire automated test suite**. Nothing in the V2 plan should be treated as implemented unless it is explicitly confirmed by the current documentation; roadmap items are intent only, never current state.

Related deviations recorded against the shipped source: `scenes/ProgrammeScene.tsx` and `scenes/CTAAtmosphere.tsx` were proposed but not built as WebGL — the shipped `FinalCTA` uses SVG atmosphere on the existing single canvas, and programme pages currently ship with no 3D (background-roadmap Tier B work, not yet done).

## Minimal historical context

V1 was a single-page landing prototype (`src/app/page.tsx`, anchor navigation only): 3 separate R3F scenes (`HeroScene`, `CourseOrbit3D`, `FloatingParticles`), 5 course-vertical cards, a client-side-simulated enquiry modal with no backend, basic `useReveal` fades, light mode only, static `public/robots.txt` for SEO. Repository is `piyush-AIML/TEMP` (confirmed current 2026-09-04 via `git remote`).

Commit chronology: `6207784` initial commit → `4f8ad7f` prototype work → `0a46152` cleanup for public deployment (removed scratch: `worklog.md`, `upload/`, `download/`) → `80ea2ad` V2 LIGHT&DARK MODE (V2 implementation begins) → `cfdb5fa` `Prod.ver-0.0.1` → `901bcbb` `Prod.ver-0.0.2` → `1405a06` doc restructure (created the four-doc set + branding SVGs) → `77b2217` `Prod.ver-0.1.0` (brand lockup).

| V1 | V2 (current) |
|---|---|
| One landing page | 16 pages + API |
| Decorative 3D, 3 canvases | One coordinated theme-aware scene system |
| Cards as primary pattern | Editorial modules, pinned scroll storytelling, SVG path-draws |
| Simulated enquiry form | Production lead pipeline |
| Basic reveal animations | Full motion system |
| Light mode only | Art-directed light/dark theme system |
| Hard-coded content | Content-driven UI from typed data models |

V2's design principles (non-negotiable — they live on in the background roadmap, [../projects/roadmap.md](../projects/roadmap.md)): visuals must explain learning/progress/connection, never decorate for its own sake; one great scene beats three mediocre ones; avoid endless rounded cards, all-centered sections, autoplay carousels, glassmorphism, stock-looking art, and invented numbers.

**Origin:** V1 was a single-page landing prototype. V2 fully implemented the 77-section design plan (now deleted — content absorbed; treat as archived). Deferred V2 items live in the background roadmap.

## Architecture review — 2026-09-04

**Scope:** analysis only — no code changes were made. **Basis:** live source tree inspection, usage greps, config reads, and that day's verification run (`lint`/`tsc`/`build` all ✓, 29 routes static/SSG).

### Verdict

The project is **clean and unusually disciplined for its age**: a coherent route group, content-driven data layer, one WebGL system, strict design-token layering, and a hard-won conventions ledger. Nothing below is a blocker — this is a list of **hygiene items and forward-looking improvements**, most of them cheap.

- 🟢 **Solid:** route/shell organization, design-system layering, pillar-styles literal-mapping rule, single-canvas 3D architecture, doc-driven conventions.
- 🟡 **Watch:** ~6 small hygiene items (dead code, config gotchas, unignored scratch) — each under 15 minutes.
- 🔴 **Only real architectural risk:** the runtime `data/enquiries.jsonl` append won't survive a serverless (Vercel) deployment — see A1.

### What is clean (don't touch)

| Area | Why it's good |
|---|---|
| `src/app` route organization | Homepage + all marketing under one `(site)` group wrapping a single shell (`(site)/layout.tsx`); root `layout.tsx` holds only fonts/theme/metadata/JSON-LD. No stray routes outside groups except the needed `api/enquiry`. |
| `components/educraft/*` | Feature folders (`landing/`, `programme/`, `insights/`, `enquiry/`, `layout/`, `graphics/`, `motion/`, `three/`, `ui/`) with consistent PascalCase components and default exports. Landing sections are 1:1 with homepage sections. |
| `three/` internal split | `core/ · primitives/ · scenes/ · hooks/` — primitives are genuinely reusable; exactly one canvas system. |
| `design/` tokens | `colors/typography/motion/tokens` as JS sources of truth + `globals.css` mapping to runtime vars — a textbook Tailwind-4 setup. |
| Data-driven content | `src/types/index.ts` → `src/data/*` → content components; `data/programmes.ts` carries per-programme `faqs[]`; adding a programme needs zero component changes. |
| Alias + imports | `@/* → ./src/*` used consistently; no deep relative-import tangles spotted. |
| Decorative backgrounds | Consolidated into `graphics/DecorativeSystems.tsx` instead of per-section copies. |
| Reduced motion | Enforced at CSS level globally — the correct systemic choice. |

### Current shape at a glance (2026-09-04 snapshot)

```
web-2/
├── src/
│   ├── app/            (site)/ 16 page dirs + home · api/enquiry · root layout/metadata/
│   │                   globals.css · sitemap/robots/opengraph-image
│   ├── components/     educraft/ (9 feature folders, 39 files) · theme/ (1)
│   ├── context/        EnquiryModalContext.tsx
│   ├── data/           programmes.ts (1,247 ln) · pillars · navigation · insights · testimonials
│   ├── design/         colors · typography · motion · tokens   (4 files, 239 ln total)
│   ├── hooks/          6 hooks   │  lib/ 4 files   │  types/index.ts
├── data/               enquiries.jsonl — RUNTIME lead log (sibling name of src/data!)
├── public/             logo.png · logo-dark.png  (both ~0.6–0.7 MB)
├── Dashboard-Implementation-Plan.md · EDUCRAFT_PRODUCTION.md · README.md
├── 2× “Educraft Branding Showcase” SVGs (unreferenced, ~237 KB each)
├── components.json     shadcn stub — no shadcn deps installed
└── .playwright-mcp/    untracked snapshot scratch
```

Total tracked-ish source: **~9,976 lines** across `src` (largest: `data/programmes.ts` 1,247 · `EnquiryForm.tsx` 528 · `globals.css` 489 · `Navbar.tsx` 383 · `ProgrammePage.tsx` 372).

### Findings & recommendations

#### A. Correctness / deployment risk

**A1 — `data/enquiries.jsonl` append breaks on serverless. 🟡→🔴 at launch.** Full text and the recommended fix are carried as a live launch item in [blockers.md](blockers.md).

**A2 — Naming collision: root `data/` vs `src/data/`.** Same word, different meaning (runtime log vs content source). Harmless today (one is gitignored), confusing tomorrow when the dashboard adds a DB.
→ When the dashboard lands, the runtime log likely disappears anyway; if it survives, rename the runtime dir (e.g. `runtime/`) — 2-minute change, avoid the trap.

**A3 — Favicon is a 601 KB PNG.** `layout.tsx` sets `icons.icon: "/logo.png"` — every tab request downloads a brand image meant for the navbar.
→ Ship a small `public/favicon.ico` or `.svg` and point `icons` at it (keeps OG/logo uses untouched). Cosmetic perf win.

#### B. Tooling config gotchas (empirically observed)

**B1 — ESLint flat-config `ignores` is not global — caused a real break.**
`eslint.config.mjs` puts `ignores: [".next/**", …]` inside the same config object as the rules. In flat config that only exempts *that* object — the preset configs (`nextCoreWebVitals`, `nextTypescript`) still match `.next`. Observed 2026-09-04: a stale/truncated `.next/dev/types/validator.ts` made `npm run lint` fail with `TS1128` until `rm -rf .next`. The fixed-bug ledger treats this as cache staleness, but the lint config is the actual exposure.
→ Move the ignores to a standalone leading block (`{ ignores: [...] }`) or `globalIgnores`; add `.playwright-mcp/` there too.

**B2 — `tsconfig.json` includes `.next/dev/types/**/*.ts`.** This is why file deletions poison `tsc`/build with stale type errors (the `rm -rf .next` ritual). The `.next/dev` include is normally only needed by an actively-running dev server.
→ Drop `.next/dev/types/**/*.ts` from `include`; keep `.next/types` (build-generated). If no dev-server regressions, the stale-cache workaround stops being needed.

**B3 — Missing `.env.example`** while `.gitignore` explicitly carves one out (`.env*` + `!.env.example`).
→ Add a 4-line example (`NEXT_PUBLIC_SITE_URL`, `ENQUIRY_WEBHOOK_URL`) — onboarding + the dashboard stage will need it.

**B4 — `components.json` (shadcn) exists; shadcn does not.** No radix/cva deps in `package.json`; `components/educraft/ui/*` are hand-rolled. The dashboard plan already flagged this as an open decision.
→ Either install shadcn when Stage 0 of the dashboard starts (config is ready) or delete `components.json` until then. Do not leave the half-state through a new project.

#### C. Dead / near-dead code

| Item | Evidence | Suggestion |
|---|---|---|
| `components/educraft/ui/Card.tsx` | **0 importers** (only the `card-surface` CSS class is used across the site) | Delete, or adopt it where `card-surface` is handwritten and the component adds value |
| `hooks/useSectionProgress.ts` | **0 consumers** (the docs described it as shipped) | Delete, or wire it into a real section step (Tier B cursor/stage work) |
| `useScrollLock` / `useParallax` | 2 / 1 consumers | In use — keep |
| 2× `Educraft Branding Showcase*.svg` at root | Both ~237 KB, unreferenced by code; near-identical purpose | Keep only one (or move out of repo / into `public/` if they're for clients) — root clutter |
| `.playwright-mcp/` | MCP snapshot scratch, untracked | Add to `.gitignore` (or let its server own a temp dir) |

#### D. Organization consistency (minor)

- **Providers are split by convention:** `EnquiryModalProvider` in `src/context/` (plural-adjacent, top-level) vs `ThemeProvider` in `src/components/theme/`. Two homes for the same concept → before the dashboard adds more providers (auth!), pick one: a top-level `src/providers/` (the review's suggestion) and move both.
- `three/hooks/useSceneActive.ts` sits under `components/educraft/three/hooks/` while all other hooks live in `src/hooks/`. Fine as locality, but be deliberate: either "hooks live next to their feature" (move the six `src/hooks` too — churn) or keep the single top-level `hooks/` (move `useSceneActive` out). Choose once.
- **No barrel/index files** anywhere (`components/educraft/ui/index.ts` etc.). With 39 components still fine; revisit when the dashboard adds its own ~15.
- **tsconfig is loose in spots:** `strict: true` but `noImplicitAny: false` (explicitly disabling the strict flag's most valuable check) + `allowJs: true` for a 100% TS codebase + `no-unused-vars` off in ESLint. Each was presumably pragmatic once; tightening them later is a cheap safety net — low priority, do during the Tier D test/QA pass.

#### E. Size & maintainability

| File | Lines | Note |
|---|---|---|
| `data/programmes.ts` | 1,247 | Content + helpers for 5 programmes. Fine now (content-driven is the point); if programmes grow → split `src/data/programmes/*.ts` (one per slug) keeping the index API. |
| `EnquiryForm.tsx` | 528 | 3 stages + validation + success in one file. Readable, but stage subcomponents would help when the dashboard copies the pattern. |
| `globals.css` | 489 | Single file, layered by concern with good comments — acceptable for Tailwind 4; split only if it grows past ~700. |
| `Navbar.tsx` | 383 | Mega-menu + mobile menu + scroll state; extractable into `layout/navbar/*` subcomponents if it grows again. |

#### F. Forward-looking — protect the static site when the dashboard lands

The marketing site is fully static (29 routes). The dashboard plan is sound on isolation. Watch these specifically:

- **Keep the root layout and `(site)` group static.** Auth libraries, DB clients, and providers must be added at the dashboard layout level (or behind middleware with a `matcher` that excludes public routes) — never in root `layout.tsx`. One dynamic dependency in the root would silently turn every page dynamic.
- **Middleware scope:** a future auth middleware must exclude `/`, `(site)` routes, and `/api/enquiry` from checks (or check session/role only on `/dashboard/*`).
- Align new folders with the existing conventions: `lib/actions/*` + `lib/validators/*` fits the current `src/lib/`.
- The `components.json` decision (B4) is a Stage-0 prerequisite, alongside the dashboard plan's open decisions.

#### Suggested priority order

| # | Item | Effort | Type |
|---|---|---|---|
| P1 | B1 ESLint global ignores (+ `.playwright-mcp`) | 5 min | tooling fix |
| P1 | B2 drop `.next/dev/types` from tsconfig | 5 min | tooling fix |
| P1 | C delete `Card.tsx` + `useSectionProgress` (or wire them) | 10 min | dead code |
| P1 | B3 add `.env.example` | 5 min | hygiene |
| P2 | D provider home consolidation (do with dashboard auth work) | 30 min | consistency |
| P2 | A3 favicon · A2 runtime-data naming · C SVG dedupe | 20 min | polish |
| P3 | A1 enquiries persistence decision — **before launch** | design | deployment risk |
| P3 | E file splits · D tsconfig tightening · barrels | as needed | growth |

#### Bottom line

Structure and architecture are healthy and internally consistent — nothing there blocked the Dashboard project. The two things to *not* defer past launch are A1 (JSONL on serverless) and the already-documented production blockers (env vars, real webhook). Everything else is under an hour of hygiene work that would make the codebase as disciplined as its documentation.

### Status since that review

- **B3 — resolved:** the root `.env.example` now exists (see [deployment-env.md](deployment-env.md)).
- **B4 — resolved (decision only):** shadcn was decided on 2026-09-12 (behaviour primitives only; **not yet installed** — `components.json` stays configured and ready) — see [stack.md](stack.md).
- **C — still open:** `Card.tsx` and `hooks/useSectionProgress.ts` remain on disk with zero importers/consumers, as do the two ~237 KB branding SVGs and the untracked `.playwright-mcp/` directory.
- **A1, A2, A3, B1, B2, D, E** — still as described above; nothing in the dashboard work has contradicted them.
