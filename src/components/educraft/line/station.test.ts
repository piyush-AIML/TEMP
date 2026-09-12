import { describe, expect, it } from 'vitest';
import { drawAt, stationPositions } from './station';

/**
 * Station geometry. Source: Landing-Redesign-Plan.md §3.1 and §10.1.
 *
 * These are pure functions of the pillar count — deliberately not constants —
 * because the walk must survive a sixth or seventh pillar without a rewrite.
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

  it('starts at x=0 and ends at x=n-1 track-widths (one station per viewport)', () => {
    const positions = stationPositions(5);
    expect(positions[0].x).toBe(0);
    expect(positions[4].x).toBe(4);
  });

  it('keeps every station on the same baseline y', () => {
    const ys = stationPositions(6).map((p) => p.y);
    expect(new Set(ys).size).toBe(1);
  });

  it('handles a single pillar without dividing by zero', () => {
    expect(stationPositions(1)).toEqual([{ x: 0, y: expect.any(Number) }]);
  });

  it('handles zero pillars', () => {
    expect(stationPositions(0)).toEqual([]);
  });
});

describe('drawAt', () => {
  it('is 0 at the very start of the walk', () => {
    expect(drawAt(0, 0, 5)).toBe(0);
  });

  it('fully lights a station once the walk has passed its slice', () => {
    // Station 2 of 5 owns the slice [0.4, 0.6), so it is complete at 0.6.
    expect(drawAt(3 / 5, 2, 5)).toBeCloseTo(1, 6);
  });

  it('is partially drawn mid-slice', () => {
    // Halfway through station 2's slice: 0.5 / 0.6.
    expect(drawAt(0.5, 2, 5)).toBeCloseTo(0.833, 3);
  });

  it('is fully lit for every station once the walk completes', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(drawAt(1, i, 5)).toBe(1);
    }
  });

  it('never returns a value outside 0..1', () => {
    for (const p of [-1, -0.5, 0, 0.3, 0.7, 1, 1.5]) {
      for (let i = 0; i < 5; i += 1) {
        const value = drawAt(p, i, 5);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it('scales with pillar count instead of a hardcoded divisor', () => {
    // The shipped Methodology section hardcodes `/ 5.5`, which cannot scale.
    expect(drawAt(1, 3, 7)).toBe(1);
    expect(drawAt(1, 0, 1)).toBe(1);
    expect(drawAt(0.5, 0, 1)).toBeCloseTo(0.5, 6);
  });

  it('handles a zero or negative pillar count without dividing by zero', () => {
    expect(drawAt(0.5, 0, 0)).toBe(0);
    expect(drawAt(0.5, 2, -3)).toBe(0);
  });
});
