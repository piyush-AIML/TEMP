import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';
import EnquireButton from '@/components/educraft/ui/EnquireButton';
import { TopographicLines } from '@/components/educraft/graphics/DecorativeSystems';
import { methodologySteps } from '@/data/pillars';

export const metadata: Metadata = {
  title: 'Methodology — Educraft',
  description:
    'Every Educraft programme runs on one five-step method — Understand, Map, Learn, Measure, Grow — so progress is planned, evidenced, and adjusted, never improvised.',
  alternates: { canonical: '/methodology' },
};

export default function MethodologyPage() {
  return (
    <div>
      <PageHero
        eyebrow='Methodology'
        title='One method. Every vertical.'
        lead='Underneath all five programmes runs a single five-step method. It is why an Educraft plan always answers the same questions: what will happen, who will do it, how often, and how will we know it worked?'
      />

      {/* The five steps */}
      <section className='relative py-16 md:py-24 bg-background overflow-hidden'>
        <TopographicLines className='opacity-60' colorClassName='text-ec-indigo' />
        <div className='container-site relative max-w-3xl'>
          <ol>
            {methodologySteps.map((s, i) => (
              <Reveal
                key={s.title}
                as='li'
                delay={i * 90}
                className='grid grid-cols-[4rem_1fr] gap-6 py-8 border-b border-ec-border last:border-b-0'
              >
                <span className='w-12 h-12 rounded-2xl bg-ec-teal text-white flex items-center justify-center font-[family-name:var(--font-clash)] font-bold text-xl'>
                  {i + 1}
                </span>
                <div>
                  <h2 className='type-heading-m text-ec-indigo dark:text-white'>{s.title}</h2>
                  <p className='type-body-m text-ec-slate mt-2 max-w-xl'>{s.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Why this matters */}
      <section className='py-16 md:py-24 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-y border-ec-border/60'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Why a single method</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              Continuity is the product
            </h2>
          </Reveal>
          <div className='space-y-5'>
            <Reveal delay={80}>
              <p className='type-body-l text-ec-ink dark:text-ec-ink/90 text-pretty'>
                When a learner moves between verticals — from exam preparation into
                wellbeing support, from linguistics into inclusive education — the
                method does not change. The plan, the evidence, and the reporting
                language stay identical.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className='type-body-m text-ec-slate text-pretty'>
                That means the fifth step of one programme can become the first step of
                another without anything being lost. The learner carries their history
                with them, and every specialist reads it the same way.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className='type-body-m text-ec-slate text-pretty'>
                A single method also makes quality verifiable. Families can compare any
                two programmes and find the same promises kept: named goals, scheduled
                reviews, and evidence of progress.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Measurement principles */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Measurement</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white mb-10'>
              How we know it is working
            </h2>
          </Reveal>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            {[
              {
                title: 'Benchmarked checkpoints',
                body: 'Progress is measured against recognised descriptors — language levels, syllabus maps, or individualised plan goals — never our own private scale.',
              },
              {
                title: 'Portfolios of evidence',
                body: 'Work samples, recordings, projects, and mock results accumulate into a portfolio families can review at any time.',
              },
              {
                title: 'Reviews on cadence',
                body: 'Every plan has dated review points. Measurement is a schedule, not an afterthought — adjustments happen because the cadence demands them.',
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 100}>
                <div className='card-surface h-full p-7'>
                  <h3 className='type-heading-s text-ec-indigo dark:text-white'>{c.title}</h3>
                  <p className='type-body-s text-ec-slate mt-3'>{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 md:py-24 bg-ec-indigo overflow-hidden'>
        <div className='container-site text-center max-w-2xl mx-auto'>
          <Reveal>
            <h2 className='type-display-m text-white text-balance'>See the method applied.</h2>
            <p className='type-body-m text-white/70 mt-4'>
              Open any programme and watch the five steps unfold in its own language.
            </p>
            <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/programmes'
                className='inline-flex items-center justify-center gap-2 bg-ec-gold text-ec-indigo-dark font-[family-name:var(--font-manrope)] font-semibold rounded-2xl px-8 py-4 hover:bg-ec-gold-dark transition-colors'
              >
                Explore programmes
                <ArrowRight className='w-5 h-5' aria-hidden='true' />
              </Link>
              <EnquireButton variant='ghost' size='lg' className='!text-white/80 hover:!text-white hover:!bg-white/10'>
                Ask a question
              </EnquireButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
