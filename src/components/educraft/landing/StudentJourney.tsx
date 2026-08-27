'use client';

import { Compass, HeartHandshake, BookOpen, TrendingUp, Lightbulb, Rocket, type LucideIcon } from 'lucide-react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { studentJourneyStages } from '@/data/pillars';
import { cn } from '@/lib/utils';

const STAGE_ICONS: LucideIcon[] = [Compass, HeartHandshake, BookOpen, TrendingUp, Lightbulb, Rocket];

/** Milestone positions along the journey path (viewBox 400×600). */
const NODE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 96, y: 512 },
  { x: 156, y: 396 },
  { x: 236, y: 296 },
  { x: 268, y: 214 },
  { x: 288, y: 148 },
  { x: 318, y: 84 },
];

const JOURNEY_PATH =
  'M 60 560 C 110 520, 70 470, 120 440 S 130 380, 170 366 S 200 300, 240 288 S 230 228, 270 208 S 270 150, 296 132 S 300 100, 322 80';

/**
 * Student journey story (plan §18) — Curious → Supported → Practising →
 * Confident → Capable → Ready. Desktop: pinned scroll story with a
 * self-drawing path and sequentially lit milestones. Mobile: a stacked
 * timeline (plan §34).
 */
export default function StudentJourney() {
  const { ref, progress } = useScrollProgress<HTMLElement>(64);

  const total = studentJourneyStages.length;
  const idx = Math.min(total - 1, Math.max(0, Math.floor(progress * total)));
  const stage = studentJourneyStages[idx];
  const StageIcon = STAGE_ICONS[idx];

  return (
    <section ref={ref} className='relative bg-ec-sky dark:bg-ec-canvas-soft overflow-hidden'>
      {/* ---------------- Desktop pinned story ---------------- */}
      <div className='hidden lg:block relative' style={{ height: `${total * 92}vh` }}>
        <div className='sticky top-0 h-screen flex items-center overflow-hidden'>
          <div className='container-site grid grid-cols-[1fr_1fr] gap-20 items-center'>
            {/* Stage narrative */}
            <div key={stage.title} className='animate-in fade-in slide-in-from-bottom-3 duration-300'>
              <span className='eyebrow eyebrow-rule text-ec-teal mb-5'>
                The student journey
              </span>
              <div className='flex items-center gap-5 mb-4'>
                <span className='font-[family-name:var(--font-sora)] font-bold text-7xl text-ec-teal/25 dark:text-ec-teal/30'>
                  {stage.stage}
                </span>
                <StageIcon className='w-10 h-10 text-ec-teal' aria-hidden='true' />
              </div>
              <h2 className='type-display-l text-ec-indigo dark:text-white'>{stage.title}</h2>
              <p className='type-body-l text-ec-slate mt-5 max-w-lg text-pretty'>{stage.description}</p>
            </div>

            {/* Journey path */}
            <div className='flex justify-center'>
              <svg viewBox='0 0 400 600' className='w-full max-w-[400px] h-[80vh]' role='img' aria-label='The six stages of the student journey'>
                {/* Path draws with scroll */}
                <path
                  d={JOURNEY_PATH}
                  fill='none'
                  stroke='var(--ec-teal)'
                  strokeOpacity='0.5'
                  strokeWidth='2'
                  strokeLinecap='round'
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - progress}
                />
                {/* Ghost path beneath */}
                <path
                  d={JOURNEY_PATH}
                  fill='none'
                  stroke='var(--ec-border)'
                  strokeWidth='2'
                  strokeLinecap='round'
                  opacity='0.5'
                />

                {/* Milestones */}
                {studentJourneyStages.map((s, i) => {
                  const pos = NODE_POSITIONS[i];
                  const lit = i <= idx;
                  const SIcon = STAGE_ICONS[i];
                  return (
                    <g key={s.title}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={lit ? 20 : 14}
                        fill={lit ? 'var(--ec-teal)' : 'var(--card)'}
                        stroke='var(--ec-teal)'
                        strokeWidth='2'
                        style={{ transition: 'all 0.4s ease-out-soft' }}
                      />
                      <SIcon
                        x={pos.x - 7}
                        y={pos.y - 7}
                        width={14}
                        height={14}
                        color={lit ? '#ffffff' : 'var(--ec-teal)'}
                        strokeWidth={2}
                        aria-hidden='true'
                      />
                      <text
                        x={pos.x + (i % 2 === 0 ? 24 : -24)}
                        y={pos.y + 4}
                        textAnchor={i % 2 === 0 ? 'start' : 'end'}
                        fontFamily='var(--font-manrope)'
                        fontWeight={lit ? 700 : 500}
                        fontSize='13'
                        fill={lit ? 'var(--ec-teal-dark)' : 'var(--ec-slate)'}
                        style={{ transition: 'all 0.4s ease-out-soft' }}
                      >
                        {s.title}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Mobile timeline ---------------- */}
      <div className='lg:hidden py-16 px-6'>
        <span className='eyebrow eyebrow-rule text-ec-teal mb-3'>The student journey</span>
        <h2 className='type-heading-l text-ec-indigo dark:text-white mb-10'>
          Six stages, one direction: forward.
        </h2>
        <ol className='relative border-l-2 border-ec-border ml-3 space-y-10'>
          {studentJourneyStages.map((s, i) => {
            const SIcon = STAGE_ICONS[i];
            return (
              <li key={s.title} className='relative pl-8'>
                <span className='absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-ec-teal flex items-center justify-center'>
                  <SIcon className='w-4 h-4 text-white' aria-hidden='true' />
                </span>
                <span className='type-caption text-ec-teal-dark dark:text-ec-teal font-semibold'>
                  Stage {s.stage}
                </span>
                <h3 className='type-heading-s text-ec-indigo dark:text-white mt-1'>{s.title}</h3>
                <p className={cn('type-body-s text-ec-slate mt-2')}>{s.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
