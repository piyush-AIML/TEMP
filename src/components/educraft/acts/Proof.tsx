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
 * The axis's own geometry, in the act's unit frame.
 *
 * **Literals, not derived.** The seam contract covers `ACT_ANCHORS.proof`, the
 * two points the axis hangs from; what happens between them is internal to this
 * act, so these are stated here and pinned by the tests — a change to the scale
 * is a change to the act, and it should be visible as one.
 */
const AXIS_Y = 0.4;
const TICK_BOTTOM_Y = 0.44;
const TICK_XS = [0.15, 0.38, 0.62, 0.85] as const;

/** Moved verbatim from `Impact.tsx` (§4). */
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
 * One strand with three movements — in, across, out — plus a tick per station,
 * all in the unit frame so the act-local anchors are viewBox coordinates.
 *
 * **The axis is a desktop composition.** Below `lg` the stations are a stacked
 * list and the strand is hidden: four labels cannot sit on a scale on a phone,
 * and §9 wants the reduced-motion page to be a plain vertical document anyway.
 * The DOM order is identical in every branch.
 */
export default function Proof({ className }: ProofProps = {}) {
  const [pullQuote, ...marginalia] = testimonials;

  const paths = [
    pathFor(ACT_ANCHORS.proof.enter, { x: TICK_XS[0], y: AXIS_Y }, 'arc'),
    polylinePath([
      { x: TICK_XS[0], y: AXIS_Y },
      { x: TICK_XS[TICK_XS.length - 1], y: AXIS_Y },
    ]),
    pathFor({ x: TICK_XS[TICK_XS.length - 1], y: AXIS_Y }, ACT_ANCHORS.proof.exit, 'arc'),
    ...TICK_XS.map((x) => pathFor({ x, y: AXIS_Y }, { x, y: TICK_BOTTOM_Y }, 'line')),
  ];

  return (
    <ActSection
      id='proof'
      eyebrow='Outcomes & evidence'
      heading={'What "better learning" looks like here'}
      lede='We do not claim transformation with adjectives. We structure impact — and we can show, at every step, how it is built and how it is measured.'
      className={className}
    >
      <div className='mx-auto max-w-5xl px-6 pb-24'>
        <h3 className='type-heading-m text-ec-ink dark:text-white'>How we build evidence</h3>

        <div className='relative mt-8 lg:h-[24rem]'>
          <LineStage
            paths={paths}
            viewBox={ACT_VIEW_BOX}
            className='pointer-events-none absolute inset-0 hidden lg:block'
          />
          <ul className='grid gap-8 sm:grid-cols-2 lg:block'>
            {CHAIN.map((station, index) => (
              <li
                key={station.title}
                className='lg:absolute lg:top-[52%] lg:w-52 lg:-translate-x-1/2'
                style={{ left: `${TICK_XS[index] * 100}%` }}
              >
                <h4 className='type-heading-s text-ec-ink dark:text-white'>{station.title}</h4>
                <p className='type-body-s mt-2 text-ec-slate'>{station.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className='mt-16 grid grid-cols-2 gap-8 border-y border-ec-border py-10 md:grid-cols-4'>
          {STATS.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} sub={stat.sub} />
          ))}
        </div>

        <figure className='mt-20'>
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

        <div className='mt-14 grid gap-10 sm:grid-cols-2'>
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
