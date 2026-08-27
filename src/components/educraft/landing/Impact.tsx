'use client';

import { TrendingUp, ArrowUpRight } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';
import Stat from '../ui/Stat';
import { TopographicLines } from '../graphics/DecorativeSystems';

/**
 * Impact & proof (plan §19, §21) — the structure of impact shown
 * qualitatively: Confidence → Engagement → Skill → Readiness as a rising
 * chain, plus how proof is built. Numbers appear only where they are
 * real (structural facts about the ecosystem itself).
 */
export default function ImpactSection() {
  return (
    <section className='relative py-20 md:py-28 bg-ec-canvas-deep/50 dark:bg-ec-canvas-deep overflow-hidden'>
      <TopographicLines className='opacity-70' colorClassName='text-ec-indigo' />

      <div className='container-site relative'>
        <SectionHeading
          eyebrow='Outcomes & evidence'
          title='What "better learning" looks like here'
          subtext='We do not claim transformation with adjectives. We structure impact — and we can show, at every step, how it is built and how it is measured.'
        />

        {/* Structure of impact — rising chain */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto'>
          {impactChain.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 120}
              className='relative card-surface p-6 pt-8'
            >
              <span className='absolute -top-3 left-6 bg-ec-teal text-white text-xs font-bold px-3 py-1 rounded-full'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <TrendingUp className='w-6 h-6 text-ec-teal mb-3' aria-hidden='true' />
              <h3 className='type-heading-s text-ec-indigo dark:text-white'>{item.title}</h3>
              <p className='type-body-s text-ec-slate mt-2'>{item.description}</p>
              {i < impactChain.length - 1 && (
                <ArrowUpRight
                  className='hidden lg:block absolute top-1/2 -right-3.5 w-5 h-5 text-ec-teal/50 z-10'
                  aria-hidden='true'
                />
              )}
            </Reveal>
          ))}
        </div>

        {/* Real, verifiable structural facts */}
        <Reveal className='mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-ec-border py-10'>
          <Stat value='5' label='Vertical programmes' sub='One per pillar' />
          <Stat value='1' label='Connected ecosystem' sub='Shared philosophy & evidence' />
          <Stat value='4' label='Audiences served' sub='Schools · Parents · Students · Partners' />
          <Stat value='6' label='Journey stages' sub='Curious to ready' />
        </Reveal>

        {/* How proof is built */}
        <div className='mt-16'>
          <Reveal>
            <h3 className='type-heading-m text-ec-indigo dark:text-white mb-8'>
              How we build evidence
            </h3>
          </Reveal>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            {proofPillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className='card-surface h-full p-5'>
                  <h4 className='type-heading-s text-ec-indigo dark:text-white'>{p.title}</h4>
                  <p className='type-body-s text-ec-slate mt-2'>{p.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const impactChain = [
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
];

const proofPillars = [
  {
    title: 'People',
    description:
      'Specialists with recognised qualifications lead every vertical — language educators, certified special educators, licensed counsellors, technologists, exam mentors.',
  },
  {
    title: 'Process',
    description:
      'Documented methods: individualised plans, level-mapped pathways, safeguarding protocols, and structured review cadences.',
  },
  {
    title: 'Evidence',
    description:
      'Portfolios, dashboards, and checkpoints give families visible proof of progress at every review — no impressions.',
  },
  {
    title: 'Partnerships',
    description:
      'We work with schools and families as partners: coordinated goals, shared reporting, and one consistent view of the learner.',
  },
  {
    title: 'Outcomes',
    description:
      'Every claim traces back to a structured outcome — what the student can now do, and what it unlocks next.',
  },
];
