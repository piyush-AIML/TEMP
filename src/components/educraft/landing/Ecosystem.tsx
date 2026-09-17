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
import {
  pillarBgClass,
  pillarBorderClass,
  pillarTextClass,
  pillarSoftBgClass,
} from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

/**
 * "One ecosystem, many paths" (plan §13, Stage 5) — the five pillars as one
 * constellation: hovering or focusing a node lights its connection and moves
 * a pulse toward it, and the programme dock below updates on the same state.
 * Clicking a node still routes to the programme.
 *
 * One compact stage: the heading sits in the left column, the map gets a
 * BOUNDED stage in the right (the wide, shallow artwork scales to fit it, so
 * the SVG never dictates the row height), and the dock follows a short gap
 * below. Mobile stacks heading → map → pillar rail → dock.
 *
 * FC-12 treatment (gate G1 — Option B): the section is the second half of the
 * cinematic anchor act, so it carries `dark-anchor` — theme-independent dark,
 * which also closes the hero→ecosystem seam flagged in the cycle ledger. The
 * panel keeps its `aria-live` contract (gate G9): same content, restyled only.
 */
export default function EcosystemSection() {
  const [activeId, setActiveId] = useState<PillarId>('learn');
  const { openModal } = useEnquiryModal();

  const activeProgramme = programmes.find((p) => p.pillarId === activeId) ?? programmes[0];
  const activePillar = pillars.find((pl) => pl.id === activeId);

  return (
    <section id='ecosystem' className='dark-anchor relative py-12 md:py-16 overflow-hidden'>
      <Constellation className='opacity-50' colorClassName='text-ec-teal' />

      <div className='container-site relative'>
        {/* Heading left, map right, both starting at the same top edge. */}
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 lg:gap-10 lg:items-start'>
          <SectionHeading
            align='left'
            eyebrow='One ecosystem'
            title='Five pillars. One connected system.'
            subtext='Each vertical is a complete programme in its own right — not a module inside a course. Together they form one ecosystem where a learner can move between paths without starting over.'
            className='mb-0 md:mb-0'
          />

          {/* Bounded stages: the artwork fits the stage, never the reverse. */}
          <div className='hidden lg:block h-[420px] xl:h-[440px]'>
            <EcosystemGraphic
              variant='full'
              activePillarId={activeId}
              onSelect={setActiveId}
              className='h-full'
            />
          </div>

          <div className='lg:hidden h-80 sm:h-96'>
            <EcosystemGraphic
              variant='compact'
              activePillarId={activeId}
              onSelect={setActiveId}
              className='h-full'
            />
          </div>
        </div>

        {/* Mobile — a compact pillar rail, so all five stay reachable and
            routable without hovering the map. */}
        <Reveal className='lg:hidden mt-5 flex gap-1.5 overflow-x-auto no-scrollbar'>
          {programmes.map((p) => {
            const pillar = pillars.find((pl) => pl.id === p.pillarId);
            const isActive = activeId === p.pillarId;
            return (
              <Link
                key={p.slug}
                href={`/programmes/${p.slug}`}
                onMouseEnter={() => setActiveId(p.pillarId)}
                onFocus={() => setActiveId(p.pillarId)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 type-caption uppercase tracking-[0.08em] font-semibold transition-colors',
                  isActive
                    ? cn(pillarBorderClass[p.pillarId], pillarTextClass[p.pillarId])
                    : 'border-ec-hairline text-ec-slate'
                )}
              >
                <span
                  className={cn('w-1.5 h-1.5 rounded-full', pillarBgClass[p.pillarId])}
                  aria-hidden='true'
                />
                {pillar?.name}
              </Link>
            );
          })}
        </Reveal>

        {/* Programme dock — full width, attached to the stage above it */}
        <div aria-live='polite' className='mt-4 md:mt-5'>
          <div
            key={activeProgramme.slug}
            className='glass-surface relative overflow-hidden rounded-2xl p-5 md:p-6 animate-in fade-in slide-in-from-bottom-3 duration-300'
          >
            <span
              className={cn('absolute inset-x-0 top-0 h-0.5', pillarBgClass[activeId])}
              aria-hidden='true'
            />

            <span
              className={cn(
                'inline-flex items-center gap-2 type-caption uppercase tracking-[0.1em] font-semibold',
                pillarTextClass[activeId]
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', pillarBgClass[activeId])} aria-hidden='true' />
              {activePillar?.name} — {activePillar?.vertical}
            </span>

            <div className='mt-2.5 grid gap-x-10 gap-y-3 lg:grid-cols-12 lg:items-baseline'>
              <h3 className='type-heading-m text-ec-ink lg:col-span-5'>{activeProgramme.name}</h3>
              <p className='type-body-m text-ec-slate lg:col-span-7'>{activeProgramme.tagline}</p>

              <ul className='grid gap-x-10 gap-y-2.5 sm:grid-cols-2 lg:col-span-12'>
                {activeProgramme.outcomes.slice(0, 2).map((o) => (
                  <li key={o.title} className='flex items-start gap-3'>
                    <span
                      className={cn(
                        'mt-1 w-4 h-4 rounded-full flex-shrink-0',
                        pillarSoftBgClass[activeId]
                      )}
                      aria-hidden='true'
                    />
                    <span className='type-body-s text-ec-ink/90'>
                      <strong className='font-semibold'>{o.title}.</strong> {o.description}
                    </span>
                  </li>
                ))}
              </ul>

              <div className='flex flex-col sm:flex-row sm:items-center gap-3 border-t border-ec-hairline pt-3 lg:col-span-12'>
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
                  className='text-ec-slate hover:text-ec-ink font-[family-name:var(--font-manrope)] font-semibold text-left transition-colors sm:ml-auto'
                >
                  Enquire about this programme
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
