import { describe, expect, it } from 'vitest';
import {
  AA_NON_TEXT,
  AA_TEXT,
  DARK_CANVASES,
  LIGHT_CANVASES,
  contrastRatio,
} from '@/lib/contrast';
import { pillars } from '@/data/pillars';
import { brand, programmeColors, reservedPillarAccents } from './colors';

/**
 * Enforces Landing-Redesign-Plan.md §6: every pillar text tier clears AA on
 * every canvas it can sit on, in both themes, and every graphic tier clears
 * the non-text threshold. This test is the reason a future palette edit cannot
 * silently regress accessibility.
 */

/**
 * Derived from the registry, never restated. A hand-written list here meant a
 * sixth pillar's colours were never measured against the AA floors while the
 * suite stayed green — the failure mode §7.4 says this test exists to prevent.
 */
const PILLAR_IDS = pillars.map((pillar) => pillar.id);

/** Worst-case ratio across a set of canvases — the number that must clear the floor. */
function worst(hex: string, canvases: readonly string[]): number {
  return Math.min(...canvases.map((canvas) => contrastRatio(hex, canvas)));
}

describe('pillar accents', () => {
  it('the palette and the pillar registry cover the same set of ids', () => {
    // The per-pillar tests below are only as complete as PILLAR_IDS. This
    // asserts the two sources agree in both directions, so a sixth pillar
    // cannot be present in one and absent from the other.
    expect(Object.keys(programmeColors).sort()).toEqual(pillars.map((p) => p.id).sort());
  });

  for (const id of PILLAR_IDS) {
    const accent = programmeColors[id];

    it(`${id}: exposes all six tiers`, () => {
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

    it(`${id}: dark soft wash reads as a tint on both dark canvases`, () => {
      // Spec §6.3. Floors: >=1.15 against the darkest canvas, >=1.02 against
      // the lighter one. The second floor is the derived equivalent of the
      // first — a wash always scores 1.1292x higher against #0b0f1e than
      // against #141b38, because #0b0f1e is darker.
      //
      // There is deliberately NO upper bound. A wash that clears 1.15 on the
      // darker canvas necessarily exceeds 1.25 on the lighter one, and that is
      // correct: it is a tint against a lighter surface. An earlier draft of
      // the spec demanded 1.15-1.25 on *both*, which is unsatisfiable.
      expect(contrastRatio(accent.softDark, '#0b0f1e')).toBeGreaterThanOrEqual(1.15);
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

  it('the primary CTA pairing clears AA: gold fill against indigo-deep text', () => {
    // Button.tsx's `primary` variant is `bg-ec-gold text-ec-indigo-dark
    // hover:bg-ec-gold-dark`. Measuring tokens only against canvases cannot
    // see a broken token-against-token pair — and this one silently regressed
    // to 2.64:1 (hover 1.86:1) when `--ec-gold` was darkened as if it were a
    // text token. Assert the hover state too, not just the resting one.
    expect(contrastRatio(brand.goldFillLight, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(brand.goldHoverLight, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(brand.goldFillDark, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('slate clears AA in both themes', () => {
    expect(worst(brand.slateLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(worst(brand.slateDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});
