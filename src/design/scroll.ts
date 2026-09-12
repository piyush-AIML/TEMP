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
 * The walk's pinned run, in pixels: one dwell per station, from
 * `perStationVh`, transcribed against the live viewport height.
 *
 * This is both the pin's `end` distance and the range the rail's targets are
 * scaled by: `stationScrollTarget` multiplies it by `i/n`. (Its divisor there is
 * `pillarCount` — this is the multiplicand.) That is why it is one function:
 * computed in two places, a change to the dwell formula could move the pin
 * without moving the rail's targets, and every button would land a fixed
 * fraction of the walk away from the station it names.
 */
export function walkPinRangePx(viewportHeightPx: number, pillarCount: number): number {
  return (viewportHeightPx * perStationVh(pillarCount) * pillarCount) / 100;
}

/**
 * Where a rail button should put the page for station `index`.
 *
 * The progress rail is N real `<button>`s (spec §9), and on desktop the track is
 * `transform`-translated rather than scrolled — `scrollIntoView` cannot reach a
 * station inside it, so the button must move the page instead.
 *
 * **Station `i` is centred at `i/n` of the pin — not at the midpoint of its own
 * dwell.** The track travels N viewports across the pin, one per dwell, and
 * station `i` sits at the centre of slot `i` in the track's own frame, so it
 * reaches the middle of the viewport exactly when the walk has covered `i`
 * viewports: `i/n` of the way. That is also the instant its own segment begins
 * to draw, since `drawAt(progress, i, n)` is `0` at `i/n` and `1` by the end of
 * the dwell — so the strand's drawn tip arrives at each station as that station
 * centres.
 *
 * The planning pass first recorded `(i + 0.5)/n` here — the dwell's midpoint —
 * which disagreed with the tween by up to `0.5/n` of the pin, 40vh at five
 * pillars. Task 6 carries the ruling that removed the disagreement.
 *
 * `pinStartY` is the page offset of the pin's start and `pinRangeY` its length,
 * both in pixels.
 *
 * **Unusable input returns `pinStartY`, matching `perStationVh` and `drawAt`:**
 * a count below 1, a non-finite index, or a range that is not a positive finite
 * length. Each would otherwise reach `window.scrollTo` as a silent no-op — a
 * `NaN` or an infinite `top` is ignored by the browser and the button does
 * nothing, with no error — or, for a negative range, scroll *backwards* out of
 * the pin. The index needs its own finiteness test because `Math.min`/`Math.max`
 * propagate `NaN` rather than rejecting it.
 */
export function stationScrollTarget(
  index: number,
  pillarCount: number,
  pinStartY: number,
  pinRangeY: number
): number {
  if (pillarCount <= 0) return pinStartY;
  if (!Number.isFinite(index)) return pinStartY;
  if (!Number.isFinite(pinRangeY) || pinRangeY <= 0) return pinStartY;
  const station = Math.min(Math.max(index, 0), pillarCount - 1);
  return pinStartY + (station / pillarCount) * pinRangeY;
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
 * The desktop branch, derived from `BREAKPOINTS` so the breakpoint exists once.
 * `branchFor` is the runtime decision; this is the same decision expressed as a
 * media query, for `gsap.matchMedia()`.
 *
 * **A media query is not a width comparison.** It measures CSS pixels with the
 * scrollbar excluded, while `window.innerWidth` includes it, so a JS branch must
 * `matchMedia()` this (or `MOBILE_QUERY`) rather than compare `innerWidth`: the
 * two can disagree by a scrollbar width at the boundary, and the JS would then
 * pick a mechanic the CSS layout is not in.
 *
 * **No tablet query exists, deliberately.** The pin and the scrubbed track are
 * the desktop branch; tablet and mobile are what happens when this query does
 * not match, so a tablet query would have no reader — and an export with no
 * consumer is the same defect as a test that pins nothing. `MOBILE_QUERY` is the
 * other half of the pair, because the rail has to tell mobile from tablet; the
 * boundaries themselves stay in `branchFor`, which the Stage 1 tests already
 * pin on all three sides.
 */
export const DESKTOP_QUERY = `(min-width: ${BREAKPOINTS.lg}px)`;

/**
 * The mobile branch, derived from `BREAKPOINTS` so the edge exists once. It
 * pairs with `DESKTOP_QUERY` and leaves tablet as the band that matches
 * neither — which is why two queries can name §8's three branches.
 *
 * **Consumed by Task 6's rail handler**, which picks a click behaviour per
 * branch: desktop scrolls the page, tablet scrolls a stacked station into view,
 * mobile scrolls the native snap container. That is what needs mobile told
 * apart from tablet — `gsap.matchMedia()` only ever asked about desktop. It is
 * `matchMedia()`d rather than compared against `window.innerWidth`, for the
 * CSS-pixel reason in `DESKTOP_QUERY`'s note above.
 *
 * The edge is `BREAKPOINTS.sm - 1`, not `sm`: `branchFor` is mobile strictly
 * below `sm`, and a CSS `max-width` is inclusive. Deriving the subtraction keeps
 * §8's mobile edge in one place — a literal `639px` here would be a second copy
 * of it, which is the drift this pair exists to prevent.
 */
export const MOBILE_QUERY = `(max-width: ${BREAKPOINTS.sm - 1}px)`;

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
