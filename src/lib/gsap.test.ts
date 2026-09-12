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

/**
 * Read once. `globals.css` is the second source of truth for two separate sets
 * of constants asserted below — the reduced-motion query and the easing
 * curves — so both describes read this same text.
 */
const GLOBALS_CSS = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf8');

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
   * D2's headline claim, made enforceable.
   *
   * The previous revision of this test compared `EASE.out` against `EASE.out`
   * — the reference WAS the value under test, so the difference was identically
   * zero and `toBeLessThan(1e-12)` could not fail for any implementation,
   * including `x => 12345 * x`. It is replaced by a genuinely independent
   * reference: Newton-Raphson on the same cubic, a different algorithm from the
   * shipped bisection, converging to ~1e-16.
   *
   * The tolerance below is 1e-10, not 1e-12: the measured divergence is
   * ~2.7e-12 (it is the 40-halving bracket's own width, 2^-41 × |dy/du|), so
   * 1e-10 leaves ~37× headroom while still failing anything materially worse.
   * The sampler test above cross-checks the same claim with a structurally
   * different reference.
   *
   * Both sides of the comparison use that independent reference. The built-in
   * really was far off — this asserts the regression, it does not assume it.
   */
  it('solves the token curve to float precision, far closer than the built-in it replaced', () => {
    function newtonReference(cp: [number, number, number, number], progress: number): number {
      const [p1x, p1y, p2x, p2y] = cp;
      let u = progress;
      for (let i = 0; i < 60; i += 1) {
        const inverse = 1 - u;
        const x = 3 * inverse * inverse * u * p1x + 3 * inverse * u * u * p2x + u * u * u;
        const dx = 3 * p1x * inverse * (1 - 3 * u) + 3 * p2x * u * (2 - 3 * u) + 3 * u * u;
        if (dx === 0 || !Number.isFinite(dx)) break;
        const step = (x - progress) / dx;
        u -= step;
        if (Math.abs(step) < 1e-16) break;
      }
      const inverse = 1 - u;
      return 3 * inverse * inverse * u * p1y + 3 * inverse * u * u * p2y + u * u * u;
    }

    const points = bezierControlPoints(EASE_EQUIVALENCE.out);
    const builtIn = gsap.parseEase('power3.out');
    let shippedWorst = 0;
    let builtInWorst = 0;
    for (let i = 0; i <= 1000; i += 1) {
      const progress = i / 1000;
      const reference = newtonReference(points, progress);
      shippedWorst = Math.max(shippedWorst, Math.abs(EASE.out(progress) - reference));
      builtInWorst = Math.max(builtInWorst, Math.abs(builtIn(progress) - reference));
    }

    // Round 1 shipped power3.out, measured at 0.0838 from this same curve.
    expect(builtInWorst).toBeGreaterThan(0.05);
    expect(shippedWorst).toBeLessThan(1e-10);
  });
});

describe('the reduced-motion fallback in globals.css', () => {
  /**
   * The span of the block opened at or after `from`, by brace matching. Needed
   * because "the rule appears somewhere after the media query starts" is not
   * containment: a rule hoisted *out* of the block to the end of the file
   * satisfies it while shipping an unconditional `stroke-dashoffset: 0
   * !important` that would beat GSAP's inline writes and freeze every strand.
   */
  function blockSpan(source: string, from: number): { open: number; close: number } {
    const open = source.indexOf('{', from);
    let depth = 0;
    for (let i = open; i < source.length; i += 1) {
      if (source[i] === '{') depth += 1;
      else if (source[i] === '}') {
        depth -= 1;
        if (depth === 0) return { open, close: i };
      }
    }
    return { open, close: -1 };
  }

  const RULE = /\[data-line-path\]\s*\{\s*stroke-dashoffset:\s*0\s*!important;\s*\}/;

  it('uses the same media query text as the JS constant', () => {
    expect(GLOBALS_CSS).toContain(`@media ${REDUCED_MOTION_QUERY}`);
  });

  it('draws the strand without JS, from inside the reduced-motion block', () => {
    const media = GLOBALS_CSS.indexOf(`@media ${REDUCED_MOTION_QUERY}`);
    expect(media).toBeGreaterThan(-1);

    const { open, close } = blockSpan(GLOBALS_CSS, media);
    expect(close).toBeGreaterThan(open);

    const rule = RULE.exec(GLOBALS_CSS);
    expect(rule).not.toBeNull();
    // Containment, not merely ordering: the rule must sit inside the braces.
    expect(rule!.index).toBeGreaterThan(open);
    expect(rule!.index).toBeLessThan(close);
  });

  it('neutralises the walk track under reduced motion', () => {
    // §9: no pin, no scrub, no horizontal track — the same page, same words, in
    // the order a screen reader already needs. The CSS is the only place this
    // can be guaranteed, since GSAP may have written a transform by then.
    //
    // Sliced from the block's braces rather than searched for in the whole file,
    // for the reason above: a rule hoisted out of the media query would satisfy
    // `toContain` while shipping an unconditional `transform: none`.
    const media = GLOBALS_CSS.indexOf(`@media ${REDUCED_MOTION_QUERY}`);
    expect(media).toBeGreaterThan(-1);
    const { open, close } = blockSpan(GLOBALS_CSS, media);
    const block = GLOBALS_CSS.slice(open, close);
    expect(block).toContain('[data-walk-track]');
    expect(block).toContain('transform: none !important');
    expect(block).toContain('[data-walk-station]');
  });
});

/**
 * The other constant `globals.css` mirrors.
 *
 * `design/motion.ts` is the single source for the three easing curves, and the
 * CSS layer re-declares the same three literals as `--ease-*` theme tokens for
 * every transition in the stylesheet: two hand-maintained copies of one value.
 *
 * The suite does pin `motion.easing` to its literals ("reads the control points
 * straight out of the token", above) — but that assertion is about the token
 * alone. An editor who changes `motion.easing.out` is told by that test to
 * update the literal, and doing so leaves the CSS on the old curve while the
 * GSAP draw moves to the new one. Editing *either* file alone was invisible
 * from the CSS side; these two tests are the mirror that closes it.
 */
describe('the easing tokens in globals.css', () => {
  /** `motion.easing` key -> the custom property that must carry the same curve. */
  const EASING_MIRROR = {
    out: '--ease-out-soft',
    inOut: '--ease-inout-soft',
    soft: '--ease-soft',
  } as const;

  /**
   * Every `--ease-*` declaration in the whole file with its value — not just
   * the ones in the `@theme` block. A redefinition in `:root` or `.dark` would
   * shadow the theme token at runtime, and a sweep scoped to `@theme` would
   * report the file as agreeing while the browser painted the override.
   */
  function declaredEasings(): { name: string; value: string }[] {
    const withoutComments = GLOBALS_CSS.replace(/\/\*[\s\S]*?\*\//g, '');
    const out: { name: string; value: string }[] = [];
    const declaration = /(--ease-[a-z0-9-]+)\s*:\s*([^;]+);/g;
    let match: RegExpExecArray | null;
    while ((match = declaration.exec(withoutComments)) !== null) {
      out.push({ name: match[1], value: match[2].trim() });
    }
    return out;
  }

  it('declares exactly the three tokens motion.easing carries', () => {
    // Both directions, and duplicates count: a fourth `--ease-*` with no token
    // behind it, or a token with no custom property, is a red here.
    expect(declaredEasings().map((entry) => entry.name).sort()).toEqual(Object.values(EASING_MIRROR).sort());
  });

  it('carries the token curve, compared as bezier control points', () => {
    for (const key of ['out', 'inOut', 'soft'] as const) {
      const cssVar = EASING_MIRROR[key];
      const declared = declaredEasings().filter((entry) => entry.name === cssVar);
      expect(declared, `${cssVar} is not declared in globals.css`).toHaveLength(1);

      // Parsed rather than string-compared, so whitespace or formatting cannot
      // make two different curves look equal; and it throws — loudly — if the
      // CSS value stops being a cubic-bezier at all, which a string compare
      // would have reported as a plain mismatch.
      expect(bezierControlPoints(declared[0].value), `${cssVar} vs motion.easing.${key}`).toEqual(
        bezierControlPoints(motion.easing[key])
      );
    }
  });
});
