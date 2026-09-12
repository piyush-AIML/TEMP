import { describe, expect, it } from 'vitest';
import {
  BREAKPOINTS,
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
  it('gives 80vh per station at 5 pillars (the designed value)', () => {
    expect(perStationVh(5)).toBe(80);
  });

  it('holds the act at ~400vh at 6 pillars', () => {
    expect(perStationVh(6) * 6).toBeCloseTo(400, 0);
  });

  it('clamps to the floor rather than shrinking stations into nothing', () => {
    expect(perStationVh(7)).toBe(WALK_MIN_VH);
    expect(perStationVh(8)).toBe(WALK_MIN_VH);
    expect(perStationVh(20)).toBe(WALK_MIN_VH);
  });

  it('never exceeds the ceiling for tiny pillar counts', () => {
    expect(perStationVh(1)).toBe(WALK_MAX_VH);
    expect(perStationVh(3)).toBe(WALK_MAX_VH);
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
    expect(branchFor(BREAKPOINTS.md)).toBe('tablet');
    expect(branchFor(BREAKPOINTS.md - 1)).toBe('mobile');
  });
});
