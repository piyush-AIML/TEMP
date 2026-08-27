'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { insights } from '@/data/insights';
import { insightCategories } from '@/types';
import { formatDate, cn } from '@/lib/utils';

/**
 * Insights index with category filtering (plan §23) — client-side only,
 * content stays fully data-driven.
 */
export default function InsightsList() {
  const [category, setCategory] = useState<string | null>(null);
  const visible = category ? insights.filter((i) => i.category === category) : insights;

  return (
    <div>
      {/* Category filter */}
      <div className='flex flex-wrap gap-2 mb-10'>
        <button
          onClick={() => setCategory(null)}
          aria-pressed={category === null}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            category === null
              ? 'bg-ec-indigo text-white'
              : 'bg-ec-canvas-soft dark:bg-ec-canvas-deep text-ec-slate hover:text-ec-ink dark:hover:text-white'
          )}
        >
          All
        </button>
        {insightCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              category === c
                ? 'bg-ec-indigo text-white'
                : 'bg-ec-canvas-soft dark:bg-ec-canvas-deep text-ec-slate hover:text-ec-ink dark:hover:text-white'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {visible.map((insight) => (
          <Link
            key={insight.slug}
            href={`/insights/${insight.slug}`}
            className='card-surface group h-full p-7 flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] transition-all duration-150'
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
            <h2 className='type-heading-s text-ec-indigo dark:text-white mt-3 group-hover:text-ec-teal-dark dark:group-hover:text-ec-teal transition-colors'>
              {insight.title}
            </h2>
            <p className='type-body-s text-ec-slate mt-3 flex-1'>{insight.excerpt}</p>
            <div className='mt-5 flex items-center justify-between'>
              <span className='type-caption text-ec-slate'>{formatDate(insight.date)}</span>
              <ArrowRight
                className='w-4 h-4 text-ec-teal group-hover:translate-x-1 transition-transform duration-150'
                aria-hidden='true'
              />
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <p className='type-body-m text-ec-slate'>No articles in this category yet.</p>
      )}
    </div>
  );
}
