import type { PillarId } from '@/data/pillars';

/**
 * Pillar → Tailwind class maps (Landing Redesign Stage 1).
 *
 * Tailwind 4 scans source files for complete class names, so every class is
 * written out **literally** here — never built via string interpolation in
 * components. `bg-ec-${x}` generates no CSS.
 *
 * This is ONE registry rather than six parallel maps: six records keyed by
 * `PillarId` meant six chances to drift when a pillar was added. `Record<PillarId, …>`
 * makes `tsc` enforce completeness — adding a pillar fails the build until its
 * entry is added here.
 *
 * The re-exports below preserve the old call sites, so this refactor touches
 * no component.
 */

export type PillarAccentClasses = {
  /** The pillar's text-safe accent colour. */
  text: string;
  /** Non-text accent for strokes and nodes. */
  graphic: string;
  /**
   * `bg-ec-<id>` — the **accent (text-safe)** tier used as a background, not
   * the `graphic` tier. Preserves the old `pillarBgClass` values; Stage 3's
   * graphic-role migration should reach for `graphicVar` instead.
   */
  bg: string;
  /** Wash background for a station band. */
  softBg: string;
  /** Border in the text-safe accent. */
  border: string;
  /** Raw CSS var for SVG `stroke` / `fill` — theme-aware. */
  accentVar: string;
  /** Raw CSS var for the graphic tier — theme-aware. */
  graphicVar: string;
  /** Raw CSS var for the wash — theme-aware. */
  softVar: string;
};

export const pillarAccent: Record<PillarId, PillarAccentClasses> = {
  learn: {
    text: 'text-ec-learn',
    graphic: 'text-ec-learn-graphic',
    bg: 'bg-ec-learn',
    softBg: 'bg-ec-learn-soft',
    border: 'border-ec-learn',
    accentVar: 'var(--ec-p-learn)',
    graphicVar: 'var(--ec-p-learn-graphic)',
    softVar: 'var(--ec-p-learn-soft)',
  },
  include: {
    text: 'text-ec-include',
    graphic: 'text-ec-include-graphic',
    bg: 'bg-ec-include',
    softBg: 'bg-ec-include-soft',
    border: 'border-ec-include',
    accentVar: 'var(--ec-p-include)',
    graphicVar: 'var(--ec-p-include-graphic)',
    softVar: 'var(--ec-p-include-soft)',
  },
  thrive: {
    text: 'text-ec-thrive',
    graphic: 'text-ec-thrive-graphic',
    bg: 'bg-ec-thrive',
    softBg: 'bg-ec-thrive-soft',
    border: 'border-ec-thrive',
    accentVar: 'var(--ec-p-thrive)',
    graphicVar: 'var(--ec-p-thrive-graphic)',
    softVar: 'var(--ec-p-thrive-soft)',
  },
  achieve: {
    text: 'text-ec-achieve',
    graphic: 'text-ec-achieve-graphic',
    bg: 'bg-ec-achieve',
    softBg: 'bg-ec-achieve-soft',
    border: 'border-ec-achieve',
    accentVar: 'var(--ec-p-achieve)',
    graphicVar: 'var(--ec-p-achieve-graphic)',
    softVar: 'var(--ec-p-achieve-soft)',
  },
  excel: {
    text: 'text-ec-excel',
    graphic: 'text-ec-excel-graphic',
    bg: 'bg-ec-excel',
    softBg: 'bg-ec-excel-soft',
    border: 'border-ec-excel',
    accentVar: 'var(--ec-p-excel)',
    graphicVar: 'var(--ec-p-excel-graphic)',
    softVar: 'var(--ec-p-excel-soft)',
  },
};

// ---------------------------------------------------------------------------
// Back-compat re-exports — the previous six-map shape, derived from the one
// registry above. No call site changes were required by this refactor.
// ---------------------------------------------------------------------------

/** @deprecated Prefer `pillarAccent[id].text`. Kept for existing call sites. */
export const pillarTextClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.text])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].bg`. */
export const pillarBgClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.bg])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].softBg`. */
export const pillarSoftBgClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.softBg])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].border`. */
export const pillarBorderClass: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.border])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].accentVar`. */
export const pillarAccentVar: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.accentVar])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].graphicVar` — the accentVar is now text-tier. */
export const pillarGraphicVar: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.graphicVar])
) as Record<PillarId, string>;

/** @deprecated Prefer `pillarAccent[id].softVar`. */
export const pillarSoftVar: Record<PillarId, string> = Object.fromEntries(
  Object.entries(pillarAccent).map(([id, accent]) => [id, accent.softVar])
) as Record<PillarId, string>;
