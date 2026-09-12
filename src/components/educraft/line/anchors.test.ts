import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS, ACT_ORDER, VERTICAL_CHAIN, type ActName } from './anchors';

/**
 * The anchor contract. Source: Landing-Redesign-Plan.md §3.1.
 *
 * **Why this file exists.** Before it, `anchors.ts` was invisible to the entire
 * gate: no test imported it, so a discontinuous seam, a renamed act key or a
 * deleted act all stayed green. `assertContinuity` (`pathBuilders.ts`) now
 * checks the seam rule — an act leaves at its own bottom edge, the next enters
 * at its own top edge, and the two share one horizontal fraction — but a
 * relative check is still blind to a coordinated edit that moves both sides of
 * a seam together, and it is not defined over the acts that leave the pattern
 * on purpose. So the actual numbers are pinned literally below, and this file
 * is the only place they are **asserted**.
 *
 * The coordinates are the D1/D2 geometry, not invented placeholders: the strand
 * enters the hero top-right, forks above the fold so the five branches have room
 * to descend to seeds at `y = 1`, runs edge to edge down a spine at `x = 0.75`,
 * and ends on the CTA node at mid-band. They are the design's — changing one is
 * a design change that should cost an edit here.
 */

/**
 * The three edge-to-edge seams, in scroll order. Written out rather than
 * derived, so a deletion or reorder of an act fails rather than silently
 * reshaping the loop.
 */
const VERTICAL_SEAMS: [ActName, ActName][] = [
  ['pillars', 'way'],
  ['way', 'proof'],
  ['proof', 'doors'],
];

describe('ACT_ANCHORS', () => {
  it('carries exactly the five designed acts, in scroll order', () => {
    expect(Object.keys(ACT_ANCHORS)).toEqual(['origin', 'pillars', 'way', 'proof', 'doors']);
    expect(ACT_ORDER).toEqual(['origin', 'pillars', 'way', 'proof', 'doors']);
  });

  it('pins every anchor value', () => {
    expect(ACT_ANCHORS).toEqual({
      origin: { enter: { x: 0.72, y: 0 }, exit: { x: 0.5, y: 0.85 } },
      pillars: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 1 } },
      way: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 1 } },
      proof: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 1 } },
      doors: { enter: { x: 0.75, y: 0 }, exit: { x: 0.75, y: 0.5 } },
    });
  });

  it('gives every vertical act a real edge-to-edge run', () => {
    for (const [from, to] of VERTICAL_SEAMS) {
      const exit = ACT_ANCHORS[from].exit;
      const enter = ACT_ANCHORS[to].enter;
      expect(exit.y, `${from}.exit sits on its own bottom edge`).toBe(1);
      expect(enter.y, `${to}.enter sits on its own top edge`).toBe(0);
      expect(exit.x, `${from}.exit and ${to}.enter share a horizontal fraction`).toBe(enter.x);
    }
    // Not vacuous: three of the five acts used to have enter === exit, which is
    // the shape this test exists to forbid.
    for (const act of ['pillars', 'way', 'proof', 'doors'] as const) {
      expect(ACT_ANCHORS[act].enter).not.toEqual(ACT_ANCHORS[act].exit);
    }
  });

  it('leaves the fork point above the fold, so the fan can descend into it', () => {
    // The one anchor that is deliberately not on an act edge: the single strand
    // forks here and the seeds sit below it at y = 1. `assertContinuity` is
    // called with VERTICAL_CHAIN, never with this record — see pathBuilders.
    expect(ACT_ANCHORS.origin.exit.y).toBeLessThan(1);
    expect(ACT_ANCHORS.origin.exit).toEqual({ x: 0.5, y: 0.85 });
  });

  it('ends the strand at the CTA node rather than at an edge', () => {
    expect(ACT_ANCHORS.doors.exit).toEqual({ x: 0.75, y: 0.5 });
  });

  it('enters the hero at the top-right', () => {
    expect(ACT_ANCHORS.origin.enter).toEqual({ x: 0.72, y: 0 });
  });

  it('keeps both coordinates plain numbers', () => {
    const x: number = ACT_ANCHORS.origin.enter.x;
    const y: number = ACT_ANCHORS.doors.exit.y;
    expect(typeof x).toBe('number');
    expect(typeof y).toBe('number');
  });

  it('holds the vertical chain as the four post-fork acts, in scroll order', () => {
    expect(Object.keys(VERTICAL_CHAIN)).toEqual(['pillars', 'way', 'proof', 'doors']);
    // Same objects, not copies: a seam cannot be moved in one place only.
    expect(VERTICAL_CHAIN.way).toBe(ACT_ANCHORS.way);
  });

  it('is frozen all the way down, so no helper can rewrite the contract in place', () => {
    expect(Object.isFrozen(ACT_ANCHORS)).toBe(true);
    for (const act of ACT_ORDER) {
      expect(Object.isFrozen(ACT_ANCHORS[act]), act).toBe(true);
      expect(Object.isFrozen(ACT_ANCHORS[act].enter), `${act}.enter`).toBe(true);
      expect(Object.isFrozen(ACT_ANCHORS[act].exit), `${act}.exit`).toBe(true);
    }
  });

  it('rejects an in-place rewrite of a shared anchor', () => {
    expect(() => {
      (ACT_ANCHORS.doors.exit as { x: number }).x = 0.6;
    }).toThrow(TypeError);
    expect(ACT_ANCHORS.doors.exit.x).toBe(0.75);
  });
});
