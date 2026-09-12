import { describe, expect, it } from 'vitest';
import { drawAt } from '@/components/educraft/line/station';
import {
  BREAKPOINTS,
  CEILINGS,
  DESKTOP_QUERY,
  MOBILE_QUERY,
  SCRUB,
  WALK_BASE_VH,
  WALK_MAX_VH,
  WALK_MIN_VH,
  branchFor,
  perStationVh,
  stationScrollTarget,
  walkPinRangePx,
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

describe('the desktop media query', () => {
  it('pins the exact string the Tailwind variant is aligned to', () => {
    expect(DESKTOP_QUERY).toBe('(min-width: 1024px)');
  });

  it('agrees with branchFor at its own boundary', () => {
    // If the query and `branchFor` drift, the CSS layout and the GSAP branch
    // disagree at a breakpoint: the visible failure is a pinned track with no
    // animation, or a stacked spine that translates sideways. The tablet and
    // mobile boundary is `branchFor`'s own, pinned in the Stage 1 tests.
    const desktopMin = Number(/min-width: (\d+)px/.exec(DESKTOP_QUERY)![1]);
    expect(desktopMin).toBe(BREAKPOINTS.lg);
    expect(branchFor(desktopMin), 'the query includes its own boundary').toBe('desktop');
    expect(branchFor(desktopMin - 1)).toBe('tablet');
  });
});

describe('the mobile media query', () => {
  it('pins the exact string the Tailwind variant is aligned to', () => {
    // The same band as Tailwind's `max-sm:` variant — `width < 40rem` — written
    // in whole CSS pixels. It is one below `sm` and not `sm` itself because
    // `branchFor` is mobile strictly below 640 while a CSS `max-width` includes
    // its own boundary.
    expect(MOBILE_QUERY).toBe('(max-width: 639px)');
  });

  it('agrees with branchFor at its own boundary', () => {
    // Same shape as the desktop query's, and the same failure if they drift:
    // the CSS layout and the rail's decision disagree at the breakpoint.
    const mobileMax = Number(/max-width: (\d+)px/.exec(MOBILE_QUERY)![1]);
    expect(mobileMax).toBe(BREAKPOINTS.sm - 1);
    expect(branchFor(mobileMax), 'the query includes its own boundary').toBe('mobile');
    expect(branchFor(mobileMax + 1)).toBe('tablet');
  });

  it('partitions with DESKTOP_QUERY, leaving the tablet band between them', () => {
    // The rail branches on this pair and treats "neither matches" as tablet, so
    // the two must not overlap — a width in both would run one branch's
    // mechanic over another's layout — and must not touch: a tablet band
    // collapsed to nothing would silently delete the branch whose behaviour is
    // the absence of the desktop setup, and so is written down nowhere else.
    const mobileMax = Number(/max-width: (\d+)px/.exec(MOBILE_QUERY)![1]);
    const desktopMin = Number(/min-width: (\d+)px/.exec(DESKTOP_QUERY)![1]);
    expect(mobileMax).toBeLessThan(desktopMin);
    expect(branchFor(mobileMax)).toBe('mobile');
    expect(branchFor(mobileMax + 1), 'the tablet band starts between them').toBe('tablet');
    expect(branchFor(desktopMin - 1)).toBe('tablet');
    expect(branchFor(desktopMin)).toBe('desktop');
  });
});

describe('stationScrollTarget', () => {
  it('targets the progress at which each station is centred', () => {
    // Five stations over a 400vh pin starting at 0: the track travels one
    // viewport per dwell, so station 0 centres at the pin's start and station 4
    // at 80% of it.
    expect(stationScrollTarget(0, 5, 0, 400)).toBe(0);
    expect(stationScrollTarget(2, 5, 0, 400)).toBe(160);
    expect(stationScrollTarget(4, 5, 0, 400)).toBe(320);
  });

  it('offsets from the pin start rather than assuming the top of the page', () => {
    expect(stationScrollTarget(0, 5, 1200, 400)).toBe(1200);
    expect(stationScrollTarget(3, 5, 1200, 400)).toBe(1440);
  });

  it('is strictly increasing, so a button never scrolls backwards', () => {
    for (let i = 1; i < 7; i += 1) {
      expect(stationScrollTarget(i, 7, 0, 420)).toBeGreaterThan(
        stationScrollTarget(i - 1, 7, 0, 420)
      );
    }
  });

  it('clamps an out-of-range index to the ends', () => {
    expect(stationScrollTarget(-1, 5, 0, 400)).toBe(0);
    expect(stationScrollTarget(9, 5, 0, 400)).toBe(320);
  });

  it('returns the pin start for an unusable count rather than NaN', () => {
    // Same policy as perStationVh and drawAt: an unusable count must not produce
    // a NaN scroll position, which the browser silently ignores — the button
    // would do nothing, with no error.
    expect(stationScrollTarget(0, 0, 300, 400)).toBe(300);
  });

  it('returns the pin start for a negative range rather than scrolling out of the pin', () => {
    // `walkPinRangePx` cannot go negative today, but the rail's range is read
    // from the live viewport, and a negative one would send the page
    // *backwards*, above the pin's start and outside the walk entirely.
    expect(stationScrollTarget(2, 5, 0, -400)).toBe(0);
    expect(stationScrollTarget(2, 5, 1200, -400)).toBe(1200);
  });

  it('returns the pin start for a NaN index rather than a NaN scroll position', () => {
    // `Math.min`/`Math.max` propagate `NaN` rather than rejecting it, so the
    // clamp cannot catch it, and a `NaN` `top` is one of the values the browser
    // ignores silently — the button would do nothing, with no error. `drawAt`
    // is already NaN-safe for an index, so this closes an asymmetry between the
    // two halves of the cross-check rather than inventing a policy.
    expect(stationScrollTarget(Number.NaN, 5, 0, 400)).toBe(0);
    expect(stationScrollTarget(Number.NaN, 5, 1200, 400)).toBe(1200);
  });

  it('returns the pin start for a non-finite range rather than an ignored scroll', () => {
    // An infinite `top` is dropped by `window.scrollTo` exactly as a `NaN` one
    // is; both take the guard the count already had. The count, the index and
    // the range are every argument this function consumes.
    expect(stationScrollTarget(2, 5, 0, Number.POSITIVE_INFINITY)).toBe(0);
    expect(stationScrollTarget(2, 5, 0, Number.NEGATIVE_INFINITY)).toBe(0);
    expect(stationScrollTarget(2, 5, 0, Number.NaN)).toBe(0);
  });

  it('targets the exact progress at which drawAt starts that station', () => {
    // The cross-check, and the reason the rail is trustworthy: a button takes
    // the page to the progress where the walk arrives at its station, which is
    // the same progress at which that station's segment begins to draw. If
    // either module changes its axis, a button would land somewhere the draw
    // does not agree with.
    //
    // `toBe` is `Object.is`-strict, and this agreement is exact only at the
    // small counts below — measured, not a structural property of the axis.
    // `drawAt(i/n, i, n)` is exact for every `i` at `n <= 21` and inexact beyond
    // it: the first failure is `n = 22, i = 15`, where `22 * (15 / 22)` is
    // `14.999999999999998` — 1 ULP below 15 — so the preceding station reads
    // `0.9999999999999982`, 16 ULP below the `1` this asserts. 134 of the `n`
    // in 1..200 have at least one failing pair, in both directions (the
    // station's own segment first fails at `n = 25`). The shipped counts are 5
    // and 7, both inside the exact region — so a later task that widens this
    // loop past 21 must expect float error and compare with a tolerance, rather
    // than conclude the axis has moved.
    for (const [i, n] of [[0, 5], [2, 5], [4, 5], [3, 7]] as const) {
      const progress = stationScrollTarget(i, n, 0, 1);
      expect(drawAt(progress, i, n), `station ${i} of ${n} has just begun`).toBe(0);
      if (i > 0) {
        // Station 0 has no predecessor; its own segment is the first thing drawn.
        expect(drawAt(progress, i - 1, n), `station ${i - 1} is complete`).toBe(1);
      }
    }
  });
});

describe('walkPinRangePx', () => {
  it('is one dwell per station, in pixels', () => {
    // An 800px viewport at five pillars: 80vh per station, five stations.
    expect(walkPinRangePx(800, 5)).toBe(3200);
  });

  it('keeps the act near four screens at six and seven pillars', () => {
    expect(walkPinRangePx(800, 6)).toBe(3200); // 400/6 vh × 6 = 400vh
    expect(walkPinRangePx(800, 7)).toBe(3360); // clamped at 60vh × 7 = 420vh
  });

  it('pins the multiplication order the literals above cannot see', () => {
    // The order is load-bearing and the three pinned triples are blind to it:
    // 800 × 5, 6 and 7 agree under every ordering, which is exactly why this
    // needs a cell that does not. Replicated over h = 100..3000 × n = 1..12
    // (34,812 cells), `(h * vh * n) / 100` differs from `(h * n * vh) / 100` on
    // 1,062 of them and from `(h * (vh * n)) / 100` on 696; `h = 102, n = 6` is
    // one of the 1,062, where the reordered product lands on exactly 408 and
    // this order on the value below. The gap is 1 ULP and no browser renders it
    // as a different pixel, so this pins a choice rather than defending a
    // defect: a rewrite that reorders the operands is then a deliberate,
    // visible change instead of a silent 1-ULP drift.
    expect(walkPinRangePx(102, 6)).toBe(408.00000000000006);
  });

  it('agrees with stationScrollTarget about where the last station is', () => {
    // The last station is centred at 80% of the walk at five pillars, and the
    // pin runs to 100%. Computed in one place, the two cannot drift.
    const range = walkPinRangePx(800, 5);
    expect(stationScrollTarget(4, 5, 0, range)).toBe(0.8 * range);
  });
});
