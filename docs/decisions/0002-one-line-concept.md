# 0002 — The "One Line" concept: retire the orbit, promote the drawn path

**Date:** 2026-09-12
**Status:** Accepted — design approved, implementation in progress

## Context

The hero contained a WebGL scene of five orbiting nodes with connectors. Immediately below it,
the `Ecosystem` section rendered a *second* orbital map in SVG, and below that `ProgrammeExplorer`
narrated the same five programmes a third time, pinned over 550vh.

The owner's report: the change from the hero to the five-pillar sections *"feels very broken and not
smooth."* The diagnosis is that it is not a timing bug — it is a **vocabulary switch**. The first
three sections say the same thing in three different visual languages, and the hero's floating
system connects to nothing.

The decisive evidence was in the project's own documentation: the master doc's visual-metaphor table
lists **Path** as the first element ("Progress, learning journeys, movement"), and the rest of the
site obeys it — `StudentJourney`, `Methodology`, `ProgrammeGraphic`, `EcosystemGraphic` and
`PathLines` all draw paths and nodes. **The hero was the only section not speaking the documented
primary metaphor.**

## Decision

Retire the orbit scene. Promote the drawn path from a repeated motif to the page's connective
tissue, and make the hero its **origin** rather than a container holding a decorative scene.

One continuous strand enters the hero, forks into the five pillars, carries the learner's journey,
and converges into the CTA. The seam between acts is guaranteed by an entry/exit anchor contract,
with `assertContinuity` proving each act starts exactly where the previous one ended.

**Identity lives in nodes and typography — the strand stays one brand colour.** A five-hue gradient
along the strand was the tempting alternative and is rejected: it reads as a chart legend, not a
premium system.

## Consequences

- 12 homepage sections become **5 acts**; ~20 screens become ~11.5; 24 `card-surface` boxes become
  **zero** on the landing page.
- The entire `src/components/educraft/three/` tree (13 files) is retired — it was reachable **only**
  from `landing/Hero.tsx`, verified by grep. `three`, `@react-three/fiber`, `@react-three/drei` and
  `@types/three` come out, **and with them the React `~19.2.8` pin**, which exists solely because
  R3F declares `peer react: ">=19 <19.3"`.
- Removing WebGL is a net JS win even after adding GSAP and Motion, since the hero shipped a
  `dynamic({ ssr: false })` bundle.
- On mobile the strand uses native `overflow-x` snap, never a pinned track on touch — a pinned
  horizontal track is how vertical page scroll gets broken.

## What it cost if wrong

The largest single bet in the redesign. If the strand reads as decoration rather than connection,
the homepage loses its signature visual and the five sections lose their organising device. Mitigated
by phasing: Stage 1 ships only the geometry and the palette, so the concept can be judged on real
scroll behaviour before the acts are built. Reversal is expensive — the acts are built on it.
