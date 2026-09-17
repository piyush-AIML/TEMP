'use client';

import Link from 'next/link';
import type { PillarId } from '@/types';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import { useReveal } from '@/hooks/useReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pillarAccentVar, pillarSoftVar } from '@/lib/pillarStyles';
import { motion } from '@/design/motion';
import { cn } from '@/lib/utils';

interface EcosystemGraphicProps {
  activePillarId: PillarId;
  onSelect: (id: PillarId) => void;
  className?: string;
  /** 'full' — the desktop orbital map; 'compact' — the mobile composition. */
  variant?: 'full' | 'compact';
}

/**
 * Node placement as polar coordinates from the core: the arrangement is
 * computed, so a pillar is one row here rather than hand-placed geometry.
 * Angles and radii vary deliberately — an even star would read as a diagram,
 * not as an ecosystem.
 */
const NODE_LAYOUT: Record<PillarId, { angle: number; radius: number }> = {
  learn: { angle: -95, radius: 218 },
  include: { angle: -160, radius: 232 },
  thrive: { angle: 152, radius: 226 },
  achieve: { angle: -22, radius: 248 },
  excel: { angle: 58, radius: 240 },
};

const VARIANTS = {
  full: {
    w: 800, h: 620, coreR: 26, nodeR: 24, nodeActiveR: 30, haloR: 42,
    labelSize: 14, labelActiveSize: 15.5, labelDy: 56, bow: 30,
    atmosphere: true, particles: true,
  },
  compact: {
    w: 480, h: 420, coreR: 21, nodeR: 21, nodeActiveR: 26, haloR: 34,
    labelSize: 19, labelActiveSize: 20.5, labelDy: 44, bow: 18,
    atmosphere: false, particles: false,
  },
} as const;

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Project the polar layout into a variant's viewBox and derive its curves. */
function buildGeometry(variant: 'full' | 'compact') {
  const v = VARIANTS[variant];
  const core = { x: v.w / 2, y: v.h / 2 };
  const sx = v.w / VARIANTS.full.w;
  const sy = v.h / VARIANTS.full.h;

  const nodes = (Object.keys(NODE_LAYOUT) as PillarId[]).map((id) => {
    const { angle, radius } = NODE_LAYOUT[id];
    const rad = (angle * Math.PI) / 180;
    const x = core.x + radius * sx * Math.cos(rad);
    const y = core.y + radius * sy * Math.sin(rad);

    // One consistent swirl: every spoke bows along the same rotational
    // direction, so the five connections read as one orbiting system.
    const dx = x - core.x;
    const dy = y - core.y;
    const len = Math.hypot(dx, dy) || 1;
    const cx = (core.x + x) / 2 + (-dy / len) * v.bow;
    const cy = (core.y + y) / 2 + (dx / len) * v.bow;

    return {
      id,
      x,
      y,
      // Drawn core → node, so a travelling pulse reads as flow outward.
      d: `M ${r1(core.x)} ${r1(core.y)} Q ${r1(cx)} ${r1(cy)}, ${r1(x)} ${r1(y)}`,
    };
  });

  return { v, core, nodes };
}

/** Staged entrance: atmosphere → core → connections → nodes → labels → flow. */
const ENTER = { atmosphere: 0, core: 120, connections: 300, nodes: 540, labels: 780, flow: 980 };
const STAGGER = 90;

/**
 * "One ecosystem" (plan §13) — the five pillars as a living orbital system.
 *
 * Shared body, two projections: 'full' for desktop, 'compact' for mobile
 * (larger relative nodes and type, no atmosphere or particles). Motion is
 * SVG-native — SMIL for ambient flow, particles and the core's breathing,
 * CSS transitions for the entrance — so nothing is driven per frame by
 * React, and everything ambient is omitted entirely under reduced motion.
 *
 * The visual is decorative: it is aria-hidden and the section carries the
 * five pillars as real text, so nothing here is the only route to the
 * content. Links remain real programme links.
 */
export default function EcosystemGraphic({
  activePillarId,
  onSelect,
  className,
  variant = 'full',
}: EcosystemGraphicProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.25 });
  const reducedMotion = useReducedMotion();
  const { v, core, nodes } = buildGeometry(variant);

  const enterMs = Math.round(motion.duration.reveal * 1000);
  const ease = motion.easing.out;
  const fade = (delay: number) => ({
    opacity: revealed ? 1 : 0,
    transition: `opacity ${enterMs}ms ${ease}`,
    transitionDelay: `${delay}ms`,
  });
  const grow = (delay: number) => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : 'scale(0.85)',
    transformBox: 'fill-box' as const,
    transformOrigin: 'center',
    transition: `opacity ${enterMs}ms ${ease}, transform ${enterMs}ms ${ease}`,
    transitionDelay: `${delay}ms`,
  });

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <svg
        viewBox={`0 0 ${v.w} ${v.h}`}
        fill='none'
        aria-hidden='true'
        className='w-full h-auto'
      >
        <defs>
          <radialGradient id={`ec-core-${variant}`} cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='var(--ec-teal)' stopOpacity='0.55' />
            <stop offset='55%' stopColor='var(--ec-teal)' stopOpacity='0.14' />
            <stop offset='100%' stopColor='var(--ec-teal)' stopOpacity='0' />
          </radialGradient>
        </defs>

        {/* 1 · Atmosphere — slow drifting orbits behind everything */}
        {v.atmosphere && (
          <g style={fade(ENTER.atmosphere)}>
            <ellipse
              cx={core.x}
              cy={core.y}
              rx={330}
              ry={252}
              stroke='var(--ec-border)'
              strokeWidth='1'
              strokeDasharray='2 10'
              transform={`rotate(-12 ${core.x} ${core.y})`}
            >
              {!reducedMotion && (
                <animateTransform
                  attributeName='transform'
                  type='rotate'
                  from={`-12 ${core.x} ${core.y}`}
                  to={`348 ${core.x} ${core.y}`}
                  dur='150s'
                  repeatCount='indefinite'
                />
              )}
            </ellipse>
            <ellipse
              cx={core.x}
              cy={core.y}
              rx={268}
              ry={206}
              stroke='var(--ec-teal)'
              strokeOpacity='0.14'
              strokeWidth='1'
              strokeDasharray='2 14'
              transform={`rotate(18 ${core.x} ${core.y})`}
            >
              {!reducedMotion && (
                <animateTransform
                  attributeName='transform'
                  type='rotate'
                  from={`18 ${core.x} ${core.y}`}
                  to={`-342 ${core.x} ${core.y}`}
                  dur='200s'
                  repeatCount='indefinite'
                />
              )}
            </ellipse>
          </g>
        )}

        {/* 3 · Structural connections + 4 · travelling flow */}
        {nodes.map((n, i) => {
          const isActive = activePillarId === n.id;
          return (
            <g key={`link-${n.id}`}>
              <path
                d={n.d}
                stroke={pillarAccentVar[n.id]}
                strokeOpacity={isActive ? 0.55 : 0.22}
                strokeWidth={isActive ? 2.2 : 1.4}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={revealed ? 0 : 1}
                style={{
                  transition: `stroke-dashoffset ${enterMs}ms ${ease} ${ENTER.connections + i * STAGGER}ms, stroke-opacity 400ms ${ease}, stroke-width 400ms ${ease}`,
                }}
              />
              <path
                d={n.d}
                stroke={pillarAccentVar[n.id]}
                strokeWidth={isActive ? 3 : 2}
                strokeLinecap='round'
                pathLength={1}
                strokeDasharray='0.06 1'
                strokeDashoffset={0}
                opacity={revealed ? (isActive ? 0.95 : 0.3) : 0}
                style={{
                  transition: `opacity 500ms ${ease} ${ENTER.flow}ms, stroke-width 400ms ${ease}`,
                }}
              >
                {!reducedMotion && (
                  <animate
                    attributeName='stroke-dashoffset'
                    from='1'
                    to='0'
                    dur={isActive ? '3.6s' : '7.5s'}
                    begin={`${i * 0.6}s`}
                    repeatCount='indefinite'
                  />
                )}
              </path>
            </g>
          );
        })}

        {/* 6 · Central core — the system's heartbeat */}
        <g style={grow(ENTER.core)}>
          <circle cx={core.x} cy={core.y} r={v.coreR * 2.2} fill={`url(#ec-core-${variant})`}>
            {!reducedMotion && (
              <animate
                attributeName='r'
                values={`${r1(v.coreR * 2.1)};${r1(v.coreR * 2.45)};${r1(v.coreR * 2.1)}`}
                dur='7s'
                repeatCount='indefinite'
              />
            )}
          </circle>
          <circle
            cx={core.x}
            cy={core.y}
            r={v.coreR}
            fill='var(--card)'
            stroke='var(--ec-teal)'
            strokeWidth='2'
          />
          <path
            d={`M ${core.x - 8} ${core.y - 4} L ${core.x} ${core.y + 6} L ${core.x + 12} ${core.y - 12}`}
            stroke='var(--ec-teal)'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <text
            x={core.x}
            y={core.y + v.coreR + 26}
            textAnchor='middle'
            fontFamily='var(--font-manrope)'
            fontWeight='600'
            fontSize={variant === 'full' ? 12 : 15}
            letterSpacing='0.08em'
            fill='var(--ec-slate)'
          >
            ONE ECOSYSTEM
          </text>
        </g>

        {/* 5 · Particles — occasional pulses travelling toward the active node */}
        {v.particles && !reducedMotion && (
          <g key={`flow-${activePillarId}`}>
            {nodes
              .filter((n) => n.id === activePillarId)
              .map((n) => (
                <g key={n.id}>
                  {[0, 1].map((k) => (
                    <circle
                      key={k}
                      r='2.6'
                      fill={pillarAccentVar[n.id]}
                      opacity='0'
                      style={fade(ENTER.flow)}
                    >
                      <animateMotion
                        dur='7s'
                        begin={`${k * 3.1}s`}
                        repeatCount='indefinite'
                        path={n.d}
                        calcMode='linear'
                      />
                      {/* Visible only for a window of each cycle — flow that
                          reads as occasional rather than constant. */}
                      <animate
                        attributeName='opacity'
                        values='0;0;0.85;0.85;0;0'
                        keyTimes='0;0.52;0.6;0.8;0.88;1'
                        dur='7s'
                        begin={`${k * 3.1}s`}
                        repeatCount='indefinite'
                      />
                    </circle>
                  ))}
                </g>
              ))}
          </g>
        )}

        {/* 7–9 · Pillar nodes, halos and labels */}
        {nodes.map((n, i) => {
          const isActive = activePillarId === n.id;
          const pillar = pillars.find((pl) => pl.id === n.id);
          const programme = programmes.find((p) => p.pillarId === n.id);
          return (
            <g key={n.id} style={grow(ENTER.nodes + i * STAGGER)}>
              {/* Halo */}
              <circle
                cx={n.x}
                cy={n.y}
                r={v.haloR}
                fill={pillarSoftVar[n.id]}
                opacity={isActive ? 1 : 0}
                style={{ transition: `opacity 400ms ${ease}` }}
              />

              {/* Active emphasis — one slow ring, never a bounce */}
              {isActive && !reducedMotion && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={v.haloR}
                  stroke={pillarAccentVar[n.id]}
                  strokeWidth='1.5'
                  opacity='0.45'
                >
                  <animate
                    attributeName='r'
                    values={`${v.haloR};${v.haloR + 12};${v.haloR}`}
                    dur='4.6s'
                    repeatCount='indefinite'
                  />
                  <animate
                    attributeName='opacity'
                    values='0.45;0;0.45'
                    dur='4.6s'
                    repeatCount='indefinite'
                  />
                </circle>
              )}

              <Link
                href={`/programmes/${programme?.slug ?? ''}`}
                onMouseEnter={() => onSelect(n.id)}
                onFocus={() => onSelect(n.id)}
                aria-label={`${programme?.name ?? pillar?.name} — ${programme?.tagline ?? ''}`}
                data-cursor-label='Explore'
                style={{ outline: 'none' }}
              >
                {/* Generous invisible target so the node is easy to hit. */}
                <circle cx={n.x} cy={n.y} r={v.nodeR + 14} fill='transparent' />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isActive ? v.nodeActiveR : v.nodeR}
                  fill={isActive ? pillarAccentVar[n.id] : 'var(--card)'}
                  stroke={pillarAccentVar[n.id]}
                  strokeWidth='2'
                  style={{ transition: `all 320ms ${ease}` }}
                />
                {isActive && (
                  <circle cx={n.x} cy={n.y} r={v.nodeR * 0.3} fill='var(--card)' />
                )}
              </Link>

              <text
                x={n.x}
                y={n.y + v.labelDy}
                textAnchor='middle'
                fontFamily='var(--font-manrope)'
                fontWeight={isActive ? 700 : 600}
                fontSize={isActive ? v.labelActiveSize : v.labelSize}
                letterSpacing='0.05em'
                fill={isActive ? pillarAccentVar[n.id] : 'var(--ec-slate)'}
                opacity={revealed ? 1 : 0}
                style={{
                  transition: `opacity ${enterMs}ms ${ease} ${ENTER.labels + i * STAGGER}ms, fill 300ms ${ease}`,
                }}
              >
                {pillar?.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
