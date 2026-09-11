import Link from 'next/link';
import { ArrowRight, CheckCircle2, Users, Target, HeartHandshake, Award, Activity } from 'lucide-react';
import type { Programme } from '@/types';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import ProgrammeGraphic from '../graphics/ProgrammeGraphic';
import { Constellation, TopographicLines } from '../graphics/DecorativeSystems';
import EnquireButton from '../ui/EnquireButton';
import FaqAccordion from '../ui/FaqAccordion';
import Reveal from '../motion/Reveal';
import { pillarTextClass, pillarBgClass, pillarSoftBgClass, pillarAccentVar } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

/**
 * Programme detail page (plan §15, Stage 7) — a self-contained
 * mini-experience: promise, context, audience, method, curriculum,
 * journey, outcomes, activities, support, evidence, FAQs, and a
 * conversion close. Fully data-driven; server component with client
 * children (accordion, enquiry).
 */
export default function ProgrammePage({ programme }: { programme: Programme }) {
  const pillar = pillars.find((pl) => pl.id === programme.pillarId);
  const accent = pillarAccentVar[programme.pillarId];
  const related = programmes.filter((p) => p.slug !== programme.slug);

  return (
    <article>
      {/* ---------------------------------------------------------- Hero */}
      <header className='relative pt-32 pb-20 md:pt-40 md:pb-28 bg-ec-canvas-deep/60 dark:bg-ec-canvas-deep overflow-hidden'>
        <Constellation className='opacity-60' colorClassName='text-ec-teal' />
        <div className='container-site relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center'>
          <div>
            <span className={cn('eyebrow eyebrow-rule mb-5', pillarTextClass[programme.pillarId])}>
              {pillar?.name} — {pillar?.vertical}
            </span>
            <h1 className='type-display-l text-ec-indigo dark:text-white text-balance'>
              {programme.name}
            </h1>
            <p className='type-heading-s font-[family-name:var(--font-manrope)] font-medium text-ec-slate mt-5 max-w-xl'>
              {programme.tagline}
            </p>
            <p className='type-body-m text-ec-slate mt-4 max-w-xl text-pretty'>
              {programme.promise}
            </p>
            <div className='mt-9 flex flex-col sm:flex-row gap-4'>
              <EnquireButton slug={programme.slug} size='lg'>
                Enquire about this programme
              </EnquireButton>
              <a
                href='#programme-faqs'
                className='inline-flex items-center justify-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white hover:opacity-80 transition-opacity px-8 py-4'
              >
                Read the FAQs
              </a>
            </div>
          </div>
          <ProgrammeGraphic pillarId={programme.pillarId} className='w-full max-w-[400px] h-auto mx-auto' />
        </div>
      </header>

      {/* ------------------------------------------- Why it matters */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Why it matters</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              Why this matters right now
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className='type-body-l text-ec-ink dark:text-ec-ink/90 text-pretty'>
              {programme.whyItMatters}
            </p>
            <p className='type-body-m text-ec-slate mt-6 max-w-2xl text-pretty'>
              {programme.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------- Audience */}
      <section className='py-16 md:py-24 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-y border-ec-border/60'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Who it is for</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>Built for these learners</h2>
          </Reveal>
          <div className='mt-10 grid grid-cols-1 md:grid-cols-3 gap-5'>
            {programme.audience.map((a, i) => (
              <Reveal key={a.title} delay={i * 100}>
                <div className='card-surface h-full p-7'>
                  <Users className='w-6 h-6 mb-4' style={{ color: accent }} aria-hidden='true' />
                  <h3 className='type-heading-s text-ec-indigo dark:text-white'>{a.title}</h3>
                  <p className='type-body-s text-ec-slate mt-2'>{a.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ How it works */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>How it works</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>The five-step method</h2>
          </Reveal>
          <ol className='mt-10 space-y-0'>
            {programme.methodology.map((m, i) => (
              <Reveal
                key={m.title}
                as='li'
                delay={i * 90}
                className='grid grid-cols-[3rem_1fr] md:grid-cols-[4rem_1fr_1.4fr] gap-5 md:gap-8 py-6 border-b border-ec-border'
              >
                <span
                  className='w-11 h-11 rounded-2xl flex items-center justify-center font-[family-name:var(--font-clash)] font-bold text-lg'
                  style={{ backgroundColor: pillarAccentVar[programme.pillarId], color: '#fff' }}
                >
                  {i + 1}
                </span>
                <h3 className='type-heading-s text-ec-indigo dark:text-white self-center'>{m.title}</h3>
                <p className='type-body-s text-ec-slate md:col-start-3 md:row-start-1 self-center max-w-xl'>
                  {m.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------- Curriculum */}
      <section className='relative py-16 md:py-24 bg-ec-canvas-deep/50 dark:bg-ec-canvas-deep overflow-hidden'>
        <TopographicLines className='opacity-60' colorClassName='text-ec-indigo' />
        <div className='container-site relative'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Curriculum</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>What the programme contains</h2>
          </Reveal>
          <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-5'>
            {programme.curriculum.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <div className='card-surface h-full p-8'>
                  <span
                    className='type-caption font-bold uppercase tracking-[0.1em]'
                    style={{ color: accent }}
                  >
                    Module {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className='type-heading-m text-ec-indigo dark:text-white mt-2'>{c.title}</h3>
                  <p className='type-body-s text-ec-slate mt-2'>{c.description}</p>
                  <ul className='mt-5 space-y-2.5'>
                    {c.items.map((item) => (
                      <li key={item} className='flex items-start gap-2.5 type-body-s text-ec-ink dark:text-ec-ink/90'>
                        <CheckCircle2 className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: accent }} aria-hidden='true' />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Journey */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>The learning journey</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>From first session to ready</h2>
          </Reveal>
          <div className='mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {programme.journey.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className='relative h-full rounded-2xl border border-ec-border bg-card p-6 pt-8 overflow-hidden'>
                  <span
                    className='absolute top-0 left-0 right-0 h-1'
                    style={{ backgroundColor: accent }}
                    aria-hidden='true'
                  />
                  <span className='font-[family-name:var(--font-clash)] font-bold text-3xl text-ec-border dark:text-ec-border/60'>
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

      {/* ----------------------------------------- Outcomes + activities */}
      <section className='py-16 md:py-24 bg-ec-sky dark:bg-ec-canvas-soft border-y border-ec-border/60'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <div>
            <Reveal>
              <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Expected outcomes</span>
              <h2 className='type-heading-l text-ec-indigo dark:text-white'>What changes afterwards</h2>
            </Reveal>
            <div className='mt-8 space-y-4'>
              {programme.outcomes.map((o, i) => (
                <Reveal key={o.title} delay={i * 80}>
                  <div className='flex items-start gap-4 card-surface p-5'>
                    <span
                      className={cn('mt-1 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', pillarSoftBgClass[programme.pillarId])}
                    >
                      <Target className='w-4 h-4' style={{ color: accent }} aria-hidden='true' />
                    </span>
                    <div>
                      <h3 className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink'>
                        {o.title}
                      </h3>
                      <p className='type-body-s text-ec-slate mt-1'>{o.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <Reveal>
              <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Inside a session</span>
              <h2 className='type-heading-l text-ec-indigo dark:text-white'>What students actually do</h2>
            </Reveal>
            <ul className='mt-8 space-y-4'>
              {programme.activities.map((a, i) => (
                <Reveal key={a} as='li' delay={i * 80}>
                  <div className='flex items-start gap-4'>
                    <span
                      className={cn('mt-1 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', pillarSoftBgClass[programme.pillarId])}
                    >
                      <Activity className='w-4 h-4' style={{ color: accent }} aria-hidden='true' />
                    </span>
                    <p className='type-body-s text-ec-ink dark:text-ec-ink/90 self-center'>{a}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- Support + proof */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <div>
            <Reveal>
              <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Support model</span>
              <h2 className='type-heading-l text-ec-indigo dark:text-white'>Nobody learns alone</h2>
            </Reveal>
            <ul className='mt-8 space-y-4'>
              {programme.support.map((s, i) => (
                <Reveal key={s} as='li' delay={i * 80}>
                  <div className='flex items-start gap-3'>
                    <HeartHandshake className='w-5 h-5 mt-0.5 flex-shrink-0' style={{ color: accent }} aria-hidden='true' />
                    <p className='type-body-s text-ec-ink dark:text-ec-ink/90'>{s}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <div>
            <Reveal>
              <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Evidence & proof</span>
              <h2 className='type-heading-l text-ec-indigo dark:text-white'>How this is verified</h2>
            </Reveal>
            <div className='mt-8 space-y-4'>
              {programme.proof.map((p, i) => (
                <Reveal key={p.title} delay={i * 80}>
                  <div className='card-surface p-5'>
                    <div className='flex items-center gap-3'>
                      <Award className='w-5 h-5 flex-shrink-0' style={{ color: accent }} aria-hidden='true' />
                      <h3 className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink'>{p.title}</h3>
                    </div>
                    <p className='type-body-s text-ec-slate mt-2'>{p.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- FAQs */}
      <section id='programme-faqs' className='py-16 md:py-24 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-t border-ec-border/60'>
        <div className='container-site max-w-3xl'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Questions</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>
              Common questions about {programme.name}
            </h2>
          </Reveal>
          <div className='mt-10'>
            <FaqAccordion faqs={programme.faqs} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------- Conversion close */}
      <section className='relative py-16 md:py-24 bg-ec-indigo overflow-hidden'>
        <Constellation className='opacity-40' colorClassName='text-ec-teal-light' />
        <div className='container-site relative text-center max-w-2xl mx-auto'>
          <Reveal>
            <span
              className={cn('inline-flex items-center gap-2 type-caption uppercase tracking-[0.1em] font-semibold text-ec-gold mb-4')}
            >
              <span className={cn('w-2 h-2 rounded-full', pillarBgClass[programme.pillarId])} aria-hidden='true' />
              {programme.name}
            </span>
            <h2 className='type-display-m text-white text-balance'>
              See if this path fits.
            </h2>
            <p className='type-body-m text-white/70 mt-4 text-pretty'>
              Tell us where the learner is now — we will explain how this programme would
              work for them, honestly and specifically.
            </p>
            <div className='mt-8 flex justify-center'>
              <EnquireButton slug={programme.slug} size='lg'>
                Enquire about this programme
              </EnquireButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------ Related programmes */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Keep exploring</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white'>Related programmes</h2>
            <p className='type-body-s text-ec-slate mt-3'>
              Because every programme is part of one ecosystem, learners can move between
              paths — and often benefit from more than one.
            </p>
          </Reveal>
          <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <Link
                  href={`/programmes/${p.slug}`}
                  className='card-surface group h-full p-6 flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] transition-all duration-150'
                >
                  <span
                    className={cn('inline-flex items-center gap-2 type-caption uppercase tracking-[0.08em] font-semibold', pillarTextClass[p.pillarId])}
                  >
                    <span className={cn('w-2 h-2 rounded-full', pillarBgClass[p.pillarId])} aria-hidden='true' />
                    {pillars.find((pl) => pl.id === p.pillarId)?.name}
                  </span>
                  <h3 className='type-heading-s text-ec-indigo dark:text-white mt-3 group-hover:text-ec-teal-dark dark:group-hover:text-ec-teal transition-colors'>
                    {p.name}
                  </h3>
                  <p className='type-body-s text-ec-slate mt-2 flex-1'>{p.tagline}</p>
                  <span className='mt-4 inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white group-hover:opacity-80 transition-opacity'>
                    Explore
                    <ArrowRight className='w-4 h-4' aria-hidden='true' />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
