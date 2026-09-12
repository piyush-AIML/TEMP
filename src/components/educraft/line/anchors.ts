/**
 * The anchor contract (Landing-Redesign-Plan.md §3.1).
 *
 * Every act's strand starts exactly where the previous act's ended, so the eye
 * reads one continuous line while the DOM stays as small, separately
 * understandable pieces. `assertContinuity` (Task 6, `pathBuilders.ts`) **will**
 * prove the seam contract holds — it does not exist yet, so as of Task 5
 * nothing checks this file at load time. `anchors.test.ts` is what pins it in
 * the meantime, and it is the only thing that pins the absolute values:
 * `assertContinuity` compares anchors against anchors, which is a purely
 * relative check and can never see a single anchor move.
 *
 * **Frames.** x and y here are **act-local**: x runs 0..1 across one act's own
 * strip and y runs 0..1 down that act's own band. This is *not* the frame
 * `stationPositions` (station.ts) uses — its x is **track-local**, one station
 * per viewport — and it is not viewport coordinates either. `pathFor` (Task 6)
 * owns the transform between the two; nothing should read these values as track
 * widths.
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
