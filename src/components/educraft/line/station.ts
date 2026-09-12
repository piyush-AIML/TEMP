import type { Anchor } from './anchors';

/**
 * Station geometry — pure functions of the pillar count
 * (Landing-Redesign-Plan.md §3.1, §7.3).
 *
 * Deliberately **functions of n, not constants**: the walk must survive a
 * sixth or seventh pillar with no rewrite.
 *
 * **Frames.** `stationPositions` x is **track-local**: station `i` sits `i`
 * track-widths from the first, one station per viewport. `anchors.ts` x/y are a
 * different frame — **act-local**. `pathFor` (Task 6) does not reconcile them:
 * it is frame-agnostic, taking two points in a single frame
 * (`trackX = actIndex + actLocalX` needs an act identity its signature never
 * carries). The caller in Stage 2, which knows which act a point belongs to,
 * supplies both endpoints in one frame.
 *
 * `drawAt` *provides* the scale-by-pillar-count replacement for the shipped
 * Methodology section's hardcoded `/ 5.5` divisor, which cannot scale. That old
 * formula is still live at `Methodology.tsx:29` and nothing imports `drawAt`
 * yet, so the draw does **not** scale with pillar count today — this module is
 * the replacement, not the replacement applied. Stage 2 wires it in.
 */

/** Baseline y for the horizontal walk, in viewport heights. */
const WALK_BASELINE_Y = 0.5;

/**
 * Clamps into [0, 1]. Local rather than imported: the one in
 * `src/hooks/useScrollProgress.ts` is in a `'use client'` React module, and
 * this module is deliberately DOM-free so it can be tested in the node
 * environment.
 */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * One anchor per pillar, spread evenly across the horizontal track.
 * Station `i` sits at `x = i` (track-widths) so `x` maps directly to a
 * `-i * 100vw` translate. Every station shares the walk baseline: the walk is
 * horizontal, so only `x` is a function of the pillar count.
 *
 * A non-positive count yields no stations, and there is deliberately no
 * `pillarCount <= 0` guard here to express that: `Array.from` already coerces a
 * negative or `NaN` `length` to zero, so such a guard would be unobservable —
 * no test could distinguish it from its absence. The behaviour is pinned by
 * test instead.
 */
export function stationPositions(pillarCount: number): Anchor[] {
  return Array.from({ length: pillarCount }, (_, i) => ({
    x: i,
    y: WALK_BASELINE_Y,
  }));
}

/**
 * How lit station `index` is at a given overall walk `progress` (0..1).
 *
 * The shape is `clamp01(pillarCount * progress - index)`.
 *
 * **Derivation.** Each station owns an equal slice of the walk, of width
 * `1 / pillarCount`, so station `i`'s slice is `[i / n, (i + 1) / n]`. The
 * fraction of *its own slice* the walk has covered at `progress` is therefore
 *
 *     (progress - i / n) / (1 / n)  =  n * progress - i
 *
 * clamped to 0..1. Three properties follow, and between them they force this
 * shape: station 0 starts drawing at `progress = 0`; station `i` starts drawing
 * exactly at `progress = i / n`, so each segment draws as the walk arrives at
 * it (spec.md §Act 1); and station `n - 1` completes at `progress = 1`, as does
 * every other station. Spacing the stations over `1 / (n - 1)` instead would
 * put the last station's window at `[1, n / (n - 1)]` — outside the walk — so
 * the final segment would never draw at any progress. That is why the divisor
 * is `n` and not `n - 1`.
 *
 * A consequence worth knowing: the fractions sum to `progress * n`, so the
 * drawn fraction of the whole strand equals `progress`.
 *
 * `pillarCount === 1` has no travel to distribute, and the formula degenerates
 * to `clamp01(progress)` — the whole walk lighting the only station. That is
 * the correct answer rather than a case to branch on, and it is pinned by test.
 *
 * Worked example: `drawAt(0.5, 2, 5)` is `5 * 0.5 - 2 = 0.5`, half of station
 * 2's slice `[0.4, 0.6]`. `progress` outside 0..1 saturates; the result is
 * always in 0..1, so `1 - drawAt(...)` is always a valid `strokeDashoffset`.
 *
 * **Guards.** An unusable count returns 0 rather than propagating, matching
 * `perStationVh` in `src/design/scroll.ts`. The guard tests the *quotient*, not
 * the arguments, because guarding the arguments only catches `NaN` inputs — a
 * product that is `NaN` any other way (`Infinity * 0`, `n * NaN`) would slip
 * through and freeze the rail, since a browser silently rejects a `NaN` dash
 * offset. `index` is clamped into `[0, n - 1]` before the product is formed: an
 * act that derives its active station as `Math.floor(progress * n)` returns
 * exactly `n` at `progress === 1`, and an unclamped index would freeze the rail
 * `1 / n` short with nothing to show for it.
 */
export function drawAt(progress: number, index: number, pillarCount: number): number {
  if (pillarCount <= 0) return 0;
  const station = Math.min(Math.max(index, 0), pillarCount - 1);
  const drawn = pillarCount * progress - station;
  if (Number.isNaN(drawn)) return 0;
  return clamp01(drawn);
}
