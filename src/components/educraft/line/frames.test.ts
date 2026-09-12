import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from './anchors';
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
 * them; the measured symptom was a rail at 0.33% of the viewBox and an arc of
 * 0.26px × 1.13px. Every value below is therefore pinned to a literal, and the
 * join invariant is asserted directly rather than inferred from the numbers.
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

  it('pins exact values rather than float noise', () => {
    // 0.1 + 0.8 * (1/4) is 0.30000000000000004 in binary floating point. The
    // values are rounded in the module so a correct implementation passes a
    // strict equality assertion, and so two seeds that must mirror each other
    // cannot differ in their last bits.
    expect(seedAnchors(5)[1].x).toBe(0.3);
    expect(seedAnchors(7)[3].x).toBe(0.5);
  });

  it('stays symmetric about the fork for any count', () => {
    for (const n of [2, 3, 5, 7]) {
      const seeds = seedAnchors(n);
      expect(seeds).toHaveLength(n);
      seeds.forEach((seed, i) => {
        const mirror = seeds[n - 1 - i];
        expect(seed.x + mirror.x, `n=${n}, i=${i}`).toBeCloseTo(
          2 * ACT_ANCHORS.origin.exit.x,
          10
        );
      });
      expect(seeds.every((seed) => seed.y === 1)).toBe(true);
    }
  });

  it('puts a single seed on the fork point itself', () => {
    expect(seedAnchors(1)).toEqual([{ x: ACT_ANCHORS.origin.exit.x, y: 1 }]);
  });

  it('derives its spread from the fork, not from a hardcoded centre', () => {
    // The width is a margin in from each edge: for five seeds, 0.1 … 0.9.
    expect(seedAnchors(5)[0].x).toBe(0.1);
    expect(seedAnchors(5)[4].x).toBe(0.9);
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

  it('runs the rail edge to edge in N one-unit segments', () => {
    const frame = walkFrame(5);
    expect(frame.rail).toBe('M 0 0.5 L 5 0.5');
    expect(frame.railSegments).toEqual([
      'M 0 0.5 L 1 0.5',
      'M 1 0.5 L 2 0.5',
      'M 2 0.5 L 3 0.5',
      'M 3 0.5 L 4 0.5',
      'M 4 0.5 L 5 0.5',
    ]);
  });

  it('follows the station baseline rather than repeating it', () => {
    // The rail's y is read from stationPositions' own output, so a change to
    // WALK_BASELINE_Y in station.ts moves the rail with it.
    expect(walkFrame(5).rail).toContain('0.5');
    expect(walkFrame(3).rail).toBe('M 0 0.5 L 3 0.5');
  });

  it('scales to a sixth and seventh pillar with no rewrite', () => {
    expect(walkFrame(6).viewBox).toBe('0 0 6 1');
    expect(walkFrame(7).railSegments).toHaveLength(7);
    expect(walkFrame(7).stations[6].x).toBe(6.5);
  });

  it('refuses a walk with no pillars, loudly', () => {
    // Unlike perStationVh, this cannot degrade quietly: an empty walk is a page
    // with no content, and a hand-built SVG with no stations would render a
    // strand to nowhere rather than an error.
    expect(() => walkFrame(0)).toThrow(/at least one pillar/);
  });
});

describe('ribbonFrame', () => {
  it('puts six stages on one continuing strand, after a convergence slot', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.viewBox).toBe('0 0 8 1');
    expect(frame.nodes).toEqual([
      { x: 1.5, y: 0.5 },
      { x: 2.5, y: 0.5 },
      { x: 3.5, y: 0.5 },
      { x: 4.5, y: 0.5 },
      { x: 5.5, y: 0.5 },
      { x: 6.5, y: 0.5 },
    ]);
  });

  it('exits on the page spine, read from the contract', () => {
    // The ribbon is Act 1's tail; its exit is the seam into Act 2. The value is
    // read from ACT_ANCHORS so the two cannot disagree, and expressed as a
    // fraction of the ribbon's own box — which is what a seam compares.
    const frame = ribbonFrame(6, 5);
    expect(frame.exit.x / frame.width).toBe(ACT_ANCHORS.pillars.exit.x);
    expect(frame.exit.y).toBe(1);
    expect(ACT_ANCHORS.way.enter.x).toBe(ACT_ANCHORS.pillars.exit.x);
  });

  it('converges N strands into the first node', () => {
    const frame = ribbonFrame(6, 5);
    expect(frame.convergence).toHaveLength(5);
    for (const d of frame.convergence) {
      expect(d.startsWith('M 0 ')).toBe(true);
      expect(d.endsWith('1.5 0.5')).toBe(true);
    }
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
});

describe('the two seam assertions', () => {
  it('accepts the shipped contract', () => {
    expect(() => assertForkSeam(5)).not.toThrow();
    expect(() => assertRibbonSeam(5, 6)).not.toThrow();
  });

  it('rejects a fork point that is not above the fold', () => {
    // With dy = 0 the fork's five branches are a flat horizontal smear: the
    // shape's first control point lands on the origin and the leave is gone.
    expect(() => assertForkSeam(5, { x: 0.5, y: 1 })).toThrow(/above the fold/);
  });

  it('rejects an asymmetric fan', () => {
    expect(() => assertForkSeam(5, { x: 0.4, y: 0.85 })).toThrow(/symmetric/);
  });

  it('rejects a ribbon that exits off the spine', () => {
    expect(() => assertRibbonSeam(5, 6, 0.5)).toThrow(/spine/);
  });
});

/** Pulls the two x values out of a `M x y L x y` string. */
function segmentEnds(d: string): [number, number] {
  const match = /^M ([\d.]+) [\d.]+ L ([\d.]+) [\d.]+$/.exec(d);
  if (!match) throw new Error(`not a two-point line: ${d}`);
  return [Number(match[1]), Number(match[2])];
}
