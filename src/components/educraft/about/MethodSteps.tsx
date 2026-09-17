'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { methodologySteps } from '@/data/pillars';
import { motion } from '@/design/motion';
import { cn } from '@/lib/utils';

/**
 * About — the mission's method, choreographed.
 *
 * One reveal state drives the whole beat: the path rule draws left-to-right
 * on large screens while the five steps cascade in behind it. Transform and
 * opacity only; durations and easing come from design/motion.ts. Reduced
 * motion short-circuits inside useReveal, so the finished composition is
 * simply there (the global CSS block also kills the transitions).
 *
 * The steps are the same content the /methodology page presents — reused,
 * not re-authored.
 */
export default function MethodSteps() {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const drawMs = Math.round(motion.duration.reveal * 1000);

  return (
    <div ref={ref} className='relative'>
      {/* The path — draws in as the steps arrive (large screens). */}
      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute left-0 right-0 top-0 hidden h-px origin-left bg-ec-hairline-strong transition-transform ease-out-soft lg:block',
          revealed ? 'scale-x-100' : 'scale-x-0'
        )}
        style={{ transitionDuration: `${drawMs}ms` }}
      />

      <ol className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'>
        {methodologySteps.map((step, i) => (
          <li
            key={step.title}
            className='relative border-l border-ec-hairline pl-5 pb-6 sm:pb-7 lg:border-l-0 lg:pt-6 lg:pl-0 lg:pr-6 lg:pb-0'
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'none' : 'translateY(10px)',
              transition: `opacity ${drawMs}ms ${motion.easing.out}, transform ${drawMs}ms ${motion.easing.out}`,
              transitionDelay: `${150 + i * 120}ms`,
            }}
          >
            <span
              aria-hidden='true'
              className='absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-ec-teal lg:-top-1 lg:left-0'
            />
            <span className='type-caption font-semibold text-ec-slate tabular-nums'>
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className='type-heading-s text-ec-indigo dark:text-white mt-1'>{step.title}</h3>
            <p className='type-body-s text-ec-slate mt-2 text-pretty'>{step.description}</p>
          </li>
        ))}
      </ol>

      <Link
        href='/methodology'
        className='group mt-8 inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-teal-dark dark:text-ec-teal hover:text-ec-indigo dark:hover:text-white transition-colors'
      >
        See the full methodology
        <ArrowRight
          className='w-4 h-4 transition-transform group-hover:translate-x-0.5'
          aria-hidden='true'
        />
      </Link>
    </div>
  );
}
