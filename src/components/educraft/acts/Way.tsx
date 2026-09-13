'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ActSection from './ActSection';
import Eyebrow from '@/components/educraft/ui/Eyebrow';
import { LineStage } from '@/components/educraft/line/LineStage';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import { ACT_VIEW_BOX } from '@/components/educraft/line/frames';
import { pathFor } from '@/components/educraft/line/pathBuilders';
import { methodologySteps } from '@/data/pillars';

export type WayProps = { className?: string };

/**
 * The spine: the x the strand and every node read, so a node lands **on** the
 * line rather than near it. `ACT_ANCHORS.way` is the seam contract's value, not
 * a layout choice — the geometry comes from there and the copy is arranged
 * around it.
 */
const SPINE_X = ACT_ANCHORS.way.enter.x;

/** Room kept to the right of the spine, past a node, for the node to sit in. */
const NODE_GUTTER = '2.75rem';

/** The copy the nodes hang off. Moved verbatim from `WhyDifferent.tsx` (§4). */
const DIFFERENTIATORS = [
  {
    title: 'One ecosystem, not five silos',
    description:
      'Programmes are designed to work together. A student building language confidence can also access wellbeing support; an exam aspirant can pause for counselling without leaving the system. Learners move between paths without starting over.',
  },
  {
    title: 'Specialists in every room',
    description:
      'Each vertical is led by people trained for it — language specialists, certified special educators, licensed counsellors, technologists, and exam mentors. Nobody is improvising outside their field.',
  },
  {
    title: 'Families are partners, not spectators',
    description:
      'Goals are agreed with families, not announced to them. Structured check-ins, plain-language reports, and home strategies keep parents genuinely part of the journey.',
  },
  {
    title: 'Progress you can actually see',
    description:
      'Portfolios, dashboards, and benchmarked checkpoints replace vague reassurance. Every programme answers the same question with evidence: what can the student do now that they could not do before?',
  },
  {
    title: 'Wellbeing woven in, not bolted on',
    description:
      'Steadiness is designed into every programme — realistic targets, study-rest cycles, and access to counselling. We treat sustainable learning as a performance advantage, not a soft option.',
  },
] as const;

const METHOD_LEDE =
  'Every programme — whatever the vertical — runs on the same five-step method. It is why the ecosystem stays coherent as it grows.';

/** `01`…`05` — the numerals are the nodes, so they are not a list marker. */
const numeral = (index: number) => String(index + 1).padStart(2, '0');

/**
 * Act 2 — The Way: `WhyDifferent`'s ruled rows and `Methodology`'s five steps
 * as **one argument** (spec §4). The differentiators are the *why*, the method
 * steps are the *how*, and both are nodes on a single vertical strand running
 * the length of the act — one path with two movements, not two strands: the
 * strand spans `way.enter` to `way.exit`, the two anchors the seam contract
 * checks.
 *
 * The strand is drawn by `LineStage`'s own in-view draw: this act is the first
 * to use that default, since it owns no tween of its own. Under reduced motion
 * `LineStage` renders it fully drawn and the nodes are simply a list.
 */
export default function Way({ className }: WayProps = {}) {
  const strand = pathFor(ACT_ANCHORS.way.enter, ACT_ANCHORS.way.exit, 'arc');
  // The copy sits left of the spine, so every block reserves the same gutter.
  const copyStyle = { paddingRight: `calc(${(1 - SPINE_X) * 100}% + ${NODE_GUTTER})` };
  const nodeStyle = { left: `${SPINE_X * 100}%` };

  return (
    <ActSection
      id='way'
      line={
        <LineStage
          paths={[strand]}
          viewBox={ACT_VIEW_BOX}
          className='pointer-events-none absolute inset-0'
        />
      }
      eyebrow='Why Educraft'
      heading='A different kind of education company.'
      lede='Most education offerings are collections of courses. Educraft is a connected system — five specialist verticals sharing one philosophy, one standard of evidence, and one view of the learner.'
      className={className}
    >
      {/* No `mx-auto max-w-5xl` here, and that is the point: the rows must span
          the act, because the node's `SPINE_X` and the copy's gutter are both
          read from the row's own width. At 75% of an inner 976px box every node
          sat 104px off the line at 1440, while this file's comment claimed it
          landed on it. The copy keeps its measure with `max-w-2xl` instead. */}
      <div className='w-full pb-24'>
        <ol>
          {DIFFERENTIATORS.map((item, index) => (
            <li key={item.title} className='relative py-7' style={copyStyle}>
              <span
                aria-hidden='true'
                // The numeral masks the strand behind it, so the line reads as
                // threaded through the nodes rather than struck through them.
                className='absolute top-7 -translate-x-1/2 bg-background px-1 type-caption font-bold text-ec-teal'
                style={nodeStyle}
              >
                {numeral(index)}
              </span>
              <div className='max-w-2xl pl-6'>
                <h3 className='type-heading-s text-ec-ink dark:text-white'>{item.title}</h3>
                <p className='type-body-s mt-2 text-ec-slate'>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className='mt-16' style={copyStyle}>
          <div className='max-w-2xl pl-6'>
            <Eyebrow className='text-ec-teal'>How it works</Eyebrow>
            <h3 className='type-heading-m mt-4 text-ec-ink dark:text-white'>
              Five steps, one method
            </h3>
            <p className='type-body-s mt-3 text-ec-slate'>{METHOD_LEDE}</p>
          </div>
        </div>

        <ol className='mt-8'>
          {methodologySteps.map((step) => (
            <li key={step.title} className='relative py-6' style={copyStyle}>
              <span
                aria-hidden='true'
                className='absolute top-8 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ec-teal-graphic'
                style={nodeStyle}
              />
              <div className='max-w-2xl pl-6'>
                <h4 className='type-heading-s text-ec-ink dark:text-white'>{step.title}</h4>
                <p className='type-body-s mt-2 text-ec-slate'>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className='mt-14' style={copyStyle}>
          <div className='max-w-2xl pl-6'>
            <Link
              href='/methodology'
              className='group inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo transition-opacity hover:opacity-80 dark:text-white'
            >
              Read the full methodology
              <ArrowRight
                className='h-4 w-4 transition-transform duration-150 group-hover:translate-x-1'
                aria-hidden='true'
              />
            </Link>
          </div>
        </div>
      </div>
    </ActSection>
  );
}
