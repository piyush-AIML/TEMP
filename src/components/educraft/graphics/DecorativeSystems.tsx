/**
 * Decorative background systems (plan §42) — reusable, not redrawn per section.
 * All are aria-hidden, use currentColor/stroke tokens for theme-awareness,
 * and scale to their container.
 *
 *   System A — GradientMesh      (subtle atmosphere)
 *   System B — Constellation      (ecosystem sections)
 *   System C — TopographicLines   (methodology)
 *   System D — GridPattern        (technology sections, used sparingly)
 *   System E — PathLines          (transitions and journeys)
 */

interface SystemProps {
  className?: string;
  /** Token class controlling stroke colour, e.g. 'text-ec-teal' — SVG uses currentColor. */
  colorClassName?: string;
}

/**
 * System A — subtle gradient mesh wash.
 * v2 (FC-05): two slow transform-only radial layers drift on their own cycles
 * (GPU-safe, no layout reads). Layer 1 follows `colorClassName` via
 * currentColor; layer 2 is the teal accent through the theme token. Reduced
 * motion freezes both (global animation kill). API unchanged.
 */
export function GradientMesh({ className = '', colorClassName = 'text-ec-indigo' }: SystemProps) {
  return (
    <div
      aria-hidden='true'
      className={`absolute inset-0 overflow-hidden pointer-events-none ${colorClassName} ${className}`}
    >
      <div className='gradient-mesh-layer gradient-mesh-layer-a' />
      <div className='gradient-mesh-layer gradient-mesh-layer-b' />
    </div>
  );
}

/** System B — dotted constellation (ecosystem sections). */
export function Constellation({ className = '', colorClassName = 'text-ec-teal' }: SystemProps) {
  const dots: Array<[number, number]> = [
    [10, 15], [24, 8], [40, 18], [58, 6], [72, 14], [88, 8], [96, 20],
    [16, 40], [32, 34], [50, 44], [66, 36], [82, 46], [94, 38],
    [12, 68], [28, 60], [46, 70], [62, 62], [78, 72], [92, 64],
    [20, 88], [38, 82], [56, 90], [74, 84], [90, 90],
  ];
  const lines: Array<[number, number, number, number]> = [
    [10, 15, 24, 8], [24, 8, 40, 18], [40, 18, 58, 6], [58, 6, 72, 14],
    [72, 14, 88, 8], [88, 8, 96, 20], [16, 40, 32, 34], [32, 34, 50, 44],
    [50, 44, 66, 36], [66, 36, 82, 46], [82, 46, 94, 38], [12, 68, 28, 60],
    [28, 60, 46, 70], [46, 70, 62, 62], [62, 62, 78, 72], [78, 72, 92, 64],
    [20, 88, 38, 82], [38, 82, 56, 90], [56, 90, 74, 84], [74, 84, 90, 90],
    [24, 8, 32, 34], [40, 18, 50, 44], [72, 14, 66, 36], [88, 8, 82, 46],
    [32, 34, 28, 60], [50, 44, 46, 70], [66, 36, 62, 62], [82, 46, 78, 72],
    [28, 60, 38, 82], [46, 70, 56, 90], [62, 62, 74, 84], [78, 72, 90, 90],
  ];
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${colorClassName} ${className}`}
      viewBox='0 0 100 100'
      preserveAspectRatio='xMidYMid slice'
      aria-hidden='true'
    >
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke='currentColor' strokeOpacity='0.14' strokeWidth='0.2' />
      ))}
      {dots.map(([x, y], i) => (
        <circle key={`d${i}`} cx={x} cy={y} r={i % 3 === 0 ? 0.55 : 0.32} fill='currentColor' fillOpacity='0.35' />
      ))}
    </svg>
  );
}

/** System C — topographic contour lines (methodology). */
export function TopographicLines({ className = '', colorClassName = 'text-ec-indigo' }: SystemProps) {
  const rings = [
    { cx: 18, cy: 30, r: 14 },
    { cx: 18, cy: 30, r: 22 },
    { cx: 18, cy: 30, r: 30 },
    { cx: 18, cy: 30, r: 40 },
    { cx: 78, cy: 74, r: 12 },
    { cx: 78, cy: 74, r: 20 },
    { cx: 78, cy: 74, r: 28 },
    { cx: 78, cy: 74, r: 38 },
    { cx: 92, cy: 12, r: 8 },
    { cx: 92, cy: 12, r: 15 },
  ];
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${colorClassName} ${className}`}
      viewBox='0 0 100 100'
      preserveAspectRatio='xMidYMid slice'
      aria-hidden='true'
    >
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={r.cx}
          cy={r.cy}
          r={r.r}
          fill='none'
          stroke='currentColor'
          strokeOpacity={i % 3 === 0 ? 0.16 : 0.08}
          strokeWidth='0.35'
        />
      ))}
    </svg>
  );
}

/** System D — engineering grid (technology sections, sparingly). */
export function GridPattern({ className = '', colorClassName = 'text-ec-indigo' }: SystemProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${colorClassName} ${className}`}
      viewBox='0 0 100 100'
      preserveAspectRatio='xMidYMid slice'
      aria-hidden='true'
    >
      <defs>
        <pattern id='grid-cells' width='6' height='6' patternUnits='userSpaceOnUse'>
          <path d='M 6 0 L 0 0 0 6' fill='none' stroke='currentColor' strokeOpacity='0.12' strokeWidth='0.25' />
        </pattern>
      </defs>
      <rect width='100' height='100' fill='url(#grid-cells)' />
    </svg>
  );
}

/** System E — journey path lines (transitions and journeys). */
export function PathLines({ className = '', colorClassName = 'text-ec-teal' }: SystemProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${colorClassName} ${className}`}
      viewBox='0 0 100 100'
      preserveAspectRatio='xMidYMid slice'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M -2 78 C 20 74, 26 58, 44 54 S 72 46, 78 28 S 92 10, 104 6'
        stroke='currentColor'
        strokeOpacity='0.2'
        strokeWidth='0.4'
        strokeDasharray='1.6 1.2'
      />
      <path
        d='M -2 88 C 24 84, 30 66, 50 62 S 76 52, 84 36 S 96 20, 104 16'
        stroke='currentColor'
        strokeOpacity='0.12'
        strokeWidth='0.4'
      />
    </svg>
  );
}
