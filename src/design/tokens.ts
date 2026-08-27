/**
 * Educraft V2 — layout and elevation tokens (plan §8, Stage 1).
 * Spacing follows the 4px scale; grids, gutters, radii, shadows and z-order
 * are defined here so components never pick arbitrary values.
 */

/** Spacing scale in px (plan §8). */
export const spacing = [0, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160, 192] as const;

/** Radius scale — matches the --radius-* theme tokens. */
export const radii = {
  sm: '0.5rem', // 8
  md: '0.75rem', // 12
  lg: '1rem', // 16
  xl: '1.5rem', // 24
  '2xl': '2rem', // 32
  pill: '9999px',
} as const;

/** Elevation — restrained, indigo-tinted shadows. */
export const shadows = {
  subtle: '0 2px 12px rgba(14, 19, 48, 0.05)',
  card: '0 8px 30px rgba(30, 42, 120, 0.08)',
  elevated: '0 16px 48px rgba(14, 19, 48, 0.14)',
  gold: '0 4px 20px rgba(244, 185, 66, 0.3)',
  teal: '0 4px 20px rgba(0, 179, 184, 0.25)',
} as const;

/** Z-order ladder — one canonical scale for the whole app. */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 30,
  nav: 50,
  overlay: 90,
  modal: 100,
  cursor: 120,
} as const;

/** Layout grid (plan §8): 1440 max, 1200 content, responsive gutters. */
export const layout = {
  maxWidth: '1440px',
  contentWidth: '1200px',
  gutter: {
    mobile: 24,
    tablet: 32,
    desktop: 48,
    wide: 64,
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;
