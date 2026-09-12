import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from './contrast';

/**
 * Tests for the WCAG maths itself.
 *
 * These assert against **hex literals, not the palette**, so this file
 * compiles and passes no matter what `src/design/colors.ts` currently
 * exports. The palette-enforcement test is `src/design/colors.test.ts`,
 * which Task 2 adds in the same commit as the token shape it checks — a test
 * cannot reference a type shape that does not exist yet without breaking
 * `tsc`.
 */

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 6);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 6);
  });

  it('increases monotonically with lightness', () => {
    const greys = ['#000000', '#333333', '#767676', '#bbbbbb', '#ffffff'];
    const lums = greys.map(relativeLuminance);
    for (let i = 1; i < lums.length; i += 1) {
      expect(lums[i]).toBeGreaterThan(lums[i - 1]);
    }
  });

  it('expands 3-digit hex', () => {
    expect(relativeLuminance('#fff')).toBeCloseTo(relativeLuminance('#ffffff'), 9);
    expect(relativeLuminance('#000')).toBeCloseTo(relativeLuminance('#000000'), 9);
  });

  it('throws on a non-hex input rather than returning NaN', () => {
    // `relativeLuminance` is part of the module's public interface and Task 2+
    // callers can reach it directly, so it must guard its own input rather
    // than relying on contrastRatio's guard.
    expect(() => relativeLuminance('rebeccapurple')).toThrow(/hex/i);
    expect(() => relativeLuminance(undefined as unknown as string)).toThrow(/hex/i);
  });
});

describe('contrastRatio', () => {
  it('gives the maximum 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
  });

  it('gives 1:1 for a colour against itself', () => {
    expect(contrastRatio('#00b3b8', '#00b3b8')).toBeCloseTo(1, 6);
  });

  it('is order-independent', () => {
    expect(contrastRatio('#0c7078', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#0c7078'),
      9
    );
  });

  it('places the AA boundary where WCAG does', () => {
    // #767676 on white is the canonical just-passes grey (4.54:1); #777777 is
    // the canonical just-fails one.
    expect(contrastRatio('#767676', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#777777', '#ffffff')).toBeLessThan(4.5);
  });

  it('reproduces the shipped brand-teal failure measured in the spec', () => {
    // Landing-Redesign-Plan.md §1.4 — #00b3b8 as text on white is 2.58:1.
    expect(contrastRatio('#00b3b8', '#ffffff')).toBeCloseTo(2.58, 2);
  });

  it('throws on a non-hex input instead of silently returning NaN', () => {
    expect(() => contrastRatio('rebeccapurple', '#ffffff')).toThrow(/hex/i);
    expect(() => contrastRatio(undefined as unknown as string, '#ffffff')).toThrow(/hex/i);
    expect(() => contrastRatio('', '#ffffff')).toThrow(/hex/i);
  });
});
