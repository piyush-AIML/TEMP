How the Educraft homepage (`/`, served by `src/app/(site)/page.tsx`) is built: its 12-section narrative arc and each section's signature interaction.

> **⚠️ SUPERSEDED 2026-09-12 by §26 (Landing Redesign).** The 12-section arc below is the **current shipped** state and remains accurate as a description of what is live — but it is no longer the design of record. §26 replaces it with **5 acts** and retires sections 01, 02, 03, 05, 06 and 11. Read §26 before changing anything here. The table is retained because it is the accurate "before" state and the source of the §26 diagnosis.

**Where the code lives:** the twelve components are in `src/components/educraft/landing/` — `Hero` · `Ecosystem` · `ProgrammeExplorer` · `WhyDifferent` · `StudentJourney` · `ProgrammeDeepDive` · `Impact` · `AudienceEntryPoints` · `Methodology` · `Testimonials` · `InsightsTeaser` · `FinalCTA`.

**Narrative arc:** **Understand → Explore → Trust → Imagine → Choose → Act.**

| # | Section | Signature interaction | Notes |
|---|---|---|---|
| 01 | `Hero` | Staged entrance (0→1700ms via `--hero-delay`); scroll-linked content rise + camera pull-back + node drift (`useScrollProgress` `'full'` mode) | Headline "Five paths. One learning ecosystem." WebGL hidden on mobile → SVG `Constellation` fallback. Bottom fade + scroll cue. |
| 02 | `Ecosystem` | Interactive SVG map: 5 nodes around a core, spokes draw on enter, hover/focus lights the connection + updates an `aria-live` right panel, click → programme page | Mobile: stacked cards. Default active = Learn. `data-cursor-label="Explore"`. |
| 03 | `ProgrammeExplorer` | 550vh pinned scroll story (5 × 110vh): keyed crossfade panel, `ProgrammeGraphic` visual, progress rail + top bar | Mobile: horizontal snap cards. Uses `'full'` mode. |
| 04 | `WhyDifferent` | Sticky left statement, numbered differentiators (01–05) | |
| 05 | `StudentJourney` | 552vh pinned (6 × 92vh): path self-draws (`strokeDashoffset = 1-progress`), milestones light with icons | Mobile: vertical timeline. **Must never gain `overflow-hidden` on the section — breaks sticky pinning.** |
| 06 | `ProgrammeDeepDive` | Tabbed spotlight: curriculum modules, 5-step method, outcomes, proof line, CTAs | Client tab state, data-driven. |
| 07 | `Impact` | Outcome chain Confidence→Engagement→Skill→Readiness (numbered cards + arrows), structural facts, "how we build evidence" (5 pillars) | Qualitative by design. |
| 08 | `AudienceEntryPoints` | Three doors — schools=indigo, parents=teal, students=gold → audience pages | |
| 09 | `Methodology` | Path-draw, calibrated pacing: `'visible'` mode, `draw = clamp01(progress * 1.1)`, node *i* lights at `((i+0.08)/5.5)*1.1` — completes ~84% through visible scroll | User-calibrated: the 1.1× tuning fixed the draw lagging behind scroll. |
| 10 | `Testimonials` | Editorial: 1 large primary quote (parallax drift) + 2 supporting. No carousel, no autoplay | Content is SEED — a launch blocker, see `docs/platform/blockers.md`. |
| 11 | `InsightsTeaser` | 3 latest articles (category, reading time, date) | |
| 12 | `FinalCTA` | Indigo close, SVG atmosphere on the existing single canvas (no second WebGL context), magnetic gold CTA | |

**The `overflow-hidden` rule in section 05 is a general engineering constraint, not a per-section note:** an ancestor's `overflow-hidden` becomes the sticky element's scroll box, so pinned sections (`StudentJourney`, `ProgrammeExplorer`) must keep section-level overflow visible and handle overflow only on the sticky inner element. This is the source of the fixed-bug ledger entry "Student Journey blank zone after stage 2" in `docs/platform/history.md`.

**What the redesign retires here** (per §26): sections 01, 02, 03, 05, 06 and 11 — the WebGL orbit hero, the SVG orbital `Ecosystem` map and the 550vh `ProgrammeExplorer` were the three that said the same thing in three visual languages. §26 carries the measured diagnosis and the 5-act replacement.
