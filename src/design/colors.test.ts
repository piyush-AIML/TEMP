import { describe, expect, it } from 'vitest';
import {
  AA_NON_TEXT,
  AA_TEXT,
  DARK_CANVASES,
  LIGHT_CANVASES,
  contrastRatio,
} from '@/lib/contrast';
import { brand, programmeColors, reservedPillarAccents } from './colors';

/**
 * Enforces Landing-Redesign-Plan.md §6: every pillar text tier clears AA on
 * every canvas it can sit on, in both themes, and every graphic tier clears
 * the non-text threshold. This test is the reason a future palette edit cannot
 * silently regress accessibility.
 */

const PILLAR_IDS = ['learn', 'include', 'thrive', 'achieve', 'excel'] as const;

/** Worst-case ratio across a set of canvases — the number that must clear the floor. */
function worst(hex: string, canvases: readonly string[]): number {
  return Math.min(...canvases.map((canvas) => contrastRatio(hex, canvas)));
}

describe('pillar accents', () => {
  for (const id of PILLAR_IDS) {
    const accent = programmeColors[id];

    it(`${id}: exposes all six tiers`, () => {
      // Guards against a partial migration — on the shipped palette this fails
      // first and explains why the ratios below are NaN.
      expect(accent).toBeDefined();
      expect(Object.keys(accent).sort()).toEqual([
        'graphicDark',
        'graphicLight',
        'softDark',
        'softLight',
        'textDark',
        'textLight',
      ]);
    });

    it(`${id}: light text tier clears AA on every light canvas`, () => {
      expect(worst(accent.textLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${id}: dark text tier clears AA on every dark canvas`, () => {
      expect(worst(accent.textDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${id}: light graphic tier clears the non-text threshold on white`, () => {
      expect(contrastRatio(accent.graphicLight, '#ffffff')).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it(`${id}: dark graphic tier clears the non-text threshold on the dark canvas`, () => {
      expect(contrastRatio(accent.graphicDark, '#0b0f1e')).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it(`${id}: dark soft wash is visible against both dark canvases`, () => {
      // Spec §6.3 — the shipped washes measured 1.00-1.06 and were invisible.
      // The floor is 1.10; the band to aim for is 1.15-1.25.
      expect(contrastRatio(accent.softDark, '#0b0f1e')).toBeGreaterThanOrEqual(1.1);
      expect(contrastRatio(accent.softDark, '#141b38')).toBeGreaterThanOrEqual(1.02);
    });
  }

  it('reserved slots 6 and 7 are also AA-verified', () => {
    for (const accent of reservedPillarAccents) {
      expect(worst(accent.textLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(worst(accent.textDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});

describe('brand chrome', () => {
  it('teal text tier clears AA on every light canvas', () => {
    expect(worst(brand.tealTextLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('indigo has a dark-mode partner that clears AA on dark', () => {
    expect(worst(brand.indigoDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('slate clears AA in both themes', () => {
    expect(worst(brand.slateLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(worst(brand.slateDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});
