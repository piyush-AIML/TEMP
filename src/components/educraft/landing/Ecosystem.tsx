'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PillarId } from '@/types';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import EcosystemGraphic from '../graphics/EcosystemGraphic';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';
import { Constellation } from '../graphics/DecorativeSystems';
import { pillarBgClass, pillarTextClass, pillarSoftBgClass } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

/**
 * "One ecosystem, many paths" (plan §13, Stage 5) — the five pillars as a
 * connected system. Hovering a pillar lights its connection and updates
 * the panel; clicking routes to the programme. Mobile gets a stacked
 * card composition instead of the orbital map (plan §34).
 */
export default function EcosystemSection() {
  const [activeId, setActiveId] = useState<PillarId>('learn');
  const { openModal } = useEnquiryModal();

  const activeProgramme = programmes.find((p) => p.pillarId === activeId) ?? programmes[0];
  const activePillar = pillars.find((pl) => pl.id === activeId);

  return (
    <section id='ecosystem' className='relative py-20 md:py-28 bg-background overflow-hidden'>
      <Constellation className='opacity-60' colorClassName='text-ec-teal' />

      <div className='container-site relative'>
        <SectionHeading
          eyebrow='One ecosystem'
          title='Five pillars. One connected system.'
          subtext='Each vertical is a complete programme in its own right — not a module inside a course. Together they form one ecosystem where a learner can move between paths without starting over.'
        />

        <div className='grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center'>
          {/* Interactive map — desktop */}
          <EcosystemGraphic
            activePillarId={activeId}
            onSelect={setActiveId}
            className='hidden lg:block'
          />

          {/* Active pillar panel */}
          <div aria-live='polite'>
            <Reveal key={activeProgramme.slug} className='card-surface p-8 md:p-10'>
              <span
                className={cn(
                  'inline-flex items-center gap-2 type-caption uppercase tracking-[0.1em] font-semibold',
                  pillarTextClass[activeId]
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', pillarBgClass[activeId])} aria-hidden='true' />
                {activePillar?.name} — {activePillar?.vertical}
              </span>
              <h3 className='type-heading-l text-ec-ink dark:text-white mt-3'>
                {activeProgramme.name}
              </h3>
              <p className='type-body-m text-ec-slate mt-4'>{activeProgramme.tagline}</p>

              <ul className='mt-6 space-y-3'>
                {activeProgramme.outcomes.slice(0, 2).map((o) => (
                  <li key={o.title} className='flex items-start gap-3'>
                    <span
                      className={cn(
                        'mt-1 w-4 h-4 rounded-full flex-shrink-0',
                        pillarSoftBgClass[activeId]
                      )}
                      aria-hidden='true'
                    />
                    <span className='type-body-s text-ec-ink dark:text-ec-ink/90'>
                      <strong className='font-semibold'>{o.title}.</strong> {o.description}
                    </span>
                  </li>
                ))}
              </ul>

              <div className='mt-8 flex flex-col sm:flex-row gap-3'>
                <Link
                  href={`/programmes/${activeProgramme.slug}`}
                  className={cn(
                    'inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold',
                    pillarTextClass[activeId]
                  )}
                >
                  Explore {activeProgramme.name}
                  <ArrowRight className='w-4 h-4' aria-hidden='true' />
                </Link>
                <button
                  onClick={() => openModal(activeProgramme.slug)}
                  className='text-ec-slate hover:text-ec-ink dark:hover:text-white font-[family-name:var(--font-manrope)] font-semibold text-left transition-colors'
                >
                  Enquire about this programme
                </button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Mobile composition — stacked pillar cards */}
        <div className='lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12'>
          {programmes.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <Link
                href={`/programmes/${p.slug}`}
                className='card-surface block p-5 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] transition-all duration-150'
              >
                <div className='flex items-center gap-3'>
                  <span className={cn('w-2.5 h-2.5 rounded-full', pillarBgClass[p.pillarId])} aria-hidden='true' />
                  <span className='type-caption uppercase tracking-[0.1em] font-semibold text-ec-slate'>
                    {pillars.find((pl) => pl.id === p.pillarId)?.name}
                  </span>
                </div>
                <h3 className='type-heading-s text-ec-indigo dark:text-white mt-2'>{p.name}</h3>
                <p className='type-body-s text-ec-slate mt-2'>{p.tagline}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
