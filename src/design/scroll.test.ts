import { describe, expect, it } from 'vitest';
import {
  BREAKPOINTS,
  WALK_BASE_VH,
  WALK_MAX_VH,
  WALK_MIN_VH,
  branchFor,
  perStationVh,
} from './scroll';

/**
 * Scroll calibration. Source: Landing-Redesign-Plan.md §7.3 and §8.
 *
 * `perStationVh` is the formula that keeps the five-pillar act a constant
 * ~4 screens tall no matter how many pillars exist — the spec's answer to
 * "what happens when a sixth pillar arrives".
 */

describe('perStationVh', () => {
  /**
   * The calibration constants themselves, pinned to literals. Without this the
   * floor and ceiling cases below compare `perStationVh` against the very
   * constant under test, so each moves with the constant and pins nothing.
   *
   * Measured against the pre-pin test, every one of the three had a non-zero
   * window that left all eleven assertions green:
   *   WALK_BASE_VH in [400, 400.5)
   *   WALK_MIN_VH  in [400/7, 66.75)
   *   WALK_MAX_VH  in [80, 400/3]
   * The base's top edge is 400 + 0.5 because `toBeCloseTo(400, 0)` tolerates
   * ±0.5 — the same slack that puts the floor's top edge at 66.75 rather than
   * 400/6. A wrong value anywhere in any of those windows passed the whole
   * suite, so the literals below are load-bearing: do not relax them back to
   * comparisons against the constants.
   */
  it('pins the calibration constants to spec §7.3 (400vh base, 60vh floor, 80vh ceiling)', () => {
    expect(WALK_BASE_VH).toBe(400);
    expect(WALK_MIN_VH).toBe(60);
    expect(WALK_MAX_VH).toBe(80);
  });

  it('gives 80vh per station at 5 pillars (the designed value)', () => {
    expect(perStationVh(5)).toBe(80);
  });

  it('holds the act at ~400vh at 6 pillars', () => {
    expect(perStationVh(6) * 6).toBeCloseTo(400, 0);
  });

  it('clamps to the floor rather than shrinking stations into nothing', () => {
    // Literal first, then the constant: 60 is the calibration, `WALK_MIN_VH` is
    // the name it ships under, and both have to be right.
    expect(perStationVh(7)).toBe(60);
    expect(perStationVh(8)).toBe(60);
    expect(perStationVh(20)).toBe(60);
    expect(perStationVh(7)).toBe(WALK_MIN_VH);
    expect(perStationVh(8)).toBe(WALK_MIN_VH);
    expect(perStationVh(20)).toBe(WALK_MIN_VH);
  });

  it('never exceeds the ceiling for tiny pillar counts', () => {
    expect(perStationVh(1)).toBe(80);
    expect(perStationVh(3)).toBe(80);
    expect(perStationVh(1)).toBe(WALK_MAX_VH);
    expect(perStationVh(3)).toBe(WALK_MAX_VH);
  });

  it('falls back to the ceiling for NaN, and to the floor for a huge count', () => {
    // The guard exists so a bad count can never become a silent NaN scroll
    // length in a ScrollTrigger `end`. It tests the quotient, so it catches
    // both a NaN input and any input that divides to NaN — the `undefined` case
    // below is the one guarding the argument alone would have missed.
    // `Infinity` deliberately does NOT take that path: an absurdly large count
    // is the floor's job, not the ceiling's, so catching it with
    // `!Number.isFinite` would be a regression.
    expect(perStationVh(Number.NaN)).toBe(WALK_MAX_VH);
    expect(perStationVh(Number.NaN)).toBe(80);
    // @ts-expect-error — out-of-contract input, deliberately bypassing the type
    // to exercise the runtime guard a JS caller could reach.
    expect(perStationVh(undefined)).toBe(80);
    expect(perStationVh(Number.POSITIVE_INFINITY)).toBe(60);
    expect(perStationVh(1e9)).toBe(60);
  });

  it('is monotonic non-increasing as pillars are added', () => {
    for (let n = 2; n < 12; n += 1) {
      expect(perStationVh(n + 1)).toBeLessThanOrEqual(perStationVh(n));
    }
  });
});

describe('branchFor', () => {
  it('selects the desktop branch at and above 1024px', () => {
    expect(branchFor(1024)).toBe('desktop');
    expect(branchFor(1440)).toBe('desktop');
  });

  it('selects the tablet branch between 640 and 1023px', () => {
    expect(branchFor(640)).toBe('tablet');
    expect(branchFor(1023)).toBe('tablet');
  });

  it('selects the mobile branch below 640px', () => {
    expect(branchFor(639)).toBe('mobile');
    expect(branchFor(390)).toBe('mobile');
  });

  it('agrees with the breakpoint constants it is built from', () => {
    expect(branchFor(BREAKPOINTS.lg)).toBe('desktop');
    expect(branchFor(BREAKPOINTS.sm)).toBe('tablet');
    expect(branchFor(BREAKPOINTS.sm - 1)).toBe('mobile');
  });
});
