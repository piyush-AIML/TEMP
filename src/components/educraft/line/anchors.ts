/**
 * The anchor contract (Landing-Redesign-Plan.md §3.1).
 *
 * Every act's strand starts exactly where the previous act's ended, so the eye
 * reads one continuous line while the DOM stays as small, separately
 * understandable pieces. `assertContinuity` (Task 6, `pathBuilders.ts`) proves
 * the seam contract holds, but it is called from the test suite and from
 * nothing else — no runtime module calls it, so nothing checks this file at
 * load time. `anchors.test.ts` is what pins the values in the meantime, and it
 * has to, because `assertContinuity`'s check is relative: it is blind to the
 * two free ends — `origin.enter` and `doors.exit` — and to a coordinated edit
 * that moves both copies of a seam. It is *not* blind to a single anchor move:
 * eight of the ten anchors are written twice, as act i's `exit` and act i+1's
 * `enter`, so moving one copy of a seam breaks that seam and fails.
 *
 * **Frames.** x and y here are **act-local**: x runs 0..1 across one act's own
 * strip and y runs 0..1 down that act's own band. This is *not* the frame
 * `stationPositions` (station.ts) uses — its x is **track-local**, one station
 * per viewport, and its y is the constant walk baseline rather than an act
 * band — and it is not viewport coordinates either. The two are different
 * geometry, not one frame needing conversion: the vertical strand segments are
 * built from these anchors, the horizontal walk's rail from those station
 * positions, and how they compose on screen is a layout decision owned by the
 * Stage 2 caller. `pathFor` (Task 6) is frame-agnostic — it turns two points
 * *in one frame* into a path string and neither knows nor needs to know which
 * frame that is. Nothing should read these values as track widths.
 *
 * Kept in one place because both ends of every seam read from here.
 */

/** The acts, in scroll order. The single source of the act set and its order. */
export const ACT_ORDER = ['origin', 'pillars', 'way', 'proof', 'doors'] as const;

export type ActName = (typeof ACT_ORDER)[number];

export type Anchor = { x: number; y: number };

/** One act's strand endpoints. */
type AnchorPair = { enter: Anchor; exit: Anchor };

/**
 * Both endpoints of one act, frozen.
 *
 * `as const` is a compile-time promise only: at runtime an exported anchor is
 * an ordinary mutable object, so a helper that normalised one in place would
 * silently rewrite the global contract for the rest of the page's life. The
 * depth matters — freezing only the outer object leaves `enter` and `exit`
 * writable, which are the values that matter.
 */
function endpoints(enter: Anchor, exit: Anchor): AnchorPair {
  return Object.freeze({ enter: Object.freeze({ ...enter }), exit: Object.freeze({ ...exit }) });
}

/**
 * Where each act's strand enters and leaves, in **act-local** coordinates.
 *
 * `satisfies Record<ActName, …>` rather than `Record<string, …>`: it constrains
 * the *keys*, so a renamed or deleted act is a compile error instead of a
 * silently different `ActName`.
 */
export const ACT_ANCHORS = Object.freeze({
  origin: endpoints(
    /** The strand enters the hero from the top-right. */
    { x: 0.72, y: 0 },
    /** The fork resolves at the fold, where the five seeds sit. */
    { x: 0.5, y: 1 },
  ),
  pillars: endpoints({ x: 0.5, y: 1 }, { x: 0.5, y: 1 }),
  way: endpoints({ x: 0.5, y: 1 }, { x: 0.5, y: 1 }),
  proof: endpoints({ x: 0.5, y: 1 }, { x: 0.5, y: 1 }),
  doors: endpoints(
    { x: 0.5, y: 1 },
    /** The strand converges to a single point — the CTA. */
    { x: 0.5, y: 0.5 },
  ),
} satisfies Record<ActName, AnchorPair>);
