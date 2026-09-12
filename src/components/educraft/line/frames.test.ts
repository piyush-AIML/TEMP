import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from './anchors';
import { NonFiniteCoordinateError } from './pathBuilders';
import {
  ACT_VIEW_BOX,
  assertForkSeam,
  assertRibbonSeam,
  forkPaths,
  ribbonFrame,
  seedAnchors,
  walkFrame,
} from './frames';

/**
 * The join. Source: Landing-Redesign-Plan.md §3.1, ADR 0006 (the frames), and
 * the Stage 2 join ruling (2026-09-13).
 *
 * These are the assertions that decide whether a strand is drawn at all. Stage 1
 * shipped three correct modules and a correct renderer with nothing joining
 * them; wiring them naively gives a rail at 0.33% of the viewBox and an arc of
 * 0.26px × 0.96px — arithmetic over the strings these modules return, since
 * nothing here renders and nothing imports `frames.ts` yet. Every value below is
 * therefore pinned to a literal, and the join invariant is asserted directly
 * rather than inferred from the numbers.
 */

describe('ACT_VIEW_BOX', () => {
  it('is the act-local unit box, so anchors need no arithmetic', () => {
    expect(ACT_VIEW_BOX).toBe('0 0 1 1');
  });
});

describe('seedAnchors', () => {
  it('spreads five seeds across the fold, symmetric about the fork', () => {
    expect(seedAnchors(5)).toEqual([
      { x: 0.1, y: 1 },
      { x: 0.3, y: 1 },
      { x: 0.5, y: 1 },
      { x: 0.7, y: 1 },
      { x: 0.9, y: 1 },
    ]);
  });

  it('rounds each seed to two decimal places', () => {
    // Not `0.1 + 0.8 * (1/4)`, which is what this comment used to claim the
    // module computes: the fan is laid out as `FORK.x ± round2(offset)`.
    // Measured, the value that needs the *sum* rounded is index 0 — the offset
    // is exactly 0.4 and `0.5 - 0.4` is still 0.09999999999999998 — and at
    // n = 7 the offset itself, 0.26666666666666666, reads as 0.27. At one
    // decimal place n = 6 would give 0.3/0.4/0.6/0.7, so these two fans pin the
    // precision as well as the values.
    expect(seedAnchors(5)[0].x).toBe(0.1);
    expect(seedAnchors(6)).toEqual([
      { x: 0.1, y: 1 },
      { x: 0.26, y: 1 },
      { x: 0.42, y: 1 },
      { x: 0.58, y: 1 },
      { x: 0.74, y: 1 },
      { x: 0.9, y: 1 },
    ]);
    expect(seedAnchors(7)).toEqual([
      { x: 0.1, y: 1 },
      { x: 0.23, y: 1 },
      { x: 0.37, y: 1 },
      { x: 0.5, y: 1 },
      { x: 0.63, y: 1 },
      { x: 0.77, y: 1 },
      { x: 0.9, y: 1 },
    ]);
  });

  it('mirrors exactly about the fork at every count tested, 33 included', () => {
    // Exact equality, not a tolerance: each seed is `FORK.x ± offset` for one
    // rounded offset, so the two members of a mirror pair cannot differ — and
    // `assertForkSeam` consumes exactly that. The counts are not decoration:
    // 33 and 65 are where the shipped interpolation rounded the two halves of
    // a half-way pair separately, producing 0.13 + 0.88 = 1.01 for a fan that
    // is exactly symmetric before rounding.
    for (const n of [2, 3, 5, 6, 7, 33, 65]) {
      const seeds = seedAnchors(n);
      expect(seeds).toHaveLength(n);
      seeds.forEach((seed, i) => {
        const mirror = seeds[n - 1 - i];
        expect(seed.x + mirror.x, `n=${n}, i=${i}`).toBe(2 * ACT_ANCHORS.origin.exit.x);
      });
      expect(seeds.every((seed) => seed.y === 1)).toBe(true);
    }
  });

  it('puts a single seed on the fork point itself', () => {
    expect(seedAnchors(1)).toEqual([{ x: ACT_ANCHORS.origin.exit.x, y: 1 }]);
  });

  it('centres the fan on the fork point', () => {
    // The fan is laid out from `FORK.x`, so its middle seed *is* the fork's own
    // x — a comparison against the contract rather than against a literal.
    // It cannot see the value read being replaced by the literal 0.5 that
    // happens to equal it, and no test can while the two coincide, so the name
    // claims only what the assertion checks.
    expect(seedAnchors(5)[2].x).toBe(ACT_ANCHORS.origin.exit.x);
    expect(seedAnchors(7)[3].x).toBe(ACT_ANCHORS.origin.exit.x);
  });
});

describe('forkPaths', () => {
  it('emits one curve per seed, each leaving the shared fork point', () => {
    const paths = forkPaths(5);
    expect(paths).toHaveLength(5);
    for (const d of paths) {
      expect(d.startsWith(`M ${ACT_ANCHORS.origin.exit.x} ${ACT_ANCHORS.origin.exit.y} `)).toBe(true);
      expect(d, 'the fork shape is a curve, not a line').toContain('C');
    }
    expect(new Set(paths).size, 'five distinct branches').toBe(5);
  });

  it("draws the 'fork' shape — each branch holds x at the fork before it diverges", () => {
    // The shape's defining behaviour, from `pathBuilders.ts`: the first control
    // point holds x at the origin, so the branch leaves straight down before it
    // diverges. Pinned as the emitted strings, because `toContain('C')` above is
    // satisfied by the default 'arc' shape too — measured, 'arc' gives
    // `M 0.5 0.85 C 0.3 0.85 …` (an immediate bulge) where 'fork' gives
    // `M 0.5 0.85 C 0.5 0.93 …` (the vertical leave).
    expect(forkPaths(5)).toEqual([
      'M 0.5 0.85 C 0.5 0.93 0.3 0.98 0.1 1',
      'M 0.5 0.85 C 0.5 0.93 0.4 0.98 0.3 1',
      'M 0.5 0.85 C 0.5 0.93 0.5 0.98 0.5 1',
      'M 0.5 0.85 C 0.5 0.93 0.6 0.98 0.7 1',
      'M 0.5 0.85 C 0.5 0.93 0.7 0.98 0.9 1',
    ]);
  });

  it('leaves downward, which needs dy > 0', () => {
    // pathFor's 'fork' shape holds the first control point's x at the origin,
    // which only reads as a downward leave while dy is non-zero. With the fork
    // point above the fold this is true; with the shipped y = 1 it was not.
    const tokens = forkPaths(5)[0].split(' ');
    expect(Number(tokens.at(-1)), 'lands on the fold').toBe(1);
    expect(Number(tokens.at(-2)), 'at the outermost seed').toBe(0.1);
    expect(ACT_ANCHORS.origin.exit.y).toBeLessThan(1);
  });
});

describe('walkFrame', () => {
  it('uses a frame of one unit per viewport, N units wide', () => {
    const frame = walkFrame(5);
    expect(frame.viewBox).toBe('0 0 5 1');
    expect(frame.widthVw).toBe(500);
  });

  it('places station i at the centre of slot i — the join, asserted directly', () => {
    const frame = walkFrame(5);
    expect(frame.stations).toEqual([
      { x: 0.5, y: 0.5 },
      { x: 1.5, y: 0.5 },
      { x: 2.5, y: 0.5 },
      { x: 3.5, y: 0.5 },
      { x: 4.5, y: 0.5 },
    ]);
    // The claim that matters: every station is the midpoint of its own segment.
    frame.stations.forEach((station, i) => {
      const [from, to] = segmentEnds(frame.railSegments[i]);
      expect((from + to) / 2, `station ${i} is the midpoint of its segment`).toBe(station.x);
      expect(to - from, `segment ${i} is one unit wide`).toBe(1);
    });
  });

  it('tiles the rail edge to edge in N one-unit segments', () => {
    const frame = walkFrame(5);
    expect(frame.railSegments).toEqual([
      'M 0 0.5 L 1 0.5',
      'M 1 0.5 L 2 0.5',
      'M 2 0.5 L 3 0.5',
      'M 3 0.5 L 4 0.5',
      'M 4 0.5 L 5 0.5',
    ]);
    // Edge to edge, read off the strings: the first segment starts at 0 and the
    // last ends at N, so together they span the whole frame.
    expect(segmentEnds(frame.railSegments[0])[0]).toBe(0);
    expect(segmentEnds(frame.railSegments[4])[1]).toBe(5);
  });

  it('draws every segment on the station baseline', () => {
    // `frames.ts` reads the rail's y from `stationPositions`' own output rather
    // than repeating station.ts's private baseline, so the two cannot drift.
    // This test pins the value that derivation produces; it cannot see the
    // difference between the derivation and the literal 0.5, because the
    // baseline it reads *is* 0.5 (the same limit applies to `stations`' y).
    expect(walkFrame(3).railSegments).toEqual([
      'M 0 0.5 L 1 0.5',
      'M 1 0.5 L 2 0.5',
      'M 2 0.5 L 3 0.5',
    ]);
  });

  it('scales to a sixth and seventh pillar with no rewrite', () => {
    expect(walkFrame(6).viewBox).toBe('0 0 6 1');
    expect(walkFrame(6).widthVw).toBe(600);
    expect(walkFrame(7).railSegments).toHaveLength(7);
    expect(walkFrame(7).widthVw).toBe(700);
    expect(walkFrame(7).stations[6].x).toBe(6.5);
  });

  it('refuses a count that is not a whole number of pillars, loudly', () => {
    // Unlike perStationVh, this cannot degrade quietly: an empty walk is a page
    // with no content, and a partial one is worse — at 2.7 the frame advertises
    // 2.7 units while its two segments tile [0, 2], so the last 0.7 unit falls
    // in no drawAt window. NaN has to fail here too, or it reaches the inside
    // as a TypeError instead of naming the fault.
    for (const count of [0, 0.5, 2.7, -3, NaN]) {
      expect(() => walkFrame(count), String(count)).toThrow(/whole number of pillars/);
    }
    expect(() => walkFrame(1)).not.toThrow();
  });
});

describe('ribbonFrame', () => {
  it('puts six stages on one continuing strand, after a convergence slot', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.viewBox).toBe('0 0 8 1');
    expect(frame.width).toBe(8);
    expect(frame.stageCount).toBe(6);
    expect(frame.pillarCount).toBe(5);
    expect(frame.nodes).toEqual([
      { x: 1.5, y: 0.5 },
      { x: 2.5, y: 0.5 },
      { x: 3.5, y: 0.5 },
      { x: 4.5, y: 0.5 },
      { x: 5.5, y: 0.5 },
      { x: 6.5, y: 0.5 },
    ]);
  });

  it('exits on the page spine at 0.75 of its own frame', () => {
    // The ribbon is Act 1's tail; its exit is the seam into Act 2. The value is
    // read from ACT_ANCHORS so the two cannot disagree, and expressed as a
    // fraction of the ribbon's own box — which is what a seam compares. The
    // fraction is pinned to its literal as well: the contract comparison alone
    // moves with the constant it is derived from.
    const frame = ribbonFrame(6, 5);
    expect(frame.exit.x).toBe(6);
    expect(frame.exit.x / frame.width).toBe(0.75);
    expect(frame.exit.x / frame.width).toBe(ACT_ANCHORS.pillars.exit.x);
    expect(frame.exit.y).toBe(1);
    expect(ACT_ANCHORS.way.enter.x).toBe(ACT_ANCHORS.pillars.exit.x);
  });

  it('converges N strands into the first node', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.convergence).toHaveLength(5);
    // The fan's geometry, pinned: the margin, the spread between the strands
    // and the 'arc' shape are all invisible to a count-plus-endpoints assertion.
    expect(frame.convergence).toEqual([
      'M 0 0.2 C 0.75 0.2 0.75 0.46 1.5 0.5',
      'M 0 0.35 C 0.75 0.35 0.75 0.48 1.5 0.5',
      'M 0 0.5 C 0.75 0.5 0.75 0.5 1.5 0.5',
      'M 0 0.65 C 0.75 0.65 0.75 0.52 1.5 0.5',
      'M 0 0.8 C 0.75 0.8 0.75 0.55 1.5 0.5',
    ]);
  });

  it('draws the strand through every node and out to the exit', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.strand).toBe('M 1.5 0.5 L 2.5 0.5 L 3.5 0.5 L 4.5 0.5 L 5.5 0.5 L 6.5 0.5 L 6 1');
  });

  it('scales the frame with the stage count, keeping the spine fixed', () => {
    const frame = ribbonFrame(8, 5);
    expect(frame.viewBox).toBe('0 0 10 1');
    expect(frame.exit.x / frame.width).toBe(0.75);
  });

  it('refuses a count that is not a whole number of stages', () => {
    // Without this guard, stageCount = 0 dies inside `polylinePath` ("needs at
    // least two points") — an error that names the wrong function — and 6.5
    // builds a frame whose width and node count disagree.
    for (const count of [0, -1, 6.5, NaN]) {
      expect(() => ribbonFrame(count, 5), String(count)).toThrow(/whole number of stages/);
    }
    expect(() => ribbonFrame(1, 5)).not.toThrow();
  });

  it('refuses a count that is not a whole number of pillars', () => {
    for (const count of [0, 2.7, -1, NaN]) {
      expect(() => ribbonFrame(6, count), String(count)).toThrow(/whole number of pillars/);
    }
  });
});

describe('the two seam assertions', () => {
  it('accepts the shipped contract', () => {
    expect(() => assertForkSeam(5)).not.toThrow();
    expect(() => assertRibbonSeam(ribbonFrame(6, 5))).not.toThrow();
  });

  it('rejects a fork point that is not above the fold', () => {
    // With dy = 0 the fork's five branches are a flat horizontal smear: the
    // shape's first control point lands on the origin and the leave is gone.
    expect(() => assertForkSeam(5, { x: 0.5, y: 1 })).toThrow(/above the fold/);
  });

  it('rejects an asymmetric fan', () => {
    expect(() => assertForkSeam(5, { x: 0.4, y: 0.85 })).toThrow(/symmetric/);
  });

  it('rejects a fan with a different number of seeds than pillars', () => {
    // The docstring's second clause, "there is exactly one seed per pillar",
    // has no other way to fire: a whole-number count always yields that many
    // seeds, so only a count that is not whole can disagree — seedAnchors(2.7)
    // can only make two.
    expect(() => assertForkSeam(2.7)).toThrow(/2.7 pillars but 2 seeds/);
  });

  it('rejects a non-finite fork point', () => {
    // Every test in assertForkSeam is an ordered comparison, and every
    // comparison with NaN is false — so without the finiteness check first, a
    // NaN fork passes as above the fold *and* as symmetric.
    expect(() => assertForkSeam(5, { x: NaN, y: NaN })).toThrow(NonFiniteCoordinateError);
    expect(() => assertForkSeam(5, { x: 0.5, y: NaN })).toThrow(NonFiniteCoordinateError);
  });

  it('rejects a ribbon that exits off the spine', () => {
    expect(() => assertRibbonSeam(ribbonFrame(6, 5), 0.5)).toThrow(/spine/);
  });

  it('rejects a non-finite spine', () => {
    expect(() => assertRibbonSeam(ribbonFrame(6, 5), NaN)).toThrow(NonFiniteCoordinateError);
  });

  it('rejects a frame whose own exit is not a finite point', () => {
    // The exit is half of the comparison, so a NaN there is as silent as a NaN
    // spine: `Math.abs(NaN / 8 - 0.75) > 1e-6` is false.
    const frame = ribbonFrame(6, 5);
    expect(() => assertRibbonSeam({ ...frame, exit: { x: NaN, y: 1 } })).toThrow(
      NonFiniteCoordinateError
    );
  });

  it('rejects a frame whose strand count disagrees with its own pillar count', () => {
    // The frame carries the counts it was built with, which is what removes the
    // argument order the shipped signature had — and a caller that hands this
    // check a RibbonFrame it built (or edited) itself cannot pass an arity
    // claim its own convergence contradicts.
    const frame = ribbonFrame(6, 5);
    expect(() =>
      assertRibbonSeam({ ...frame, convergence: frame.convergence.slice(0, 4) })
    ).toThrow(/built for 5 pillars but 4 strands converge/);
  });
});

/** Pulls the two x values out of a `M x y L x y` string. */
function segmentEnds(d: string): [number, number] {
  const match = /^M ([\d.]+) [\d.]+ L ([\d.]+) [\d.]+$/.exec(d);
  if (!match) throw new Error(`not a two-point line: ${d}`);
  return [Number(match[1]), Number(match[2])];
}
