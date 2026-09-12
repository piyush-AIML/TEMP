/**
 * Scroll calibration — pure, DOM-free, testable (Landing-Redesign-Plan.md §10.1).
 * The single source of truth for how long each act is and which mechanic each
 * breakpoint gets. Nothing here touches the DOM, React, or GSAP, so it is safe
 * to import from anywhere including the Vitest node environment.
 */

/** Tailwind-aligned breakpoints. Keep in sync with globals.css if it gains a custom screen. */
export const BREAKPOINTS = {
  md: 640,
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

/** Vertical scroll distance granted to each pillar station, in viewport heights. */
export function perStationVh(pillarCount: number): number {
  if (pillarCount <= 0) return WALK_MAX_VH;
  const ideal = WALK_BASE_VH / pillarCount;
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
  if (widthPx >= BREAKPOINTS.md) return 'tablet';
  return 'mobile';
}

/**
 * GSAP ScrollTrigger scrub smoothing, in seconds. 1 gives the walk a weighted
 * feel without lagging behind the user's scroll.
 */
export const SCRUB = 1;

/**
 * Motion ceilings, in milliseconds, expressed as multiples of the `motion.ts`
 * duration tokens so there is still one source of truth for timing.
 * See Landing-Redesign-Plan.md §10.2.
 */
export const CEILINGS = {
  /**
   * Headline line stagger. Deliberately below the shortest duration token that
   * exists — `instant` (100ms) — because a per-line stagger has to read as one
   * motion rather than a sequence of separate ones; there is no token shorter
   * than `instant` to derive this from, so 80 is a standalone value.
   */
  headlineStaggerMs: 80,
  /** Station content entering — `motion.duration.emphasis` * 1000. */
  stationEnterMs: 400,
  /** Journey ribbon draw — `motion.duration.reveal` * 1000. */
  ribbonDrawMs: 700,
  /** Any UI feedback must not exceed this — `motion.duration.fast` * 1000. */
  uiFeedbackMaxMs: 160,
} as const;
