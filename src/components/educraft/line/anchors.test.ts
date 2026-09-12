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
 * a seam together, and to the two ends of the chain it is handed (the first
 * key's `enter` and the last key's `exit` have no seam against them; `origin`
 * is not in `VERTICAL_CHAIN` at all). So the actual numbers are pinned
 * literally below, and this file is the only place they are **asserted**.
 *
 * The coordinates are the **D1/D2 geometry as the Stage 2 plan's own decision
 * table fixes it** (`.claude/plans/landing-redesign-stage-2.md`, Task 1's
 * values table), not placeholders: the strand enters the hero top-right, forks
 * above the fold so the five branches have room to descend to seeds at
 * `y = 1`, and runs down a spine at `x = 0.75` — edge to edge through
 * `pillars`, `way` and `proof`, ending at the CTA node at mid-band inside
 * `doors`. No design document carries these numbers — Stage 1 closed with the
 * *predecessor* values ruled "invented and unvalidated"
 * (`docs/decisions/0006-coordinate-frames-act-local-and-track-local.md`) — and
 * these replaced them by the plan's decision. Changing one is a design change
 * that should cost an edit here.
 */

/**
 * The three edge-to-edge seams, in scroll order.
 *
 * Written out rather than derived, and **pinned by its own test below**. The
 * assertions that consume it are all shape checks, which any pair of acts in a
 * correct chain satisfies: an act deletion is caught by the key pins, but a
 * gutted or mis-paired list is caught by that test alone.
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

  it('pins the vertical-seam list itself, not only the acts it pairs', () => {
    // The list is written out rather than derived, so pinning it is the only
    // thing that makes an edit to it visible: every assertion in the loop above
    // is a shape check that any pair of acts in a correct chain satisfies, so a
    // gutted list or a mis-paired one left the suite green.
    expect(VERTICAL_SEAMS).toEqual([
      ['pillars', 'way'],
      ['way', 'proof'],
      ['proof', 'doors'],
    ]);
    // And it is the list the chain it describes implies: consecutive keys of
    // `VERTICAL_CHAIN`, which is what `assertContinuity` iterates.
    const chainActs = Object.keys(VERTICAL_CHAIN);
    expect(VERTICAL_SEAMS).toEqual(
      chainActs.slice(0, -1).map((act, index) => [act, chainActs[index + 1]])
    );
  });

  it('leaves the fork point above the fold, so the fan can descend into it', () => {
    // One of the two anchors deliberately not on an act edge; the other is
    // `doors.exit`, the CTA node. `assertContinuity` is handed VERTICAL_CHAIN,
    // whose default that is — handing it this whole record throws by design,
    // which `pathBuilders.test.ts` asserts.
    //
    // A floor, not a design value: the drop from the fork point to the seed row
    // at y = 1 has to be at least a tenth of the hero band for the fan to read
    // as descending rather than starting flat. The literal below pins the exact
    // value; this pins the property that makes 0.85 a choice rather than a
    // number — a pin alone accepts the fork sitting at 0.99.
    expect(1 - ACT_ANCHORS.origin.exit.y).toBeGreaterThanOrEqual(0.1);
    expect(ACT_ANCHORS.origin.exit).toEqual({ x: 0.5, y: 0.85 });
  });

  it('ends the strand at the CTA node rather than at an edge', () => {
    expect(ACT_ANCHORS.doors.exit).toEqual({ x: 0.75, y: 0.5 });
  });

  it('enters the hero at the top-right', () => {
    expect(ACT_ANCHORS.origin.enter).toEqual({ x: 0.72, y: 0 });
  });

  it('keeps both coordinates plain numbers', () => {
    // A type-level pin as well as a runtime one: widening `Anchor` to
    // `y: number | string` leaves every runtime assertion above green, so the
    // annotations on the next two lines are what fails `tsc --noEmit`. The
    // `typeof` checks are the half a reader sees; the annotations are the half
    // the gate reads.
    const x: number = ACT_ANCHORS.origin.enter.x;
    const y: number = ACT_ANCHORS.doors.exit.y;
    expect(typeof x).toBe('number');
    expect(typeof y).toBe('number');
  });

  it('holds the vertical chain as the four post-fork acts, in scroll order', () => {
    expect(Object.keys(VERTICAL_CHAIN)).toEqual(['pillars', 'way', 'proof', 'doors']);
    // Frozen, so a later assignment — by a helper or by a fixture — cannot
    // re-point the default `assertContinuity` binds to. The deep-freeze test
    // below walks `ACT_ORDER`, i.e. `ACT_ANCHORS` only.
    expect(Object.isFrozen(VERTICAL_CHAIN)).toBe(true);
    // Same objects, not copies — all four entries, not the one this used to
    // name: a seam that moved in one place only would leave the two records
    // disagreeing about it.
    for (const act of ['pillars', 'way', 'proof', 'doors'] as const) {
      expect(VERTICAL_CHAIN[act], act).toBe(ACT_ANCHORS[act]);
    }
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
