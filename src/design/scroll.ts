/**
 * Scroll calibration — pure, DOM-free, testable (Landing-Redesign-Plan.md §10.1).
 * The single source of truth for how long each act is and which mechanic each
 * breakpoint gets. Nothing here touches the DOM, React, or GSAP, so it is safe
 * to import from anywhere including the Vitest node environment.
 */

import { durationMs } from './motion';

/**
 * The spec §8 band edges: `>= lg` is desktop, `sm <= w < lg` is tablet, below
 * `sm` is mobile. They agree with the Tailwind ladder at `lg` and at `sm` — note
 * `tokens.ts` holds the canonical *layout* ladder, whose `md` is 768, a
 * different question from this one.
 *
 * Deliberately NOT derived from `tokens.ts`: importing would let a future
 * layout edit silently move the tablet branch.
 */
export const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
} as const;

export type ScrollBranch = 'desktop' | 'tablet' | 'mobile';

/**
 * The five-pillar walk targets roughly `WALK_BASE_VH` of total scroll, so the
 * act stays a constant ~4 screens regardless of pillar count. Stations shrink
 * as pillars are added and stop shrinking at `WALK_MIN_VH` — below that a
 * station cannot hold a headline, a tagline and two highlights at readable
 * pace. `WALK_MAX_VH` stops one or two pillars producing molasses.
 */
export const WALK_BASE_VH = 400;
export const WALK_MIN_VH = 60;
export const WALK_MAX_VH = 80;

/**
 * Vertical scroll distance granted to each pillar station, in viewport heights.
 *
 * An unusable count falls back to the ceiling rather than propagating: `NaN`
 * would otherwise flow into a ScrollTrigger `end` as a silent `NaN` scroll
 * length. The guard tests the *quotient*, not the argument, because guarding
 * the argument only catches a `NaN` input — an out-of-contract value that
 * divides to `NaN` would slip through. `Infinity` is deliberately NOT caught:
 * `400 / Infinity` is `0`, so it takes the ordinary path to the floor, which is
 * the right answer for an absurdly large count.
 */
export function perStationVh(pillarCount: number): number {
  if (pillarCount <= 0) return WALK_MAX_VH;
  const ideal = WALK_BASE_VH / pillarCount;
  if (Number.isNaN(ideal)) return WALK_MAX_VH;
  return Math.min(WALK_MAX_VH, Math.max(WALK_MIN_VH, ideal));
}

/**
 * Which scroll mechanic a viewport gets (Landing-Redesign-Plan.md §8).
 * Desktop pins and scrubs horizontally; tablet deliberately does NOT (a pinned
 * horizontal track on a 768px viewport fights the browser's own gestures);
 * mobile uses native CSS overflow-snap, never a pinned track on touch.
 */
export function branchFor(widthPx: number): ScrollBranch {
  if (widthPx >= BREAKPOINTS.lg) return 'desktop';
  if (widthPx >= BREAKPOINTS.sm) return 'tablet';
  return 'mobile';
}

/**
 * GSAP ScrollTrigger scrub smoothing, in seconds. 1 gives the walk a weighted
 * feel without lagging behind the user's scroll.
 */
export const SCRUB = 1;

/**
 * Motion ceilings, in milliseconds. See Landing-Redesign-Plan.md §10.2.
 *
 * Three of the four are derived from the `motion.ts` duration tokens through
 * `durationMs`, so `motion.ts` stays the single source for timing and a token
 * change moves these with it. `headlineStaggerMs` is the exception and is a
 * standalone literal — see its own note.
 */
export const CEILINGS = {
  /**
   * Headline line stagger. Deliberately below the shortest duration token that
   * exists — `instant` (100ms) — because a per-line stagger has to read as one
   * motion rather than a sequence of separate ones; there is no token shorter
   * than `instant` to derive this from, so 80 is a standalone value.
   */
  headlineStaggerMs: 80,
  /** Station content entering — `motion.duration.emphasis`, 400ms. */
  stationEnterMs: durationMs('emphasis'),
  /** Journey ribbon draw — `motion.duration.reveal`, 700ms. */
  ribbonDrawMs: durationMs('reveal'),
  /** Any UI feedback must not exceed this — `motion.duration.fast`, 160ms. */
  uiFeedbackMaxMs: durationMs('fast'),
} as const;
