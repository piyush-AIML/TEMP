import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { AudienceEntry } from '@/types';
import { audienceEntries, audiencePageHrefs } from '@/data/navigation';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { studentJourneyStages } from '@/data/pillars';
import PageHero from '../layout/PageHero';
import EnquireButton from '../ui/EnquireButton';
import Reveal from '../motion/Reveal';
import { pillarTextClass, pillarBgClass } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

interface AudiencePageProps {
  slug: AudienceEntry['slug'];
}

/**
 * Audience landing pages (plan §22) — each with different framing,
 * relevant benefits, and an appropriate CTA. Data-driven from
 * audienceEntries plus per-audience detail sections.
 */
export default function AudiencePage({ slug }: AudiencePageProps) {
  const entry = audienceEntries.find((a) => a.slug === slug) ?? audienceEntries[0];
  const others = audienceEntries.filter((a) => a.slug !== slug);

  return (
    <div>
      <PageHero eyebrow={entry.label} title={entry.headline} lead={entry.description}>
        <div className='flex flex-col sm:flex-row gap-4'>
          <EnquireButton size='lg'>{entry.ctaLabel}</EnquireButton>
          <Link
            href='/programmes'
            className='inline-flex items-center justify-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white px-8 py-4'
          >
            Browse programmes
          </Link>
        </div>
      </PageHero>

      {/* Benefits */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>What you get</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              Designed around your questions
            </h2>
            <p className='type-body-s text-ec-slate mt-4 max-w-md'>
              Every benefit below maps to a real part of the Educraft operating model —
              nothing here is marketing shorthand.
            </p>
          </Reveal>
          <div className='space-y-4'>
            {entry.benefits.map((b, i) => (
              <Reveal key={b} delay={i * 80}>
                <div className='flex items-start gap-4 card-surface p-5'>
                  <CheckCircle2 className='w-5 h-5 mt-0.5 flex-shrink-0 text-ec-teal' aria-hidden='true' />
                  <p className='type-body-s text-ec-ink dark:text-ec-ink/90'>{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Per-audience detail */}
      {slug === 'schools' && <SchoolsDetail />}
      {slug === 'parents' && <ParentsDetail />}
      {slug === 'students' && <StudentsDetail />}

      {/* The five verticals, everywhere */}
      <section className='py-16 md:py-24 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-t border-ec-border/60'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>The ecosystem</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>
              Five verticals, one view of the learner
            </h2>
          </Reveal>
          <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
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

      {/* Other doors */}
      <section className='py-16 bg-background'>
        <div className='container-site'>
          <Reveal>
            <h2 className='type-heading-m text-ec-indigo dark:text-white mb-6'>
              Not who you were looking for?
            </h2>
          </Reveal>
          <div className='flex flex-col sm:flex-row gap-4'>
            {others.map((o) => (
              <Reveal key={o.slug}>
                <Link
                  href={audiencePageHrefs[o.slug]}
                  className='inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white border border-ec-border rounded-2xl px-6 py-3 hover:border-ec-teal/50 transition-colors group'
                >
                  {o.label}
                  <ArrowRight className='w-4 h-4 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function SchoolsDetail() {
  const steps = [
    { title: 'Discovery', description: 'We learn your school’s context, goals, and constraints — and tell you honestly which verticals fit.' },
    { title: 'Design', description: 'A joint plan: delivery model (in-school, after-school, or blended), calendar, and reporting rhythm.' },
    { title: 'Launch', description: 'Specialist educators begin delivery with named points of contact on both sides.' },
    { title: 'Review', description: 'Termly reviews with evidence: participation, progress reports, and agreed outcome measures.' },
  ];
  return (
    <section className='py-16 md:py-24 bg-background border-t border-ec-border/60'>
      <div className='container-site'>
        <Reveal>
          <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Partnership model</span>
          <h2 className='type-heading-l text-ec-indigo dark:text-white'>How a school partnership works</h2>
        </Reveal>
        <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className='card-surface h-full p-6'>
                <span className='font-[family-name:var(--font-sora)] font-bold text-3xl text-ec-teal/40'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className='type-heading-s text-ec-indigo dark:text-white mt-3'>{s.title}</h3>
                <p className='type-body-s text-ec-slate mt-2'>{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ParentsDetail() {
  return (
    <section className='py-16 md:py-24 bg-background border-t border-ec-border/60'>
      <div className='container-site grid grid-cols-1 lg:grid-cols-2 gap-12'>
        <div>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>How progress works</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>You will never have to guess</h2>
            <p className='type-body-m text-ec-slate mt-4 text-pretty'>
              Every programme produces structured evidence: level checkpoints, portfolios,
              dashboards, or written plans with review dates. Reports are written in plain
              language — what was worked on, what the student can now do, and what happens
              next.
            </p>
          </Reveal>
        </div>
        <div className='space-y-4'>
          {[
            { title: 'Regular updates', body: 'Monthly or per-plan reports with concrete next steps, not vague reassurance.' },
            { title: 'Goal-setting with you', body: 'Plans are agreed with families at the start and reviewed together on cadence.' },
            { title: 'Guidance for home', body: 'Practical strategies for supporting learning and wellbeing between sessions.' },
            { title: 'One point of contact', body: 'A named person who knows your child’s journey across the ecosystem.' },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className='card-surface p-5'>
                <h3 className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink'>{c.title}</h3>
                <p className='type-body-s text-ec-slate mt-1'>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudentsDetail() {
  return (
    <section className='py-16 md:py-24 bg-background border-t border-ec-border/60'>
      <div className='container-site'>
        <Reveal>
          <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Your journey</span>
          <h2 className='type-heading-l text-ec-indigo dark:text-white mb-10'>
            Six stages, one direction: forward
          </h2>
        </Reveal>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {studentJourneyStages.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className='relative card-surface p-6 pt-8 overflow-hidden'>
                <span className='absolute top-0 left-0 right-0 h-1 bg-ec-teal' aria-hidden='true' />
                <span className='font-[family-name:var(--font-sora)] font-bold text-3xl text-ec-border dark:text-ec-border/60'>
                  {s.stage}
                </span>
                <h3 className='type-heading-s text-ec-indigo dark:text-white mt-3'>{s.title}</h3>
                <p className='type-body-s text-ec-slate mt-2'>{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
