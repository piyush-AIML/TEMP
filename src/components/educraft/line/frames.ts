import { ACT_ANCHORS, type Anchor } from './anchors';
import { pathFor, polylinePath } from './pathBuilders';
import { stationPositions } from './station';

/**
 * THE JOIN — the coordinate reconciliation Stage 1 deliberately left undone
 * (Landing-Redesign-Plan.md §3.1; ADR 0006).
 *
 * Stage 1 shipped three correct pure modules and a correct renderer, and
 * **nothing in the shipped code ever draws a strand**: `LineStage` imports
 * `cn`, `motion`, `SCRUB` and GSAP, but not `anchors`, `station` or
 * `pathBuilders`. Measured, wiring them naively gives a rail at 0.33% of the
 * default 1200×800 viewBox and an arc of 0.26px × 1.13px at 1440×900. R8 ruled
 * that `pathFor` is frame-agnostic and that reconciling the frames is the
 * caller's job, and that is what this module is.
 *
 * **The reconciliation is viewBox selection, not arithmetic.** A path string is
 * resolution-independent, so a frame is a *choice of coordinate space*, and
 * `LineStage` is already documented as caller-scaled:
 *
 * - A **vertical act** renders `ACT_VIEW_BOX` — `viewBox="0 0 1 1"` over a box
 *   sized to the act's band. Act-local coordinates are then viewBox coordinates
 *   verbatim: `anchors.ts` needs no transform at all, which is why R8's
 *   "no per-point arithmetic maps one onto the other" is not an obstacle.
 * - **The walk** renders `viewBox="0 0 N 1"` over an element `N × 100vw` wide
 *   and `100vh` tall, so one unit is exactly one viewport. `stationPositions`'
 *   `x = i` is track-local in *track widths*; adding **half a slot** puts
 *   station `i` at the centre of slot `i`, and that offset is the whole of the
 *   caller's transform. The rail spans `0 … N`, so slice `i` is `[i, i+1]` —
 *   one unit wide, station `i` at its midpoint — which is exactly the slicing
 *   `drawAt(progress, i, n) = clamp01(n·progress − i)` assumes.
 *
 * Pure: no DOM, no React, no GSAP, safe in the Vitest node environment.
 * `station.ts` is **not** modified — the offset lives here, in the caller.
 */

/** A vertical act's frame: act-local 0..1 in both axes, verbatim (spec §3.1). */
export const ACT_VIEW_BOX = '0 0 1 1';

/**
 * How far in from each edge the outermost seed sits, as a fraction of the
 * act's width. Five seeds therefore land at 0.1 … 0.9.
 */
const SEED_MARGIN = 0.1;

/** How far in from each edge the outermost convergence strand enters. */
const CONVERGENCE_MARGIN = 0.2;

/**
 * Two decimal places, matching `pathFor`'s own rounding. Not cosmetic: the
 * seeds are laid out by interpolation, and `0.1 + 0.8 * (1/4)` is
 * `0.30000000000000004` in binary floating point. Rounding makes a strict
 * equality assertion pass for a correct implementation, and guarantees that two
 * seeds which must mirror each other cannot differ in their last bits.
 */
const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Where the strand forks — the one anchor that is not on an act edge. */
const FORK = ACT_ANCHORS.origin.exit;

export type WalkFrame = {
  /** `0 0 N 1` — one unit per viewport. */
  viewBox: string;
  /** The SVG's width in `vw`, so one unit is one viewport. */
  widthVw: number;
  /** One station per pillar, at the centre of its own slot. */
  stations: Anchor[];
  /** The whole rail, for the reduced-motion / no-JS case. */
  rail: string;
  /** One segment per station, for the scrubbed per-station draw. */
  railSegments: string[];
};

export type RibbonFrame = {
  /** `0 0 W 1`, where `W = stageCount + 2`. */
  viewBox: string;
  /** The frame's width in units, needed to express the exit as a fraction. */
  width: number;
  /** One node per journey stage, left to right. */
  nodes: Anchor[];
  /** The convergence point, in frame units. */
  exit: Anchor;
  /** The single strand through every node and out to the exit. */
  strand: string;
  /** N strands merging into the first node — the walk's N→1 seam. */
  convergence: string[];
};

/**
 * The N seed points the fork resolves into, spread across the fold and
 * **symmetric about the fork's own x** — derived from `ACT_ANCHORS.origin.exit`
 * rather than from a hardcoded centre, so moving the fork moves the fan with it.
 *
 * `y = 1` is the fold: the seeds sit on the first act's bottom edge, one act
 * band above the walk they open into.
 */
export function seedAnchors(pillarCount: number): Anchor[] {
  if (pillarCount <= 1) return [{ x: FORK.x, y: 1 }];
  const span = 1 - 2 * SEED_MARGIN;
  return Array.from({ length: pillarCount }, (_, i) => ({
    x: round2(FORK.x + (i / (pillarCount - 1) - 0.5) * span),
    y: 1,
  }));
}

/**
 * One `fork`-shaped branch per seed, all leaving the shared fork point. Five
 * separate draws from a shared origin, not a path morph: no `d` is ever
 * tweened, so nothing depends on MorphSVG, and reduced motion degrades to five
 * pre-drawn lines (spec §3.1).
 *
 * This is the one shape whose reading depends on `dy`: the first control point
 * holds x at the origin, so the branch leaves straight down before it diverges,
 * and with `dy = 0` the whole fan collapses into a horizontal smear. `FORK` is
 * above the fold, which is what makes it read as a leave; `assertForkSeam`
 * enforces that rather than assuming it.
 */
export function forkPaths(pillarCount: number): string[] {
  return seedAnchors(pillarCount).map((seed) => pathFor(FORK, seed, 'fork'));
}

/**
 * The walk's frame, its stations, and its rail — sliced so that `drawAt`'s
 * per-station windows land exactly on the rail.
 *
 * `stationPositions` gives `x = i` in track widths; the half-slot offset here
 * makes it the centre of slot `i`. Nothing else is transformed: the viewBox
 * does the scaling, and the element's width in `vw` is what makes one unit one
 * viewport.
 */
export function walkFrame(pillarCount: number): WalkFrame {
  if (pillarCount < 1) {
    // Deliberately loud. `perStationVh` returns its ceiling for an unusable
    // count because it feeds a ScrollTrigger `end`, but an empty walk is a page
    // with no content: quietly emitting a strand to nowhere would hide the bug.
    throw new Error(
      `walkFrame: a walk needs at least one pillar, received ${pillarCount}.`
    );
  }
  const stations = stationPositions(pillarCount).map((point) => ({
    x: point.x + 0.5,
    y: point.y,
  }));
  // The rail's y is read from the stations rather than repeating station.ts's
  // private baseline, so the two cannot drift.
  const y = stations[0].y;
  return {
    viewBox: `0 0 ${pillarCount} 1`,
    widthVw: pillarCount * 100,
    stations,
    rail: pathFor({ x: 0, y }, { x: pillarCount, y }, 'line'),
    railSegments: Array.from({ length: pillarCount }, (_, i) =>
      pathFor({ x: i, y }, { x: i + 1, y }, 'line')
    ),
  };
}

/**
 * The journey ribbon: the six stages on one continuing strand, entered through
 * a convergence slot that turns the walk's N strands back into one.
 *
 * The frame is `stageCount + 2` units wide — one slot for the convergence, one
 * trailing slot the exit descends through — which makes the exit land on
 * `0.75 × width`, the page spine, for the six stages that exist. The exit is
 * read from `ACT_ANCHORS.pillars.exit` so the ribbon and the contract cannot
 * disagree, and is published as a fraction of this frame's own width, because a
 * seam compares fractions and not units.
 *
 * **A deliberate simplification, recorded rather than hidden:** the N strands
 * converge from the act boundary, not from the walk's own station nodes. Those
 * nodes are never on screen together — the walk shows one viewport at a time —
 * so a literal re-convergence would need a scale-out tween on the whole track,
 * which is a mechanic this stage does not invent. From the reader's seat the
 * effect is the same five-into-one.
 */
export function ribbonFrame(stageCount: number, pillarCount: number): RibbonFrame {
  const width = stageCount + 2;
  const nodes = Array.from({ length: stageCount }, (_, j) => ({ x: j + 1.5, y: 0.5 }));
  const exit = { x: round2(ACT_ANCHORS.pillars.exit.x * width), y: 1 };
  const spread = 1 - 2 * CONVERGENCE_MARGIN;
  const enters = pillarCount <= 1
    ? [0.5]
    : Array.from({ length: pillarCount }, (_, i) =>
        round2(CONVERGENCE_MARGIN + (i / (pillarCount - 1)) * spread)
      );
  return {
    viewBox: `0 0 ${width} 1`,
    width,
    nodes,
    exit,
    strand: polylinePath([...nodes, exit]),
    convergence: enters.map((y) => pathFor({ x: 0, y }, nodes[0], 'arc')),
  };
}

/**
 * The 1→N seam: one strand becomes N. Checked structurally, because a
 * one-to-many handoff has no equality to assert — there is no "the same point"
 * between one anchor and five.
 *
 * What must hold: the fork is above the fold (so the branches leave downward),
 * there is exactly one seed per pillar, and the fan is symmetric about the fork.
 */
export function assertForkSeam(pillarCount: number, fork: Anchor = FORK): void {
  if (fork.y >= 1) {
    throw new Error(
      `Fork seam broken: the fork point must sit above the fold so its branches ` +
        `leave downward, but it is at y = ${fork.y}. With dy = 0 the 'fork' shape's ` +
        'first control point lands on the origin and the fan is a horizontal smear.'
    );
  }
  const seeds = seedAnchors(pillarCount);
  if (seeds.length !== pillarCount) {
    throw new Error(`Fork seam broken: ${pillarCount} pillars but ${seeds.length} seeds.`);
  }
  seeds.forEach((seed, i) => {
    const mirror = seeds[seeds.length - 1 - i];
    if (Math.abs(seed.x + mirror.x - 2 * fork.x) > 1e-6) {
      throw new Error(
        `Fork seam broken: the fan must be symmetric about the fork at x = ${fork.x}, ` +
          `but seeds ${i} and ${seeds.length - 1 - i} are at ${seed.x} and ${mirror.x}.`
      );
    }
  });
}

/**
 * The N→1 seam: the ribbon's convergence, and its exit onto the page spine.
 *
 * The exit is checked *as a fraction of the ribbon's own frame* against the
 * spine, which is the comparison a seam actually makes; comparing units would
 * compare a 8-unit frame against a 0..1 anchor and be wrong in a way that looks
 * like a pass once someone "fixes" it.
 */
export function assertRibbonSeam(
  pillarCount: number,
  stageCount: number,
  spineX: number = ACT_ANCHORS.pillars.exit.x
): void {
  const frame = ribbonFrame(stageCount, pillarCount);
  if (Math.abs(frame.exit.x / frame.width - spineX) > 1e-6) {
    throw new Error(
      `Ribbon seam broken: the strand must exit on the page spine at x = ${spineX} ` +
        `as a fraction of its own frame, but it exits at ${frame.exit.x} of ` +
        `${frame.width} (${frame.exit.x / frame.width}).`
    );
  }
  if (frame.convergence.length !== pillarCount) {
    throw new Error(
      `Ribbon seam broken: ${pillarCount} pillars but ${frame.convergence.length} strands converge.`
    );
  }
}
