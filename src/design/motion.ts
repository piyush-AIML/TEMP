/**
 * Educraft V2 — motion tokens (plan §26).
 * One source of truth for durations and easings; consumed by hooks,
 * components, and the CSS layer (--ease-* theme tokens in globals.css).
 */

export const motion = {
  /** seconds */
  duration: {
    instant: 0.1,
    fast: 0.16,
    standard: 0.24,
    emphasis: 0.4,
    reveal: 0.7,
    hero: 1.2,
  },
  easing: {
    /** Baseline for UI motion (plan §26). */
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    /** For scene transitions and larger state changes. */
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    /** Extra-soft settle for atmosphere layers. */
    soft: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export type MotionDurationKey = keyof typeof motion.duration;
export type MotionEasingKey = keyof typeof motion.easing;

/** Milliseconds for setTimeout/transition-duration usage. */
export function durationMs(key: MotionDurationKey): number {
  return Math.round(motion.duration[key] * 1000);
}
