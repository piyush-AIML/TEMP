'use client';

import { useRef } from 'react';
import EnquireButton from '@/components/educraft/ui/EnquireButton';
import { ButtonNextLink } from '@/components/educraft/ui/Button';
import Eyebrow from '@/components/educraft/ui/Eyebrow';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import { ACT_VIEW_BOX, forkPaths, seedAnchors } from '@/components/educraft/line/frames';
import { pathFor } from '@/components/educraft/line/pathBuilders';
import { LineStage } from '@/components/educraft/line/LineStage';
import MaskLine from '@/components/educraft/motion/MaskLine';
import { CEILINGS, DESKTOP_QUERY, MOBILE_QUERY } from '@/design/scroll';
import { motion as motionTokens } from '@/design/motion';
import { EASE, REDUCED_MOTION_QUERY, gsap, registerGsap, useGSAP } from '@/lib/gsap';

/** Act 0's pinned run, in vh. Spec §4 Act 0: "pinned 70vh". */
const FORK_PIN_VH = 70;
/** The copy's lift and final opacity while the fork resolves. Spec §4 Act 0. */
const COPY_LIFT_Y = -40;
const COPY_FADE = 0.25;
/** Per-line headline stagger, from the token §10.2 names (80ms). */
const HEADLINE_STAGGER_S = CEILINGS.headlineStaggerMs / 1000;

export type OriginProps = {
  eyebrow: string;
  /** The H1 split into the lines that reveal independently, in order. */
  h1Lines: readonly string[];
  lede: string;
  trustLine: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  pillarCount: number;
};

export default function Origin({
  eyebrow,
  h1Lines,
  lede,
  trustLine,
  primaryLabel,
  secondaryLabel,
  secondaryHref,
  pillarCount,
}: OriginProps) {
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  const arc = pathFor(ACT_ANCHORS.origin.enter, ACT_ANCHORS.origin.exit, 'arc');
  /**
   * The phone's fall: §8's mobile row asks for "simplified vertical fall — one
   * strand, not five", and the five branches are 1/5 of a viewport apart, which
   * on a 390px screen is a fan no one can read. Same origin, same fold.
   */
  const fall = pathFor(ACT_ANCHORS.origin.exit, { x: 0.5, y: 1 }, 'line');
  const seeds = seedAnchors(pillarCount);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      // One branch, two conditions: the pin exists only on desktop, and under
      // reduced motion nothing animates at all — `LineStage` has already
      // rendered every strand fully drawn.
      mm.add({ isDesktop: DESKTOP_QUERY, isReduced: REDUCED_MOTION_QUERY }, (ctx) => {
        const { isDesktop, isReduced } = ctx.conditions as {
          isDesktop: boolean;
          isReduced: boolean;
        };
        const scope = root.current;
        if (!scope || isReduced) return;
        // Scoped per stage rather than over the section: the fork and the phone's
        // fall are alternatives, and a section-wide query would hand the arc's
        // slot to whichever stage happened to come first in the DOM.
        const forkStage = scope.querySelector('[data-origin-fork]');
        const fallStage = scope.querySelector('[data-origin-fall]');
        const strands = forkStage ? gsap.utils.toArray<SVGPathElement>('[data-line-path]', forkStage) : [];
        const [arcPath, ...branches] = strands;
        const fallPath = fallStage
          ? gsap.utils.toArray<SVGPathElement>('[data-line-path]', fallStage)[0]
          : undefined;
        if (!arcPath) return;

        // The line continues the type: it draws as the headline's last line
        // lands, on arrival rather than on scroll. The arc and the phone's fall
        // are the same moment at two widths — exactly one of them is displayed,
        // and each has exactly one tween.
        gsap.fromTo(
          [arcPath, fallPath].filter(Boolean),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: EASE.out, duration: motionTokens.duration.hero }
        );

        if (isDesktop && copy.current) {
          // Desktop: pin, and scrub the fork open while the copy lifts away.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: scope,
              start: 'top top',
              end: () => `+=${window.innerHeight * (FORK_PIN_VH / 100)}`,
              pin: true,
              pinSpacing: true,
              scrub: 1,
            },
          });
          tl.fromTo(branches, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: EASE.out }, 0)
            .to(copy.current, { y: COPY_LIFT_Y, opacity: COPY_FADE, ease: EASE.soft }, 0);

          return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
          };
        }

        // Tablet: §8 is explicit that "the fork still happens" — it simply is
        // not pinned and not scrubbed. Every branch was left undrawn here, so
        // the reader saw five seed dots with no lines reaching them.
        if (!window.matchMedia(MOBILE_QUERY).matches) {
          gsap.fromTo(
            branches,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: EASE.out,
              duration: motionTokens.duration.hero,
              delay: motionTokens.duration.hero * 0.5,
              stagger: motionTokens.duration.hero / 6,
            }
          );
        }
        // Phone: the fall has already drawn with the arc, and the five branches
        // are `hidden` — nothing here touches them.
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [pillarCount] }
  );

  return (
    <section id='origin' className='relative'>
      <div ref={root} className='relative flex h-screen items-center px-6'>
        {/* One stage visible at a time, so the arc reaches the seeds on a phone
            and forks into five everywhere else. The fork comes first in the DOM
            because it is the composition; the fall is its phone substitute. */}
        <div className='contents' data-origin-fork>
          <LineStage
            paths={[arc, ...forkPaths(pillarCount)]}
            viewBox={ACT_VIEW_BOX}
            draw={false}
            className='pointer-events-none absolute inset-0 hidden sm:block'
          >
            {/* The seed nodes, positioned from the same values the branches land
                on — the join's promise, and the reason they are not hand-placed. */}
            <div aria-hidden='true' className='absolute inset-0'>
              {seeds.map((seed) => (
                <span
                  key={`${seed.x}`}
                  style={{ left: `${seed.x * 100}%`, top: `${seed.y * 100}%` }}
                  className='absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ec-teal-graphic'
                />
              ))}
            </div>
          </LineStage>
        </div>

        <div className='contents' data-origin-fall>
          <LineStage
            paths={[fall]}
            viewBox={ACT_VIEW_BOX}
            draw={false}
            className='pointer-events-none absolute inset-0 sm:hidden'
          />
        </div>

        <div ref={copy} className='relative mx-auto w-full max-w-3xl md:mx-0 md:max-w-2xl'>
          <Eyebrow className='text-ec-teal'>{eyebrow}</Eyebrow>
          <h1 className='type-display-xl mt-5 text-ec-ink dark:text-white'>
            {h1Lines.map((line, index) => (
              <MaskLine key={line} delay={index * HEADLINE_STAGGER_S}>
                {line}
              </MaskLine>
            ))}
          </h1>
          <p className='type-body-l mt-6 text-pretty text-ec-slate'>{lede}</p>
          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <EnquireButton variant='primary' size='lg'>
              {primaryLabel}
            </EnquireButton>
            <ButtonNextLink href={secondaryHref} variant='secondary' size='lg'>
              {secondaryLabel}
            </ButtonNextLink>
          </div>
          <p className='type-body-s mt-6 text-ec-slate'>{trustLine}</p>
          {/* `_copy.md`'s Act 0 row: the retired hero's cue, kept as real DOM
              text rather than decoration a screen reader walks past. */}
          <span className='sr-only'>Scroll</span>
        </div>
      </div>
    </section>
  );
}
