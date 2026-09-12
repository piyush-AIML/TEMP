'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import Eyebrow from '@/components/educraft/ui/Eyebrow';
import { LineStage } from '@/components/educraft/line/LineStage';
import { walkFrame } from '@/components/educraft/line/frames';
import { drawAt } from '@/components/educraft/line/station';
import { pillarAccent } from '@/lib/pillarStyles';
import {
  DESKTOP_QUERY,
  MOBILE_QUERY,
  SCRUB,
  stationScrollTarget,
  walkPinRangePx,
} from '@/design/scroll';
import { REDUCED_MOTION_QUERY, gsap, registerGsap, useGSAP } from '@/lib/gsap';
import type { PillarId } from '@/data/pillars';
import type { Highlight } from '@/types';

export type Station = {
  pillarId: PillarId;
  pillarName: string;
  programmeName: string;
  tagline: string;
  /** The programme's own highlight shape, sliced to the two §4 keeps. */
  highlights: readonly Highlight[];
  href: string;
};

export type FivePillarsProps = {
  stations: readonly Station[];
  /** `pillars.length` — the geometry is a function of it, never of `stations`. */
  pillarCount: number;
};

export default function FivePillars({ stations, pillarCount }: FivePillarsProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  /** The pin's start in page pixels, published by the ScrollTrigger itself. */
  const pinStartRef = useRef(0);
  const frame = walkFrame(pillarCount);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      mm.add({ isDesktop: DESKTOP_QUERY, isReduced: REDUCED_MOTION_QUERY }, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as { isDesktop: boolean; isReduced: boolean };
        const scope = root.current;
        const trackEl = track.current;
        // Reduced motion is a CSS branch for this act (see globals.css): the
        // track is neutralised, so there is nothing to animate and nothing to
        // undo. LineStage has already drawn every segment.
        if (!scope || !trackEl || isReduced) return;
        if (!isDesktop) return; // tablet and mobile own their behaviour in CSS

        const segments = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scope);
        if (segments.length === 0) return;

        const trigger = {
          trigger: scope,
          start: 'top top',
          // The pinned run is one dwell per station. `walkPinRangePx` is also
          // what `stationScrollTarget` divides, so the pin and the rail cannot
          // disagree about where a station is.
          end: () => `+=${walkPinRangePx(window.innerHeight, pillarCount)}`,
          pin: true,
          pinSpacing: true,
          scrub: SCRUB,
          // `invalidateOnRefresh` because the end is a function of the viewport
          // height: on resize the range must be recomputed, not scaled.
          invalidateOnRefresh: true,
          // The pin's own start, in page pixels — the rail needs it and cannot
          // derive it. `getBoundingClientRect().top` looks equivalent and is
          // not: *inside* the pinned range the pinned element is fixed to the
          // top of the viewport, so its rect reports 0 and a derived start
          // would be the current scroll position. Every rail click would then
          // overshoot by however far into the walk the reader already was.
          onRefresh: (self: { start: number }) => {
            pinStartRef.current = self.start;
          },
          onUpdate: (self: { progress: number }) => {
            segments.forEach((segment, i) => {
              gsap.set(segment, { strokeDashoffset: 1 - drawAt(self.progress, i, pillarCount) });
            });
          },
        };
        // The track travels **N viewports, not N − 1** — the one place this
        // stage supersedes the spec's §4 Act 1 tween, which reads
        // `0 → -(100 × (N−1))vw`.
        //
        // At (N−1) viewports of travel, station i reaches the middle of the
        // viewport at `i/(N−1)` of the pin, while `drawAt` — pinned by Stage 1
        // and decided by the owner after the alternative was put to them —
        // begins segment i at `i/N`. The two axes differ by `0.5/N` of the pin
        // *on average* and by `1/N` at the ends: **40vh and 80vh of a 400vh walk
        // at five pillars**. (The "up to `0.5/N`, 40vh" this comment carried
        // until the verifier measured it was the mean, not the maximum.) The
        // rail would land 80vh from the station it names, and the strand would
        // draw one station's segment while a different station was centred.
        //
        // A full viewport of travel per dwell removes both disagreements and
        // makes the model self-consistent: station i centres at `i/N`, exactly
        // where `drawAt` starts its segment, so the strand's drawn tip arrives
        // at each station as that station centres. This is what Stage 1's own
        // ruling offered when it corrected `drawAt`'s shape — "the owner was
        // offered a redirect that would instead change Task 7's tween from
        // (N−1) to N steps" — so it restores a decision rather than reversing
        // one.
        const st = gsap.to(trackEl, {
          x: () => -(window.innerWidth * pillarCount),
          ease: 'none',
          scrollTrigger: trigger,
        });

        return () => {
          st.scrollTrigger?.kill();
          st.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [pillarCount] }
  );

  const onRailClick = (index: number) => {
    // §9's buttons must actually move the walk. The behaviour is branch-aware
    // and that is `branchFor`'s consumer: on desktop the track is transformed
    // rather than scrolled, so the page moves; on tablet the stations are
    // stacked, so the element scrolls into view; on mobile the track is a
    // native snap container, so the container scrolls horizontally.
    // Branch on the same media queries the CSS layout uses, not on
    // `window.innerWidth`: a media query measures CSS pixels while `innerWidth`
    // includes the scrollbar, so within ~15px of a breakpoint the two disagree
    // and a rail click would scroll the page under a stacked layout. The queries
    // come from `src/design/scroll.ts`, so the layout and the button cannot drift.
    // (`branchFor` keeps no runtime consumer after this; it remains the
    // spec-pinned statement of §8's three branches, and the boundaries the two
    // queries are asserted against.)
    const branch = window.matchMedia(DESKTOP_QUERY).matches
      ? 'desktop'
      : window.matchMedia(MOBILE_QUERY).matches
        ? 'mobile'
        : 'tablet';
    if (branch === 'tablet') {
      document.getElementById(`station-${stations[index].pillarId}`)?.scrollIntoView({ block: 'start' });
      return;
    }
    if (branch === 'mobile') {
      track.current?.scrollTo({ left: index * window.innerWidth, behavior: 'smooth' });
      return;
    }
    window.scrollTo({
      top: stationScrollTarget(
        index,
        pillarCount,
        pinStartRef.current,
        walkPinRangePx(window.innerHeight, pillarCount)
      ),
      behavior: 'smooth',
    });
  };

  return (
    <section id='pillars' ref={root} className='relative'>
      {/* Desktop: pin + translate. Tablet: stack. Mobile: native snap.
          One structure, three CSS branches — identical DOM order in all of
          them, which is what §9 requires under reduced motion. */}
      <div
        className='snap-x snap-mandatory overflow-x-auto sm:snap-none sm:overflow-x-visible lg:overflow-hidden'
        data-walk-track
      >
        <div
          ref={track}
          className='relative flex w-[var(--track-w)] flex-row sm:w-full sm:flex-col lg:w-[var(--track-w)] lg:flex-row'
          style={{ '--track-w': `${frame.widthVw}vw` } as CSSProperties}
        >
          <LineStage
            paths={frame.railSegments}
            viewBox={frame.viewBox}
            draw={false}
            className='pointer-events-none absolute inset-0'
          />
          <ol className='contents'>
            {stations.map((station) => (
              <li
                key={station.pillarId}
                id={`station-${station.pillarId}`}
                data-walk-station
                className='relative w-screen shrink-0 snap-center sm:w-full lg:h-screen'
              >
                {/* the pillar's soft tier as a full-bleed band, not a box (§4) */}
                <div className={`absolute inset-y-0 left-0 w-1 ${pillarAccent[station.pillarId].border}`} aria-hidden='true' />
                <div className='mx-auto flex h-full max-w-xl flex-col justify-center gap-6 px-6'>
                  <Eyebrow className={pillarAccent[station.pillarId].text}>{station.pillarName}</Eyebrow>
                  <p className='type-display-m text-ec-ink dark:text-white'>{station.programmeName}</p>
                  <p className='type-body-m text-ec-slate'>{station.tagline}</p>
                  <ul className='divide-y divide-ec-border border-y border-ec-border'>
                    {station.highlights.map((highlight) => (
                      <li key={highlight.title} className='py-3 type-body-m text-ec-ink dark:text-white'>
                        <span className='font-medium'>{highlight.title}.</span> {highlight.detail}
                      </li>
                    ))}
                  </ul>
                  <Link href={station.href} className='type-body-s underline underline-offset-4'>
                    Read the full programme
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* §9: real buttons, not decorative dots. */}
      <ol className='mt-8 flex justify-center gap-3'>
        {stations.map((station, index) => (
          <li key={station.pillarId}>
            <button
              type='button'
              onClick={() => onRailClick(index)}
              className='group flex h-6 w-6 items-center justify-center rounded-full'
            >
              <span className='sr-only'>Go to {station.pillarName}</span>
              <span
                aria-hidden='true'
                className={`h-2 w-2 rounded-full ${pillarAccent[station.pillarId].bg}`}
              />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
