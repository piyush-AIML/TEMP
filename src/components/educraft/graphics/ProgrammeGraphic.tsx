import type { PillarId } from '@/types';
import { pillarAccentVar, pillarSoftVar } from '@/lib/pillarStyles';

interface ProgrammeGraphicProps {
  pillarId: PillarId;
  className?: string;
}

/**
 * Programme-specific hero illustrations (plan §12 E) — one bespoke SVG
 * composition per pillar. Theme-aware: colours resolve through CSS
 * variables, so light and dark modes each get their own art direction.
 */
export default function ProgrammeGraphic({ pillarId, className = '' }: ProgrammeGraphicProps) {
  return (
    <svg
      className={className}
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label={`${pillarId} programme illustration`}
    >
      {pillarId === 'learn' && <LinguisticsArt />}
      {pillarId === 'include' && <InclusionArt />}
      {pillarId === 'thrive' && <WellbeingArt />}
      {pillarId === 'achieve' && <TechnologyArt />}
      {pillarId === 'excel' && <ExcellenceArt />}
    </svg>
  );
}

/* Shared bits */
function SoftCircle({ cx, cy, r, id }: { cx: number; cy: number; r: number; id: PillarId }) {
  return <circle cx={cx} cy={cy} r={r} fill={pillarSoftVar[id]} />;
}

function AccentDot({ cx, cy, r = 5, id }: { cx: number; cy: number; r?: number; id: PillarId }) {
  return <circle cx={cx} cy={cy} r={r} fill={pillarAccentVar[id]} />;
}

function Ring({ cx, cy, r, id, opacity = 0.4 }: { cx: number; cy: number; r: number; id: PillarId; opacity?: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      stroke={pillarAccentVar[id]}
      strokeOpacity={opacity}
      strokeWidth='1.5'
      strokeDasharray='5 6'
    />
  );
}

/* ------------------------------------------------------------------ */
/* LEARN — language: speech bubbles, letterforms, conversation path    */
/* ------------------------------------------------------------------ */
function LinguisticsArt() {
  const id = 'learn';
  return (
    <g>
      <SoftCircle cx={200} cy={200} r={150} id={id} />
      <Ring cx={200} cy={200} r={118} id={id} />
      <Ring cx={200} cy={200} r={150} id={id} opacity={0.25} />

      {/* Conversation path between the bubbles */}
      <path
        d='M 128 132 C 160 120, 176 140, 200 150 S 236 156, 252 148'
        stroke={pillarAccentVar[id]}
        strokeOpacity='0.5'
        strokeWidth='2'
        strokeLinecap='round'
        strokeDasharray='4 6'
      />

      {/* Main speech bubble with letterforms */}
      <g className='ambient-drift'>
        <rect x='140' y='150' width='120' height='100' rx='28' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' />
        <path d='M 178 250 L 178 276 L 200 250 Z' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' strokeLinejoin='round' />
        <text
          x='200'
          y='216'
          textAnchor='middle'
          fontFamily='var(--font-clash)'
          fontWeight='700'
          fontSize='44'
          fill={pillarAccentVar[id]}
        >
          Aa
        </text>
      </g>

      {/* Small floating bubbles */}
      <g className='ambient-drift' style={{ animationDelay: '-4s' }}>
        <circle cx='94' cy='96' r='26' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='1.5' />
        <text x='94' y='103' textAnchor='middle' fontFamily='var(--font-clash)' fontWeight='700' fontSize='18' fill={pillarAccentVar[id]}>
          你好
        </text>
      </g>
      <g className='ambient-drift' style={{ animationDelay: '-8s' }}>
        <circle cx='304' cy='92' r='22' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='1.5' />
        <text x='304' y='99' textAnchor='middle' fontFamily='var(--font-clash)' fontWeight='700' fontSize='16' fill={pillarAccentVar[id]}>
          hola
        </text>
      </g>

      <AccentDot cx={310} cy={290} r={6} id={id} />
      <AccentDot cx={88} cy={290} r={4} id={id} />
      <circle cx='310' cy='290' r='14' stroke={pillarAccentVar[id]} strokeOpacity='0.4' strokeWidth='1' />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* INCLUDE — one circle holding many smaller ones                      */
/* ------------------------------------------------------------------ */
function InclusionArt() {
  const id = 'include';
  return (
    <g>
      <SoftCircle cx={200} cy={200} r={152} id={id} />
      <circle cx='200' cy='200' r='118' stroke={pillarAccentVar[id]} strokeOpacity='0.5' strokeWidth='2' />

      {/* Diverse shapes inside one circle */}
      <g className='ambient-drift'>
        <circle cx='156' cy='160' r='34' fill={pillarAccentVar[id]} fillOpacity='0.85' />
        <rect x='180' y='196' width='52' height='52' rx='14' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' transform='rotate(12 206 222)' />
        <circle cx='244' cy='154' r='24' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' />
        <path d='M 168 236 L 190 268 L 222 232 Z' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' strokeLinejoin='round' />
      </g>

      {/* Connecting arcs — each shape linked to the centre */}
      <g stroke={pillarAccentVar[id]} strokeOpacity='0.35' strokeWidth='1.5' strokeDasharray='3 5'>
        <line x1='200' y1='200' x2='156' y2='160' />
        <line x1='200' y1='200' x2='206' y2='222' />
        <line x1='200' y1='200' x2='244' y2='154' />
        <line x1='200' y1='200' x2='190' y2='268' />
      </g>

      <AccentDot cx={200} cy={200} r={6} id={id} />
      <AccentDot cx={92} cy={330} r={4} id={id} />
      <AccentDot cx={314} cy={330} r={4} id={id} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* THRIVE — calm: layered petals, horizon waves, centred dot           */
/* ------------------------------------------------------------------ */
function WellbeingArt() {
  const id = 'thrive';
  return (
    <g>
      <SoftCircle cx={200} cy={190} r={140} id={id} />
      <Ring cx={200} cy={190} r={112} id={id} />

      {/* Layered petals around a calm centre */}
      <g className='ambient-drift'>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={deg}
            d='M 200 190 C 208 140, 232 120, 254 132 C 236 152, 232 172, 236 190 C 218 196, 206 194, 200 190 Z'
            fill='var(--card)'
            stroke={pillarAccentVar[id]}
            strokeOpacity='0.6'
            strokeWidth='1.5'
            transform={`rotate(${deg} 200 190)`}
          />
        ))}
      </g>
      <circle cx='200' cy='190' r='30' fill={pillarAccentVar[id]} fillOpacity='0.9' />
      <circle cx='200' cy='190' r='14' fill='var(--card)' />

      {/* Horizon waves */}
      <g className='ambient-drift' style={{ animationDelay: '-5s' }}>
        <path d='M 80 300 Q 140 286, 200 300 T 320 300' stroke={pillarAccentVar[id]} strokeOpacity='0.5' strokeWidth='2' fill='none' strokeLinecap='round' />
        <path d='M 110 324 Q 170 314, 230 324 T 330 322' stroke={pillarAccentVar[id]} strokeOpacity='0.3' strokeWidth='1.5' fill='none' strokeLinecap='round' />
      </g>

      <AccentDot cx={92} cy={92} r={4} id={id} />
      <AccentDot cx={310} cy={92} r={4} id={id} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* ACHIEVE — technology: chip, circuits, data points                   */
/* ------------------------------------------------------------------ */
function TechnologyArt() {
  const id = 'achieve';
  return (
    <g>
      <SoftCircle cx={200} cy={200} r={150} id={id} />

      {/* Circuit traces */}
      <g stroke={pillarAccentVar[id]} strokeOpacity='0.45' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M 200 108 V 148' />
        <path d='M 200 252 V 292' />
        <path d='M 108 200 H 148' />
        <path d='M 252 200 H 292' />
        <path d='M 200 148 H 168 V 170' />
        <path d='M 200 252 H 232 V 230' />
      </g>

      {/* Central chip */}
      <g className='ambient-drift'>
        <rect x='152' y='152' width='96' height='96' rx='22' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2.5' />
        <rect x='176' y='176' width='48' height='48' rx='12' fill={pillarAccentVar[id]} fillOpacity='0.9' />
        <path d='M 192 200 L 198 206 L 212 192' stroke='var(--card)' strokeWidth='3' fill='none' strokeLinecap='round' strokeLinejoin='round' />
        {/* Pins */}
        {[168, 184, 200, 216, 232].map((x) => (
          <line key={x} x1={x} y1='248' x2={x} y2='258' stroke={pillarAccentVar[id]} strokeWidth='2.5' />
        ))}
      </g>

      {/* Data nodes on traces */}
      <AccentDot cx={200} cy={118} r={6} id={id} />
      <AccentDot cx={200} cy={282} r={6} id={id} />
      <AccentDot cx={118} cy={200} r={6} id={id} />
      <AccentDot cx={282} cy={200} r={6} id={id} />
      <circle cx='200' cy='118' r='13' stroke={pillarAccentVar[id]} strokeOpacity='0.35' strokeWidth='1.5' />
      <circle cx='282' cy='200' r='13' stroke={pillarAccentVar[id]} strokeOpacity='0.35' strokeWidth='1.5' />

      {/* Floating data squares */}
      <rect x='90' y='84' width='14' height='14' rx='4' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='1.5' className='ambient-drift' />
      <rect x='296' y='302' width='18' height='18' rx='5' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='1.5' className='ambient-drift' style={{ animationDelay: '-6s' }} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* EXCEL — excellence: ascending steps to a rising star                */
/* ------------------------------------------------------------------ */
function ExcellenceArt() {
  const id = 'excel';
  return (
    <g>
      <SoftCircle cx={200} cy={200} r={150} id={id} />
      <Ring cx={200} cy={200} r={118} id={id} />

      {/* Ascending steps */}
      <g className='ambient-drift'>
        <rect x='104' y='252' width='56' height='24' rx='8' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' />
        <rect x='164' y='220' width='56' height='24' rx='8' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' />
        <rect x='224' y='188' width='56' height='24' rx='8' fill='var(--card)' stroke={pillarAccentVar[id]} strokeWidth='2' />
      </g>

      {/* Rising arrow */}
      <path
        d='M 136 292 L 196 222 L 232 180 L 274 140'
        stroke={pillarAccentVar[id]}
        strokeOpacity='0.6'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeDasharray='6 7'
        fill='none'
      />
      <path d='M 258 136 L 276 136 L 276 152' stroke={pillarAccentVar[id]} strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' fill='none' />

      {/* Star at the top */}
      <g className='ambient-pulse'>
        <path
          d='M 200 64 L 208 82 L 228 84 L 213 97 L 218 117 L 200 105 L 182 117 L 187 97 L 172 84 L 192 82 Z'
          fill={pillarAccentVar[id]}
        />
      </g>

      {/* Baseline */}
      <line x1='92' y1='292' x2='308' y2='292' stroke={pillarAccentVar[id]} strokeOpacity='0.4' strokeWidth='1.5' strokeLinecap='round' />

      <AccentDot cx={96} cy={100} r={4} id={id} />
      <AccentDot cx={304} cy={232} r={4} id={id} />
    </g>
  );
}
