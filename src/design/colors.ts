import type { PillarId } from '@/data/pillars';

/**
 * Educraft — colour system source of truth (Landing Redesign Stage 1).
 * Hex values are mirrored into CSS custom properties in globals.css, where
 * light/dark art direction is applied.
 *
 * Every value here is **measured**: src/design/colors.test.ts asserts each
 * text tier clears WCAG AA (4.5:1) on every canvas it can sit on and each
 * graphic tier clears 3:1. Do not edit a value without re-running that test.
 *
 * Contrast rationale — Landing-Redesign-Plan.md §6.
 */

/** A pillar identity in three roles × two themes. */
export type PillarAccent = {
  /** Text-safe accent (≥4.5:1 on every canvas). Drives `text-ec-<id>`. */
  textLight: string;
  textDark: string;
  /** Non-text accent for strokes, nodes, the strand (≥3:1). Drives `ec-<id>-graphic`. */
  graphicLight: string;
  graphicDark: string;
  /** Wash behind a station. Drives `bg-ec-<id>-soft`. */
  softLight: string;
  softDark: string;
};

/**
 * Programme accent identities. `learn`/`include`/`thrive`/`achieve`/`excel` are
 * five *distinct* hues — note that `learn` and `excel` deliberately no longer
 * alias the brand teal and brand indigo, which was the old collision.
 *
 * Equi-luminant by design: the five text tiers' relative luminance spans 0.030,
 * so no pillar shouts louder than another. Hue spread 39/184/222/260/336deg.
 *
 * Annotated `Record<PillarId, PillarAccent>` rather than `satisfies`, so a
 * pillar id with no palette entry is a **compile error** — the same discipline
 * as `pillarAccent` in lib/pillarStyles.ts. The annotation also makes every
 * `programmeColors[pillarId]` index total; on an unconstrained object, and
 * with `noImplicitAny: false`, an absent key silently types as `any` instead
 * of erroring.
 */
export const programmeColors: Record<PillarId, PillarAccent> = {
  learn: {
    textLight: '#0C7078',
    textDark: '#4FD4DC',
    graphicLight: '#12A0AC',
    graphicDark: '#2FBAC4',
    softLight: '#E0F5F7',
    softDark: '#0C2B30',
  },
  include: {
    textLight: '#2B5FD9',
    textDark: '#8FB4F5',
    graphicLight: '#4C82E8',
    graphicDark: '#6E9BEE',
    softLight: '#E5EDFD',
    softDark: '#131F3D',
  },
  thrive: {
    textLight: '#6B3FC4',
    textDark: '#B49BEE',
    graphicLight: '#8B62D9',
    graphicDark: '#9E7FE4',
    softLight: '#EDE6FB',
    softDark: '#221B3C',
  },
  achieve: {
    textLight: '#8A5A00',
    textDark: '#F5C95E',
    graphicLight: '#B8860B',
    graphicDark: '#E8B94A',
    softLight: '#FAEED6',
    softDark: '#2A2110',
  },
  excel: {
    textLight: '#C2185B',
    textDark: '#F285A8',
    graphicLight: '#E0437C',
    graphicDark: '#EC6A99',
    softLight: '#FCE4EC',
    softDark: '#391627',
  },
};

/**
 * Pillar identity for colour lookups. An alias of `PillarId`, not a second
 * union derived from this object's keys: two independently-derived identity
 * unions drift the moment one of them gains an entry.
 */
export type PillarColorKey = PillarId;

/**
 * Reserved accents for pillars 6 and 7 (Landing-Redesign-Plan.md §7.3).
 * The largest free hue gap in the current wheel is 39deg -> 184deg (145deg),
 * so slot 6 is green (~112deg) and slot 7 is a deeper lime (~70deg).
 *
 * These ship **measured but unemitted** — no CSS custom properties exist for
 * them until a real pillar claims one. The point is that a future pillar never
 * means inventing a hue under deadline. To claim one: move the object into
 * `programmeColors` under its new id, then extend globals.css.
 */
export const reservedPillarAccents: readonly PillarAccent[] = [
  {
    textLight: '#1B6B3A',
    textDark: '#6FCF8F',
    graphicLight: '#2E8B57',
    graphicDark: '#5CBE80',
    softLight: '#E3F3E8',
    softDark: '#0F2A1B',
  },
  {
    textLight: '#6B5A00',
    textDark: '#D6CD6B',
    graphicLight: '#8A7600',
    graphicDark: '#C4BA55',
    softLight: '#F4F0D9',
    softDark: '#26220C',
  },
] as const;

/**
 * Brand chrome. `teal` splits into a text tier and a graphic tier because one
 * vivid teal cannot serve both: `#00b3b8` reads correctly as a stroke but
 * measured only 2.58:1 as text, and it was used for eyebrows site-wide.
 */
export const brand = {
  indigoLight: '#1E2A78',
  indigoDeep: '#141D57',
  tealTextLight: '#0C7078',
  tealTextDark: '#4FD4DC',
  tealGraphicLight: '#12A0AC',
  tealGraphicDark: '#2FBAC4',
  /**
   * Gold is a FILL family, not a text family — it is the primary CTA's
   * background. `goldFillLight` pairs with `indigoDeep` as the CTA's
   * foreground; that pairing is asserted in the test, because measuring
   * tokens only against canvases cannot catch a broken token-against-token
   * pair.
   */
  goldFillLight: '#F4B942',
  goldFillDark: '#F5C95E',
  goldHoverLight: '#C58F1B',
  goldHoverDark: '#E8B94A',
  goldSoftLight: '#F8CD73',
  goldSoftDark: '#F8CD73',
  goldGraphicLight: '#B8860B',
  goldGraphicDark: '#E8B94A',
  slateLight: '#4A5468',
  slateDark: '#9AA3C0',
  inkLight: '#12172E',
  inkDark: '#E8ECFB',
} as const;

/** Neutral canvas layers. */
export const canvas = {
  DEFAULT: '#FFFFFF',
  soft: '#F6F9FC',
  deep: '#EAF3FB',
  sky: '#EAF6FF',
  DEFAULT_DARK: '#0B0F1E',
  softDark: '#10152A',
  deepDark: '#141B38',
  skyDark: '#151B36',
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
  successDark: '#4ADE80',
  warningDark: '#FBBF24',
  errorDark: '#F87171',
  infoDark: '#60A5FA',
  focusLight: '#1E2A78',
  focusDark: '#7C86C9',
} as const;
