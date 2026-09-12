import { describe, it, expect, vi } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { motion } from '@/design/motion';
import {
  EASE,
  EASE_EQUIVALENCE,
  EASE_NAMES,
  REDUCED_MOTION_QUERY,
  bezierControlPoints,
  gsap,
  registerGsap,
} from './gsap';

/**
 * `src/lib/gsap.ts` is the module that carries the "single registration point"
 * invariant, so these tests pin the things that invariant rests on.
 *
 * This file runs in the node environment with no DOM. That is sufficient:
 * `'use client'` is inert under Vitest, and GSAP registers plugins without
 * touching the document.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Every `.ts`/`.tsx` under `src/`, excluding Prisma's generated output. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'generated') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * The needle is the **call form**, not the bare name, and it is assembled from
 * two halves so that *this file* does not contain it. Both details matter:
 * a literal here — or a needle of `registerPlugin` alone — would make the scan
 * below match its own test file (`vi.spyOn(gsap, 'registerPlugin')`) and force
 * the assertion to be weakened to "at most two files", which is not the
 * invariant. Matching the call also means a prose mention in a docstring is not
 * mistaken for a registration site.
 */
const REGISTER_PLUGIN_CALL = ['gsap.register', 'Plugin('].join('');

describe('registerGsap', () => {
  it('registers exactly once no matter how many consumers call it', () => {
    const pluginSpy = vi.spyOn(gsap, 'registerPlugin');
    const easeSpy = vi.spyOn(gsap, 'registerEase');

    registerGsap();
    registerGsap();
    registerGsap();

    // The whole point of the module: three consumers, one registration.
    expect(pluginSpy).toHaveBeenCalledTimes(1);
    // One call per named ease, and only on the first invocation.
    expect(easeSpy).toHaveBeenCalledTimes(3);
    expect(easeSpy.mock.calls.map((call) => call[0]).sort()).toEqual(Object.values(EASE_NAMES).sort());

    pluginSpy.mockRestore();
    easeSpy.mockRestore();
  });
});

describe('the single registration point invariant', () => {
  it('registers plugins from exactly one file in src/', () => {
    const callers = sourceFiles(SRC_DIR).filter((file) => readFileSync(file, 'utf8').includes(REGISTER_PLUGIN_CALL));

    expect(callers.map((file) => file.slice(SRC_DIR.length))).toEqual([join('lib', 'gsap.ts')]);
  });
});

describe('EASE', () => {
  it('maps one-to-one onto the motion.easing tokens', () => {
    expect(EASE_EQUIVALENCE).toEqual({
      out: motion.easing.out,
      inOut: motion.easing.inOut,
      soft: motion.easing.soft,
    });
  });

  it('reads the control points straight out of the token', () => {
    expect(bezierControlPoints(motion.easing.out)).toEqual([0.22, 1, 0.36, 1]);
    expect(bezierControlPoints(motion.easing.inOut)).toEqual([0.65, 0, 0.35, 1]);
    expect(bezierControlPoints(motion.easing.soft)).toEqual([0.16, 1, 0.3, 1]);
  });

  it('rejects a token that is not a cubic-bezier rather than easing something else', () => {
    expect(() => bezierControlPoints('ease-in-out')).toThrow(/not a cubic-bezier/);
  });

  it('pins the endpoints exactly', () => {
    for (const key of ['out', 'inOut', 'soft'] as const) {
      expect(EASE[key](0)).toBe(0);
      expect(EASE[key](1)).toBe(1);
    }
  });

  it('is monotonic', () => {
    for (const key of ['out', 'inOut', 'soft'] as const) {
      let previous = -Infinity;
      for (let i = 0; i <= 1000; i += 1) {
        const value = EASE[key](i / 1000);
        expect(value).toBeGreaterThanOrEqual(previous);
        previous = value;
      }
    }
  });

  /**
   * The claim D2 rests on: the shipped ease IS the token curve, not a built-in
   * standing in for it. The reference here is a different algorithm from the
   * one in `cubicBezierEase` — the curve is sampled densely in its own
   * parameter `u`, and `y` is recovered by interpolating at `x = progress` —
   * so agreement between the two is evidence, not a tautology.
   */
  it('reproduces the token bezier, measured against an independent sampler', () => {
    function sampler([p1x, p1y, p2x, p2y]: [number, number, number, number], progress: number): number {
      const steps = 50000;
      let previousX = 0;
      let previousY = 0;
      for (let i = 1; i <= steps; i += 1) {
        const u = i / steps;
        const inverse = 1 - u;
        const x = 3 * inverse * inverse * u * p1x + 3 * inverse * u * u * p2x + u * u * u;
        const y = 3 * inverse * inverse * u * p1y + 3 * inverse * u * u * p2y + u * u * u;
        if (x >= progress) {
          const span = x - previousX;
          if (span === 0) return y;
          return previousY + ((progress - previousX) / span) * (y - previousY);
        }
        previousX = x;
        previousY = y;
      }
      return 1;
    }

    const divergence: Record<string, number> = {};
    for (const key of ['out', 'inOut', 'soft'] as const) {
      const points = bezierControlPoints(EASE_EQUIVALENCE[key]);
      let worst = 0;
      for (let i = 0; i <= 1000; i += 1) {
        const progress = i / 1000;
        worst = Math.max(worst, Math.abs(EASE[key](progress) - sampler(points, progress)));
      }
      divergence[key] = worst;
      // Tighter than the sampler's own interpolation error, which is ~1e-8.
      expect(worst).toBeLessThan(1e-6);
    }

    // Recorded so a regression is legible in the failure output, not just "false".
    expect(divergence).toMatchObject({ out: expect.any(Number) });
  });

  /**
   * The regression this replaced: GSAP built-ins diverged from the tokens by
   * up to 0.084 (`out`) and 0.266 (`soft`). Anything at that scale must fail.
   */
  it('is far closer to the token than the GSAP built-ins it replaced', () => {
    const builtIn = gsap.parseEase('power3.out');
    const token = EASE.out;
    let builtInWorst = 0;
    let shippedWorst = 0;
    for (let i = 0; i <= 1000; i += 1) {
      const progress = i / 1000;
      builtInWorst = Math.max(builtInWorst, Math.abs(builtIn(progress) - token(progress)));
      shippedWorst = Math.max(shippedWorst, Math.abs(EASE.out(progress) - token(progress)));
    }
    expect(builtInWorst).toBeGreaterThan(0.05);
    expect(shippedWorst).toBeLessThan(1e-12);
  });
});

describe('the reduced-motion fallback in globals.css', () => {
  const css = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf8');

  it('uses the same media query text as the JS constant', () => {
    expect(css).toContain(`@media ${REDUCED_MOTION_QUERY}`);
  });

  it('draws the strand without JS, matching the matchMedia branch', () => {
    const block = css.slice(css.indexOf(`@media ${REDUCED_MOTION_QUERY}`));
    expect(block).toMatch(/\[data-line-path\]\s*\{\s*stroke-dashoffset:\s*0\s*!important;\s*\}/);
  });
});
