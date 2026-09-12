# 0006 — The Line system's coordinate frames, and why `pathFor` reconciles none of them

**Date:** 2026-09-13
**Status:** Accepted — Stage 1 shipped; the join is Stage 2's to design

## Context

The "One Line" design (ADR 0002) draws one continuous strand through five acts. Stage 1 built that
geometry as three pure, DOM-free modules, because this project has no local runtime and pure
functions with tests are the only verification available (ADR 0001, `platform/verification.md`):

- `anchors.ts` — where each act's strand enters and leaves.
- `station.ts` — where the five pillar stations sit along Act 1's horizontal walk.
- `pathBuilders.ts` — turning two points into an SVG `d` string.

They were built independently and each is correct in isolation. Reviewing the stage as a whole
exposed the thing no per-task review could see: **the three do not join, and nothing in the shipped
code ever draws a strand.** `LineStage` imports `cn`, `motion`, `SCRUB` and GSAP — not `anchors`,
`station` or `pathBuilders`.

Two failures made this concrete. First, a documentation claim: `anchors.ts` and `station.ts` both
asserted that "`pathFor` owns the transform" between their frames. Second, a measurement: feeding
`stationPositions(5)` straight through `pathFor` into `LineStage`'s default `1200×800` viewBox draws a
rail occupying **0.33%** of the SVG width, and Act 0's arc renders **0.26px × 1.13px** at 1440×900.

## Decision

**Three frames exist, and they are not the same space:**

- `anchors.ts` x and y are **act-local**: 0..1 across one act's own strip, 0..1 down that act's own
  band.
- `stationPositions` x is **track-local**: station `i` sits `i` *track-widths* from the first, one
  station per viewport, so the range is `0..N−1` and not 0..1. Its y is a constant in **viewport
  heights**.
- `LineStage` renders in whatever unit space its `viewBox` declares, defaulting to `1200×800`.

**`pathFor` is frame-agnostic and reconciles nothing.** It was briefly documented — in three files —
as owning the transform, via `trackX = actIndex + actLocalX`. That formula is false three ways: it
conflates the *act* index with the *station* index, it maps one shared seam point to two different
places depending on which side of the seam you draw from (manufacturing the very discontinuity
`assertContinuity` exists to forbid), and it says nothing about y, where the frames genuinely differ.
The signature `pathFor(from, to, shape)` receives two bare points and carries no act identity, so it
*cannot* perform the transform. That is a structural fact about the signature, not a preference.

**The reconciliation belongs to the caller** — Stage 2 — because only the caller knows which act a
point belongs to and how large the act's strip is on screen.

## Consequences

- **Stage 1's exit criteria are met and the stage is not "incomplete" for this.** The criteria always
  said "`LineStage` exists but is unused; Stage 2 binds it." What Stage 1 owed was correct,
  tested pieces; what it does not hand over is the join.
- **Stage 2 designs the coordinate system from scratch**, and that is now stated at the top of its
  planning inputs in `stages/README.md` rather than left for it to rediscover. The destructive reading
  of "use them, do not re-invent" was to assemble the three modules and expect a strand.
- **A naive seam check will throw a false alarm.** `assertContinuity` enforces `exit == enter` as
  *values*, but act-local those are each act's own edge, one act-band apart on screen once stacked.
  A corrected Act 2 spine is rejected by the current test until every seam moves together.
- **The walk's draw disagrees with the spec's tween by (N−1)/N.** `drawAt`'s slices are `1/N`; the
  spec tweens the track `0 → −(100×(N−1))vw`. There is no mapping in which a segment draws as the walk
  arrives at it. 5 stations make 4 gaps; `drawAt` models 5 slices. `drawAt`'s shape is forced by three
  properties that cannot all hold otherwise, so the tween — not `drawAt` — is what needs revisiting if
  the two must agree.
- **The anchor values, arc coefficients and fork shape remain invented.** No design document fixes
  `0.72` or the `0.5` baseline. Pinning them by test makes a *change* visible; it does not make them
  *correct*, and they still need the owner's eye. The `dy = 0` case makes the fork's real geometry a
  horizontal bulge rather than the vertical leave its docstring describes.
- **Cost if wrong:** Stage 2 builds its layout on the wrong assumption about which module owns which
  frame, and the strand renders at the wrong scale — silently, because the SVG is `aria-hidden` and
  nothing in the suite can see it. The mitigation is that the frames are now named in three module
  docstrings, in `stages/README.md`'s join warning, and here.

## Stage 2 update — 2026-09-13

**The decision above stands unchanged. Its stated consequence — "how they compose on screen is a
layout decision owned by the Stage 2 caller" — now has an answer**, recorded here so a reader who
stops at this file learns it rather than re-deriving it.

The caller is `src/components/educraft/line/frames.ts` (Stage 2 Task 2), and **the reconciliation is
viewBox selection, not arithmetic** — which is what makes R8's "no per-point arithmetic maps one onto
the other" a non-obstacle rather than a dead end. A vertical act renders `ACT_VIEW_BOX` (`0 0 1 1`)
over a box sized to its own band, so the act-local anchors *are* viewBox coordinates verbatim and
`anchors.ts` needs no transform. The walk renders `0 0 N 1` over an element `N × 100vw` wide and
`100vh` tall, so one unit is one viewport and `stationPositions`' `x = i` (track widths) becomes the
centre of slot `i` with a single **half-slot offset** — the whole of the transform, and it lives in
the caller, as R8 requires. `station.ts` is unmodified. The measured symptom is gone: the rail spans
the full width of its frame instead of 0.33% of it.

The same module gives the other consequences somewhere to land. `pathFor`'s `'fork'` shape — which had
**no callers anywhere** — is called by `forkPaths`, fed by `seedAnchors`, which generates the seed
nodes `ACT_ANCHORS` does not carry; `assertForkSeam` enforces the `dy > 0` reading the shape's
docstring describes rather than assuming it. At the other end `assertRibbonSeam` checks the ribbon's
exit against `ACT_ANCHORS.pillars.exit` **as a fraction of its own frame**, which is the comparison a
seam makes and the one a units comparison would get wrong while looking like a pass. Neither is
called at runtime yet — `page.tsx` becomes the single call site for all three seam assertions in
Stage 2's last task, which is the call site Stage 1 left open.

Each of the consequences below the decision now has an outcome, one of them from a later task rather
than from this module:

- **"A naive seam check will throw a false alarm"** — correct, and the repair was to *re-specify*
  `assertContinuity`, not to weaken it. It now checks the shape of a seam (each act's exit on its own
  bottom edge, the next's enter on its own top edge, one shared horizontal fraction) instead of
  `exit == enter` as raw values, which no correct vertical chain satisfies. Recorded at stage close in
  ADR 0008.
- **"The anchor values, arc coefficients and fork shape remain invented"** — still true, and it is
  the one consequence Stage 2 does not retire. Pinning these by test makes a change visible, not
  correct; they still need the owner's eye. What has changed is narrow and worth stating exactly: the
  fork's `dy` is non-zero for the first time (`FORK` at y = 0.85, the seeds at y = 1), so the vertical
  leave the shape's docstring describes is now its real geometry rather than the horizontal bulge this
  file records, and `assertForkSeam` turns a return to `dy = 0` into a test failure. The arc
  coefficients and the anchor values themselves are untouched by that.
- **"The walk's draw disagrees with the spec's tween by (N−1)/N"** — resolved in Stage 2 by changing
  the *tween*, which is the side this file said needed revisiting: the walk tweens N viewports rather
  than `N − 1` (Tasks 6–7), so the tween, `drawAt`'s slices and `walkFrame`'s N one-unit segments all
  put station `i` at `i/n`. The frame's shape is what forces it — slice `i` is `[i, i+1]` with
  station `i` at its midpoint, asserted directly in `frames.test.ts` — and the resolved tween is the
  one Stage 1's ruling had already offered.
- `stages/README.md`'s **⚠ join warning has been replaced by the outcome**, since it asserted that
  the join did not exist. The mitigation sentence above therefore now points at a note rather than a
  warning; the frames are still named there.

