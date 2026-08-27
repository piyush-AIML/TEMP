'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import ProgrammeGraphic from '../graphics/ProgrammeGraphic';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';
import { pillarBgClass, pillarTextClass, pillarSoftBgClass, pillarAccentVar } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

/**
 * Programme deep-dive (plan §3.07, §15) — a spotlight that lets visitors
 * open any programme and see its curriculum, methodology, outcomes, and
 * proof without leaving the homepage. Rich data, rendered generically.
 */
export default function ProgrammeDeepDive() {
  const [slug, setSlug] = useState(programmes[0].slug);
  const { openModal } = useEnquiryModal();

  const active = programmes.find((p) => p.slug === slug) ?? programmes[0];
  const pillar = pillars.find((pl) => pl.id === active.pillarId);

  return (
    <section className='relative py-20 md:py-28 bg-background border-t border-ec-border/60 overflow-hidden'>
      <div className='container-site'>
        <SectionHeading
          eyebrow='Inside a programme'
          title='What a programme actually contains'
          subtext='Every vertical is a complete experience: curriculum, method, outcomes, and evidence. Open one and look inside.'
        />

        <div className='grid grid-cols-1 lg:grid-cols-[0.9fr_1.6fr] gap-10'>
          {/* Programme selector */}
          <Reveal direction='left' className='flex lg:flex-col gap-3 overflow-x-auto no-scrollbar lg:overflow-visible'>
            {programmes.map((p) => {
              const isActive = p.slug === active.slug;
              return (
                <button
                  key={p.slug}
                  onClick={() => setSlug(p.slug)}
                  aria-pressed={isActive}
                  className={cn(
                    'shrink-0 lg:shrink flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all duration-150 ease-out-soft',
                    isActive
                      ? 'bg-card border-transparent shadow-[0_8px_30px_rgba(30,42,120,0.08)]'
                      : 'bg-transparent border-ec-border hover:border-ec-teal/50'
                  )}
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full', pillarBgClass[p.pillarId])} aria-hidden='true' />
                  <span>
                    <span className='block text-xs font-semibold uppercase tracking-[0.08em] text-ec-gold-dark dark:text-ec-gold'>
                      {pillars.find((pl) => pl.id === p.pillarId)?.name}
                    </span>
                    <span className='block text-sm font-semibold text-ec-ink mt-0.5'>{p.name}</span>
                  </span>
                </button>
              );
            })}
          </Reveal>

          {/* Content panel */}
          <div key={active.slug} className='card-surface p-7 md:p-10 animate-in fade-in slide-in-from-bottom-2 duration-300'>
            <div className='flex items-center justify-between gap-4 flex-wrap'>
              <div>
                <span className={cn('eyebrow', pillarTextClass[active.pillarId])}>
                  {pillar?.name} — {pillar?.vertical}
                </span>
                <h3 className='type-heading-l text-ec-indigo dark:text-white mt-2'>{active.name}</h3>
              </div>
              <ProgrammeGraphic pillarId={active.pillarId} className='w-24 h-24 md:w-28 md:h-28 hidden sm:block' />
            </div>

            <p className='type-body-m text-ec-slate mt-4 max-w-2xl'>{active.promise}</p>

            {/* Curriculum */}
            <h4 className='type-heading-s text-ec-indigo dark:text-white mt-8 mb-4'>Curriculum</h4>
            <div className='grid sm:grid-cols-2 gap-4'>
              {active.curriculum.slice(0, 4).map((c) => (
                <div key={c.title} className='rounded-2xl bg-ec-canvas-soft dark:bg-ec-canvas-deep p-5'>
                  <span
                    className='type-caption font-bold uppercase tracking-[0.08em]'
                    style={{ color: pillarAccentVar[active.pillarId] }}
                  >
                    {c.title}
                  </span>
                  <p className='type-body-s text-ec-slate mt-2'>{c.description}</p>
                </div>
              ))}
            </div>

            {/* Method + outcomes row */}
            <div className='grid md:grid-cols-2 gap-8 mt-8'>
              <div>
                <h4 className='type-heading-s text-ec-indigo dark:text-white mb-4'>The method</h4>
                <ol className='space-y-3'>
                  {active.methodology.map((m, i) => (
                    <li key={m.title} className='flex items-start gap-3'>
                      <span
                        className={cn(
                          'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                          pillarSoftBgClass[active.pillarId]
                        )}
                        style={{ color: pillarAccentVar[active.pillarId] }}
                      >
                        {i + 1}
                      </span>
                      <span className='type-body-s text-ec-slate'>
                        <strong className='font-semibold text-ec-ink'>{m.title}.</strong> {m.description}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className='type-heading-s text-ec-indigo dark:text-white mb-4'>What changes</h4>
                <ul className='space-y-3'>
                  {active.outcomes.map((o) => (
                    <li key={o.title} className='flex items-start gap-3'>
                      <CheckCircle2 className='w-5 h-5 flex-shrink-0 mt-0.5' style={{ color: pillarAccentVar[active.pillarId] }} aria-hidden='true' />
                      <span className='type-body-s text-ec-slate'>
                        <strong className='font-semibold text-ec-ink'>{o.title}.</strong> {o.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Proof line + CTA */}
            <div className='mt-8 pt-6 border-t border-ec-border flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <p className='type-body-s text-ec-slate max-w-md'>
                <strong className='font-semibold text-ec-ink'>Evidence:</strong>{' '}
                {active.proof[0]?.title} — {active.proof[0]?.description}
              </p>
              <div className='flex items-center gap-5 flex-shrink-0'>
                <button
                  onClick={() => openModal(active.slug)}
                  className='font-[family-name:var(--font-manrope)] font-semibold text-ec-slate hover:text-ec-ink dark:hover:text-white transition-colors'
                >
                  Enquire
                </button>
                <Link
                  href={`/programmes/${active.slug}`}
                  className='inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white hover:opacity-80 transition-opacity group'
                >
                  Full programme
                  <ArrowRight className='w-4 h-4 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
