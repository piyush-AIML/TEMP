'use client';

import { useEffect, useRef } from 'react';
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
  /** 'full' — the desktop composition; 'compact' — the mobile one. */
  variant?: 'full' | 'compact';
}

type Pt = { x: number; y: number };

/**
 * Node positions in the full space (940×470): an organic horizontal spread,
 * deliberately uneven so the five read as points along living paths rather
 * than as satellites on a ring. A sixth pillar is one row here.
 */
const NODE_POINTS: Record<PillarId, Pt> = {
  learn: { x: 486, y: 104 },
  include: { x: 156, y: 214 },
  thrive: { x: 300, y: 388 },
  excel: { x: 650, y: 410 },
  achieve: { x: 784, y: 178 },
};

/**
 * Three flowing strands. Each is one continuous luminous path threading the
 * pillars it passes through ('core' is the nucleus itself, so the spine is the
 * strand that visibly runs through the centre of the system).
 */
const STRANDS: Array<{ id: string; through: Array<PillarId | 'core'>; accent: string }> = [
  { id: 'upper', through: ['include', 'learn', 'achieve'], accent: 'var(--ec-teal)' },
  { id: 'lower', through: ['include', 'thrive', 'excel', 'achieve'], accent: 'var(--ec-p-thrive)' },
  { id: 'spine', through: ['thrive', 'core', 'learn'], accent: 'var(--ec-gold)' },
];

/** Sparse fragments in the outer margin — atmosphere, nothing structural. */
const FIELD_DOTS: Array<[number, number]> = [
  [64, 84], [188, 36], [372, 22], [600, 24], [800, 46], [896, 140],
  [892, 352], [820, 452], [124, 448], [128, 400], [40, 244],
];

const VARIANTS = {
  full: {
    w: 940, h: 470, coreR: 19, nodeR: 22, nodeActiveR: 25, haloR: 38,
    labelSize: 16, labelActiveSize: 17, labelDy: 40, coreLabelSize: 12,
    stroke: 1.6, strokeActive: 2.3, glow: 7, atmosphere: true, particles: true, pointer: true,
  },
  compact: {
    w: 480, h: 400, coreR: 17, nodeR: 20, nodeActiveR: 23, haloR: 30,
    labelSize: 18, labelActiveSize: 19, labelDy: 36, coreLabelSize: 13,
    stroke: 1.7, strokeActive: 2.4, glow: 7, atmosphere: false, particles: false, pointer: false,
  },
} as const;

const r1 = (n: number) => Math.round(n * 10) / 10;
const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Centripetal Catmull-Rom through an open list of points, emitted as one cubic
 * Bézier chain. Centripetal parameterisation keeps the curve faithful on
 * unevenly spaced points (uniform Catmull-Rom overshoots and cusps), and the
 * clamped ends give the outer pillars a natural tangent instead of a kink.
 */
function flowingPath(points: Pt[]): string {
  const n = points.length;
  const at = (i: number) => points[Math.max(0, Math.min(n - 1, i))];
  let d = `M ${r1(points[0].x)} ${r1(points[0].y)}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const d1 = Math.sqrt(dist(p0, p1));
    const d2 = Math.sqrt(dist(p1, p2));
    const d3 = Math.sqrt(dist(p2, p3));

    const c1 = {
      x: p1.x + ((p2.x - p0.x) * d2) / (3 * (d1 + d2)),
      y: p1.y + ((p2.y - p0.y) * d2) / (3 * (d1 + d2)),
    };
    const c2 = {
      x: p2.x - ((p3.x - p1.x) * d2) / (3 * (d2 + d3)),
      y: p2.y - ((p3.y - p1.y) * d2) / (3 * (d2 + d3)),
    };

    d += ` C ${r1(c1.x)} ${r1(c1.y)}, ${r1(c2.x)} ${r1(c2.y)}, ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return d;
}

function buildGeometry(variant: 'full' | 'compact') {
  const v = VARIANTS[variant];
  const sx = v.w / VARIANTS.full.w;
  const sy = v.h / VARIANTS.full.h;
  const project = (p: Pt): Pt => ({ x: p.x * sx, y: p.y * sy });

  const core = { x: v.w / 2, y: v.h / 2 };
  const nodes = (Object.keys(NODE_POINTS) as PillarId[]).map((id) => ({
    id,
    ...project(NODE_POINTS[id]),
  }));
  const at = (id: PillarId) => nodes.find((n) => n.id === id)!;

  const strands = STRANDS.map((s) => ({
    ...s,
    d: flowingPath(s.through.map((id) => (id === 'core' ? core : at(id)))),
  }));

  return { v, core, nodes, strands };
}

/** Entrance: atmosphere → strands → core → nodes → labels → travelling light. */
const ENTER = { atmosphere: 0, strands: [200, 350, 500], core: 650, nodes: 750, labels: 950, flow: 1100 };

/**
 * "One ecosystem" — five paths, one connected system.
 *
 * The drawing is three flowing strands, not a ring: an upper sweep through
 * include → learn → achieve, a lower sweep through include → thrive → excel →
 * achieve, and a spine that runs through the nucleus itself (thrive → core →
 * learn), so the five pillars sit *on* living paths and the core is where the
 * flow crosses rather than a centre being orbited.
 *
 * Idle motion is confined to travelling light, a slow breath in each strand,
 * the nucleus pulse and a drift in the atmospheric fragments — nothing
 * rotates. Pointer proximity adds a damped local glow on fine pointers only
 * (a CSS variable written directly to the DOM, so no render happens per move).
 * Everything ambient is omitted under reduced motion.
 *
 * The visual is aria-hidden: the section carries the pillars as real text and
 * links, so this is never the only route to the content.
 */
export default function EcosystemGraphic({
  activePillarId,
  onSelect,
  className,
  variant = 'full',
}: EcosystemGraphicProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.25 });
  const reducedMotion = useReducedMotion();
  const glowRef = useRef<HTMLDivElement>(null);
  const { v, core, nodes, strands } = buildGeometry(variant);

  // Damped pointer proximity: a single listener, values written as CSS
  // variables (no React state, so moving the pointer never re-renders).
  // Uses the same ref as the reveal observer — one element, one ref.
  useEffect(() => {
    if (!v.pointer || reducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = ref.current;
    const glow = glowRef.current;
    if (!el || !glow) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      // Small, damped travel: depth, never a cursor follower.
      el.style.setProperty('--ec-gx', `${r1(dx * 56)}px`);
      el.style.setProperty('--ec-gy', `${r1(dy * 34)}px`);
      glow.style.opacity = '1';
    };
    const onLeave = () => {
      glow.style.opacity = '0';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [v.pointer, reducedMotion, ref]);

  const enterMs = Math.round(motion.duration.reveal * 1000);
  const ease = motion.easing.out;
  const fade = (delay: number, duration = enterMs) => ({
    opacity: revealed ? 1 : 0,
    transition: `opacity ${duration}ms ${ease}`,
    transitionDelay: `${delay}ms`,
  });
  const grow = (delay: number) => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : 'scale(0.9)',
    transformBox: 'fill-box' as const,
    transformOrigin: 'center',
    transition: `opacity ${enterMs}ms ${ease}, transform ${enterMs}ms ${ease}`,
    transitionDelay: `${delay}ms`,
  });

  return (
    <div ref={ref} className={cn('relative w-full h-full', className)}>
      {/* Local glow that lags the pointer — depth, not a spotlight. */}
      {v.pointer && (
        <div
          ref={glowRef}
          aria-hidden='true'
          className='pointer-events-none absolute left-1/2 top-1/2 -ml-40 -mt-40 h-80 w-80 rounded-full opacity-0'
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--ec-teal) 16%, transparent), transparent)',
            transform: 'translate3d(var(--ec-gx, 0px), var(--ec-gy, 0px), 0)',
            transition: 'opacity 600ms var(--ease-out-soft), transform 700ms var(--ease-out-soft)',
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${v.w} ${v.h}`}
        fill='none'
        preserveAspectRatio='xMidYMid meet'
        aria-hidden='true'
        className='relative w-full h-full'
      >
        <defs>
          <radialGradient id={`ec-nucleus-${variant}`} cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='var(--ec-teal)' stopOpacity='0.5' />
            <stop offset='45%' stopColor='var(--ec-teal)' stopOpacity='0.12' />
            <stop offset='100%' stopColor='var(--ec-teal)' stopOpacity='0' />
          </radialGradient>
          <radialGradient id={`ec-field-${variant}`} cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='var(--ec-teal)' stopOpacity='0.07' />
            <stop offset='60%' stopColor='var(--ec-indigo-light)' stopOpacity='0.03' />
            <stop offset='100%' stopColor='var(--ec-indigo-light)' stopOpacity='0' />
          </radialGradient>
        </defs>

        {/* 1 · Atmospheric field — one soft local volume, then fragments */}
        {v.atmosphere && (
          <g style={fade(ENTER.atmosphere, 900)}>
            <ellipse
              cx={core.x}
              cy={core.y}
              rx={v.w * 0.42}
              ry={v.h * 0.52}
              fill={`url(#ec-field-${variant})`}
            />
            <g>
              {FIELD_DOTS.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r='1.1' fill='var(--ec-border)' opacity='0.55' />
              ))}
              {!reducedMotion && (
                <animateTransform
                  attributeName='transform'
                  type='translate'
                  values='0 0; 5 -4; 0 0'
                  dur='44s'
                  repeatCount='indefinite'
                />
              )}
            </g>
          </g>
        )}

        {/* 2 · Flowing paths — an aura that breathes, a soft glow duplicate,
            then the strand itself. The aura carries the SMIL breath and the
            other two layers stay purely state-driven, so nothing fights over
            the same property (inline CSS wins over SMIL on one element). */}
        {strands.map((s, i) => {
          const touched = s.through.includes(activePillarId);
          return (
            <g key={s.id}>
              <path
                d={s.d}
                stroke={s.accent}
                strokeWidth={v.glow * 2.1}
                strokeOpacity={0.05}
                strokeLinecap='round'
              >
                {!reducedMotion && (
                  <animate
                    attributeName='stroke-opacity'
                    values='0.04;0.09;0.04'
                    dur={`${11 + i * 3}s`}
                    begin={`${i * 1.6}s`}
                    repeatCount='indefinite'
                  />
                )}
              </path>
              <path
                d={s.d}
                stroke={s.accent}
                strokeWidth={touched ? v.glow * 1.35 : v.glow}
                strokeOpacity={touched ? 0.16 : 0.07}
                strokeLinecap='round'
                style={{ transition: `stroke-opacity 500ms ${ease}, stroke-width 500ms ${ease}` }}
              />
              <path
                d={s.d}
                stroke={s.accent}
                strokeWidth={touched ? v.strokeActive : v.stroke}
                strokeOpacity={touched ? 0.6 : 0.3}
                strokeLinecap='round'
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={revealed ? 0 : 1}
                style={{
                  transition: `stroke-dashoffset ${enterMs + 300}ms ${ease} ${ENTER.strands[i]}ms, stroke-opacity 500ms ${ease}, stroke-width 500ms ${ease}`,
                }}
              />
            </g>
          );
        })}

        {/* 3 · Travelling light — one particle with a short trail per strand.
            The entrance fade lives on the group, so the circle's opacity is
            SMIL's alone. */}
        {v.particles && (
          <g>
            {strands.map((s, i) => {
              const touched = s.through.includes(activePillarId);
              const dur = `${13 + i * 4}s`;
              const begin = `${i * 3.5}s`;
              return (
                <g key={`light-${s.id}`} style={reducedMotion ? undefined : fade(ENTER.flow)}>
                  {!reducedMotion && (
                    <>
                      {/* opacity="0" is the base value the SMIL animation takes
                          over from once its `begin` elapses — without it a
                          particle sits fully visible on its start node. */}
                      <circle r={touched ? 3.1 : 2.4} fill={s.accent} opacity='0'>
                        <animateMotion dur={dur} begin={begin} repeatCount='indefinite' path={s.d} calcMode='linear' />
                        <animate
                          attributeName='opacity'
                          values={`0;0;${touched ? 0.95 : 0.45};${touched ? 0.95 : 0.45};0;0`}
                          keyTimes='0;0.3;0.42;0.72;0.84;1'
                          dur={dur}
                          begin={begin}
                          repeatCount='indefinite'
                        />
                      </circle>
                      <circle r={touched ? 1.7 : 1.3} fill={s.accent} opacity='0'>
                        <animateMotion dur={dur} begin={`${i * 3.5 + 0.45}s`} repeatCount='indefinite' path={s.d} calcMode='linear' />
                        <animate
                          attributeName='opacity'
                          values={`0;0;${touched ? 0.4 : 0.2};${touched ? 0.4 : 0.2};0;0`}
                          keyTimes='0;0.3;0.42;0.72;0.84;1'
                          dur={dur}
                          begin={`${i * 3.5 + 0.45}s`}
                          repeatCount='indefinite'
                        />
                      </circle>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 4 · The nucleus — where the strands cross, not what they orbit */}
        <g style={grow(ENTER.core)}>
          <circle cx={core.x} cy={core.y} r={v.coreR * 2.4} fill={`url(#ec-nucleus-${variant})`}>
            {!reducedMotion && (
              <animate
                attributeName='r'
                values={`${r1(v.coreR * 2.2)};${r1(v.coreR * 2.7)};${r1(v.coreR * 2.2)}`}
                dur='8s'
                repeatCount='indefinite'
              />
            )}
          </circle>
          <circle
            cx={core.x}
            cy={core.y}
            r={v.coreR + 9}
            stroke='var(--ec-teal)'
            strokeOpacity='0.28'
            strokeWidth='1'
            strokeDasharray='1.5 6'
          >
            {!reducedMotion && (
              <animate
                attributeName='stroke-opacity'
                values='0.28;0.5;0.28'
                dur='8s'
                repeatCount='indefinite'
              />
            )}
          </circle>
          <circle cx={core.x} cy={core.y} r={v.coreR} fill='var(--card)' stroke='var(--ec-teal)' strokeWidth='1.75' />
          <circle cx={core.x} cy={core.y} r={v.coreR * 0.34} fill='var(--ec-teal)'>
            {!reducedMotion && (
              <animate attributeName='opacity' values='0.75;1;0.75' dur='8s' repeatCount='indefinite' />
            )}
          </circle>
          <text
            x={core.x}
            y={core.y + v.coreR + 26}
            textAnchor='middle'
            fontFamily='var(--font-manrope)'
            fontWeight='600'
            fontSize={v.coreLabelSize}
            letterSpacing='0.1em'
            fill='var(--ec-slate)'
            opacity='0.75'
          >
            ONE ECOSYSTEM
          </text>
        </g>

        {/* 5 · Pillar nodes — points on the paths, never satellites */}
        {nodes.map((n, i) => {
          const isActive = activePillarId === n.id;
          const pillar = pillars.find((pl) => pl.id === n.id);
          const programme = programmes.find((p) => p.pillarId === n.id);
          return (
            <g key={n.id} style={grow(ENTER.nodes + i * 60)}>
              <circle
                cx={n.x}
                cy={n.y}
                r={v.haloR}
                fill={pillarSoftVar[n.id]}
                opacity={isActive ? 0.85 : 0}
                style={{ transition: `opacity 400ms ${ease}` }}
              />

              {isActive && !reducedMotion && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={v.nodeR + 9}
                  stroke={pillarAccentVar[n.id]}
                  strokeWidth='1.25'
                  opacity='0.5'
                >
                  <animate attributeName='r' values={`${v.nodeR + 7};${v.nodeR + 17};${v.nodeR + 7}`} dur='5.2s' repeatCount='indefinite' />
                  <animate attributeName='opacity' values='0.5;0;0.5' dur='5.2s' repeatCount='indefinite' />
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
                <circle cx={n.x} cy={n.y} r={v.nodeR + 16} fill='transparent' />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isActive ? v.nodeActiveR : v.nodeR}
                  fill={isActive ? pillarAccentVar[n.id] : 'var(--card)'}
                  stroke={pillarAccentVar[n.id]}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  style={{ transition: `all 320ms ${ease}` }}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={v.nodeR * 0.24}
                  fill={isActive ? 'var(--card)' : pillarAccentVar[n.id]}
                  style={{ transition: `all 320ms ${ease}` }}
                />
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
                  transition: `opacity ${enterMs}ms ${ease} ${ENTER.labels + i * 60}ms, fill 300ms ${ease}`,
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
