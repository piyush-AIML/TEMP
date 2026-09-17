import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/educraft/motion/Reveal';
import SectionWash from '@/components/educraft/motion/SectionWash';
import EnquireButton from '@/components/educraft/ui/EnquireButton';
import { Constellation } from '@/components/educraft/graphics/DecorativeSystems';
import MdMessage from '@/components/educraft/about/MdMessage';
import MethodSteps from '@/components/educraft/about/MethodSteps';
import OutreachNetwork from '@/components/educraft/about/OutreachNetwork';

export const metadata: Metadata = {
  title: 'About — Educraft',
  description:
    'Educraft exists to connect the pieces of a learner’s journey — language, inclusion, wellbeing, technology, and exam readiness — under one trusted ecosystem.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div>
      {/* 01 · Who we are — the former hero and "The idea" as one opening spread:
          no standalone hero followed by a gap, the two halves sit side by side. */}
      <header className='relative pt-32 pb-16 md:pt-40 md:pb-20 bg-background overflow-hidden'>
        <Constellation className='opacity-40' colorClassName='text-ec-teal' />
        <div className='container-site relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>About Educraft</span>
            <h1 className='type-display-l text-ec-indigo dark:text-white text-balance'>
              Education is a system. We built one.
            </h1>
            <p className='type-body-l text-ec-slate mt-5 text-pretty'>
              Educraft unifies five specialist verticals — linguistics, inclusive education,
              wellbeing, AI &amp; digital technology, and NEET/JEE preparation — under one
              philosophy: every learner deserves a path designed for how they actually learn.
            </p>
          </Reveal>

          <div className='lg:border-l lg:border-ec-hairline lg:pl-16'>
            <Reveal delay={80}>
              <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>The idea</span>
              <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
                Most learners do not need one course. They need a system.
              </h2>
            </Reveal>
            <div className='space-y-5 mt-5'>
              <Reveal delay={140}>
                <p className='type-body-l text-ec-ink dark:text-ec-ink/90 text-pretty'>
                  A student preparing for an exam may also need help with stress. A student
                  learning a language may process information differently and need adapted
                  teaching. A school serving all of them needs a partner that speaks all
                  five languages.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p className='type-body-m text-ec-slate text-pretty'>
                  Educraft was built around that observation. Instead of five disconnected
                  course catalogues, we run one ecosystem: shared enrolment, shared
                  progress reporting, shared safeguarding, and specialists who coordinate
                  with each other about the same learner.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <p className='type-body-m text-ec-slate text-pretty'>
                  The result is what a learner actually needs: continuity. A plan that can
                  span language, inclusion, wellbeing, technology, and exams without
                  starting over at every handoff.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </header>

      {/* 02 · Why we exist — vision and mission share one plane (left / right),
          with the method that turns the mission into practice beneath them. */}
      <section className='relative py-16 md:py-20 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-y border-ec-border/60 overflow-hidden'>
        <Constellation className='opacity-40' colorClassName='text-ec-teal' />
        <div className='container-site relative'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal'>Our direction</span>
          </Reveal>

          <div className='mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start'>
            {/* Vision — the aspiration */}
            <div>
              <Reveal delay={80}>
                <h2 className='eyebrow text-ec-teal'>Vision</h2>
              </Reveal>
              <Reveal delay={120} distance={24}>
                <p className='type-display-m text-ec-indigo dark:text-white mt-4 text-balance'>
                  {VISION.statement}
                </p>
              </Reveal>
              <Reveal delay={180}>
                <p className='type-body-m text-ec-slate mt-4 text-pretty'>{VISION.support}</p>
              </Reveal>
              <Reveal delay={220}>
                <ul className='mt-5 space-y-2.5 border-t border-ec-hairline pt-5'>
                  {VISION.points.map((point) => (
                    <li key={point} className='flex items-start gap-3 type-body-s text-ec-slate'>
                      <span
                        aria-hidden='true'
                        className='mt-2 w-1.5 h-1.5 rounded-full bg-ec-teal flex-shrink-0'
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* Mission — the operation */}
            <div className='lg:border-l lg:border-ec-hairline lg:pl-16'>
              <Reveal delay={140}>
                <h2 className='eyebrow text-ec-teal'>Mission</h2>
              </Reveal>
              <Reveal delay={180} distance={24}>
                <p className='type-heading-xl text-ec-indigo dark:text-white mt-4 text-balance'>
                  {MISSION.statement}
                </p>
              </Reveal>
              <Reveal delay={240}>
                <p className='type-body-m text-ec-slate mt-4 text-pretty'>{MISSION.support}</p>
              </Reveal>
              <Reveal delay={280}>
                <ul className='mt-5 space-y-2.5 border-t border-ec-hairline pt-5'>
                  {MISSION.points.map((point) => (
                    <li key={point} className='flex items-start gap-3 type-body-s text-ec-slate'>
                      <span
                        aria-hidden='true'
                        className='mt-2 w-1.5 h-1.5 rounded-full bg-ec-teal flex-shrink-0'
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>

          <div className='mt-10 md:mt-12 border-t border-ec-hairline pt-8 md:pt-10'>
            <MethodSteps />
          </div>
        </div>
      </section>

      {/* 03 · Who leads the vision */}
      <section className='py-16 md:py-24 bg-background border-t border-ec-hairline'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Leadership</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              A word from the Director.
            </h2>
          </Reveal>
          <Reveal delay={100} className='mt-8 md:mt-12'>
            <MdMessage />
          </Reveal>
        </div>
      </section>

      {/* 04 · What we believe */}
      <section className='py-16 md:py-24 bg-background border-t border-ec-hairline'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Principles</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              What we will not compromise on
            </h2>
          </Reveal>
          <ol className='border-t border-ec-hairline'>
            {principles.map((v, i) => (
              <Reveal as='li' key={v.title} delay={i * 80} className='border-b border-ec-hairline'>
                <div className='grid grid-cols-[auto_1fr] gap-x-6 py-6'>
                  <span className='type-caption font-semibold text-ec-slate tabular-nums mt-1'>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className='type-heading-s text-ec-indigo dark:text-white'>{v.title}</h3>
                    <p className='type-body-m text-ec-slate mt-2 text-pretty'>{v.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 05 · How we reach beyond one place */}
      <section className='py-16 md:py-24 bg-ec-canvas-deep/60 dark:bg-ec-canvas-deep border-y border-ec-border/60'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] items-center gap-10 lg:gap-16'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Global outreach</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              From local classrooms to international study.
            </h2>
            <p className='type-body-m text-ec-slate mt-5 text-pretty'>
              Learners are prepared for global higher education, and every programme is
              benchmarked against internationally recognised level descriptors. The network
              around that work is growing — the confirmed and open nodes are shown here.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <OutreachNetwork />
          </Reveal>
        </div>
      </section>

      {/* 06 · How to engage */}
      <section className='relative pt-24 pb-16 md:pt-28 md:pb-24 bg-ec-indigo overflow-hidden'>
        <SectionWash from='top' />
        <Constellation className='opacity-40' colorClassName='text-ec-teal-light' />
        <div className='container-site relative text-center max-w-2xl mx-auto'>
          <Reveal>
            <h2 className='type-display-m text-white text-balance'>Work with us.</h2>
            <p className='type-body-m text-white/70 mt-4'>
              Whether you are a school, a family, or a specialist educator — the
              ecosystem has a door for you.
            </p>
            <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
              <EnquireButton size='lg'>Start a Conversation</EnquireButton>
              <Link
                href='/careers'
                className='inline-flex items-center justify-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-white/80 hover:text-white px-8 py-4 transition-colors'
              >
                Join the team
                <ArrowRight className='w-4 h-4' aria-hidden='true' />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

const principles = [
  {
    title: 'Specialists, always',
    body: 'Every vertical is led by people trained for it. We do not rotate generalists across unrelated fields.',
  },
  {
    title: 'Evidence over adjectives',
    body: 'If we cannot show how something is measured, we do not claim it. Progress means something a student can now do.',
  },
  {
    title: 'Families inside the room',
    body: 'Goals are agreed with families, reports are written for families, and review cadences are promised to families.',
  },
  {
    title: 'Safeguarding first',
    body: 'Documented protocols, licensed professionals, and clear escalation pathways — before marketing, before scale.',
  },
  {
    title: 'Steadiness as performance',
    body: 'We design for sustainable learning: realistic targets, recovery, and wellbeing support integrated into every path.',
  },
];

/**
 * Vision and Mission — re-presentations, not new claims.
 *
 * The repository contains no authored vision/mission statement. The two
 * statements below are the project's own documented language: the north star
 * ("Five paths. One learning ecosystem.") and the five-step method in
 * data/pillars.ts (rendered in full by MethodSteps). The support lines are
 * the brief's own framing; the points restate shipped structural facts —
 * the four audiences (master §2) and the one-standard idea, the shared
 * method, and the evidence artefacts from data/pillars.ts and /impact.
 *
 * OWNER INPUT REQUIRED: replace the statements with the company's wording.
 */
const VISION = {
  statement: 'Five paths. One learning ecosystem.',
  support: 'What Educraft wants to build for learners.',
  points: [
    'Four audiences: schools, families, students, and partners.',
    'One standard across all five verticals.',
  ],
};

const MISSION = {
  statement: 'One method: understand, map, learn, measure, grow.',
  support: 'How Educraft turns that direction into practice.',
  points: [
    'The same five-step method in every vertical.',
    'Evidence at every step: checkpoints, portfolios, dashboards.',
  ],
};
