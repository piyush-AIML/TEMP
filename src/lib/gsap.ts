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
 * and of ScrollTrigger instances surviving a hot reload. That invariant is a
 * convention plus the source-scanning assertion in `gsap.test.ts` — it is NOT
 * a lint rule, so the test is the only thing enforcing it.
 *
 * Client-only by construction: importing gsap at module scope in a server
 * component would evaluate it during SSR. Always import from a `'use client'`
 * boundary.
 *
 * Reduced motion is NOT handled here — each consumer must branch with
 * `gsap.matchMedia()` on `(prefers-reduced-motion: reduce)` and render the
 * final state, because once GSAP drives the animation, the CSS
 * `prefers-reduced-motion` block in globals.css can no longer make that
 * guarantee (spec §9). The one exception is the strand's *initial* state, which
 * globals.css pins for reduced motion so the markup is not invisible without
 * JS — see the `[data-line-path]` rule in the reduced-motion block.
 */

/**
 * A CSS `cubic-bezier(a, b, c, d)` easing, as a plain function of progress.
 *
 * CSS defines the curve parametrically — `x(u)` and `y(u)` are both cubics in
 * `u` — and the easing is `y(x⁻¹(t))`. `x(u)` is monotonic for control points
 * in the usual range, so `u` is recovered by bisection and the curve is then
 * evaluated at that `u`. 40 halvings of the unit interval put `u` within
 * ~9e-13, far below float64 significance for the result.
 *
 * This is what lets `design/motion.ts` be the single source for easing: the
 * tokens are `cubic-bezier(...)` strings, and this turns them into eases that
 * GSAP accepts directly, with no interpolation in between.
 */
export function cubicBezierEase(p1x: number, p1y: number, p2x: number, p2y: number) {
  return function ease(progress: number): number {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    let lo = 0;
    let hi = 1;
    let u = progress;
    for (let i = 0; i < 40; i += 1) {
      u = (lo + hi) / 2;
      const x = 3 * (1 - u) * (1 - u) * u * p1x + 3 * (1 - u) * u * u * p2x + u * u * u;
      if (x < progress) lo = u;
      else hi = u;
    }

    return 3 * (1 - u) * (1 - u) * u * p1y + 3 * (1 - u) * u * u * p2y + u * u * u;
  };
}

/**
 * Reads the four control points out of a `cubic-bezier(a, b, c, d)` token.
 *
 * Throws rather than substituting a default: a token this cannot parse means
 * `design/motion.ts` no longer holds a bezier, and silently easing something
 * else is the failure mode this whole module exists to remove. The throw is
 * reachable at module load, and `gsap.test.ts` evaluates every token in
 * `motion.easing` — so a bad edit fails the suite rather than the browser.
 */
export function bezierControlPoints(token: string): [number, number, number, number] {
  const match = /^cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)$/.exec(
    token.trim()
  );
  if (!match) {
    throw new Error(`design/motion.ts easing token is not a cubic-bezier: ${JSON.stringify(token)}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
}

/**
 * Named eases, solved from the `motion.easing` tokens (spec §10.2).
 *
 * These are the token curves, not approximations of them: the control points
 * come from `motion.ts` and `cubicBezierEase` evaluates the same parametric
 * cubic CSS does. Measured divergence from the token curve is float epsilon
 * (asserted in `gsap.test.ts`). An earlier revision shipped GSAP's built-in
 * `power3.out` / `power2.inOut` / `power2.out` instead; `power3` is a *quart*
 * (exponent 4) despite the name, and the ladder diverged from the tokens by up
 * to 0.084 (`out`) and 0.266 (`soft`) — visible differences, on the one
 * animation the design is built around.
 */
export const EASE = {
  out: cubicBezierEase(...bezierControlPoints(motionTokens.easing.out)),
  inOut: cubicBezierEase(...bezierControlPoints(motionTokens.easing.inOut)),
  soft: cubicBezierEase(...bezierControlPoints(motionTokens.easing.soft)),
} as const;

/**
 * Names the eases are registered under, so `ease: 'ec-out'` works as well as
 * `ease: EASE.out`. Prefixed to avoid colliding with GSAP's built-ins.
 */
export const EASE_NAMES = {
  out: 'ec-out',
  inOut: 'ec-in-out',
  soft: 'ec-soft',
} as const;

/** The `(prefers-reduced-motion: reduce)` media query string, in one place. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * The token each `EASE` key is solved from, exposed so a test can assert the
 * correspondence instead of trusting it: `gsap.test.ts` checks these against
 * `motion.easing` directly, and checks that each `EASE` function reproduces the
 * bezier those control points describe.
 */
export const EASE_EQUIVALENCE = {
  out: motionTokens.easing.out,
  inOut: motionTokens.easing.inOut,
  soft: motionTokens.easing.soft,
} as const;

let registered = false;

/** Idempotent — safe to call from every consumer's `useGSAP` setup. */
export function registerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.registerEase(EASE_NAMES.out, EASE.out);
  gsap.registerEase(EASE_NAMES.inOut, EASE.inOut);
  gsap.registerEase(EASE_NAMES.soft, EASE.soft);
  registered = true;
}

export { gsap, ScrollTrigger, useGSAP };
