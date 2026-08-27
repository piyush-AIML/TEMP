import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import ProgrammeGraphic from '@/components/educraft/graphics/ProgrammeGraphic';
import { Constellation } from '@/components/educraft/graphics/DecorativeSystems';
import EnquireButton from '@/components/educraft/ui/EnquireButton';
import { pillarTextClass, pillarBgClass } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Programmes — Educraft',
  description:
    'Five interconnected programmes: linguistics, inclusive education, wellbeing & counselling, AI & digital technologies, and NEET/JEE preparation — one connected learning ecosystem.',
};

export default function ProgrammesIndex() {
  return (
    <div>
      {/* Header */}
      <header className='relative pt-32 pb-16 md:pt-40 md:pb-20 bg-ec-canvas-deep/60 dark:bg-ec-canvas-deep overflow-hidden'>
        <Constellation className='opacity-60' colorClassName='text-ec-teal' />
        <div className='container-site relative max-w-3xl'>
          <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Programmes</span>
          <h1 className='type-display-l text-ec-indigo dark:text-white text-balance'>
            Five paths. One ecosystem.
          </h1>
          <p className='type-body-l text-ec-slate mt-5 text-pretty'>
            Each programme is a complete vertical in its own right — and every one is
            connected to the others. Start where the learner is; the ecosystem handles
            the rest.
          </p>
        </div>
      </header>

      {/* Programme list */}
      <section className='py-14 md:py-20 bg-background'>
        <div className='container-site space-y-8'>
          {programmes.map((p, i) => {
            const pillar = pillars.find((pl) => pl.id === p.pillarId);
            return (
              <article
                key={p.slug}
                className='card-surface grid grid-cols-1 lg:grid-cols-[240px_1fr_auto] gap-8 items-center p-8 md:p-10'
              >
                <ProgrammeGraphic pillarId={p.pillarId} className='w-full max-w-[220px] h-auto mx-auto' />
                <div>
                  <span className={cn('inline-flex items-center gap-2 type-caption uppercase tracking-[0.1em] font-semibold', pillarTextClass[p.pillarId])}>
                    <span className={cn('w-2 h-2 rounded-full', pillarBgClass[p.pillarId])} aria-hidden='true' />
                    {pillar?.name} — {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className='type-heading-l text-ec-indigo dark:text-white mt-3'>
                    <Link href={`/programmes/${p.slug}`} className='hover:text-ec-teal-dark dark:hover:text-ec-teal transition-colors'>
                      {p.name}
                    </Link>
                  </h2>
                  <p className='type-body-m text-ec-slate mt-3 max-w-2xl'>{p.tagline}</p>
                  <ul className='mt-4 flex flex-wrap gap-2'>
                    {p.outcomes.slice(0, 3).map((o) => (
                      <li
                        key={o.title}
                        className='text-xs font-medium text-ec-ink dark:text-ec-ink/80 bg-ec-canvas-soft dark:bg-ec-canvas-deep rounded-full px-3 py-1.5'
                      >
                        {o.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='flex lg:flex-col gap-3'>
                  <Link
                    href={`/programmes/${p.slug}`}
                    className='inline-flex items-center justify-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white border border-ec-border rounded-2xl px-6 py-3 hover:border-ec-teal/50 hover:-translate-y-0.5 transition-all duration-150'
                  >
                    Explore
                    <ArrowRight className='w-4 h-4' aria-hidden='true' />
                  </Link>
                  <EnquireButton slug={p.slug} variant='ghost'>
                    Enquire
                  </EnquireButton>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
