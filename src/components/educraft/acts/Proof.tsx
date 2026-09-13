'use client';

import ActSection from './ActSection';
import Stat from '@/components/educraft/ui/Stat';
import { LineStage } from '@/components/educraft/line/LineStage';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import { ACT_VIEW_BOX } from '@/components/educraft/line/frames';
import { pathFor, polylinePath } from '@/components/educraft/line/pathBuilders';
import { testimonials } from '@/data/testimonials';

export type ProofProps = { className?: string };

/**
 * The spine: the same x every vertical act's strand reads, so a node lands
 * **on** the line rather than near it.
 */
const SPINE_X = ACT_ANCHORS.proof.enter.x;

/** Room kept to the right of the spine, past the copy, for the strand. */
const NODE_GUTTER = '2.75rem';

/**
 * The axis's geometry — **as fractions of the act**, not of an inner box.
 *
 * That distinction is the whole of this act's frame problem. These were
 * fractions of a `lg:h-[24rem]` container sitting in the middle of the act, so
 * the strand that turns into the axis was drawn in a 384px box while its
 * neighbours' strands were drawn in theirs: `proof.exit` rendered ~800px above
 * the act's bottom edge, and the act-local `y = 0` the seam contract checks was
 * not on any edge at all. Reading the act's own box costs one rule — everything
 * drawn inside the frame is positioned in the same frame — and it is the rule
 * `AXIS_Y` and `STATION_Y` now share with the strand.
 */
const AXIS_Y = 0.4;
/** The station's top edge is the tick's end, which is what "on the axis" means. */
const STATION_Y = 0.44;
const TICK_BOTTOM_Y = 0.44;
const TICK_XS = [0.15, 0.38, 0.62, 0.85] as const;

/**
 * Moved verbatim from `landing/Impact.tsx` (§4) — retired with the other eleven
 * sections in Task 11, so this is provenance rather than a live reference.
 */
const CHAIN = [
  {
    title: 'Confidence',
    description:
      'Students who can see their own progress start to trust their ability to learn — the foundation everything else stands on.',
  },
  {
    title: 'Engagement',
    description:
      'Learning designed around real interests and visible wins becomes something students want to return to.',
  },
  {
    title: 'Skill',
    description:
      'Capability demonstrated through portfolios, projects, and benchmarked checkpoints — not asserted in a brochure.',
  },
  {
    title: 'Readiness',
    description:
      'The destination: a student prepared for exams, conversations, applications, and whatever comes after school.',
  },
] as const;

// A station with no tick would be parked at `NaN%` — the two arrays are one
// fact stated twice, and `noUncheckedIndexedAccess` is off, so the compiler
// cannot see it. Fail at module evaluation, like the seam assertions do.
if (CHAIN.length !== TICK_XS.length) {
  throw new Error(
    `Proof: ${CHAIN.length} stations but ${TICK_XS.length} ticks. One station would ` +
      'render with no tick under it and an undefined x.'
  );
}

/**
 * The stat row keeps the shipped treatment and loses its one defect (§1.3):
 * `Partners` was never an audience — `data/navigation.ts` defines three
 * `audienceEntries`, and this row said four.
 */
const STATS = [
  { value: '5', label: 'Vertical programmes', sub: 'One per pillar' },
  { value: '1', label: 'Connected ecosystem', sub: 'Shared philosophy & evidence' },
  { value: '3', label: 'Audiences served', sub: 'Schools · Parents · Students' },
  { value: '6', label: 'Journey stages', sub: 'Curious to ready' },
] as const;

const SEED_WARNING = 'These are placeholder quotes pending consented testimonials.';

/**
 * Act 3 — Proof: the strand becomes a **horizontal axis with tick marks**, an
 * evidence scale (spec §4). The impact chain's four stations sit on it, the stat
 * row keeps its unboxed treatment, and the three testimonial cards become one
 * pull quote with two marginalia under hairline rules.
 *
 * **Two strands, one visible at a time.** The axis needs a box it can scale a
 * scale into, and §8 asks for a vertical thread below `lg` where four labels
 * cannot sit on a scale. So the seam is carried by whichever is on screen: the
 * plain vertical spine below `lg`, the motif at `lg` and above. Both start at
 * `proof.enter` and end at `proof.exit`, so the handoff either side is the same
 * two anchors at every width.
 */
export default function Proof({ className }: ProofProps = {}) {
  const [pullQuote, ...marginalia] = testimonials;

  const spine = pathFor(ACT_ANCHORS.proof.enter, ACT_ANCHORS.proof.exit, 'arc');
  const paths = [
    pathFor(ACT_ANCHORS.proof.enter, { x: TICK_XS[0], y: AXIS_Y }, 'arc'),
    polylinePath([
      { x: TICK_XS[0], y: AXIS_Y },
      { x: TICK_XS[TICK_XS.length - 1], y: AXIS_Y },
    ]),
    pathFor({ x: TICK_XS[TICK_XS.length - 1], y: AXIS_Y }, ACT_ANCHORS.proof.exit, 'arc'),
    ...TICK_XS.map((x) => pathFor({ x, y: AXIS_Y }, { x, y: TICK_BOTTOM_Y }, 'line')),
  ];

  // Everything below the axis keeps clear of the spine for the same reason the
  // axis does: the strand runs the act's full height, so it crosses whatever is
  // not inset.
  const copyStyle = { paddingRight: `calc(${(1 - SPINE_X) * 100}% + ${NODE_GUTTER})` };

  return (
    <ActSection
      id='proof'
      line={
        <>
          <LineStage
            paths={[spine]}
            viewBox={ACT_VIEW_BOX}
            className='pointer-events-none absolute inset-0 lg:hidden'
          />
          <LineStage
            paths={paths}
            viewBox={ACT_VIEW_BOX}
            className='pointer-events-none absolute inset-0 hidden lg:block'
          />
        </>
      }
      eyebrow='Outcomes & evidence'
      heading={'What "better learning" looks like here'}
      lede='We do not claim transformation with adjectives. We structure impact — and we can show, at every step, how it is built and how it is measured.'
      className={className}
    >
      <div className='w-full pb-24'>
        <h3 className='type-heading-m max-w-2xl pl-6 text-ec-ink dark:text-white'>
          How we build evidence
        </h3>

        {/* **Unpositioned on purpose.** A `relative` here would become the
            stations' containing block, and their `left`/`top` would then be
            fractions of this spacer while the strand's `AXIS_Y` is a fraction of
            the act — two boxes, one supposed alignment, and nothing to catch the
            drift. It shipped that way for one round: `lg:h-[34rem]` → `lg:h-[30rem]`
            slid every station up the act, away from its tick, with 355 tests
            green. As an unpositioned spacer it reserves the room; the numbers
            both read the act. */}
        <div className='lg:h-[44rem]'>
          <ul className='grid gap-8 sm:grid-cols-2 lg:block'>
            {CHAIN.map((station, index) => (
              <li
                key={station.title}
                // `left`/`top` are inert while the item is static, which is what
                // lets one inline style serve both the stacked list and the
                // positioned station — they apply at `lg` and nowhere else.
                className='max-w-2xl pl-6 lg:absolute lg:w-52 lg:-translate-x-1/2 lg:pl-0'
                style={{ left: `${TICK_XS[index] * 100}%`, top: `${STATION_Y * 100}%` }}
              >
                <h4 className='type-heading-s text-ec-ink dark:text-white'>{station.title}</h4>
                <p className='type-body-s mt-2 text-ec-slate'>{station.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div
          className='mt-16 grid grid-cols-2 gap-8 border-y border-ec-border py-10 md:grid-cols-4'
          style={copyStyle}
        >
          {STATS.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} sub={stat.sub} />
          ))}
        </div>

        <figure className='mt-20' style={copyStyle}>
          <blockquote className='type-heading-l text-pretty font-[family-name:var(--font-manrope)] font-medium text-ec-ink dark:text-white'>
            &ldquo;{pullQuote.quote}&rdquo;
          </blockquote>
          <figcaption className='mt-6 flex flex-col gap-1'>
            <span className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink dark:text-white'>
              {pullQuote.name}
            </span>
            <span className='type-body-s text-ec-slate'>
              {pullQuote.role} · {pullQuote.context}
            </span>
          </figcaption>
          {/* Visible, not a comment: a launch blocker the reader cannot see is
              one nobody replaces (§4's carried caveat). */}
          <p className='type-body-s mt-4 text-ec-slate'>{SEED_WARNING}</p>
        </figure>

        <div className='mt-14 grid gap-10 sm:grid-cols-2' style={copyStyle}>
          {marginalia.map((testimonial) => (
            <figure key={testimonial.name} className='border-t border-ec-border pt-6'>
              <p className='type-body-m text-pretty text-ec-ink dark:text-white/90'>
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <figcaption className='mt-4 type-body-s text-ec-slate'>
                {testimonial.name} — {testimonial.role} · {testimonial.context}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </ActSection>
  );
}
