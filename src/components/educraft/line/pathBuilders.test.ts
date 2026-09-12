import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS, type Anchor } from './anchors';
import { NonFiniteCoordinateError, assertContinuity, pathFor, polylinePath } from './pathBuilders';

/** A seam fixture: what `assertContinuity` accepts, spelled out per case. */
type Chain = Record<string, { enter: Anchor; exit: Anchor }>;

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
   * The next five tests pin current output, which is a change-detector, not a
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

  it('throws on a chain with no seams rather than iterating zero times', () => {
    // A one-key (or empty) record has no handoff to check and the loop would run
    // zero times, passing everything — which is how a default bound to `{}`
    // turns this guard into a silent no-op. It throws instead, so the default
    // binding stays observable through the `not.toThrow()` above.
    expect(() => assertContinuity({})).toThrow(/no seams is not a valid chain/);
    expect(() =>
      assertContinuity({ only: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 0.5 } } })
    ).toThrow(/no seams is not a valid chain/);
  });

  it('rejects an exit that is not on its act bottom edge, and names that side', () => {
    const chain: Chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 0.9 } },
      b: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
    };
    // The label is pinned, not only the edge word: the edge word comes from the
    // message template, so `/bottom edge/` alone is satisfied by a call that
    // reports the wrong side — `b.enter` rather than `a.exit` — as broken.
    expect(() => assertContinuity(chain)).toThrow(
      /Strand seam broken at a\.exit: an act's bottom edge is y = 1/
    );
  });

  it('rejects an enter that is not on its act top edge, and names that side', () => {
    const chain: Chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      b: { enter: { x: 0.5, y: 0.1 }, exit: { x: 0.5, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(
      /Strand seam broken at b\.enter: an act's top edge is y = 0/
    );
  });

  it('rejects a seam whose two sides disagree horizontally, and names both', () => {
    const chain: Chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      b: { enter: { x: 0.6, y: 0 }, exit: { x: 0.6, y: 1 } },
    };
    expect(() => assertContinuity(chain)).toThrow(/a\.exit → b\.enter/);
    expect(() => assertContinuity(chain)).toThrow(/0\.5/);
  });

  it('rejects a seam off by a thousandth — the tolerance, not only the fixtures', () => {
    // Every other failing fixture here is off by exactly 0.1, so what this block
    // actually pinned was "the offset exceeds 0.1": an epsilon loosened to 0.09
    // — 90,000x the shipped 1e-6 — left the whole suite green, and at that
    // tolerance the check stops telling a shared spine from a 1%-off one. One
    // fixture per guard, each off by a thousandth, pins the order of magnitude.
    const edgeOff: Chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1.001 } },
      b: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
    };
    expect(() => assertContinuity(edgeOff)).toThrow(/bottom edge/);

    const xOff: Chain = {
      a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
      b: { enter: { x: 0.501, y: 0 }, exit: { x: 0.501, y: 1 } },
    };
    expect(() => assertContinuity(xOff)).toThrow(/a\.exit → b\.enter/);
  });

  it('rejects a non-finite anchor, which every ordered comparison passes', () => {
    // Both guards are ordered comparisons and every comparison with NaN is
    // false, so a NaN anchor is accepted as a valid edge *and* as equal to its
    // neighbour. `pathFor` guards a `d` one layer down, but this is the layer
    // Task 2's generated seed coordinates arrive at.
    const cases: [string, Chain][] = [
      [
        'NaN exit y',
        {
          a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: NaN } },
          b: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
        },
      ],
      [
        'NaN enter y',
        {
          a: { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } },
          b: { enter: { x: 0.5, y: NaN }, exit: { x: 0.5, y: 1 } },
        },
      ],
      [
        'NaN x on both sides of the seam',
        {
          a: { enter: { x: NaN, y: 0 }, exit: { x: NaN, y: 1 } },
          b: { enter: { x: NaN, y: 0 }, exit: { x: NaN, y: 1 } },
        },
      ],
    ];
    for (const [label, chain] of cases) {
      expect(() => assertContinuity(chain), label).toThrow(NonFiniteCoordinateError);
      expect(() => assertContinuity(chain), label).toThrow(/NaN/);
    }
  });

  it('walks a break through every seam of a four-act chain, naming the one that broke', () => {
    // Every other failing fixture here is a two-act chain, which has one seam:
    // a loop that stopped after the first seam, or took every second one,
    // satisfies all of them. The shipped data cannot tell them apart either —
    // `pillars`, `way` and `proof` share anchors, so seams 1, 2 and 3 are
    // byte-identical. Here four acts share an x and only the moved exit differs,
    // so the seam named in the message is the only evidence the loop reached it.
    const acts = ['a', 'b', 'c', 'd'] as const;
    for (let seam = 0; seam < acts.length - 1; seam += 1) {
      const chain: Chain = {};
      for (const act of acts) {
        chain[act] = { enter: { x: 0.5, y: 0 }, exit: { x: 0.5, y: 1 } };
      }
      chain[acts[seam]].exit = { x: 0.5, y: 0.9 };
      expect(
        () => assertContinuity(chain),
        `seam ${seam + 1} (${acts[seam]}.exit → ${acts[seam + 1]}.enter) is not checked`
      ).toThrow(new RegExp(`Strand seam broken at ${acts[seam]}\\.exit`));
    }
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

  it('attributes the error to polylinePath, not to pathFor', () => {
    // One check, two callers, one error class: the function name in the message
    // is the only thing that tells a reader which function met the number. It
    // used to be a hardcoded `pathFor:` prefix, so every overflow from here was
    // reported against the wrong function.
    expect(() => polylinePath([{ x: 0, y: 0 }, { x: Number.MAX_VALUE, y: 0 }])).toThrow(
      /polylinePath: point 1 x is not finite/
    );
  });
});
