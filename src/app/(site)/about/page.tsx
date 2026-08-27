import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';
import EnquireButton from '@/components/educraft/ui/EnquireButton';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { pillarTextClass, pillarBgClass } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About — Educraft',
  description:
    'Educraft exists to connect the pieces of a learner’s journey — language, inclusion, wellbeing, technology, and exam readiness — under one trusted ecosystem.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow='About Educraft'
        title='Education is a system. We built one.'
        lead='Educraft unifies five specialist verticals — linguistics, inclusive education, wellbeing, AI & digital technology, and NEET/JEE preparation — under one philosophy: every learner deserves a path designed for how they actually learn.'
      />

      {/* Story */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>The idea</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              Most learners do not need one course. They need a system.
            </h2>
          </Reveal>
          <div className='space-y-5'>
            <Reveal delay={80}>
              <p className='type-body-l text-ec-ink dark:text-ec-ink/90 text-pretty'>
                A student preparing for an exam may also need help with stress. A student
                learning a language may process information differently and need adapted
                teaching. A school serving all of them needs a partner that speaks all
                five languages.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className='type-body-m text-ec-slate text-pretty'>
                Educraft was built around that observation. Instead of five disconnected
                course catalogues, we run one ecosystem: shared enrolment, shared
                progress reporting, shared safeguarding, and specialists who coordinate
                with each other about the same learner.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className='type-body-m text-ec-slate text-pretty'>
                The result is what a learner actually needs: continuity. A plan that can
                span language, inclusion, wellbeing, technology, and exams without
                starting over at every handoff.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className='py-16 md:py-24 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-y border-ec-border/60'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>What we run</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white mb-10'>
              Five verticals, one standard
            </h2>
          </Reveal>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            {programmes.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <Link
                  href={`/programmes/${p.slug}`}
                  className='card-surface group h-full p-5 block hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] transition-all duration-150'
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full block', pillarBgClass[p.pillarId])} aria-hidden='true' />
                  <span className={cn('block mt-3 type-caption uppercase tracking-[0.08em] font-semibold', pillarTextClass[p.pillarId])}>
                    {pillars.find((pl) => pl.id === p.pillarId)?.name}
                  </span>
                  <h3 className='type-heading-s text-ec-indigo dark:text-white mt-1'>{p.name}</h3>
                  <p className='type-body-s text-ec-slate mt-2'>{p.tagline}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Principles</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              What we will not compromise on
            </h2>
          </Reveal>
          <div className='space-y-4'>
            {[
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
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className='card-surface p-5'>
                  <h3 className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink'>{v.title}</h3>
                  <p className='type-body-s text-ec-slate mt-1'>{v.body}</p>
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
