# Educraft — Project Structure & Architecture Review

**Date:** 2026-09-04 · **Scope:** analysis only — no code changes were made.
**Basis:** live source tree inspection, usage greps, config reads, and the 2026-09-04 verification run (`lint`/`tsc`/`build` all ✓, 29 routes static/SSG). Architectural context per [`EDUCRAFT_PRODUCTION.md`](EDUCRAFT_PRODUCTION.md) (master).

---

## 1. Verdict

The project is **clean and unusually disciplined for its age**: a coherent route group, content-driven data layer, one WebGL system, strict design-token layering, and a hard-won conventions ledger. Nothing below is a blocker — this is a list of **hygiene items and forward-looking improvements**, most of them cheap.

- 🟢 **Solid:** route/shell organization, design-system layering, pillar-styles literal-mapping rule, single-canvas 3D architecture, doc-driven conventions.
- 🟡 **Watch:** ~6 small hygiene items (dead code, config gotchas, unignored scratch) — each under 15 minutes.
- 🔴 **Only real architectural risk:** the runtime `data/enquiries.jsonl` append won't survive a serverless (Vercel) deployment — filesystem writes are ephemeral there. Known-but-important; see §5-A1.

---

## 2. What is clean (don't touch)

| Area | Why it's good |
|---|---|
| `src/app` route organization | Homepage + all marketing under one `(site)` group wrapping a single shell (`(site)/layout.tsx`); root `layout.tsx` holds only fonts/theme/metadata/JSON-LD. No stray routes outside groups except the needed `api/enquiry`. |
| `components/educraft/*` | Feature folders (`landing/`, `programme/`, `insights/`, `enquiry/`, `layout/`, `graphics/`, `motion/`, `three/`, `ui/`) with consistent PascalCase components and default exports. Landing sections are 1:1 with homepage sections. |
| `three/` internal split | `core/ · primitives/ · scenes/ · hooks/` — primitives are genuinely reusable; exactly one canvas system. |
| `design/` tokens | `colors/typography/motion/tokens` as JS sources of truth + `globals.css` mapping to runtime vars — a textbook Tailwind-4 setup. |
| Data-driven content | `src/types/index.ts` → `src/data/*` → content components; `data/programmes.ts` carries per-programme `faqs[]`; adding a programme needs zero component changes. |
| Alias + imports | `@/* → ./src/*` used consistently; no deep relative-import tangles spotted. |
| Decorative backgrounds | Consolidated into `graphics/DecorativeSystems.tsx` instead of per-section copies (the doc's own §6 rule is being followed). |
| Reduced motion | Enforced at CSS level globally — the correct systemic choice. |

---

## 3. Current shape at a glance

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

---

## 4. Findings & recommendations

### A. Correctness / deployment risk

**A1 — `data/enquiries.jsonl` append breaks on serverless. 🟡→🔴 at launch**
The route handler `mkdir`s and appends to `data/` at repo root. Locally that works; on Vercel the filesystem is **ephemeral and read-only** (writes fail or vanish per invocation). Today enquiries are only *really* delivered when `ENQUIRY_WEBHOOK_URL` is set (already documented, §13/§21) — but the JSONL is described as a delivery channel, which it cannot be in production.
→ Before/at launch: treat JSONL as a **dev-only** fallback (or write to `/tmp` in serverless and accept loss), and make the webhook (or a hosted store) the sole production channel. Also worth a one-line note in `EDUCRAFT_PRODUCTION.md` §13/§21 once decided.

**A2 — Naming collision: root `data/` vs `src/data/`.** Same word, different meaning (runtime log vs content source). Harmless today (one is gitignored), confusing tomorrow when the dashboard adds a DB.
→ When the dashboard lands, the runtime log likely disappears anyway; if it survives, rename the runtime dir (e.g. `runtime/`) — 2-minute change, avoid the trap.

**A3 — Favicon is a 601 KB PNG.** `layout.tsx` sets `icons.icon: "/logo.png"` — every tab request downloads a brand image meant for the navbar.
→ Ship a small `public/favicon.ico` or `.svg` and point `icons` at it (keeps OG/logo uses untouched). Cosmetic perf win.

### B. Tooling config gotchas (empirically observed)

**B1 — ESLint flat-config `ignores` is not global — caused a real break.**
`eslint.config.mjs` puts `ignores: [".next/**", …]` inside the same config object as the rules. In flat config that only exempts *that* object — the preset configs (`nextCoreWebVitals`, `nextTypescript`) still match `.next`. Observed 2026-09-04: a stale/truncated `.next/dev/types/validator.ts` made `npm run lint` fail with `TS1128` until `rm -rf .next`. The doc ledger (§19) treats this as cache staleness, but the lint config is the actual exposure.
→ Move the ignores to a standalone leading block (`{ ignores: [...] }`) or `globalIgnores`; add `.playwright-mcp/` there too.

**B2 — `tsconfig.json` includes `.next/dev/types/**/*.ts`.** This is why file deletions poison `tsc`/build with stale type errors (the `rm -rf .next` ritual in §19/§20). The `.next/dev` include is normally only needed by an actively-running dev server.
→ Drop `.next/dev/types/**/*.ts` from `include`; keep `.next/types` (build-generated). If no dev-server regressions, the stale-cache workaround stops being needed.

**B3 — Missing `.env.example`** while `.gitignore` explicitly carves one out (`.env*` + `!.env.example`).
→ Add a 4-line example (`NEXT_PUBLIC_SITE_URL`, `ENQUIRY_WEBHOOK_URL`) — onboarding + the dashboard stage will need it.

**B4 — `components.json` (shadcn) exists; shadcn does not.** No radix/cva deps in `package.json`; `components/educraft/ui/*` are hand-rolled. The dashboard plan (§24.3 of master) already flags this as an open decision.
→ Either install shadcn when Stage 0 of the dashboard starts (config is ready) or delete `components.json` until then. Do not leave the half-state through a new project.

### C. Dead / near-dead code

| Item | Evidence | Suggestion |
|---|---|---|
| `components/educraft/ui/Card.tsx` | **0 importers** (only the `card-surface` CSS class is used across the site) | Delete, or adopt it where `card-surface` is handwritten and the component adds value |
| `hooks/useSectionProgress.ts` | **0 consumers** (docs §11 describe it as shipped) | Delete, or wire it into a real section step (Tier B cursor/stage work) |
| `useScrollLock` / `useParallax` | 2 / 1 consumers | In use — keep |
| 2× `Educraft Branding Showcase*.svg` at root | Both ~237 KB, unreferenced by code; near-identical purpose | Keep only one (or move out of repo / into `public/` if they're for clients) — root clutter |
| `.playwright-mcp/` | MCP snapshot scratch, untracked | Add to `.gitignore` (or let its server own a temp dir) |

### D. Organization consistency (minor)

- **Providers are split by convention:** `EnquiryModalProvider` in `src/context/` (plural-adjacent, top-level) vs `ThemeProvider` in `src/components/theme/`. Two homes for the same concept → before the dashboard adds more providers (auth!), pick one: a top-level `src/providers/` (my suggestion) and move both.
- `three/hooks/useSceneActive.ts` sits under `components/educraft/three/hooks/` while all other hooks live in `src/hooks/`. Fine as locality, but be deliberate: either "hooks live next to their feature" (move the six `src/hooks` too — churn) or keep the single top-level `hooks/` (move `useSceneActive` out). Choose once.
- **No barrel/index files** anywhere (`components/educraft/ui/index.ts` etc.). With 39 components still fine; revisit when the dashboard adds its own ~15.
- **tsconfig is loose in spots:** `strict: true` but `noImplicitAny: false` (explicitly disabling the strict flag's most valuable check) + `allowJs: true` for a 100% TS codebase + `no-unused-vars` off in ESLint. Each was presumably pragmatic once; tightening them later is a cheap safety net — low priority, do during the Tier D test/QA pass.

### E. Size & maintainability

| File | Lines | Note |
|---|---|---|
| `data/programmes.ts` | 1,247 | Content + helpers for 5 programmes. Fine now (content-driven is the point); if programmes grow → split `src/data/programmes/*.ts` (one per slug) keeping the index API. |
| `EnquiryForm.tsx` | 528 | 3 stages + validation + success in one file. Readable, but stage subcomponents would help when the dashboard copies the pattern. |
| `globals.css` | 489 | Single file, layered by concern with good comments — acceptable for Tailwind 4; split only if it grows past ~700. |
| `Navbar.tsx` | 383 | Mega-menu + mobile menu + scroll state; extractable into `layout/navbar/*` subcomponents if it grows again. |

### F. Forward-looking — protect the static site when the dashboard lands (§24)

The marketing site is fully static (29 routes). The dashboard plan is sound on isolation (separate route group). Watch these specifically:
- **Keep the root layout and `(site)` group static.** Auth libraries, DB clients, and providers must be added at the `(dashboard)` layout level (or behind middleware with a `matcher` that excludes public routes) — never in root `layout.tsx`. One dynamic dependency in the root would silently turn every page dynamic.
- **Middleware scope:** a future auth middleware must exclude `/`, `(site)` routes, and `/api/enquiry` from checks (or check session/role only on `/dashboard/*`).
- Align new folders with the existing conventions the plan itself maps: `lib/actions/*` + `lib/validators/*` fits the current `src/lib/` (master §24.4 note already maps `(marketing)` → real `(site)`).
- `components.json` decision (B4) is a Stage-0 prerequisite, alongside the two open decisions in plan §8 (auth provider, course↔professor cardinality).

---

## 5. Suggested priority order

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

---

## 6. Bottom line

Structure and architecture are healthy and internally consistent — nothing here blocks the Dashboard project. The two things to *not* defer past launch are A1 (JSONL on serverless) and the already-documented §22 blockers (env vars, real webhook). Everything else is under an hour of hygiene work that would make the codebase as disciplined as its documentation.
