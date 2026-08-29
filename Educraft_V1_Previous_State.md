# Educraft — Previous State (V1)

> **Role of this document:** The compact record of what the project was **before** V2. Read this to understand where the system came from — nothing else. The live documents are:
> - **Current state:** [`prod.md`](prod.md) — the production system document (single source of truth)
> - **Next version planner:** [`Educraft_V3_Next_Version_Planner.md`](Educraft_V3_Next_Version_Planner.md)
> - **V2 plan (archived, completed):** [`Educraft_V2_Experience_Web_Design_Implementation_Plan.md`](Educraft_V2_Experience_Web_Design_Implementation_Plan.md)

---

## What V1 was

A **polished single-page landing prototype** for Educraft — a global digital education platform unifying five verticals (linguistics, inclusive education, psychological counseling, AI & digital technologies, NEET/JEE) under one trust umbrella.

| | |
|---|---|
| **Pages** | One landing page (`src/app/page.tsx`), anchor navigation only |
| **3D** | Three separate React Three Fiber scenes: `HeroScene` (orbit ring + glowing course nodes), `CourseOrbit3D`, `FloatingParticles` (starfield) |
| **Content** | 5 course verticals as detail cards, trust strip, pillars section, final CTA |
| **Enquiry** | `EnquiryModal` with a **client-side simulated** form (general + course-locked modes); accessible dialog (focus trap, Esc); **no data persisted, no backend** |
| **Design** | Tailwind CSS v4, Sora/Manrope fonts, basic `useReveal` fade-in scroll animations; light mode only |
| **Stack** | Next.js 16 (App Router) · React 19 · TypeScript · Three.js · R3F · Drei |
| **SEO** | Basic metadata + Open Graph + static `public/robots.txt` |

Repository: `piyush-AIML/TEMP`.

## How V1 ended

1. `6207784 Initial commit` → `4f8ad7f` — early prototype work.
2. `0a46152 Clean up project for public deployment` — removed scratch files (`worklog.md`, `upload/`, `download/`).
3. `80ea2ad V2-LIGTH&DARK MODE` onwards — V2 implementation began from the 77-section design plan.

## What V2 changed (one-glance delta)

| V1 | V2 |
|---|---|
| One landing page | 16 pages + API: programmes ×5, audience doors ×3, insights ×4, methodology, impact, legal/business, `/api/enquiry` |
| Decorative 3D (3 canvases) | One coordinated theme-aware scene system (`EcosystemScene` + reusable primitives) |
| Cards as primary pattern | Editorial modules, pinned scroll storytelling, SVG path-draws |
| Simulated enquiry form | Production lead pipeline: zod v4 validation, honeypot, rate limit, webhook + JSONL persistence |
| Basic reveal animations | Motion system: scroll progress, parallax, reveals, custom cursor (all reduced-motion aware) |
| Light mode only | Fully art-directed light/dark theme system |
| Hard-coded content | Content-driven UI from typed data models (`src/data/`, `src/types/`) |

Everything deleted or replaced from V1 is documented in `prod.md` §5.3 (three-scene consolidation) and the archived V2 plan.

---

**Do not expand this document.** V1 details only matter historically; current truth lives in `prod.md`.
