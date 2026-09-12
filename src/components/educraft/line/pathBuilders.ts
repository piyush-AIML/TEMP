import { VERTICAL_CHAIN, type Anchor } from './anchors';

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
 * Thrown for a number that cannot be written into a path.
 *
 * A browser silently drops a `d` it cannot parse, exactly as it rejects a `NaN`
 * dash offset (station.ts states the same policy for the same reason), so a
 * strand built from a non-finite number would simply vanish with nothing to
 * trace. This module fails loudly instead.
 *
 * **What is checked is the numbers that would be written into the string, not
 * the arguments that came in.** `round` multiplies by 100, so a perfectly
 * finite coordinate above `Number.MAX_VALUE / 100` overflows *inside the
 * rounding* and comes back as `Infinity`; and once an endpoint has done that,
 * `dx = x1 - x0` is `±Infinity` and the midpoint `round(x0 + dx * 0.5)` is
 * `Infinity + -Infinity` — a `NaN`. Guarding only the arguments passes both
 * straight into the string, which is the outcome this class exists to prevent.
 * `perStationVh` in `src/design/scroll.ts` shipped that weaker guard — `NaN`
 * inputs caught, `NaN` results not — and failed against its own stated goal.
 * `docs/projects/landing-redesign/rulings.md` records it.
 */
export class NonFiniteCoordinateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonFiniteCoordinateError';
  }
}

/**
 * Two decimal places is plenty at normalised scale and keeps strings diffable.
 *
 * It can also overflow to `Infinity` for a finite input above
 * `Number.MAX_VALUE / 100`, which is why `pathFor` checks its results rather
 * than its arguments — see `NonFiniteCoordinateError`.
 */
const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Rejects a non-finite value before it can reach the `d` string.
 *
 * The caller names itself (`caller`), because two exported functions share this
 * check and the class is the same for both: a `polylinePath` overflow reported
 * as `pathFor:` sends its reader to the wrong function.
 */
function assertFinite(caller: string, label: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new NonFiniteCoordinateError(
      `${caller}: ${label} is not finite (${value}). ` +
        'A path containing it would be dropped silently by the browser.'
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
  const x0 = round(from.x);
  const y0 = round(from.y);
  const x1 = round(to.x);
  const y1 = round(to.y);

  // Checked *after* rounding, not before: `round` multiplies by 100, so a finite
  // coordinate above `Number.MAX_VALUE / 100` arrives finite and leaves as
  // `Infinity`. The arguments are not checked separately — every finite argument
  // that survives rounding is covered here, and every one that does not is
  // caught here.
  assertFinite('pathFor', 'from.x', x0);
  assertFinite('pathFor', 'from.y', y0);
  assertFinite('pathFor', 'to.x', x1);
  assertFinite('pathFor', 'to.y', y1);

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
  // depends on `dy` being non-zero. The fork this shape is for leaves
  // `origin.exit`, which `ACT_ANCHORS` fixes at the fork point `{ x: 0.5,
  // y: 0.85 }`, and the five seeds hang below it at `y = 1` — so `dy` is
  // non-zero and the branch does leave vertically first. (`ACT_ANCHORS` holds
  // act enter/exit anchors only; the seed nodes are generated by `seedAnchors`
  // in `frames.ts`, which is why no seed node is in it.)
  const c1 = shape === 'fork' ? { x: x0, y: round(y0 + dy * 0.55) } : { x: midX, y: y0 };
  const c2 = { x: midX, y: round(y1 - dy * 0.15) };

  // The derived numbers are checked as well as the endpoints, because they are
  // also written into the string. With today's coefficients a finite rounded
  // pair keeps them finite; a check that stopped at the endpoints would stop
  // covering the path the first time one of those coefficients rises above 1.
  assertFinite('pathFor', 'first control point x', c1.x);
  assertFinite('pathFor', 'first control point y', c1.y);
  assertFinite('pathFor', 'second control point x', c2.x);
  assertFinite('pathFor', 'second control point y', c2.y);

  return `M ${x0} ${y0} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x1} ${y1}`;
}

type ActChain = Record<string, { enter: Anchor; exit: Anchor }>;

const SEAM_EPSILON = 1e-6;

/**
 * One side of a seam, as fractions of its own act's box — see `anchors.ts`.
 * The two sides of a seam are the same screen point while being different
 * numbers, which is why the check is a shape and not an equality.
 *
 * Finiteness is checked **first**, and it is not decoration: both tests below
 * are ordered comparisons, and every comparison with `NaN` is `false`, so a
 * `NaN` anchor passes as a valid edge *and* as equal to its neighbour. The class
 * is the same one `pathFor` and `polylinePath` throw for the same input, so a
 * caller catches one class whichever function met the number first.
 */
function assertSeamSide(label: string, side: Anchor, edge: 'top' | 'bottom'): void {
  if (!Number.isFinite(side.x) || !Number.isFinite(side.y)) {
    throw new NonFiniteCoordinateError(
      `Strand seam broken at ${label}: the anchor is (${side.x}, ${side.y}), which is ` +
        'not a finite point. Each side of a seam is a fraction of its own act box, so a ' +
        'non-finite coordinate is on no edge and compares equal to nothing.'
    );
  }
  const expected = edge === 'top' ? 0 : 1;
  if (Math.abs(side.y - expected) > SEAM_EPSILON) {
    throw new Error(
      `Strand seam broken at ${label}: an act's ${edge} edge is y = ${expected}, ` +
        `but the anchor is at y = ${side.y}. Each act's strand must enter at its own ` +
        'top edge and leave at its own bottom edge.'
    );
  }
}

/**
 * Proves the seam contract: each act's exit sits on its own bottom edge
 * (y = 1), the next act's enter sits on its own top edge (y = 0), and the two
 * agree on their horizontal fraction — so the strand reads as one continuous
 * line across the boundary while each act keeps its own coordinate box.
 *
 * "Continuous" holds of the numbers *and* of the layout: the two sides are the
 * same screen point only while every act is full-width and gapless and all acts
 * share one horizontal offset. This function compares fractions of each act's
 * own box and cannot see a box, so an act rendered 90% wide, or nudged
 * sideways, breaks screen continuity with every check here still green.
 *
 * A chain of **fewer than two acts throws**. A record with one key (or none) has
 * no seam to check, and the loop would run zero times — which is what would let
 * a default bound to `{}` turn this guard into a silent no-op.
 *
 * **Re-specified in Stage 2.** The shipped version demanded `exit == enter` as
 * raw values, which no correct vertical chain can satisfy: act i's exit is in
 * act i's box and act i+1's enter is in act i+1's box, one band apart. Driven
 * with the corrected geometry the shipped check throws a false alarm; called
 * with no argument it re-validated a frozen literal against itself. The premise
 * was the defect. The finding is recorded in
 * `docs/decisions/0006-coordinate-frames-act-local-and-track-local.md` (the
 * "naive seam check will throw a false alarm" consequence) and in
 * `docs/projects/landing-redesign/state.md` §4. The re-specification itself is
 * to be recorded at stage close in ADR 0008, which does not exist yet.
 *
 * The order checked is `Object.keys(chain)` — **insertion order, not
 * `ACT_ORDER`**. For the default `VERTICAL_CHAIN` the two coincide because the
 * literal is written in scroll order, and `anchors.test.ts` pins that key
 * order. The parameter stays a plain record rather than `Record<ActName, …>`
 * so the two-act test fixtures keep compiling.
 *
 * **The arity changes are not this function's business.** `origin.exit` is the
 * fork point and the ribbon's exit is the convergence, so passing `ACT_ANCHORS`
 * throws *by design*; `frames.ts` asserts those two seams with
 * `assertForkSeam` and `assertRibbonSeam`.
 */
export function assertContinuity(chain: ActChain = VERTICAL_CHAIN): void {
  const names = Object.keys(chain);
  if (names.length < 2) {
    throw new Error(
      `assertContinuity: received a chain of ${names.length} ` +
        `${names.length === 1 ? 'act' : 'acts'}. A chain with no seams is not a valid ` +
        'chain: there is no handoff to check, and a loop over zero seams would pass ' +
        'every input — including the empty one a broken default binds to.'
    );
  }
  for (let i = 0; i < names.length - 1; i += 1) {
    const from = names[i];
    const to = names[i + 1];
    const exit = chain[from].exit;
    const enter = chain[to].enter;
    assertSeamSide(`${from}.exit`, exit, 'bottom');
    assertSeamSide(`${to}.enter`, enter, 'top');
    const dx = Math.abs(exit.x - enter.x);
    if (dx > SEAM_EPSILON) {
      throw new Error(
        `Strand seam broken at ${from}.exit → ${to}.enter: ` +
          `${from}.exit is at x = ${exit.x} and ${to}.enter is at x = ${enter.x} — ` +
          `delta ${dx}. The two sides of a seam must share a horizontal fraction of ` +
          'their own act box.'
      );
    }
  }
}

/**
 * A path through two or more points, as one `M` followed by `L` commands.
 *
 * Used for strands that pass *through* nodes rather than running between two
 * anchors — the journey ribbon's six stages sit on one continuing strand. A
 * single `d` with several `L` commands is deliberate: concatenating several
 * `pathFor` outputs would emit several `M`s, and `pathLength="1"` normalises the
 * dash against the total of the subpaths, which is behaviour worth not
 * depending on.
 *
 * Same rounding and same result-not-argument finiteness discipline as
 * `pathFor`, for the same reason: `round` multiplies by 100, so a finite
 * coordinate above `Number.MAX_VALUE / 100` overflows *inside the rounding*.
 */
export function polylinePath(points: readonly Anchor[]): string {
  if (points.length < 2) {
    throw new Error(
      `polylinePath: needs at least two points, received ${points.length}. ` +
        'A single point has no segment to draw.'
    );
  }
  const rounded = points.map((point) => ({ x: round(point.x), y: round(point.y) }));
  rounded.forEach((point, index) => {
    assertFinite('polylinePath', `point ${index} x`, point.x);
    assertFinite('polylinePath', `point ${index} y`, point.y);
  });
  const [head, ...tail] = rounded;
  return [`M ${head.x} ${head.y}`, ...tail.map((point) => `L ${point.x} ${point.y}`)].join(' ');
}
