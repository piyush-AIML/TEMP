import { getProgrammeBySlug } from '@/data/programmes';
import { pillarTextClass, pillarSoftBgClass, pillarBorderClass } from '@/lib/pillarStyles';

/**
 * Course vertical → marketing programme identity (Dashboard Stage 1).
 * Course.vertical stores one of the five programme slugs; this maps it back to
 * the programme name and its literal pillar-accent classes (Tailwind 4 scans
 * complete class names only — mappings stay literal, master §18 rule 5).
 * Callers fall back to neutral accents when a vertical is unknown.
 */

export type PillarAccent = {
  /** Programme display name, e.g. "Linguistics". */
  name: string;
  text: string;
  softBg: string;
  border: string;
};

export function getPillarAccentForVertical(vertical: string): PillarAccent | null {
  const programme = getProgrammeBySlug(vertical);
  if (!programme) return null;
  return {
    name: programme.name,
    text: pillarTextClass[programme.pillarId],
    softBg: pillarSoftBgClass[programme.pillarId],
    border: pillarBorderClass[programme.pillarId],
  };
}
