import { describe, expect, it } from 'vitest';
import { drawAt, stationPositions } from './station';

/**
 * Station geometry. Source: Landing-Redesign-Plan.md §3.1 and §10.1.
 *
 * These are pure functions of the pillar count — deliberately not constants —
 * because the walk must survive a sixth or seventh pillar without a rewrite.
 * That reason is why several assertions below pin `n = 7` and not only `n = 5`:
 * an `n = 5`-only suite cannot tell a function of the pillar count from a
 * five-shaped constant. The values asserted here are hand-derived from the
 * formulas, not read back off an implementation.
 *
 * Off-centre indices are used deliberately for the per-slice assertions. At
 * `n = 5`, `index = 2` is the exact centre, where the two candidate shapes
 * `(index + 1) / n` and `index / n` coincide — so a centre-only suite cannot
 * tell "draws to the end of its slice" from "draws from the start of its
 * slice".
 */

describe('stationPositions', () => {
  it('returns one anchor per pillar', () => {
    expect(stationPositions(5)).toHaveLength(5);
    expect(stationPositions(7)).toHaveLength(7);
  });

  it('spreads stations evenly across the track', () => {
    const positions = stationPositions(5);
    const gaps = positions.slice(1).map((p, i) => p.x - positions[i].x);
    for (const gap of gaps) {
      expect(gap).toBeCloseTo(gaps[0], 6);
    }
  });

  it('puts station i at x = i, one station per viewport', () => {
    expect(stationPositions(5).map((p) => p.x)).toEqual([0, 1, 2, 3, 4]);
  });

  it('keeps the x spacing a function of n, not a five-shaped constant', () => {
    // The module exists to survive a sixth or seventh pillar with no rewrite.
    // Asserting the length alone does not check that: `x: i * n / 5` and
    // `x: i * (5 / n)` both give seven stations with the wrong spacing.
    expect(stationPositions(7).map((p) => p.x)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('starts at x=0 and ends at x=n-1 track-widths (one station per viewport)', () => {
    const positions = stationPositions(5);
    expect(positions[0].x).toBe(0);
    expect(positions[4].x).toBe(4);
  });

  it('keeps every station on the same baseline y', () => {
    const ys = stationPositions(6).map((p) => p.y);
    expect(new Set(ys).size).toBe(1);
  });

  it('sits on the 0.5 walk baseline', () => {
    // The literal, not just "all equal": a uniform y is equally consistent with
    // 0, -1, NaN or 1e9. Nothing else in the suite can see this value.
    expect(stationPositions(5).map((p) => p.y)).toEqual([0.5, 0.5, 0.5, 0.5, 0.5]);
  });

  it('returns the single station at the track origin', () => {
    // A literal `y`, not `expect.any(Number)`: `typeof NaN === 'number'`, so
    // `any(Number)` matches a NaN baseline and asserts nothing about it.
    expect(stationPositions(1)).toEqual([{ x: 0, y: 0.5 }]);
  });

  it('returns no stations for a non-positive count', () => {
    expect(stationPositions(0)).toEqual([]);
    expect(stationPositions(-3)).toEqual([]);
  });
});

describe('drawAt', () => {
  it('is 0 at the very start of the walk', () => {
    expect(drawAt(0, 0, 5)).toBe(0);
    expect(drawAt(0, 4, 5)).toBe(0);
  });

  it('starts drawing a station exactly as the walk arrives at it', () => {
    // Station i owns the slice [i/n, (i+1)/n], so it is 0 at i/n and 1 at
    // (i+1)/n — each segment draws as the walk reaches it (spec.md, Act 1).
    expect(drawAt(1 / 5, 1, 5)).toBe(0);
    expect(drawAt(3 / 5, 3, 5)).toBe(0);
    // Before its slice it is still 0.
    expect(drawAt(0.1, 1, 5)).toBe(0);
  });

  it('fully lights a station once the walk has passed its slice', () => {
    // Station 2 of 5 owns the slice [0.4, 0.6), so it is complete at 0.6.
    expect(drawAt(3 / 5, 2, 5)).toBeCloseTo(1, 6);
    // Off-centre, and the same statement: stations 1 and 3 complete at 0.4 and
    // 0.8. Values are exact, so `toBe` rather than `toBeCloseTo`.
    expect(drawAt(2 / 5, 1, 5)).toBe(1);
    expect(drawAt(4 / 5, 3, 5)).toBe(1);
  });

  it('is partially drawn mid-slice, in proportion to its own slice', () => {
    // Half of station 0's slice [0, 0.2]; half of station 1's [0.2, 0.4]; half
    // of station 4's [0.8, 1]. All off-centre indices — index 2 is the centre
    // at n = 5 and cannot distinguish the two candidate shapes.
    expect(drawAt(0.1, 0, 5)).toBe(0.5);
    expect(drawAt(0.3, 1, 5)).toBe(0.5);
    expect(drawAt(0.9, 4, 5)).toBe(0.5);
  });

  it('draws the last station through to the end of the walk', () => {
    // The failure this pins: spacing the stations over 1/(n-1) would put the
    // last station's window at [1, n/(n-1)] — outside the walk — so the final
    // segment would never draw at any progress.
    expect(drawAt(0.9, 4, 5)).toBe(0.5);
    expect(drawAt(0.99, 4, 5)).toBeCloseTo(0.95, 10);
    expect(drawAt(1, 4, 5)).toBe(1);
  });

  it('is fully lit for every station once the walk completes', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(drawAt(1, i, 5)).toBe(1);
    }
  });

  it('draws exactly as much of the strand as the walk has covered', () => {
    // n equal slices, each drawn to its own fraction of a slice: the drawn
    // fraction of the whole strand is the progress itself.
    for (const p of [0, 0.1, 0.35, 0.5, 0.777, 1]) {
      const lit = Array.from({ length: 5 }, (_, i) => drawAt(p, i, 5)).reduce((a, b) => a + b, 0);
      expect(lit / 5, `progress ${p}`).toBeCloseTo(p, 10);
    }
  });

  it('never returns a value outside 0..1', () => {
    // Out-of-range indices in both directions are swept too: the 0..1 contract
    // is what makes `1 - drawAt(...)` a usable stroke dash offset, and a
    // negative index is the reachable way to break it.
    for (const p of [-1, -0.5, 0, 0.3, 0.7, 1, 1.5, Infinity, -Infinity]) {
      for (const i of [-3, -1, 0, 1, 2, 3, 4, 5, 99]) {
        const value = drawAt(p, i, 5);
        expect(value, `drawAt(${p}, ${i}, 5)`).toBeGreaterThanOrEqual(0);
        expect(value, `drawAt(${p}, ${i}, 5)`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('treats an out-of-range index as the nearest real station', () => {
    // An act that derives its active station as Math.floor(progress * n)
    // returns exactly n at progress 1. Unclamped, that lands 1/n short of the
    // end and freezes the rail there with no error.
    expect(drawAt(1, 5, 5)).toBe(1);
    expect(drawAt(1, 99, 5)).toBe(1);
    expect(drawAt(0.9, 9, 5), 'above range behaves like the last station').toBe(drawAt(0.9, 4, 5));
    expect(drawAt(0.1, -1, 5), 'below range behaves like the first station').toBe(drawAt(0.1, 0, 5));
  });

  it('draws the whole walk through a lone pillar, with no travel to distribute', () => {
    // n = 1: the formula degenerates to clamp01(progress) — the single station
    // is the whole walk, so it is exactly as lit as the walk is far along.
    expect(drawAt(0, 0, 1)).toBe(0);
    expect(drawAt(0.25, 0, 1)).toBe(0.25);
    expect(drawAt(0.5, 0, 1)).toBeCloseTo(0.5, 6);
    expect(drawAt(1, 0, 1)).toBe(1);
    // An index outside a one-station track still lands on station 0.
    expect(drawAt(0.5, 3, 1)).toBe(0.5);
  });

  it('scales with pillar count instead of a hardcoded divisor', () => {
    // The retired Methodology section hardcoded a `/ 5.5` divisor, which could
    // not scale; `drawAt` is the scale-by-n replacement, and Stage 2 wired the
    // caller in — the walk's `onUpdate` is where it draws now.
    expect(drawAt(1, 3, 7)).toBe(1);
    expect(drawAt(1, 6, 7)).toBe(1);
    // Off-centre, mid-slice, at n = 7: station 2 owns [2/7, 3/7].
    expect(drawAt(2.5 / 7, 2, 7)).toBe(0.5);
    expect(drawAt(1, 0, 1)).toBe(1);
    expect(drawAt(0.5, 0, 1)).toBeCloseTo(0.5, 6);
  });

  it('returns 0 rather than NaN for an unusable argument', () => {
    // A NaN would reach the DOM as `strokeDashoffset = 1 - NaN`, which the
    // browser silently rejects — the rail freezes with nothing in the console.
    expect(drawAt(NaN, 0, 5)).toBe(0);
    expect(drawAt(0.5, NaN, 5)).toBe(0);
    expect(drawAt(0.5, 0, NaN)).toBe(0);
    // `Infinity * 0` is NaN. Guarding the arguments would miss this; guarding
    // the product does not.
    expect(drawAt(0, 0, Infinity)).toBe(0);
  });

  it('handles a zero or negative pillar count without dividing by zero', () => {
    expect(drawAt(0.5, 0, 0)).toBe(0);
    expect(drawAt(0.5, 2, -3)).toBe(0);
  });
});
