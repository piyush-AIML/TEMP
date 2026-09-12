import { describe, expect, it } from 'vitest';
import {
  BREAKPOINTS,
  CEILINGS,
  SCRUB,
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
   * window that left every assertion of the then-current suite green:
   *   WALK_BASE_VH in [400, 400.5)
   *   WALK_MIN_VH  in [400/7, 66.75)
   *   WALK_MAX_VH  in [80, 400/3]
   * "Then-current" is load-bearing, and the three did not share one suite: the
   * floor and ceiling windows were measured before `d1be7db`, whose suite had
   * nine `it()` blocks, while the base window was measured last, against eleven.
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

  /**
   * The band edges themselves, pinned to spec §8's literals (≥1024px desktop,
   * 640–1023px tablet, below that mobile). The three branch cases above do not
   * pin them — they only bracket them: `branchFor(1024)` with `branchFor(1023)`
   * holds for any `lg` in (1023, 1024], and `branchFor(640)` with
   * `branchFor(639)` for any `sm` in (639, 640]. Integer values make each
   * bracket a single value today, but only by accident of the neighbouring
   * widths — tidying one of those literals would silently un-pin both
   * constants and re-open the class of bug the `WALK_*` pins exist to close.
   */
  it('pins the breakpoint band edges to spec §8 (640 and 1024)', () => {
    expect(BREAKPOINTS.sm).toBe(640);
    expect(BREAKPOINTS.lg).toBe(1024);
  });

  it('agrees with the breakpoint constants it is built from', () => {
    expect(branchFor(BREAKPOINTS.lg)).toBe('desktop');
    expect(branchFor(BREAKPOINTS.sm)).toBe('tablet');
    expect(branchFor(BREAKPOINTS.sm - 1)).toBe('mobile');
  });
});

describe('SCRUB and the timing ceilings', () => {
  /**
   * Spec §10.2's table, pinned as literals — same shape and same reasoning as
   * the `WALK_*` pins above. The consumers are GSAP configuration in Tasks 5–7
   * and Stage 2's acts, which this stage cannot execute: there is no local
   * runtime here, so the suite is the only automated gate and the owner's
   * visual QA the only other detector. A wrong `SCRUB` or a wrong ceiling
   * changes how the whole walk feels and fails nothing else.
   *
   * The `CEILINGS` pin restates what `scroll.ts` derives through
   * `durationMs(motion.duration.*)`, and that duplication is deliberate: do not
   * "fix" it by deleting the pin. Three of the four members are *derived* so
   * that `motion.ts` stays the single source for timing (spec §10.2) — which
   * means retuning `motion.duration.emphasis` moves `stationEnterMs` with it,
   * silently and by design, and a `0.5` there would ship a 500ms station
   * entrance against a spec that documents 400ms. Pinning the **documented
   * spec value** rather than the derivation is what makes such a retune fail
   * here, forcing the spec and the code to be reconciled together — the only
   * moment anyone would notice they had diverged. It is the `colors.ts` /
   * `globals.css` invariant again: one file is the test source, the other is
   * what ships.
   */
  it('pins SCRUB to spec §10.2 (scrub: 1)', () => {
    expect(SCRUB).toBe(1);
  });

  it('pins CEILINGS to spec §10.2 (80 / 400 / 700 / 160ms)', () => {
    // Whole-object rather than per-member, so an added or removed ceiling fails
    // here too: a new member with no spec value behind it is a question, not a
    // detail.
    expect(CEILINGS).toEqual({
      headlineStaggerMs: 80,
      stationEnterMs: 400,
      ribbonDrawMs: 700,
      uiFeedbackMaxMs: 160,
    });
  });
});
