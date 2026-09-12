'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion as motionTokens } from '@/design/motion';
import { SCRUB } from '@/design/scroll';
import {
  EASE,
  REDUCED_MOTION_QUERY,
  ScrollTrigger,
  gsap,
  registerGsap,
  useGSAP,
} from '@/lib/gsap';

/**
 * In-view (non-scrub) draw duration, in seconds. This is exactly
 * `motion.duration.hero`, so it is taken from the token rather than copied:
 * a change to `motion.duration.hero` moves the strand with it (spec §10.2).
 */
const DRAW_IN_VIEW_S = motionTokens.duration.hero;

/**
 * Duration passed to the tween in scrub mode. **Inert when `scrub` is set:**
 * the value does reach the tween's `duration` option, but `scrub` makes
 * ScrollTrigger drive progress from the scroll position rather than letting the
 * tween run on its own clock, so it never governs the draw. Kept so both
 * branches pass the same option shape.
 */
const DRAW_SCRUB_S = 1;

/**
 * Per-strand stagger for the in-view draw, in seconds, multiplied by strand
 * index so the strands arrive as a sequence rather than together. A value, not
 * a token: it is a per-item offset between animations, not a duration, and
 * `motion.duration` has no offset ladder.
 */
const DRAW_STAGGER_S = 0.12;

/**
 * Where the in-view draw starts, as a ScrollTrigger `start` string.
 *
 * The `pin` and `scrub` docstrings refer to this **by name**, so the value has
 * one home: a docstring that repeated the literal would be a second copy
 * waiting to drift.
 */
const IN_VIEW_START = 'top 85%';

/**
 * Renders one act's strand and wires its scroll-linked draw
 * (Landing-Redesign-Plan.md §3.1).
 *
 * The draw is a single animated property — `stroke-dashoffset` — applied to
 * each path, which is what keeps this cheap. Paths carry `pathLength="1"`, so
 * the dash maths is identical for every path regardless of its real length;
 * nothing here ever calls `getTotalLength()` or reads layout in the animation
 * loop.
 *
 * GSAP owns `stroke-dashoffset` exclusively. Motion must never be pointed at
 * the same property of the same element (spec §3.2).
 *
 * React re-renders do not clobber it, but the reason is narrower than "React
 * preserves it": React 19 diffs the *previous props object*
 * (`prevStyles[name] !== value`), never `node.style`, so it writes a style
 * property only when the value passed in changed. The `style` literal here is
 * constant across renders, so nothing is written and the animated offset
 * survives. A *varying* style value would be written and would fight GSAP —
 * which is why the initial dash state belongs in that constant literal and the
 * animation belongs to GSAP.
 *
 * `draw` controls only the animated branch; the reduced-motion final state is
 * unconditional.
 */
export type LineStageProps = {
  /** Path `d` strings, one per strand. The first is the primary strand. */
  paths: string[];
  /**
   * The SVG's `viewBox`: the coordinate frame the `d` strings are drawn in.
   * Defaults to 1200×800.
   *
   * **The caller owns the scaling.** This repo's geometry is emitted small —
   * `anchors.ts` is act-local 0..1 in both axes, and `stationPositions` is
   * track-local (`x = i`, one station per viewport, on a constant baseline) —
   * and `pathBuilders.ts` states the contract: a path string is
   * resolution-independent, so "the caller scales via `viewBox`". Passing
   * unscaled geometry with the default 1200×800 frame draws it into a
   * 1×1-unit corner: a strand too small to see. Either scale the coordinates
   * before building `paths`, or pass a frame of 1×1.
   */
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  /**
   * Pin the stage for `pinDistanceVh` of scroll, starting at `top top`.
   *
   * Independent of the draw — the pin is its own ScrollTrigger with no
   * relationship to the draw tween. With `pin: true, scrub: false` the draw
   * finishes ~1.2s after the stage's top reaches `IN_VIEW_START`, and the pin
   * then runs for `pinDistanceVh` of scroll. With `scrub: true` it is worse
   * than merely independent; see `scrub`.
   */
  pin?: boolean;
  /**
   * Scroll distance for the pinned run, in `vh` units — i.e. percent of the
   * viewport height, so `100` is one screen and `200` is two.
   */
  pinDistanceVh?: number;
  /**
   * Drive the draw from scroll instead of playing it once. When true the tween
   * is scrubbed from `top 80%` to `bottom 60%` with `SCRUB` smoothing. When
   * false it plays once as the stage's top reaches `IN_VIEW_START` of the
   * viewport (`once: true`), staggered per strand — so an act below the fold is
   * still undrawn when the user arrives at it.
   *
   * **`pin` and `scrub: true` do not compose, and nothing here stops you
   * setting both.** The scrub trigger measures `top 80%` → `bottom 60%` from
   * the element's *unpinned* position, while the pin holds the element at
   * `top top` for `pinDistanceVh`. The two ScrollTriggers are unrelated, so the
   * draw completes over a range that no longer lines up with where the pinned
   * element actually is. Use one or the other; a pinned act that also wants a
   * scrubbed draw needs the composition worked out, which is a Stage 2 design
   * decision rather than a flag.
   */
  scrub?: boolean;
  /**
   * Draw the strand when it scrolls into view. Set `false` for **render-only**
   * mode: the markup is byte-identical (every path keeps its `data-line-path`
   * hook and its inline `strokeDashoffset: 1`) and no draw tween is created, so
   * the caller owns the animation.
   *
   * Act 1 needs this and cannot be served by `scrub`: its rail draws **one
   * segment per station**, against `drawAt(progress, i, n)`'s per-slice
   * fractions, rather than every path against one shared range. Its pin and its
   * track tween are a single ScrollTrigger the act owns, which is also the
   * answer to this component's `pin` ∧ `scrub` non-composition — the two are
   * never asked to compose here.
   *
   * **Reduced motion is still this component's job.** The
   * `REDUCED_MOTION_QUERY` branch sets every strand to `strokeDashoffset: 0`
   * whether or not `draw` is set, because that is not an animation — it is the
   * final state, and the contract is that the reduced-motion page renders every
   * strand fully drawn in identical DOM order (spec §9). A render-only caller
   * must therefore keep its own animation inside a `not all and …` branch, so
   * that under reduced motion this component is the only writer.
   */
  draw?: boolean;

  /**
   * The SVG's `viewBox` as a string, overriding the `viewBoxWidth` ×
   * `viewBoxHeight` composition below.
   *
   * The acts supply their **frame** rather than its dimensions, so the join's
   * policy lives in exactly one place: `ACT_VIEW_BOX` for the four vertical
   * acts, `walkFrame(n).viewBox` and `ribbonFrame(...).viewBox` for the two
   * horizontal ones. Without this the policy is restated as numbers at five
   * call sites, which is the drift `frames.ts` exists to prevent — and it is
   * not hypothetical: the first draft of this plan had the constant and both
   * frame strings with **no reader at all**, while five call sites passed
   * `viewBoxWidth={1} viewBoxHeight={1}` or their equivalent. The correctness
   * review of Task 2 measured it.
   */
  viewBox?: string;
  className?: string;
  /** Content anchored onto the strand. Positioned by the caller. */
  children?: ReactNode;
  /**
   * Labelling hook for the strand's `<title>`. **Not an accessible name:** that
   * `<title>` sits inside an `<svg aria-hidden='true'>`, so assistive tech never
   * announces it. It exists so the SVG is identifiable in devtools and so a
   * future non-decorative use has a string to hang on. All *meaning* must be
   * carried by real DOM text in `children` — the strand is decorative by
   * contract (spec §9).
   */
  label?: string;
};

export function LineStage({
  paths,
  viewBoxWidth = 1200,
  viewBoxHeight = 800,
  pin = false,
  pinDistanceVh = 100,
  scrub = false,
  draw = true,
  viewBox,
  className,
  children,
  label,
}: LineStageProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      // Reduced motion: no pin, no scrub. Every strand renders fully drawn.
      mm.add(REDUCED_MOTION_QUERY, () => {
        // Scoped to this instance's root for the same reason as the branch
        // below: a bare selector would reach every LineStage on the page and
        // mutate another instance's DOM.
        const scopeEl = root.current;
        if (!scopeEl) return;
        const strands = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scopeEl);
        // `gsap.set([])` reaches GSAP's "target not found" warning
        // (`nullTargetWarn` is on by default), so an act with no strands must
        // not call it at all.
        if (strands.length === 0) return;
        gsap.set(strands, { strokeDashoffset: 0 });
      });

      mm.add(`not all and ${REDUCED_MOTION_QUERY}`, () => {
        // Scoped to this instance's root: `gsap.utils.toArray` with a bare
        // selector would grab every LineStage on the page and cross-wire their
        // timelines.
        const scopeEl = root.current;
        if (!scopeEl) return;

        // Render-only: the caller drives these paths. Nothing is created here,
        // so nothing needs killing — but the pin below still applies, because
        // pinning is a scroll mechanic and not a draw.
        const tweens = draw
          ? gsap.utils.toArray<SVGPathElement>('[data-line-path]', scopeEl).map((el, index) =>
              gsap.fromTo(
                el,
                { strokeDashoffset: 1 },
                {
                  strokeDashoffset: 0,
                  ease: EASE.out,
                  duration: scrub ? DRAW_SCRUB_S : DRAW_IN_VIEW_S,
                  delay: scrub ? 0 : index * DRAW_STAGGER_S,
                  scrollTrigger: scrub
                    ? { trigger: root.current, start: 'top 80%', end: 'bottom 60%', scrub: SCRUB }
                    : { trigger: root.current, start: IN_VIEW_START, once: true },
                }
              )
            )
          : [];

        if (pin) {
          ScrollTrigger.create({
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * (pinDistanceVh / 100)}`,
            pin: true,
            pinSpacing: true,
          });
        }

        return () => {
          tweens.forEach((tween) => tween.scrollTrigger?.kill());
          tweens.forEach((tween) => tween.kill());
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [paths.join('|'), pin, scrub, pinDistanceVh, draw] }
  );

  return (
    <div ref={root} className={cn('relative w-full', className)}>
      <svg
        viewBox={viewBox ?? `0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio='none'
        className='h-full w-full'
        aria-hidden='true'
        focusable='false'
      >
        <title>{label ?? 'Connective strand'}</title>
        {paths.map((d, index) => (
          <path
            key={`${index}-${d}`}
            data-line-path
            d={d}
            pathLength={1}
            fill='none'
            strokeWidth={2}
            strokeLinecap='round'
            vectorEffect='non-scaling-stroke'
            className='stroke-ec-teal-graphic'
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />
        ))}
      </svg>
      {children}
    </div>
  );
}
