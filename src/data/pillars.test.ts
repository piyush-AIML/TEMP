import { describe, expect, it } from 'vitest';
import { pillars } from './pillars';
import { programmes } from './programmes';
import { pillarAccent } from '@/lib/pillarStyles';

/**
 * Registry integrity. Source: Landing-Redesign-Plan.md §7.3 — the pillar
 * registry is the single source of truth, and everything else derives from it.
 */

describe('pillar registry', () => {
  it('has unique ids', () => {
    const ids = pillars.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique slugs', () => {
    const slugs = pillars.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every pillar has an accent registry entry', () => {
    for (const pillar of pillars) {
      expect(pillarAccent[pillar.id], `missing accent for ${pillar.id}`).toBeDefined();
    }
  });

  it('every pillar has exactly one programme (the landing page assumes 1:1)', () => {
    for (const pillar of pillars) {
      const matches = programmes.filter((p) => p.pillarId === pillar.id);
      expect(matches, `pillar ${pillar.id}`).toHaveLength(1);
    }
  });

  it('every pillar has a distinct hue family — no accent is reused', () => {
    const textTiers = pillars.map((p) => pillarAccent[p.id].accentVar);
    expect(new Set(textTiers).size).toBe(textTiers.length);
  });

  it('the programme slug matches its pillar slug', () => {
    // COURSE_VERTICALS stores programme slugs; the DB's Course.vertical is one
    // of them. They must not drift apart.
    for (const pillar of pillars) {
      const programme = programmes.find((p) => p.pillarId === pillar.id);
      expect(programme?.slug).toBe(pillar.slug);
    }
  });
});
