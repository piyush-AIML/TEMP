import type { Metadata } from 'next';
import { TrendingUp } from 'lucide-react';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';
import EnquireButton from '@/components/educraft/ui/EnquireButton';
import Stat from '@/components/educraft/ui/Stat';

export const metadata: Metadata = {
  title: 'Impact — Educraft',
  description:
    'How Educraft structures impact: confidence, engagement, skill, and readiness — with evidence at every step, and honest reporting when quantitative results exist.',
  alternates: { canonical: '/impact' },
};

export default function ImpactPage() {
  return (
    <div>
      <PageHero
        eyebrow='Impact'
        title='Impact is structured. Not assumed.'
        lead='We describe outcomes as a chain — confidence, engagement, skill, readiness — and we can show, at every link, how each one is built and measured. Where verified numbers exist, we publish them; where they do not, we say so.'
      />

      {/* The chain */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>The structure</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white mb-12'>
              How one outcome enables the next
            </h2>
          </Reveal>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {impactChain.map((item, i) => (
              <Reveal key={item.title} delay={i * 110}>
                <div className='relative card-surface p-6 pt-8 h-full'>
                  <span className='absolute -top-3 left-6 bg-ec-teal text-white text-xs font-bold px-3 py-1 rounded-full'>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <TrendingUp className='w-6 h-6 text-ec-teal mb-3' aria-hidden='true' />
                  <h3 className='type-heading-s text-ec-indigo dark:text-white'>{item.title}</h3>
                  <p className='type-body-s text-ec-slate mt-2'>{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Structural facts */}
      <section className='py-16 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-y border-ec-border/60'>
        <div className='container-site'>
          <Reveal>
            <h2 className='type-heading-m text-ec-indigo dark:text-white mb-10 text-center'>
              Facts about the ecosystem itself
            </h2>
          </Reveal>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <Stat value='5' label='Vertical programmes' sub='One per pillar' />
            <Stat value='1' label='Connected ecosystem' sub='Shared method & evidence' />
            <Stat value='4' label='Audiences served' sub='Schools · Parents · Students · Partners' />
            <Stat value='6' label='Journey stages' sub='Curious to ready' />
          </div>
        </div>
      </section>

      {/* How evidence is built */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Evidence</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white mb-10'>
              Where proof comes from
            </h2>
          </Reveal>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            {evidencePillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className='card-surface h-full p-5'>
                  <h3 className='type-heading-s text-ec-indigo dark:text-white'>{p.title}</h3>
                  <p className='type-body-s text-ec-slate mt-2'>{p.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className='mt-12 card-surface p-6 md:p-8'>
            <h3 className='type-heading-s text-ec-indigo dark:text-white'>A note on numbers</h3>
            <p className='type-body-s text-ec-slate mt-2 max-w-3xl'>
              We publish quantitative outcomes — pass rates, satisfaction scores, progress
              distributions — only when they come from verified, attributable data. As
              programmes mature and cohorts grow, this page will carry those numbers,
              with their methodology. Until then, the evidence above is the honest shape
              of our proof: people, process, artefacts, and cadence.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 md:py-24 bg-ec-indigo overflow-hidden'>
        <div className='container-site text-center max-w-2xl mx-auto'>
          <Reveal>
            <h2 className='type-display-m text-white text-balance'>Ask us to prove it.</h2>
            <p className='type-body-m text-white/70 mt-4'>
              In a conversation, we will walk you through the actual plan, the actual
              artefacts, and the actual reporting for the programme you care about.
            </p>
            <div className='mt-8 flex justify-center'>
              <EnquireButton size='lg'>Start a Conversation</EnquireButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

const impactChain = [
  {
    title: 'Confidence',
    description:
      'Visible progress is the first outcome — the learner starts to trust their own ability to learn.',
  },
  {
    title: 'Engagement',
    description:
      'Learning designed around real interests and evidence of wins becomes something to return to.',
  },
  {
    title: 'Skill',
    description:
      'Capability demonstrated in portfolios, projects, and benchmarked checkpoints.',
  },
  {
    title: 'Readiness',
    description:
      'The destination: prepared for exams, conversations, applications, and whatever comes after school.',
  },
];

const evidencePillars = [
  {
    title: 'People',
    description: 'Specialists with recognised qualifications lead every vertical.',
  },
  {
    title: 'Process',
    description: 'Documented methods: plans, cadences, and safeguarding protocols.',
  },
  {
    title: 'Artefacts',
    description: 'Portfolios, dashboards, and checkpoints families can open and inspect.',
  },
  {
    title: 'Partnerships',
    description: 'Coordinated goals and shared reporting with schools and families.',
  },
  {
    title: 'Cadence',
    description: 'Dated review points that force honest, scheduled adjustment.',
  },
];
