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
 * Scrub-mode draw duration, in seconds. Deliberately a standalone literal: no
 * `motion.duration` token sits at 1 — the ladder is 0.1 / 0.16 / 0.24 / 0.4 /
 * 0.7 / 1.2 — so the nearest token (`hero`, 1.2) is 20% away and deriving this
 * from it would be a false equivalence. Same shape as `CEILINGS.headlineStaggerMs`
 * in `@/design/scroll`, which is also a deliberate standalone value.
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
 */
export type LineStageProps = {
  /** Path `d` strings, one per strand. The first is the primary strand. */
  paths: string[];
  /** Aspect ratio for the render box. Anchor coordinates are normalised to it. */
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  /** Pin the stage while `draw` runs. Off for the tableau-style acts. */
  pin?: boolean;
  /**
   * Scroll distance for the pinned run, in `vh` units — i.e. percent of the
   * viewport height, so `100` is one screen and `200` is two.
   */
  pinDistanceVh?: number;
  /**
   * Scrub the draw across the stage's own scroll range instead of playing it
   * once on entry. When true the tween is driven from `top 80%` to
   * `bottom 60%` with `SCRUB` smoothing; when false it plays on entering the
   * viewport, staggered per strand.
   */
  scrub?: boolean;
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
        gsap.set(gsap.utils.toArray<SVGPathElement>('[data-line-path]', scopeEl), {
          strokeDashoffset: 0,
        });
      });

      mm.add(`not all and ${REDUCED_MOTION_QUERY}`, () => {
        // Scoped to this instance's root: `gsap.utils.toArray` with a bare
        // selector would grab every LineStage on the page and cross-wire their
        // timelines.
        const scopeEl = root.current;
        if (!scopeEl) return;

        const tweens = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scopeEl).map((el, index) =>
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
                : undefined,
            }
          )
        );

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
    { scope: root, dependencies: [paths.join('|'), pin, scrub, pinDistanceVh] }
  );

  return (
    <div ref={root} className={cn('relative w-full', className)}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
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
