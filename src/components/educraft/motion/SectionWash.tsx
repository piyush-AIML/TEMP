interface SectionWashProps {
  /** Which edge the wash fades FROM (the edge where the previous tone ends). */
  from?: 'top' | 'bottom';
  className?: string;
}

/**
 * v4 atmosphere (FC-05) — shared light↔dark boundary wash. Renders a
 * full-bleed gradient strip along a section edge so tone changes read as one
 * canvas. Pure decoration: aria-hidden + pointer-events-none. Later FC items
 * (e.g. FinalCTA → footer) compose it; tone follows the section's own surface.
 */
export default function SectionWash({ from = 'bottom', className = '' }: SectionWashProps) {
  return (
    <div
      aria-hidden='true'
      className={`section-wash section-wash-${from} ${className}`}
    />
  );
}
