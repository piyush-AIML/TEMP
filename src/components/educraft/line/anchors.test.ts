import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS, ACT_ORDER, type ActName } from './anchors';

/**
 * The anchor contract. Source: Landing-Redesign-Plan.md §3.1.
 *
 * **Why this file exists.** Before it, `anchors.ts` was invisible to the entire
 * gate: no test imported it, so a discontinuous seam, a renamed act key or a
 * deleted act all stayed green. `assertContinuity` (Task 6, `pathBuilders.ts`)
 * now checks that neighbouring acts agree *with each other* — a relative check,
 * blind to the two free ends (`origin.enter`, `doors.exit`) and to a coordinated
 * edit that moves both copies of a seam, but not to a single anchor move. So the
 * actual numbers are pinned literally below, and this file is the only place
 * they are **asserted**.
 *
 * The coordinates are **invented for the design**: the plan's Task 5 code block
 * (`stage-1.md`) does carry `enter: { x: 0.72, y: 0 }`, so they are not absent
 * from every document — but no design document *fixes* these values. They still
 * need the owner's eye, and changing one is a design change that should cost an
 * edit here.
 */

/** The four seams, in scroll order. Written out rather than derived, so a
 * deletion or reorder of an act fails rather than silently reshapes the loop. */
const SEAMS: [ActName, ActName][] = [
  ['origin', 'pillars'],
  ['pillars', 'way'],
  ['way', 'proof'],
  ['proof', 'doors'],
];

describe('ACT_ANCHORS', () => {
  it('carries exactly the five designed acts, in scroll order', () => {
    expect(Object.keys(ACT_ANCHORS)).toEqual(['origin', 'pillars', 'way', 'proof', 'doors']);
    expect(ACT_ORDER).toEqual(['origin', 'pillars', 'way', 'proof', 'doors']);
  });

  it('hands each act off exactly where the previous one ended', () => {
    for (const [from, to] of SEAMS) {
      expect(ACT_ANCHORS[to].enter, `${from}.exit → ${to}.enter`).toEqual(ACT_ANCHORS[from].exit);
    }
  });

  it('pins every anchor value', () => {
    expect(ACT_ANCHORS).toEqual({
      origin: { enter: { x: 0.72, y: 0 }, exit: { x: 0.5, y: 1 } },
      pillars: { enter: { x: 0.5, y: 1 }, exit: { x: 0.5, y: 1 } },
      way: { enter: { x: 0.5, y: 1 }, exit: { x: 0.5, y: 1 } },
      proof: { enter: { x: 0.5, y: 1 }, exit: { x: 0.5, y: 1 } },
      doors: { enter: { x: 0.5, y: 1 }, exit: { x: 0.5, y: 0.5 } },
    });
  });

  it('enters the hero at the top-right and converges on the CTA', () => {
    expect(ACT_ANCHORS.origin.enter).toEqual({ x: 0.72, y: 0 });
    expect(ACT_ANCHORS.doors.exit).toEqual({ x: 0.5, y: 0.5 });
  });

  it('keeps both coordinates plain numbers', () => {
    // Type-level pin as well as a runtime one: widening `Anchor` to
    // `y: number | string` leaves every runtime assertion above green, so the
    // annotation on the next two lines is what fails `tsc --noEmit`.
    const x: number = ACT_ANCHORS.origin.enter.x;
    const y: number = ACT_ANCHORS.doors.exit.y;
    expect(typeof x).toBe('number');
    expect(typeof y).toBe('number');
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
    expect(ACT_ANCHORS.doors.exit.x).toBe(0.5);
  });
});
