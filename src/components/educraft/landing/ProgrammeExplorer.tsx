'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import ProgrammeGraphic from '../graphics/ProgrammeGraphic';
import { pillarBgClass, pillarTextClass, pillarAccentVar } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

/**
 * Programme Explorer (plan §14, Stage 6) — a scroll-driven story through
 * the five programmes. Desktop: pinned sticky narrative with a left panel
 * that hands over programme by programme as the user scrolls, plus a
 * progress rail. Mobile: horizontal snap cards (plan §34).
 */
export default function ProgrammeExplorer() {
  const { ref, progress } = useScrollProgress<HTMLElement>(64);
  const { openModal } = useEnquiryModal();

  const total = programmes.length;
  const idx = Math.min(total - 1, Math.max(0, Math.floor(progress * total)));
  const active = programmes[idx];
  const activePillar = pillars.find((pl) => pl.id === active.pillarId);

  return (
    <section ref={ref} className='relative bg-ec-canvas-deep/60 dark:bg-ec-canvas-deep'>
      {/* ---------------- Desktop pinned story ---------------- */}
      <div className='hidden lg:block relative' style={{ height: `${total * 110}vh` }}>
        <div className='sticky top-0 h-screen overflow-hidden flex flex-col justify-center'>
          {/* Overall progress bar */}
          <div className='absolute top-16 left-0 right-0 h-[3px] bg-ec-border/60'>
            <div
              className='h-full bg-ec-teal transition-none'
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className='container-site grid grid-cols-[1fr_1.1fr] gap-16 items-center'>
            {/* Narrative panel */}
            <div key={active.slug} className='animate-in fade-in slide-in-from-bottom-3 duration-300'>
              <div className='flex items-center gap-3 mb-4'>
                <span className={cn('w-2.5 h-2.5 rounded-full', pillarBgClass[active.pillarId])} aria-hidden='true' />
                <span className={cn('eyebrow', pillarTextClass[active.pillarId])}>
                  {activePillar?.name} — {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
              </div>

              <h2 className='type-display-m text-ec-indigo dark:text-white text-balance'>
                {active.name}
              </h2>
              <p className='type-body-l text-ec-slate mt-5 max-w-xl text-pretty'>{active.tagline}</p>

              <ul className='mt-7 space-y-3'>
                {active.highlights.slice(0, 2).map((h) => (
                  <li key={h.title} className='flex items-start gap-3'>
                    <ArrowRight className='w-4 h-4 mt-1 flex-shrink-0' style={{ color: pillarAccentVar[active.pillarId] }} aria-hidden='true' />
                    <span className='type-body-s text-ec-ink dark:text-ec-ink/90'>
                      <strong className='font-semibold'>{h.title}.</strong> {h.detail}
                    </span>
                  </li>
                ))}
              </ul>

              <div className='mt-9 flex items-center gap-6'>
                <Link
                  href={`/programmes/${active.slug}`}
                  className='inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white hover:opacity-80 transition-opacity group'
                >
                  Read the full programme
                  <ArrowRight className='w-4 h-4 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
                </Link>
                <button
                  onClick={() => openModal(active.slug)}
                  className='font-[family-name:var(--font-manrope)] font-semibold text-ec-slate hover:text-ec-ink dark:hover:text-white transition-colors'
                >
                  Enquire
                </button>
              </div>
            </div>

            {/* Programme visual */}
            <div key={`${active.slug}-visual`} className='animate-in fade-in zoom-in-95 duration-500 flex justify-center'>
              <ProgrammeGraphic pillarId={active.pillarId} className='w-full max-w-[440px] h-auto' />
            </div>
          </div>

          {/* Progress rail */}
          <div className='absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3' aria-hidden='true'>
            {programmes.map((p, i) => (
              <span
                key={p.slug}
                className={cn(
                  'rounded-full transition-all duration-300 ease-out-soft',
                  i === idx ? 'h-8 w-2' : 'h-2 w-2 bg-ec-border'
                )}
                style={i === idx ? { backgroundColor: pillarAccentVar[p.pillarId] } : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Mobile snap cards ---------------- */}
      <div className='lg:hidden py-16'>
        <div className='px-6'>
          <span className='eyebrow eyebrow-rule text-ec-teal mb-3'>The five programmes</span>
          <h2 className='type-heading-l text-ec-indigo dark:text-white'>One journey, five paths</h2>
          <p className='type-body-s text-ec-slate mt-2'>Swipe through the programmes.</p>
        </div>
        <div className='mt-8 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 pb-2'>
          {programmes.map((p) => {
            const pillar = pillars.find((pl) => pl.id === p.pillarId);
            return (
              <Link
                key={p.slug}
                href={`/programmes/${p.slug}`}
                className='snap-center shrink-0 w-[82vw] card-surface p-6 flex flex-col'
              >
                <div className='flex items-center gap-3'>
                  <span className={cn('w-2.5 h-2.5 rounded-full', pillarBgClass[p.pillarId])} aria-hidden='true' />
                  <span className={cn('eyebrow', pillarTextClass[p.pillarId])}>{pillar?.name}</span>
                </div>
                <ProgrammeGraphic pillarId={p.pillarId} className='w-full max-w-[220px] h-auto mx-auto my-4' />
                <h3 className='type-heading-s text-ec-indigo dark:text-white'>{p.name}</h3>
                <p className='type-body-s text-ec-slate mt-2 flex-1'>{p.tagline}</p>
                <span className='mt-4 inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-teal-dark dark:text-ec-teal'>
                  Read the full programme
                  <ArrowRight className='w-4 h-4' aria-hidden='true' />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
