'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion as motionTokens } from '@/design/motion';

/**
 * The single GSAP registration point (Landing-Redesign-Plan.md §3.2).
 *
 * **Nothing else in the codebase may call `gsap.registerPlugin`.** Registering
 * in more than one place is the usual source of double-registration warnings
 * and of ScrollTrigger instances surviving a hot reload.
 *
 * Client-only by construction: importing gsap at module scope in a server
 * component would evaluate it during SSR. Always import from a `'use client'`
 * boundary.
 *
 * Reduced motion is NOT handled here — each consumer must branch with
 * `gsap.matchMedia()` on `(prefers-reduced-motion: reduce)` and render the
 * final state, because once GSAP drives the animation, the CSS
 * `prefers-reduced-motion` block in globals.css can no longer make that
 * guarantee (spec §9).
 */

let registered = false;

/** Idempotent — safe to call from every consumer's `useGSAP` setup. */
export function registerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

/**
 * Named eases, standing in for the `motion.easing` curves (spec §10.2).
 *
 * These are **stand-ins, not identities**, and the gap is measured rather than
 * assumed — sampled across t ∈ [0, 1], the maximum divergence from the token
 * curve in `motion.easing` is:
 *
 * - `out`   `power3.out`   vs cubic-bezier(0.22, 1, 0.36, 1)    → 0.084
 * - `inOut` `power2.inOut` vs cubic-bezier(0.65, 0, 0.35, 1)    → 0.010
 * - `soft`  `power2.out`   vs cubic-bezier(0.16, 1, 0.3, 1)     → 0.266
 *
 * `out` and `soft` diverge visibly (`soft` badly so). GSAP's own closest
 * built-ins are `power4.out` (0.011) and `expo.out` (0.012) respectively, with
 * `power2.inOut` already the best fit for `inOut`. Reproducing a two-control-point
 * bezier exactly needs `CustomEase`, which spec §10.2 deliberately does not add;
 * the values below are the plan's choices and are left unchanged, so this note
 * is documentation of a real gap rather than a silent motion redesign. Do not
 * read `EASE.out` as "the token curve" when timing something against it.
 */
export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  soft: 'power2.out',
} as const;

/** The `(prefers-reduced-motion: reduce)` media query string, in one place. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Exposed for reference in docs/tests — the mapping is documented, not implied.
 *
 * Records which token curve each `EASE` key stands in for. It is **not** an
 * assertion of equality: see the divergence note on `EASE` above, which is the
 * half of this correspondence that a bare token string cannot carry.
 */
export const EASE_EQUIVALENCE = {
  out: motionTokens.easing.out,
  inOut: motionTokens.easing.inOut,
  soft: motionTokens.easing.soft,
} as const;

export { gsap, ScrollTrigger, useGSAP };
