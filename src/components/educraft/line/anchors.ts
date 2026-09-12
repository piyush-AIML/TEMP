/**
 * The anchor contract (Landing-Redesign-Plan.md §3.1).
 *
 * Every act's strand starts exactly where the previous act's ended, so the eye
 * reads one continuous line while the DOM stays as small, separately
 * understandable pieces. `assertContinuity` (pathBuilders.ts) proves the
 * contract holds; a seam mismatch is a test failure, not an eyeball judgement.
 *
 * Coordinates are normalised: x in track-widths (0 = left edge of act 0,
 * 1 = one viewport to the right), y in viewport heights from the top of the
 * strand's own band. Kept in one place because both ends of every seam read
 * from here.
 */

export type Anchor = { x: number; y: number };

/** Where each act's strand enters and leaves, in normalised coordinates. */
export const ACT_ANCHORS = {
  origin: {
    /** The strand enters the hero from the top-right. */
    enter: { x: 0.72, y: 0 },
    /** The fork resolves at the fold, where the five seeds sit. */
    exit: { x: 0.5, y: 1 },
  },
  pillars: {
    enter: { x: 0.5, y: 1 },
    exit: { x: 0.5, y: 1 },
  },
  way: {
    enter: { x: 0.5, y: 1 },
    exit: { x: 0.5, y: 1 },
  },
  proof: {
    enter: { x: 0.5, y: 1 },
    exit: { x: 0.5, y: 1 },
  },
  doors: {
    enter: { x: 0.5, y: 1 },
    /** The strand converges to a single point — the CTA. */
    exit: { x: 0.5, y: 0.5 },
  },
} as const satisfies Record<string, { enter: Anchor; exit: Anchor }>;

export type ActName = keyof typeof ACT_ANCHORS;
