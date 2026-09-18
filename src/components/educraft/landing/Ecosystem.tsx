'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PillarId } from '@/types';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import EcosystemGraphic from '../graphics/EcosystemGraphic';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';
import {
  pillarBgClass,
  pillarBorderClass,
  pillarTextClass,
  pillarSoftBgClass,
} from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

/**
 * The dock rebuilds in a short cascade when the active pillar changes: each
 * band fades in behind the one above it, using the site's own staged-entrance
 * primitive (`.hero-enter-fade` + `--hero-delay`, which keeps `forwards` fill
 * so a delayed band is never briefly visible, and is neutralised under
 * reduced motion by the global block).
 */
const ENTER_DOCK = { label: 0, identity: 70, evidence: 140, actions: 210 };
const stagger = (ms: number) => ({ '--hero-delay': `${ms}ms` }) as CSSProperties;

/**
 * "One ecosystem, many paths" (plan §13, Stage 5) — the five pillars as one
 * connected loop: hovering or focusing a node brightens the segments that
 * touch it and sends a pulse along each toward it, and the programme dock
 * directly below updates on the same state. Clicking a node routes to the
 * programme.
 *
 * One stage, not three blocks: the heading sits in the left column, the loop
 * gets a stage in the right whose aspect matches the artwork (so the graphic
 * fills it exactly and never dictates the row height), and the dock follows a
 * short 16–20px gap as the ecosystem's information layer. The section carries
 * no background network of its own — the atmosphere lives inside the SVG.
 *
 * FC-12 treatment (gate G1 — Option B): the section is the second half of the
 * cinematic anchor act, so it carries `dark-anchor` — theme-independent dark,
 * which also closes the hero→ecosystem seam flagged in the cycle ledger. The
 * dock keeps its `aria-live` contract (gate G9): same content, restyled only.
 */
export default function EcosystemSection() {
  const [activeId, setActiveId] = useState<PillarId>('learn');
  const { openModal } = useEnquiryModal();

  const activeProgramme = programmes.find((p) => p.pillarId === activeId) ?? programmes[0];
  const activePillar = pillars.find((pl) => pl.id === activeId);

  return (
    <section id='ecosystem' className='dark-anchor relative py-12 md:py-16 overflow-hidden'>
      <div className='container-site relative'>
        {/* Heading left, loop right, both starting at the same top edge. */}
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 lg:gap-10 lg:items-start'>
          <SectionHeading
            align='left'
            eyebrow='One ecosystem'
            title='Five pillars. One connected system.'
            subtext='Each vertical is a complete programme in its own right — not a module inside a course. Together they form one ecosystem where a learner can move between paths without starting over.'
            className='mb-0 md:mb-0'
          />

          {/* Stages follow the artwork's own proportions: the graphic fills its
              stage exactly at every width, and the cap keeps the row bounded. */}
          <div className='hidden lg:block lg:aspect-[940/470] lg:max-h-[440px]'>
            <EcosystemGraphic
              variant='full'
              activePillarId={activeId}
              onSelect={setActiveId}
              className='h-full'
            />
          </div>

          <div className='aspect-[480/400] max-h-[360px] lg:hidden'>
            <EcosystemGraphic
              variant='compact'
              activePillarId={activeId}
              onSelect={setActiveId}
              className='h-full'
            />
          </div>
        </div>

        {/* Programme dock — the ecosystem's information layer. Three bands
            (label · identity + evidence · actions) so the structure is legible
            at a glance, rebuilt in a short staggered fade on every change. */}
        <div aria-live='polite' className='mt-4 md:mt-5'>
          <div
            key={activeProgramme.slug}
            className='glass-surface relative overflow-hidden rounded-2xl'
          >
            <span
              className={cn('absolute inset-x-0 top-0 h-0.5', pillarBgClass[activeId])}
              aria-hidden='true'
            />

            {/* Band 1 — which pillar this is */}
            <div
              className='hero-enter-fade flex items-center gap-2.5 border-b border-ec-hairline px-4 md:px-5 py-2.5'
              style={stagger(ENTER_DOCK.label)}
            >
              <span
                className={cn('h-3.5 w-0.5 rounded-full', pillarBgClass[activeId])}
                aria-hidden='true'
              />
              <span
                className={cn(
                  'type-caption uppercase tracking-[0.1em] font-semibold',
                  pillarTextClass[activeId]
                )}
              >
                {activePillar?.name} — {activePillar?.vertical}
              </span>
            </div>

            {/* Band 2 — identity beside evidence */}
            <div className='grid gap-x-8 gap-y-3 px-4 md:px-5 py-4 lg:grid-cols-12'>
              <div className='hero-enter-fade lg:col-span-5' style={stagger(ENTER_DOCK.identity)}>
                <h3 className='type-heading-m text-ec-ink'>{activeProgramme.name}</h3>
                <p className='type-body-m text-ec-slate mt-1.5 text-pretty'>
                  {activeProgramme.tagline}
                </p>
              </div>

              <ul
                className='hero-enter-fade grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:col-span-7 lg:border-l lg:border-ec-hairline lg:pl-8'
                style={stagger(ENTER_DOCK.evidence)}
              >
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
            </div>

            {/* Band 3 — how to act on it */}
            <div
              className='hero-enter-fade flex flex-col sm:flex-row sm:items-center gap-2.5 border-t border-ec-hairline px-4 md:px-5 py-3'
              style={stagger(ENTER_DOCK.actions)}
            >
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

        {/* Mobile — compact pillar rail, so all five stay reachable and
            routable without hovering the map */}
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
      </div>
    </section>
  );
}
