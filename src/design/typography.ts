import type { CSSProperties } from 'react';

/**
 * Educraft V2 — typography system (plan §6).
 * Sora (700) for display/headings, Manrope (400–600) for interface and body.
 * Sizes are responsive clamps per plan §6.2; apply via the `typeStyle()` helper
 * or the `.type-*` component classes in globals.css.
 */

export const fonts = {
  display: 'var(--font-sora)',
  body: 'var(--font-manrope)',
} as const;

export interface TypeStyle {
  fontSize: string;
  lineHeight: number | string;
  letterSpacing?: string;
  fontWeight: number;
  fontFamily: string;
}

const display = (fontSize: string, lineHeight: number, letterSpacing = ''): TypeStyle => ({
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight: 700,
  fontFamily: fonts.display,
});

const body = (fontSize: string, lineHeight: number, fontWeight = 400): TypeStyle => ({
  fontSize,
  lineHeight,
  fontWeight,
  fontFamily: fonts.body,
});

/** Plan §6.2 scale: name → px target. */
export const typeScale = {
  displayXL: display('clamp(3rem, 6.5vw + 0.75rem, 5.25rem)', 0.95, '-0.03em'), // 84
  displayL: display('clamp(2.5rem, 5vw + 1rem, 4.25rem)', 1.0, '-0.025em'), // 68
  displayM: display('clamp(2.125rem, 4vw + 0.75rem, 3.25rem)', 1.04, '-0.02em'), // 52
  headingXL: display('clamp(2rem, 3.5vw + 0.5rem, 2.75rem)', 1.08, '-0.015em'), // 44
  headingL: display('clamp(1.75rem, 2.75vw + 0.5rem, 2.25rem)', 1.12, '-0.01em'), // 36
  headingM: display('clamp(1.5rem, 2vw + 0.5rem, 1.75rem)', 1.18, '-0.005em'), // 28
  headingS: display('clamp(1.25rem, 1.5vw + 0.5rem, 1.375rem)', 1.22), // 22
  bodyL: body('1.25rem', 1.55), // 20
  bodyM: body('1.0625rem', 1.6), // 17
  bodyS: body('0.875rem', 1.5), // 14
  caption: body('0.75rem', 1.3, 500), // 12
} as const;

export type TypeScaleKey = keyof typeof typeScale;

/** Returns inline styles for a named type style (e.g. `style={typeStyle('displayXL')}`). */
export function typeStyle(key: TypeScaleKey): CSSProperties {
  const t = typeScale[key];
  return {
    fontFamily: t.fontFamily,
    fontWeight: t.fontWeight,
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
  };
}

/** Reading measure — body copy should stay within ~55–75 characters (plan §6.3). */
export const measure = {
  narrow: '36ch',
  regular: '55ch',
  wide: '75ch',
} as const;
