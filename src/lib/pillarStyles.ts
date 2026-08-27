import type { PillarId } from '@/types';

/**
 * Pillar → Tailwind class maps. Tailwind 4 scans source files for complete
 * class names, so classes must be written out literally here (never built
 * via string interpolation in components).
 */

export const pillarTextClass: Record<PillarId, string> = {
  learn: 'text-ec-learn',
  include: 'text-ec-include',
  thrive: 'text-ec-thrive',
  achieve: 'text-ec-achieve',
  excel: 'text-ec-excel',
};

export const pillarBgClass: Record<PillarId, string> = {
  learn: 'bg-ec-learn',
  include: 'bg-ec-include',
  thrive: 'bg-ec-thrive',
  achieve: 'bg-ec-achieve',
  excel: 'bg-ec-excel',
};

export const pillarSoftBgClass: Record<PillarId, string> = {
  learn: 'bg-ec-learn-soft',
  include: 'bg-ec-include-soft',
  thrive: 'bg-ec-thrive-soft',
  achieve: 'bg-ec-achieve-soft',
  excel: 'bg-ec-excel-soft',
};

export const pillarBorderClass: Record<PillarId, string> = {
  learn: 'border-ec-learn',
  include: 'border-ec-include',
  thrive: 'border-ec-thrive',
  achieve: 'border-ec-achieve',
  excel: 'border-ec-excel',
};

/** CSS variable references for SVG fills — theme-aware (light/dark). */
export const pillarAccentVar: Record<PillarId, string> = {
  learn: 'var(--ec-p-learn)',
  include: 'var(--ec-p-include)',
  thrive: 'var(--ec-p-thrive)',
  achieve: 'var(--ec-p-achieve)',
  excel: 'var(--ec-p-excel)',
};

/** Soft-wash variable references for SVG backgrounds. */
export const pillarSoftVar: Record<PillarId, string> = {
  learn: 'var(--ec-p-learn-soft)',
  include: 'var(--ec-p-include-soft)',
  thrive: 'var(--ec-p-thrive-soft)',
  achieve: 'var(--ec-p-achieve-soft)',
  excel: 'var(--ec-p-excel-soft)',
};
