import type { Anchor } from './anchors';

/**
 * Station geometry — pure functions of the pillar count
 * (Landing-Redesign-Plan.md §3.1, §7.3).
 *
 * Deliberately **functions of n, not constants**: the walk must survive a
 * sixth or seventh pillar with no rewrite. `drawAt` also replaces the shipped
 * Methodology section's hardcoded `/ 5.5` divisor, which cannot scale.
 */

/** Baseline y for the horizontal walk, in viewport heights. */
const WALK_BASELINE_Y = 0.5;

/**
 * One anchor per pillar, spread evenly across the horizontal track.
 * Station `i` sits at `x = i` (track-widths) so `x` maps directly to a
 * `-i * 100vw` translate.
 */
export function stationPositions(pillarCount: number): Anchor[] {
  if (pillarCount <= 0) return [];
  return Array.from({ length: pillarCount }, (_, i) => ({
    x: i,
    y: WALK_BASELINE_Y,
  }));
}

/**
 * How lit station `index` is at a given overall walk `progress` (0..1).
 *
 * Each station owns an equal slice of the walk, `[index / pillarCount,
 * (index + 1) / pillarCount)`, and is complete at the **end** of that slice:
 * `drawAt((index + 1) / pillarCount, index, pillarCount)` is 1. The value is
 * the fraction of its own slice the walk has covered, so the draw keeps pace
 * with the station the user is reading.
 */
export function drawAt(progress: number, index: number, pillarCount: number): number {
  if (pillarCount <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  const stationEnd = (index + 1) / pillarCount;
  if (stationEnd <= 0) return 0;
  return Math.min(1, clamped / stationEnd);
}
