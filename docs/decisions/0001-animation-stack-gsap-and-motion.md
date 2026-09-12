# 0001 — GSAP + Motion as the animation stack

**Date:** 2026-09-12
**Status:** Accepted (overrides a previously documented rule)

## Context

The site's motion was hand-rolled hooks (`useScrollProgress`, `useReveal`, `useParallax`), and
`TECH-STACK.md` stated plainly: *"Motion: Hand-rolled hooks — no GSAP."*

The root cause of the redesign's central complaint — that the homepage could not be made to feel
alive — turned out to be structural. `useScrollProgress` calls `setProgress` on every `rAF` tick,
re-rendering the whole component subtree each frame. No amount of tuning fixes that; scroll-linked
motion at 60fps needs to write styles directly to the DOM, not through React state.

## Decision

Adopt **GSAP 3.15 + ScrollTrigger + `@gsap/react`** for anything scrubbed or pinned, and **Motion
13.2** for anything discrete or state-driven. The owner explicitly lifted the "no GSAP" rule and the
broader "no new library" constraint.

The split is a rule, not a preference: **never both engines on the same property of the same
element.** Registration lives in exactly one module (`src/lib/gsap.ts`) because multiple
`registerPlugin` call sites cause double-registration warnings and ScrollTrigger instances that
survive hot reload.

## Consequences

- GSAP owns pinning, scrubbing, timelines and the horizontal walk. Motion owns enter/exit, layout
  transitions and micro-interactions.
- **Reduced motion can no longer be guaranteed in CSS.** Once GSAP drives, the CSS
  `prefers-reduced-motion` block in `globals.css` is bypassed, so every GSAP consumer must branch
  through `gsap.matchMedia()` and render the final state. This is a real regression in the
  simplicity of that guarantee and is the main ongoing cost.
- Easing reuses GSAP built-ins (`power3.out` ≈ `motion.easing.out`), documented rather than
  approximated, to avoid an easing-plugin dependency.

## What it cost if wrong

~60–75 KB gzipped of new dependencies, and a second animation mental model in the codebase. Reversal
is contained: the hand-rolled hooks survive and the dashboard still uses them, so the change is
scoped to the marketing surface.
