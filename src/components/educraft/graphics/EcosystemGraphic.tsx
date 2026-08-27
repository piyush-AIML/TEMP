'use client';

import Link from 'next/link';
import type { PillarId } from '@/types';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { useReveal } from '@/hooks/useReveal';
import { pillarAccentVar, pillarSoftVar } from '@/lib/pillarStyles';
import { cn } from '@/lib/utils';

interface EcosystemGraphicProps {
  activePillarId: PillarId;
  onSelect: (id: PillarId) => void;
  className?: string;
}

/** Node geometry — matches plan §13's orbital composition. */
const POSITIONS: Record<PillarId, { x: number; y: number }> = {
  learn: { x: 400, y: 96 },
  include: { x: 176, y: 208 },
  thrive: { x: 176, y: 392 },
  achieve: { x: 624, y: 208 },
  excel: { x: 624, y: 392 },
};

const CORE = { x: 400, y: 300 };

/**
 * The "one ecosystem" interactive map (plan §13, §55) — five pillar nodes
 * around a core, connected by animated spokes. Hover/focus lights a
 * pillar's connection; click routes to its programme page.
 */
export default function EcosystemGraphic({ activePillarId, onSelect, className }: EcosystemGraphicProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <svg viewBox='0 0 800 560' fill='none' role='img' aria-label='The five Educraft pillars connected as one ecosystem'>
        {/* Outer dashed ring through the five nodes */}
        <path
          d='M 176 208 Q 176 96, 400 96 Q 624 96, 624 208 Q 624 320, 624 392 Q 624 464, 400 464 Q 176 464, 176 392 Q 176 320, 176 208 Z'
          stroke='var(--ec-border)'
          strokeWidth='1.5'
          strokeDasharray='5 8'
          fill='none'
          opacity={revealed ? 1 : 0}
          style={{ transition: 'opacity 0.8s ease-out-soft 0.5s' }}
        />

        {/* Core → node spokes */}
        {programmes.map((p, i) => {
          const pos = POSITIONS[p.pillarId];
          const isActive = activePillarId === p.pillarId;
          return (
            <path
              key={`spoke-${p.slug}`}
              d={`M ${CORE.x} ${CORE.y} C ${(CORE.x + pos.x) / 2} ${CORE.y}, ${(CORE.x + pos.x) / 2} ${pos.y}, ${pos.x} ${pos.y}`}
              stroke={pillarAccentVar[p.pillarId]}
              strokeOpacity={isActive ? 0.85 : 0.28}
              strokeWidth={isActive ? 2.5 : 1.5}
              fill='none'
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={revealed ? 0 : 1}
              style={{
                transition: `stroke-dashoffset 0.9s ease-out-soft ${i * 120 + 200}ms, stroke-opacity 0.3s ease-out-soft, stroke-width 0.3s ease-out-soft`,
              }}
            />
          );
        })}

        {/* Core */}
        <g style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease-out-soft 0.1s' }}>
          <circle cx={CORE.x} cy={CORE.y} r='44' fill={pillarSoftVar.learn} opacity='0.6' />
          <circle cx={CORE.x} cy={CORE.y} r='26' fill='var(--card)' stroke='var(--ec-teal)' strokeWidth='2' />
          <path d={`M ${CORE.x - 8} ${CORE.y - 4} L ${CORE.x} ${CORE.y + 6} L ${CORE.x + 12} ${CORE.y - 12}`} stroke='var(--ec-teal)' strokeWidth='3' fill='none' strokeLinecap='round' strokeLinejoin='round' />
          <text
            x={CORE.x}
            y={CORE.y + 66}
            textAnchor='middle'
            fontFamily='var(--font-manrope)'
            fontWeight='600'
            fontSize='13'
            letterSpacing='0.08em'
            fill='var(--ec-slate)'
          >
            ONE ECOSYSTEM
          </text>
        </g>

        {/* Pillar nodes */}
        {programmes.map((p, i) => {
          const pos = POSITIONS[p.pillarId];
          const isActive = activePillarId === p.pillarId;
          const labelY = pos.y + 58;
          return (
            <g
              key={p.slug}
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'none' : 'scale(0.5)',
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transition: `opacity 0.5s ease-out-soft ${i * 120 + 350}ms, transform 0.5s ease-out-soft ${i * 120 + 350}ms`,
              }}
            >
              {/* Halo */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r='40'
                fill={pillarSoftVar[p.pillarId]}
                opacity={isActive ? 1 : 0}
                style={{ transition: 'opacity 0.3s ease-out-soft' }}
              />
              <Link
                href={`/programmes/${p.slug}`}
                onMouseEnter={() => onSelect(p.pillarId)}
                onMouseLeave={() => onSelect('learn')}
                onFocus={() => onSelect(p.pillarId)}
                onBlur={() => onSelect('learn')}
                aria-label={`${p.name} — ${p.tagline}`}
                data-cursor-label='Explore'
                style={{ outline: 'none' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isActive ? 30 : 24}
                  fill={isActive ? pillarAccentVar[p.pillarId] : 'var(--card)'}
                  stroke={pillarAccentVar[p.pillarId]}
                  strokeWidth='2'
                  style={{ transition: 'all 0.25s ease-out-soft' }}
                />
                {isActive && (
                  <circle cx={pos.x} cy={pos.y} r='7' fill='var(--card)' style={{ transition: 'opacity 0.2s' }} />
                )}
              </Link>
              <text
                x={pos.x}
                y={labelY}
                textAnchor='middle'
                fontFamily='var(--font-manrope)'
                fontWeight={isActive ? 700 : 600}
                fontSize={isActive ? 15 : 14}
                letterSpacing='0.06em'
                fill={isActive ? pillarAccentVar[p.pillarId] : 'var(--ec-slate)'}
                style={{ transition: 'all 0.25s ease-out-soft' }}
              >
                {pillars.find((pl) => pl.id === p.pillarId)?.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
