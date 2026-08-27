'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { insights } from '@/data/insights';
import { formatDate } from '@/lib/utils';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';

/**
 * Insights teaser (plan §23) — the three latest articles with category,
 * reading time, and date, linking into the full insights experience.
 */
export default function InsightsTeaser() {
  const latest = insights.slice(0, 3);

  return (
    <section className='relative py-20 md:py-28 bg-background'>
      <div className='container-site'>
        <SectionHeading
          eyebrow='Insights'
          title='Ideas from inside the ecosystem'
          subtext='Practical thinking on learning science, wellbeing, AI literacy, and exam readiness — written for families and educators.'
          align='left'
        />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {latest.map((insight, i) => (
            <Reveal key={insight.slug} delay={i * 100}>
              <Link
                href={`/insights/${insight.slug}`}
                className='card-surface group h-full p-7 flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] transition-all duration-150 ease-out-soft'
              >
                <div className='flex items-center gap-3'>
                  <span className='text-xs font-semibold uppercase tracking-[0.08em] text-ec-teal-dark dark:text-ec-teal'>
                    {insight.category}
                  </span>
                  <span className='flex items-center gap-1 type-caption text-ec-slate'>
                    <Clock className='w-3.5 h-3.5' aria-hidden='true' />
                    {insight.readingTime}
                  </span>
                </div>
                <h3 className='type-heading-s text-ec-indigo dark:text-white mt-3 group-hover:text-ec-teal-dark dark:group-hover:text-ec-teal transition-colors'>
                  {insight.title}
                </h3>
                <p className='type-body-s text-ec-slate mt-3 flex-1'>{insight.excerpt}</p>
                <div className='mt-5 flex items-center justify-between'>
                  <span className='type-caption text-ec-slate'>{formatDate(insight.date)}</span>
                  <ArrowRight
                    className='w-4 h-4 text-ec-teal group-hover:translate-x-1 transition-transform duration-150'
                    aria-hidden='true'
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className='mt-10 text-center'>
          <Link
            href='/insights'
            className='inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white hover:opacity-80 transition-opacity group'
          >
            Browse all insights
            <ArrowRight className='w-4 h-4 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
