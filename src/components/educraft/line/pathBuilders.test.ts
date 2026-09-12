import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from './anchors';
import { NonFiniteCoordinateError, assertContinuity, pathFor, polylinePath } from './pathBuilders';

/**
 * Path geometry + the seam contract. Source: Landing-Redesign-Plan.md §3.1.
 *
 * `assertContinuity` exists to prove the seam contract rather than trust it: an
 * act's exit sits on its own bottom edge (y = 1), the next act's enter on its
 * own top edge (y = 0), and the two share one horizontal fraction — the same
 * screen point in two act-local boxes. The framing is the plan's — "the handoff
 * feels broken" is quoted in `stage-1.md`'s Task 6, and appears in no spec
 * document.
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
   * block and no design document fixes them. Pinning makes a change visible; it
   * does not make the curve right. That still needs the owner's eye.
   */
  it('builds the arc from one shared, rounded midpoint, pinned exactly', () => {
    expect(pathFor({ x: 0.25, y: 0.1 }, { x: 0.75, y: 0.9 })).toBe('M 0.25 0.1 C 0.5 0.1 0.5 0.78 0.75 0.9');
  });

  it('pins the fork exactly for a vertical run', () => {
    expect(pathFor({ x: 0.5, y: 0 }, { x: 0.5, y: 1 }, 'fork')).toBe('M 0.5 0 C 0.5 0.55 0.5 0.85 0.5 1');
  });

  it('pins the fork at dy = 0, where its first control point sits on y0', () => {
    // Not the shipped fork's geometry any more: `origin.exit` is the fork point
    // at y = 0.85 and the seeds hang below it at y = 1, so the real fork's `dy`
    // is non-zero and it does leave vertically first. This pins the shape's
    // degenerate branch, where the first control point lands on y0 and the
    // branch starts flat.
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

  it('throws for finite inputs that stop being finite inside the maths', () => {
    // `round` multiplies by 100, so `Number.MAX_VALUE` is finite going in and
    // `Infinity` coming out: a guard on the arguments passes it through, and
    // the browser then drops a `d` of "M Infinity 0 L 0 0" without a word.
    expect(() => pathFor({ x: Number.MAX_VALUE, y: 0 }, { x: 0, y: 0 }, 'line')).toThrow(
      NonFiniteCoordinateError
    );
    // The same hole on a curve path, where the infinite endpoint makes `dx`
    // infinite and the midpoint `Infinity + -Infinity`, i.e. `NaN`.
    expect(() => pathFor({ x: Number.MAX_VALUE, y: 0 }, { x: 0, y: 0 })).toThrow(
      NonFiniteCoordinateError
    );
  });
});

describe('assertContinuity', () => {
  it('accepts the vertical chain as shipped', () => {
    expect(() => assertContinuity()).not.toThrow();
  });

  it('rejects an exit that is not on its act bottom edge', () => {
    const chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 0.9 } },
      b: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(/bottom edge/);
  });

  it('rejects an enter that is not on its act top edge', () => {
    const chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      b: { enter: { x: 0.5, y: 0.1 }, exit: { x: 0.5, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(/top edge/);
  });

  it('rejects a seam whose two sides disagree horizontally, and names both', () => {
    const chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      b: { enter: { x: 0.6, y: 0 }, exit: { x: 0.6, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(/a\.exit → b\.enter/);
    expect(() => assertContinuity(chain)).toThrow(/0\.5/);
  });

  it('throws when handed the whole ACT_ANCHORS record, by design', () => {
    // origin.exit is the fork point at y = 0.85, not an act edge. This is the
    // arity change D1 named: the chain is VERTICAL_CHAIN, never the full record.
    expect(() => assertContinuity(ACT_ANCHORS)).toThrow(/bottom edge/);
  });

  it('still accepts a two-act fixture that satisfies the seam rule', () => {
    // The signature is unchanged, so the two-act fixtures keep compiling.
    expect(() =>
      assertContinuity({
        one: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
        two: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      })
    ).not.toThrow();
  });
});

describe('polylinePath', () => {
  it('emits one M and one L per remaining point', () => {
    expect(
      polylinePath([
        { x: 1.5, y: 0.5 },
        { x: 2.5, y: 0.5 },
        { x: 3.5, y: 1 },
      ])
    ).toBe('M 1.5 0.5 L 2.5 0.5 L 3.5 1');
  });

  it('rounds to two decimals like pathFor', () => {
    expect(polylinePath([{ x: 0.123, y: 0.456 }, { x: 0.789, y: 1 }]))
      .toBe('M 0.12 0.46 L 0.79 1');
  });

  it('throws on a single point rather than emitting a path with no segment', () => {
    expect(() => polylinePath([{ x: 0.5, y: 0.5 }])).toThrow(/at least two/);
  });

  it('rejects a non-finite coordinate that only becomes non-finite when rounded', () => {
    expect(() => polylinePath([{ x: 0, y: 0 }, { x: Number.MAX_VALUE, y: 0 }]))
      .toThrow(NonFiniteCoordinateError);
  });
});
