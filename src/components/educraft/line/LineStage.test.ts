import { describe, it, expect } from 'vitest';
import { createElement, type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LineStage } from './LineStage';

/**
 * The `LineStage` **markup contract**.
 *
 * This is a `.test.ts`, not a `.test.tsx`, and there is no jsdom or
 * `@testing-library` here — deliberately. `vitest.config.mts` collects only
 * `src/**\/*.test.ts`, so a `.tsx` test would be silently dropped and report
 * nothing (probe-confirmed on this tree: the same failing bytes run as
 * `7 files / 115 tests, all green` under `.tsx` and `8 files / 116 tests,
 * 1 failure` under `.ts`). `renderToStaticMarkup` + `createElement` needs no
 * DOM, so the contract is testable inside the suite that actually runs.
 *
 * What this file does NOT cover: anything the effect does. `renderToStaticMarkup`
 * runs no effects, so the GSAP wiring, the scroll triggers and the reduced-motion
 * branch are all outside it. Those are covered by mutation-verified behaviour
 * only insofar as `gsap.test.ts` reaches the eases; the animation itself remains
 * owner-QA territory.
 */

type Props = ComponentProps<typeof LineStage>;

function render(props: Props): string {
  return renderToStaticMarkup(createElement(LineStage, props));
}

function rootClass(markup: string): string {
  return /<div class="([^"]*)"/.exec(markup)?.[1] ?? '';
}

function pathTags(markup: string): string[] {
  return markup.match(/<path [^>]*>/g) ?? [];
}

describe('LineStage markup', () => {
  it('renders one data-line-path per input path', () => {
    const one = render({ paths: ['M 0 0 L 1 1'] });
    const three = render({ paths: ['M 0 0 L 1 1', 'M 1 1 L 2 2', 'M 2 2 L 3 3'] });

    expect(pathTags(one)).toHaveLength(1);
    expect(pathTags(three)).toHaveLength(3);
    // The attribute the effect queries for. React renders it as ="true", which
    // still matches the `[data-line-path]` selector — but only if it is present.
    expect(one).toContain('data-line-path=');
  });

  it('renders no path at all for an empty strand list', () => {
    const markup = render({ paths: [] });
    expect(pathTags(markup)).toHaveLength(0);
    // The SVG shell still renders, so the act's layout box is unaffected.
    expect(markup).toContain('<svg');
  });

  it('carries pathLength="1" so the dash maths is length-independent', () => {
    const markup = render({ paths: ['M 0 0 L 1 1'] });
    expect(markup).toContain('pathLength="1"');
  });

  it('ships the strand undrawn, with unitless dash values', () => {
    const markup = render({ paths: ['M 0 0 L 1 1'] });
    // Unitless is load-bearing: a `px` suffix here would change the dash maths
    // the whole draw depends on. (React leaves these two alone explicitly.)
    expect(markup).toContain('style="stroke-dasharray:1;stroke-dashoffset:1"');
  });

  it('is hidden from assistive tech and from the tab order', () => {
    const markup = render({ paths: ['M 0 0 L 1 1'] });
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('focusable="false"');
    // The strand is decorative by contract (spec §9): no role, no label, no title
    // that assistive tech could reach.
    expect(markup).not.toContain('role=');
  });

  it('labels the SVG via <title>, defaulting when no label is given', () => {
    expect(render({ paths: ['M 0 0 L 1 1'] })).toContain('<title>Connective strand</title>');
    expect(render({ paths: ['M 0 0 L 1 1'], label: 'Act one' })).toContain('<title>Act one</title>');
  });

  it('defaults the viewBox to 1200x800 and accepts an override', () => {
    expect(render({ paths: ['M 0 0 L 1 1'] })).toContain('viewBox="0 0 1200 800"');
    expect(render({ paths: ['M 0 0 L 1 1'], viewBoxWidth: 1, viewBoxHeight: 1 })).toContain('viewBox="0 0 1 1"');
  });

  it('merges className into the root rather than replacing the base classes', () => {
    expect(rootClass(render({ paths: ['M 0 0 L 1 1'] }))).toBe('relative w-full');
    const withClass = rootClass(render({ paths: ['M 0 0 L 1 1'], className: 'mt-8' }));
    expect(withClass).toContain('relative');
    expect(withClass).toContain('w-full');
    expect(withClass).toContain('mt-8');
  });

  it('contributes no overflow-hidden to the root', () => {
    // The repo's most expensive rule: an `overflow-hidden` ancestor becomes a
    // sticky/pinned element's scroll box and silently breaks the pin. This
    // component must not be the one that introduces it. (A caller still can,
    // via `className` — that is Stage 2's problem, and it is recorded there.)
    expect(rootClass(render({ paths: ['M 0 0 L 1 1'] }))).not.toContain('overflow-hidden');
    expect(rootClass(render({ paths: ['M 0 0 L 1 1'], pin: true }))).not.toContain('overflow-hidden');
  });

  it('renders children after the SVG, so content can sit over the strand', () => {
    const markup = render({
      paths: ['M 0 0 L 1 1'],
      children: createElement('span', { className: 'act-copy' }, 'Five pillars'),
    });
    expect(markup).toContain('<span class="act-copy">Five pillars</span>');
    expect(markup.indexOf('<span')).toBeGreaterThan(markup.indexOf('</svg>'));
  });
});
