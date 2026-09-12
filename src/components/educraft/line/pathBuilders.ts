import { ACT_ANCHORS, type Anchor } from './anchors';

/**
 * Pure SVG path construction + the seam contract
 * (Landing-Redesign-Plan.md §3.1).
 *
 * **Frame-agnostic.** `pathFor` turns two points that are already in *one*
 * frame into a path string; it neither knows nor needs to know which frame that
 * is. The strand's two kinds of drawing come from different sources: the
 * vertical segments are built from the **act-local** anchors in `anchors.ts`,
 * and the horizontal walk's rail from the **track-local** positions in
 * `station.ts`. Those are different geometry, not one frame needing conversion —
 * there is no per-point arithmetic that maps one onto the other. How they
 * compose on screen is a layout decision owned by the Stage 2 caller.
 *
 * Because a path string is resolution-independent, the caller scales via
 * `viewBox`, which is what makes the same geometry work at every breakpoint.
 *
 * Paths carry `pathLength="1"` at the render site, so draw is always
 * `stroke-dasharray: 1` with `stroke-dashoffset: 1 → 0` — identical for every
 * path regardless of real length. That is why nothing here measures length.
 */

export type PathShape = 'arc' | 'line' | 'fork';

/**
 * Thrown for a coordinate that is not finite.
 *
 * A browser silently drops a `d` it cannot parse, exactly as it rejects a `NaN`
 * dash offset (station.ts states the same policy for the same reason), so a
 * strand built from a non-finite point would simply vanish with nothing to
 * trace. This module fails loudly instead.
 *
 * The guard is on the inputs deliberately: an infinite endpoint makes `dx`
 * infinite, and the midpoint is then `x0 + dx * 0.5` or `x1 - dx * 0.5`, which
 * is `Infinity - Infinity` — a `NaN` that no later check would see.
 */
export class NonFiniteCoordinateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonFiniteCoordinateError';
  }
}

/** Two decimal places is plenty at normalised scale and keeps strings diffable. */
const round = (value: number): number => Math.round(value * 100) / 100;

/** Rejects a non-finite endpoint before it can reach a control point. */
function assertFinite(label: string, point: Anchor): void {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new NonFiniteCoordinateError(
      `pathFor: ${label} is not a finite point (${point.x}, ${point.y}). ` +
        'A path built from it would be dropped silently by the browser.'
    );
  }
}

/**
 * An SVG path from `from` to `to`.
 *
 * `arc`   — the default gentle S-curve used for vertical strand runs.
 * `line`  — a straight segment, used for the horizontal walk's rail.
 * `fork`  — one of the hero's five seeds. Spec §3.1 draws the fork as five
 *           separate paths out of a shared origin rather than a path morph: no
 *           `d` is ever tweened, so nothing depends on MorphSVG, and reduced
 *           motion degrades to five pre-drawn lines. Its first control point
 *           holds x at the origin, which only reads as a downward leave while
 *           `dy` is non-zero — see the note below.
 */
export function pathFor(from: Anchor, to: Anchor, shape: PathShape = 'arc'): string {
  assertFinite('from', from);
  assertFinite('to', to);

  const x0 = round(from.x);
  const y0 = round(from.y);
  const x1 = round(to.x);
  const y1 = round(to.y);

  if (shape === 'line') {
    return `M ${x0} ${y0} L ${x1} ${y1}`;
  }

  const dx = x1 - x0;
  const dy = y1 - y0;

  // The midpoint is rounded once and shared by both control points. Rounding
  // `x0 + dx * 0.5` and `x1 - dx * 0.5` separately rounds the same intended
  // value twice, and floating-point noise puts the two results on different
  // hundredths for a small share of 2dp input pairs.
  const midX = round(x0 + dx * 0.5);

  // For `fork`, the first control point holds x at x0 so the branch leaves
  // straight down before it diverges: at t = 1/3 the curve has travelled only
  // 14.81% of dx, and x stays within 1% of x0 until t ≈ 0.083. That reading
  // depends on `dy` being non-zero, and the fork's actual case in
  // `ACT_ANCHORS` is `dy = 0` — `origin.exit` and the five seed nodes share a
  // y — where the first control point sits on y0 and the curve starts flat.
  const c1 = shape === 'fork' ? { x: x0, y: round(y0 + dy * 0.55) } : { x: midX, y: y0 };
  const c2 = { x: midX, y: round(y1 - dy * 0.15) };

  return `M ${x0} ${y0} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x1} ${y1}`;
}

type ActChain = Record<string, { enter: Anchor; exit: Anchor }>;

/**
 * Proves the seam contract: each act's `exit` anchor must equal the next act's
 * `enter` anchor, so one act starts exactly where the previous one ended. Called
 * from the test suite, and from nothing else — no runtime module calls it, so it
 * does not run at module load; Stage 2 is where the real call site is wired.
 *
 * The order checked is `Object.keys(chain)` — **insertion order, not
 * `ACT_ORDER`**. For the default `ACT_ANCHORS` the two coincide because the
 * literal is written in scroll order, and `anchors.test.ts` pins that key order,
 * so the default call does check the declared order. A caller passing a chain in
 * another order gets that chain's own order, which is why the parameter is a
 * plain record rather than `Record<ActName, …>`; the act set is already
 * constrained at the source by `satisfies Record<ActName, AnchorPair>`.
 *
 * Throws naming both sides of the offending seam, because a handoff that does
 * not line up is exactly the bug this exists to catch.
 */
export function assertContinuity(chain: ActChain = ACT_ANCHORS): void {
  const names = Object.keys(chain);
  const EPSILON = 1e-6;
  for (let i = 0; i < names.length - 1; i += 1) {
    const from = names[i];
    const to = names[i + 1];
    const exit = chain[from].exit;
    const enter = chain[to].enter;
    const dx = Math.abs(exit.x - enter.x);
    const dy = Math.abs(exit.y - enter.y);
    if (dx > EPSILON || dy > EPSILON) {
      throw new Error(
        `Strand seam broken between ${from}.exit (${exit.x}, ${exit.y}) and ` +
          `${to}.enter (${enter.x}, ${enter.y}) — delta (${dx}, ${dy}). ` +
          'Each act must start exactly where the previous one ended.'
      );
    }
  }
}
