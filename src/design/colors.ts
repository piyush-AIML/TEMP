/**
 * Educraft V2 — color system source of truth (plan §7).
 * Hex values are mirrored into CSS custom properties in globals.css,
 * where light/dark art direction is applied (plan §44).
 */

export const brand = {
  indigo: {
    950: '#0B0F1E',
    900: '#141D57',
    700: '#1E2A78',
    500: '#3B4896',
    300: '#7C86C9',
    100: '#E8EBF8',
  },
  teal: {
    700: '#00898D',
    600: '#00B3B8',
    500: '#14C3C8',
    300: '#3FCBCF',
    100: '#DFF5F6',
  },
  gold: {
    700: '#B07E14',
    600: '#C58F1B',
    500: '#F4B942',
    400: '#F8CD73',
    100: '#FBF0D9',
  },
  sky: {
    100: '#EAF6FF',
    200: '#D8ECFB',
  },
} as const;

/** Neutral canvas layers (plan §7 "Neutrals"). */
export const canvas = {
  DEFAULT: '#FFFFFF',
  soft: '#F6F9FC',
  deep: '#EAF3FB',
} as const;

export const ink = {
  strong: '#0E1330',
  DEFAULT: '#12172E',
  muted: '#5B6478',
  faint: '#8E97B4',
} as const;

export const borderColor = {
  light: '#E4E9F2',
  dark: '#232B4D',
} as const;

export const semantic = {
  success: '#16A34A',
  warning: '#B45309',
  error: '#DC2626',
  info: '#2563EB',
  focus: '#1E2A78',
} as const;

/**
 * Programme accent identities (plan §7 "Programme colors").
 * Each pillar owns: main accent, accessible strong variant, and a soft wash.
 * `main` is used for lines/nodes/decoration; `strong` for text on light canvas.
 */
export const programmeColors = {
  learn: { main: '#00B3B8', strong: '#00898D', soft: '#DFF5F6', darkMain: '#3FCBCF' },
  include: { main: '#4A86D9', strong: '#3B7DD8', soft: '#E7EFFB', darkMain: '#7FA8E8' },
  thrive: { main: '#8B7BD8', strong: '#6F5CB8', soft: '#EFEBFA', darkMain: '#A795E8' },
  achieve: { main: '#F4B942', strong: '#C58F1B', soft: '#FBF0D9', darkMain: '#F8CD73' },
  excel: { main: '#3B4896', strong: '#1E2A78', soft: '#E8EBF8', darkMain: '#7C86C9' },
} as const;

export type PillarColorKey = keyof typeof programmeColors;
