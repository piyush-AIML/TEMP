'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScrollProgress, clamp01 } from '@/hooks/useScrollProgress';
import { methodologySteps } from '@/data/pillars';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';
import { PathLines } from '../graphics/DecorativeSystems';

const NODE_X = [96, 348, 600, 852, 1104];
const PATH_D = 'M 60 100 C 180 30, 240 150, 348 90 S 500 40, 600 80 S 730 150, 852 90 S 1000 30, 1104 80 S 1160 60, 1200 40';

/**
 * "How it works" (plan §17, Stage 8) — the signature path-draw moment:
 * a long SVG path draws as the user scrolls, milestone nodes light up,
 * and the five steps emerge beneath.
 */
export default function MethodologySection() {
  // 'visible' mode: progress 1 = section fully scrolled through while still
  // on screen. Draw completes at ~91% of that, so the path finishes well
  // before the section leaves the viewport.
  const { ref, progress } = useScrollProgress<HTMLElement>(32, 'visible');

  /** Path draw progress — accelerated so it never lags behind the scroll. */
  const draw = clamp01(progress * 1.1);

  /** Milestone i lights when the drawn path reaches it (~in sync with the dash). */
  const nodeLitAt = (i: number) => clamp01(((i + 0.08) / 5.5) * 1.1);

  return (
    <section ref={ref} className='relative py-20 md:py-28 bg-ec-sky dark:bg-ec-canvas-soft overflow-hidden'>
      <PathLines className='opacity-60' colorClassName='text-ec-teal' />

      <div className='container-site relative'>
        <SectionHeading
          eyebrow='How it works'
          title='Five steps, one method'
          subtext='Every programme — whatever the vertical — runs on the same five-step method. It is why the ecosystem stays coherent as it grows.'
        />

        {/* Desktop path */}
        <div className='hidden md:block mb-14'>
          <svg viewBox='0 0 1200 180' className='w-full' fill='none' role='img' aria-label='A path through five steps: understand, map, learn, measure, grow'>
            <path d={PATH_D} stroke='var(--ec-border)' strokeWidth='2.5' strokeLinecap='round' />
            <path
              d={PATH_D}
              stroke='var(--ec-teal)'
              strokeWidth='2.5'
              strokeLinecap='round'
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
            {methodologySteps.map((s, i) => {
              const lit = draw >= nodeLitAt(i);
              return (
                <g key={s.title}>
                  <circle
                    cx={NODE_X[i]}
                    cy='70'
                    r={lit ? 26 : 18}
                    fill={lit ? 'var(--ec-teal)' : 'var(--card)'}
                    stroke='var(--ec-teal)'
                    strokeWidth='2'
                    style={{ transition: 'all 0.4s ease-out-soft' }}
                  />
                  <text
                    x={NODE_X[i]}
                    y='76'
                    textAnchor='middle'
                    fontFamily='var(--font-sora)'
                    fontWeight='700'
                    fontSize='16'
                    fill={lit ? '#ffffff' : 'var(--ec-teal)'}
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Step cards */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          {methodologySteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className='card-surface h-full p-6'>
                <span className='type-caption font-bold text-ec-teal'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className='type-heading-s text-ec-indigo dark:text-white mt-2'>{s.title}</h3>
                <p className='type-body-s text-ec-slate mt-2'>{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className='mt-12 text-center'>
          <Link
            href='/methodology'
            className='inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white hover:opacity-80 transition-opacity group'
          >
            Read the full methodology
            <ArrowRight className='w-4 h-4 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
