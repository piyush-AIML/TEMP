import { ACT_ANCHORS, type Anchor } from './anchors';

/**
 * Pure SVG path construction + the seam contract
 * (Landing-Redesign-Plan.md §3.1).
 *
 * **Frame-agnostic.** `pathFor` turns two points that are already in *one*
 * frame into a path string; it neither knows nor needs to know which frame
 * that is. `anchors.ts` supplies act-local points and `stationPositions`
 * supplies track-local ones, and the caller supplies both endpoints in
 * whichever single frame it is drawing in. Reconciling the two frames would be
 * `trackX = actIndex + actLocalX`, and this signature carries no act identity,
 * so it cannot compute that index — that reconciliation belongs to the caller
 * in Stage 2, which is the only thing that knows which act a point belongs to.
 *
 * Because a path string is resolution-independent, the caller scales via
 * `viewBox`, which is what makes the same geometry work at every breakpoint.
 *
 * Paths carry `pathLength="1"` at the render site, so draw is always
 * `stroke-dasharray: 1` with `stroke-dashoffset: 1 → 0` — identical for every
 * path regardless of real length. That is why nothing here measures length.
 */

export type PathShape = 'arc' | 'line' | 'fork';

/** Two decimal places is plenty at normalised scale and keeps strings diffable. */
const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * An SVG path from `from` to `to`.
 *
 * `arc`   — the default gentle S-curve used for vertical strand runs.
 * `line`  — a straight segment, used for the horizontal walk's rail.
 * `fork`  — leaves the origin vertically first, so five forks read as one
 *           line splitting rather than five lines crossing.
 */
export function pathFor(from: Anchor, to: Anchor, shape: PathShape = 'arc'): string {
  const x0 = round(from.x);
  const y0 = round(from.y);
  const x1 = round(to.x);
  const y1 = round(to.y);

  if (shape === 'line') {
    return `M ${x0} ${y0} L ${x1} ${y1}`;
  }

  const dy = y1 - y0;
  const dx = x1 - x0;

  // For `fork`, hold x for the first third so the branch leaves straight down
  // before it starts to diverge — this is what makes a fork read as a split.
  const c1 =
    shape === 'fork' ? { x: x0, y: round(y0 + dy * 0.55) } : { x: round(x0 + dx * 0.5), y: y0 };
  const c2 = { x: round(x1 - dx * 0.5), y: round(y1 - dy * 0.15) };

  return `M ${x0} ${y0} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x1} ${y1}`;
}

type ActChain = Record<string, { enter: Anchor; exit: Anchor }>;

/**
 * Proves the seam contract: in the declared act order, each act's `exit` anchor
 * must equal the next act's `enter` anchor. Called from the test suite, and
 * from nothing else — no runtime module calls it, so it does not run at module
 * load; Stage 2 is where the real call site is wired.
 *
 * Throws naming both sides of the offending seam, because "the handoff looks
 * broken" is exactly the bug this exists to prevent.
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
