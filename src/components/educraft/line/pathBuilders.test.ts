import { describe, expect, it, vi } from 'vitest';
import { ACT_ANCHORS } from './anchors';
import { NonFiniteCoordinateError, assertContinuity, pathFor } from './pathBuilders';

/**
 * Path geometry + the seam contract. Source: Landing-Redesign-Plan.md §3.1.
 *
 * `assertContinuity` exists to prove the seam contract rather than trust it:
 * each act's exit anchor must equal the next act's entry anchor. The framing is
 * the plan's — "the handoff feels broken" is quoted in `stage-1.md`'s Task 6,
 * and appears in no spec document.
 */

describe('pathFor', () => {
  it('produces a valid SVG path string', () => {
    const d = pathFor({ x: 0, y: 0 }, { x: 1, y: 1 });
    expect(d).toMatch(/^M\s?[\d.-]+[\s,][\d.-]+/);
    expect(d).toContain('C');
  });

  it('starts at the `from` anchor and ends at the `to` anchor', () => {
    const d = pathFor({ x: 0.25, y: 0.1 }, { x: 0.75, y: 0.9 });
    expect(d.startsWith('M 0.25 0.1')).toBe(true);
    expect(d.endsWith('0.75 0.9')).toBe(true);
  });

  it('is a straight line for the `line` shape', () => {
    expect(pathFor({ x: 0, y: 0 }, { x: 1, y: 0 }, 'line')).toBe('M 0 0 L 1 0');
  });

  it('is deterministic — the same inputs give the same string', () => {
    const a = { x: 0.1, y: 0.2 };
    const b = { x: 0.9, y: 0.8 };
    expect(pathFor(a, b, 'arc')).toBe(pathFor(a, b, 'arc'));
  });

  it('is independent of direction for the same curve family', () => {
    // A vertical drop and a vertical rise over the same span share control maths.
    const down = pathFor({ x: 0.5, y: 0 }, { x: 0.5, y: 1 });
    const up = pathFor({ x: 0.5, y: 1 }, { x: 0.5, y: 0 });
    expect(down).not.toBe(up);
    expect(down).toContain('C');
  });

  /**
   * The four tests below pin current output, which is a change-detector, not a
   * correctness check: the control-point coefficients come from the plan's code
   * block and no design document fixes them — the same standing as the anchor
   * values. Pinning makes a change visible; it does not make the curve right.
   * That still needs the owner's eye.
   */
  it('builds the arc from one shared, rounded midpoint, pinned exactly', () => {
    expect(pathFor({ x: 0.25, y: 0.1 }, { x: 0.75, y: 0.9 })).toBe('M 0.25 0.1 C 0.5 0.1 0.5 0.78 0.75 0.9');
  });

  it('pins the fork exactly for a vertical run', () => {
    expect(pathFor({ x: 0.5, y: 0 }, { x: 0.5, y: 1 }, 'fork')).toBe('M 0.5 0 C 0.5 0.55 0.5 0.85 0.5 1');
  });

  it('pins the fork at dy = 0, where its first control point sits on y0', () => {
    // The fork's actual case: `origin.exit` and the five seed nodes share a y,
    // so the "leaves vertically first" reading does not hold — it starts flat.
    expect(pathFor({ x: 0.5, y: 0.5 }, { x: 1, y: 0.5 }, 'fork')).toBe('M 0.5 0.5 C 0.5 0.5 0.75 0.5 1 0.5');
  });

  it('gives both arc control points the same x, even where the two roundings disagree', () => {
    // Rounding the shared midpoint twice splits it: `0.01 + 0.05 * 0.5` is
    // `0.034999999999999996` and `0.06 - 0.05 * 0.5` is `0.035000000000000003`,
    // which round to 0.03 and 0.04. One shared rounding gives 0.03 for both.
    expect(pathFor({ x: 0.01, y: 0 }, { x: 0.06, y: 1 })).toBe('M 0.01 0 C 0.03 0 0.03 0.85 0.06 1');
  });

  it('rounds to exactly two decimals — a 3dp input is neither kept nor truncated', () => {
    expect(pathFor({ x: 0.1234, y: 0.4 }, { x: 0.8765, y: 0.6 }, 'line')).toBe('M 0.12 0.4 L 0.88 0.6');
  });

  it('throws for a non-finite coordinate instead of emitting a d the browser drops', () => {
    const cases = [
      [{ x: NaN, y: 0 }, { x: 1, y: 1 }],
      [{ x: 0, y: NaN }, { x: 1, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: NaN }],
      [{ x: 0, y: 0 }, { x: Infinity, y: 1 }],
      [{ x: -Infinity, y: 0 }, { x: 1, y: 1 }],
    ];
    for (const [from, to] of cases) {
      expect(() => pathFor(from, to), `${from.x},${from.y} → ${to.x},${to.y}`).toThrow(
        NonFiniteCoordinateError
      );
    }
  });
});

describe('assertContinuity', () => {
  it('passes for the declared act chain', () => {
    expect(() => assertContinuity()).not.toThrow();
  });

  it('detects a broken seam', () => {
    // Prove the assertion has teeth: a deliberately mismatched chain must fail.
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
      pillars: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
    };
    expect(() => assertContinuity(broken)).toThrow(/origin\.exit/);
  });

  it('reports the offending seam by name', () => {
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 0.1, y: 0.1 } },
      pillars: { enter: { x: 0.2, y: 0.2 }, exit: { x: 1, y: 1 } },
    };
    let message = '';
    try {
      assertContinuity(broken);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('origin.exit');
    expect(message).toContain('pillars.enter');
  });

  it('reports each side paired with its own coordinates and the delta', () => {
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 0.25, y: 0.5 } },
      pillars: { enter: { x: 0.5, y: 0.25 }, exit: { x: 1, y: 1 } },
    };
    let message = '';
    try {
      assertContinuity(broken);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(
      /origin\.exit \(0\.25, 0\.5\) and pillars\.enter \(0\.5, 0\.25\) — delta \(0\.25, 0\.25\)\./
    );
  });

  it('catches a seam broken on x alone', () => {
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 0.5, y: 1 } },
      pillars: { enter: { x: 0.6, y: 1 }, exit: { x: 1, y: 1 } },
    };
    expect(() => assertContinuity(broken)).toThrow(/origin\.exit/);
  });

  it('catches a seam broken on y alone', () => {
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 0.5, y: 1 } },
      pillars: { enter: { x: 0.5, y: 0.9 }, exit: { x: 1, y: 1 } },
    };
    expect(() => assertContinuity(broken)).toThrow(/origin\.exit/);
  });

  it('checks every seam of a five-act chain, not one seam or every other one', () => {
    const acts = ['origin', 'pillars', 'way', 'proof', 'doors'];
    const shared = { enter: { x: 0.5, y: 1 }, exit: { x: 0.5, y: 1 } };
    for (let brokenSeam = 0; brokenSeam < acts.length - 1; brokenSeam += 1) {
      const chain = Object.fromEntries(
        acts.map((name, index) => [
          name,
          index === brokenSeam
            ? { enter: { x: 0.5, y: 1 }, exit: { x: 0.25, y: 0.75 } }
            : { enter: { ...shared.enter }, exit: { ...shared.exit } },
        ])
      );
      expect(() => assertContinuity(chain), `seam ${brokenSeam}`).toThrow(
        new RegExp(`${acts[brokenSeam]}\\.exit`)
      );
    }
  });

  it('accepts the real ACT_ANCHORS unchanged', () => {
    expect(() => assertContinuity(ACT_ANCHORS)).not.toThrow();
  });

  it('defaults to the real ACT_ANCHORS chain rather than to an empty one', async () => {
    // A vacuous default (`= {}`) would iterate no keys and pass everything, so
    // the default binding is only observable if the chain it binds to is broken.
    vi.doMock('./anchors', () => ({
      ACT_ANCHORS: {
        origin: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
        pillars: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
      },
    }));
    vi.resetModules();
    try {
      const fresh = await import('./pathBuilders');
      expect(() => fresh.assertContinuity()).toThrow(/origin\.exit/);
    } finally {
      vi.doUnmock('./anchors');
      vi.resetModules();
    }
  });
});
