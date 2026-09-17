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
 * "One ecosystem, many paths" (plan §13, Stage 5) — the five pillars as one
 * living system: hovering or focusing a node lights its connection and moves
 * a pulse toward it, and the programme dock below updates on the same state.
 * Clicking a node still routes to the programme.
 *
 * Composition: the section heading sits in the left column beside the map
 * (≈40 / 60) so the ecosystem is the primary visual, and the active programme
 * reads as a full-width dock beneath both. Mobile stacks: eyebrow → heading →
 * description → compact map → dock → the five pillars as text.
 *
 * FC-12 treatment (gate G1 — Option B): the section is the second half of the
 * cinematic anchor act, so it carries `dark-anchor` — theme-independent dark,
 * which also closes the hero→ecosystem seam flagged in the cycle ledger. The
 * panel keeps its `aria-live` contract (gate G9): same content, restyled only.
 *
 * Spacing is deliberately tight: the heading/map row and the programme dock
 * are one "stage" — short top padding after the hero, columns aligned to a
 * shared top edge (never centred against the map's height), and the map
 * capped on large screens so the dock stays in the same view.
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

          <EcosystemGraphic
            variant='full'
            activePillarId={activeId}
            onSelect={setActiveId}
            className='hidden lg:block lg:max-w-2xl lg:mx-auto'
          />

          {/* Mobile keeps the same system, projected for a small canvas */}
          <EcosystemGraphic
            variant='compact'
            activePillarId={activeId}
            onSelect={setActiveId}
            className='lg:hidden max-w-sm mx-auto'
          />
        </div>

        {/* Programme dock — full width, composed to sit low and wide */}
        <div aria-live='polite' className='mt-6 md:mt-8'>
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

        {/* Mobile — all five pillars as text, reachable without the map */}
        <ul className='lg:hidden mt-6 border-t border-ec-hairline'>
          {programmes.map((p, i) => {
            const pillar = pillars.find((pl) => pl.id === p.pillarId);
            const isActive = activeId === p.pillarId;
            return (
              <Reveal as='li' key={p.slug} delay={i * 70} className='border-b border-ec-hairline'>
                <Link
                  href={`/programmes/${p.slug}`}
                  onMouseEnter={() => setActiveId(p.pillarId)}
                  onFocus={() => setActiveId(p.pillarId)}
                  className='flex items-start gap-4 py-4'
                >
                  <span
                    className={cn('mt-2 w-2.5 h-2.5 rounded-full flex-shrink-0', pillarBgClass[p.pillarId])}
                    aria-hidden='true'
                  />
                  <span className='min-w-0'>
                    <span className='block type-caption uppercase tracking-[0.08em] font-semibold text-ec-slate'>
                      {pillar?.name}
                    </span>
                    <span
                      className={cn(
                        'block type-heading-s mt-0.5 transition-colors',
                        isActive ? pillarTextClass[p.pillarId] : 'text-ec-ink'
                      )}
                    >
                      {p.name}
                    </span>
                    <span className='block type-body-s text-ec-slate mt-1'>{p.tagline}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
