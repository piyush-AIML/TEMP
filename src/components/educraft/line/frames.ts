import { ACT_ANCHORS, type Anchor } from './anchors';
import { NonFiniteCoordinateError, pathFor, polylinePath } from './pathBuilders';
import { stationPositions } from './station';

/**
 * THE JOIN — the coordinate reconciliation Stage 1 deliberately left undone
 * (Landing-Redesign-Plan.md §3.1; ADR 0006).
 *
 * Stage 1 shipped three correct pure modules and a correct renderer, and
 * **nothing in the shipped code ever draws a strand**: `LineStage` imports
 * `cn`, `motion`, `SCRUB` and GSAP, but not `anchors`, `station` or
 * `pathBuilders`. Measured on the strings those modules return, wiring them
 * naively gives a rail at 0.33% of the default 1200×800 viewBox and an arc of
 * 0.26px × 0.96px at 1440×900. R8 ruled that `pathFor` is frame-agnostic and
 * that reconciling the frames is the caller's job, and that is what this module
 * is.
 *
 * **The reconciliation is viewBox selection, not arithmetic.** A path string is
 * resolution-independent, so a frame is a *choice of coordinate space*, and
 * `LineStage` is already documented as caller-scaled:
 *
 * - A **vertical act** renders `ACT_VIEW_BOX` — `viewBox="0 0 1 1"` over a box
 *   sized to the act's band. Act-local coordinates are then viewBox coordinates
 *   verbatim: `anchors.ts` needs no transform at all, which is why the note in
 *   `pathBuilders.ts` — "there is no per-point arithmetic that maps one onto the
 *   other" — is not an obstacle.
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
 * How far the fan stays clear of each edge **while the fork is centred**, as a
 * fraction of the act's width. The fan spans `1 - 2 * SEED_MARGIN` about the
 * fork, so five seeds centred on x = 0.5 land at 0.1 … 0.9 — but this is a
 * half-width, not a margin that survives the fork moving: with the fork at
 * x = 0.6 the same fan runs 0.2 … 1.0, its outer seed on the act's edge.
 */
const SEED_MARGIN = 0.1;

/** How far in from each edge the outermost convergence strand enters. */
const CONVERGENCE_MARGIN = 0.2;

/**
 * Two decimal places, matching `pathFor`'s own rounding. Not cosmetic, and not
 * about the expression it resembles: the fan is laid out by interpolation, and
 * neither the offsets nor the sums are the decimals they read as. Measured at
 * `n = 5`, the outermost offset is exactly `0.4` and yet `FORK.x - 0.4` is
 * `0.09999999999999998`; at `n = 7` the offset itself is
 * `0.26666666666666666`, which reads as `0.27`. What the rounding buys: a
 * strict equality assertion passes for a correct implementation, and the fan's
 * mirror pairs are exact by construction (`seedAnchors`).
 */
const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * The fork point: where the strand's one branch becomes N. It sits mid-band,
 * like `doors.exit`, rather than on an act edge — `origin.exit` is above the
 * fold at y = 0.85, and the seeds it forks into hang below it at y = 1.
 */
const FORK = ACT_ANCHORS.origin.exit;

export type WalkFrame = {
  /** `0 0 N 1` — one unit per viewport. */
  viewBox: string;
  /** The SVG's width in `vw`, so one unit is one viewport. */
  widthVw: number;
  /** One station per pillar, at the centre of its own slot. */
  stations: Anchor[];
  /**
   * One segment per station, for the scrubbed per-station draw. Also the whole
   * rail: under reduced motion every segment is drawn at once, which is what
   * the no-JS CSS backstop (`[data-line-path]{stroke-dashoffset:0}`) leaves on
   * screen, so a single rail path would carry nothing these do not.
   */
  railSegments: string[];
};

export type RibbonFrame = {
  /** `0 0 W 1`, where `W = stageCount + 2`. */
  viewBox: string;
  /** The frame's width in units, needed to express the exit as a fraction. */
  width: number;
  /** The stage count this frame was built with — one node each. */
  stageCount: number;
  /** The pillar count this frame was built with — the convergence's arity. */
  pillarCount: number;
  /** One node per journey stage, left to right. */
  nodes: Anchor[];
  /**
   * Where the single strand *leaves* the ribbon: on the page spine, at the
   * frame's bottom edge. The convergence point is `nodes[0]`, where the N
   * strands merge.
   */
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
 * The symmetry is by construction rather than by tolerance: each seed is
 * `FORK.x ± offset` for one `offset` rounded once, so the two members of a
 * mirror pair cannot differ. Measured, their sums are exactly `2 * FORK.x` for
 * every count from 2 to 400. The fan spans `1 - 2 * SEED_MARGIN`, centred on
 * the fork.
 *
 * `y = 1` is the fold: the seeds sit on the first act's bottom edge, one act
 * band above the walk they open into.
 */
export function seedAnchors(pillarCount: number): Anchor[] {
  if (pillarCount <= 1) return [{ x: FORK.x, y: 1 }];
  const half = (pillarCount - 1) / 2;
  const step = (1 - 2 * SEED_MARGIN) / (pillarCount - 1);
  return Array.from({ length: pillarCount }, (_, i) => {
    const offset = round2(Math.abs(i - half) * step);
    return { x: round2(i < half ? FORK.x - offset : FORK.x + offset), y: 1 };
  });
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
  if (!Number.isInteger(pillarCount) || pillarCount < 1) {
    // Deliberately loud, and stricter than a `< 1` test. `perStationVh` returns
    // its ceiling for an unusable count because it feeds a ScrollTrigger `end`,
    // but a walk's count is what *sizes* the frame: at 2.7 the frame advertises
    // `0 0 2.7 1` while its two segments tile only `[0, 2]`, so the rail's last
    // 0.7 unit falls in no `drawAt` window and can never be drawn — the exact
    // invariant this module exists to establish. `NaN` fails this test too,
    // rather than falling through it to a `TypeError` from the inside.
    throw new Error(
      `walkFrame: a walk needs a whole number of pillars, at least one, ` +
        `received ${pillarCount}.`
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
    railSegments: Array.from({ length: pillarCount }, (_, i) =>
      pathFor({ x: i, y }, { x: i + 1, y }, 'line')
    ),
  };
}

/**
 * The journey ribbon: the six stages on one continuing strand, entered through
 * a convergence slot that turns the walk's N strands back into one.
 *
 * The frame is `stageCount + 2` units wide. The nodes run from `1.5` to
 * `stageCount + 0.5`, so the convergence has one and a half units of run-in
 * from the frame's left edge, and at the six stages that exist the frame's last
 * unit is traversed by nothing. The exit is *computed* as
 * `ACT_ANCHORS.pillars.exit.x * width`, so it lands on the page spine at
 * `0.75 × width` for any width — the padding is not what puts it there
 * (measured: `6 / 8` at six stages, `7.5 / 10` at eight, and exactly `0.75` for
 * every count measured — `stageCount` 1–1000 across `pillarCount` 1, 3, 5, 6
 * and 7). It is read from `ACT_ANCHORS.pillars.exit` so the ribbon and the
 * contract cannot disagree, and is published as a fraction of this frame's own
 * width, because a seam compares fractions and not units.
 *
 * **A deliberate simplification, recorded rather than hidden:** the N strands
 * converge from the act boundary, not from the walk's own station nodes. Those
 * nodes are never on screen together — the walk shows one viewport at a time —
 * so a literal re-convergence would need a scale-out tween on the whole track,
 * which is a mechanic this stage does not invent. From the reader's seat the
 * effect is the same five-into-one.
 */
export function ribbonFrame(stageCount: number, pillarCount: number): RibbonFrame {
  if (!Number.isInteger(stageCount) || stageCount < 1) {
    // Own guard, own message: without it a stage count of 0 or less dies inside
    // `polylinePath` ("needs at least two points"), which names the wrong
    // function and says nothing about the ribbon. A non-integer count builds a
    // frame whose width and node count disagree.
    throw new Error(
      `ribbonFrame: the ribbon needs a whole number of stages, at least one, ` +
        `received ${stageCount}.`
    );
  }
  if (!Number.isInteger(pillarCount) || pillarCount < 1) {
    throw new Error(
      `ribbonFrame: the convergence needs a whole number of pillars, at least ` +
        `one, received ${pillarCount}.`
    );
  }
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
    stageCount,
    pillarCount,
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
 *
 * Finiteness is checked **first**, for the reason `pathBuilders.ts`'s own seam
 * check records: every test below is an ordered comparison, and every
 * comparison with `NaN` is `false` — so a `NaN` fork would pass as "above the
 * fold" *and* as "symmetric".
 */
export function assertForkSeam(pillarCount: number, fork: Anchor = FORK): void {
  if (!Number.isFinite(fork.x) || !Number.isFinite(fork.y)) {
    throw new NonFiniteCoordinateError(
      `Fork seam broken: the fork point is (${fork.x}, ${fork.y}), which is not a finite ` +
        'point. Every test below is an ordered comparison, and every comparison with NaN ' +
        'is false, so a non-finite fork would pass as above the fold and as symmetric.'
    );
  }
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
 * Takes the **frame**, not two counts. `ribbonFrame(stageCount, pillarCount)`
 * takes those two numbers, and the shipped check took the same two in the
 * opposite order — both plain numbers, so a caller could swap them and have a
 * 5-stage/6-pillar ribbon validated against a 6-pillar claim with nothing to
 * notice. The frame carries the counts it was built with, so there is no
 * argument order left to get wrong and no count to re-derive.
 *
 * The exit is checked *as a fraction of the ribbon's own frame* against the
 * spine, which is the comparison a seam actually makes; comparing units would
 * compare an 8-unit frame against a 0..1 anchor and be wrong in a way that looks
 * like a pass once someone "fixes" it.
 *
 * Finiteness is checked first, on the spine and on the frame's own exit, for the
 * reason `assertForkSeam` records: the comparison below is an ordered one, and
 * every comparison with `NaN` is `false`.
 */
export function assertRibbonSeam(
  frame: RibbonFrame,
  spineX: number = ACT_ANCHORS.pillars.exit.x
): void {
  if (!Number.isFinite(spineX)) {
    throw new NonFiniteCoordinateError(
      `Ribbon seam broken: the spine is ${spineX}, which is not a finite x. The check ` +
        'below is an ordered comparison, and every comparison with NaN is false, so a ' +
        'non-finite spine would pass as "on the spine".'
    );
  }
  if (!Number.isFinite(frame.exit.x) || !Number.isFinite(frame.width)) {
    throw new NonFiniteCoordinateError(
      `Ribbon seam broken: the frame exits at ${frame.exit.x} of ${frame.width}, which is ` +
        'not a finite point. A non-finite coordinate compares false against the spine and ' +
        'would pass as "on the spine".'
    );
  }
  if (Math.abs(frame.exit.x / frame.width - spineX) > 1e-6) {
    throw new Error(
      `Ribbon seam broken: the strand must exit on the page spine at x = ${spineX} ` +
        `as a fraction of its own frame, but it exits at ${frame.exit.x} of ` +
        `${frame.width} (${frame.exit.x / frame.width}).`
    );
  }
  if (frame.convergence.length !== frame.pillarCount) {
    throw new Error(
      `Ribbon seam broken: the frame was built for ${frame.pillarCount} pillars but ` +
        `${frame.convergence.length} strands converge.`
    );
  }
}
