import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import FivePillars, { type Station } from './FivePillars';

const STATIONS: Station[] = [
  {
    pillarId: 'learn',
    pillarName: 'Learn',
    programmeName: 'Linguistics',
    tagline: 'Real fluency and confident communication across languages.',
    highlights: [
      { title: 'First highlight', detail: 'First detail.' },
      { title: 'Second highlight', detail: 'Second detail.' },
    ],
    href: '/programmes/linguistics',
  },
  {
    pillarId: 'include',
    pillarName: 'Include',
    programmeName: 'Inclusive Education',
    tagline: 'Adaptive, individualised support.',
    highlights: [
      { title: 'Third highlight', detail: 'Third detail.' },
      { title: 'Fourth highlight', detail: 'Fourth detail.' },
    ],
    href: '/programmes/inclusive-education',
  },
];

const render = (stations: Station[] = STATIONS, pillarCount = stations.length) =>
  renderToStaticMarkup(createElement(FivePillars, { stations, pillarCount }));

describe('Act 1 — the walk', () => {
  it('renders every station as real DOM, in order', () => {
    const markup = render();
    expect(markup.indexOf('Learn')).toBeLessThan(markup.indexOf('Include'));
    expect(markup).toContain('Linguistics');
    expect(markup).toContain('Inclusive Education');
  });

  it('carries no cards', () => {
    // §14's definition of done: no `card-surface` on the landing page, against
    // §1's inventory of **24, plus ~9 nested** — spread across the eight retired
    // sections, not carried by any one of them.
    expect(render()).not.toContain('card-surface');
  });

  it('gives each station exactly one link', () => {
    // §4 Act 1: the current link + `Enquire` pair is dropped — `Enquire` was
    // duplicated across three sections.
    const markup = render();
    expect((markup.match(/href="\/programmes\//g) ?? []).length).toBe(2);
    expect(markup).not.toContain('Enquire');
    expect(markup).toContain('Read the full programme');
  });

  it('renders the progress rail as real buttons with sr-only labels', () => {
    // §9: "Real <button>s that scroll to their station. Keyboard users walk the
    // pillars with Tab and ←/→." §4 states the reason, not a further quote:
    // "Not decorative dots."
    const markup = render();
    expect((markup.match(/<button/g) ?? []).length).toBe(2);
    // `type='button'` is deliberate and was unpinned: a bare <button> defaults
    // to submit, and this rail is one markup change away from living inside a
    // form. Measured — dropping the attribute left the suite green.
    expect((markup.match(/type="button"/g) ?? []).length).toBe(2);
    expect(markup).toContain('sr-only');
    for (const name of ['Learn', 'Include']) expect(markup).toContain(`Go to ${name}`);
  });

  it('uses the walk frame: one viewBox unit per viewport', () => {
    expect(render()).toContain('viewBox="0 0 2 1"');
  });

  it('segments the rail one per station, for the per-station draw', () => {
    const markup = render();
    expect((markup.match(/data-line-path/g) ?? []).length).toBe(2);
    expect(markup).toContain('M 0 0.5 L 1 0.5');
    expect(markup).toContain('M 1 0.5 L 2 0.5');
  });

  it('scales to six pillars with no code change', () => {
    const six = [...STATIONS, { ...STATIONS[0], pillarId: 'thrive' as const, pillarName: 'Thrive' }];
    expect(render(six)).toContain('viewBox="0 0 3 1"');
    expect((render(six).match(/<button/g) ?? []).length).toBe(3);
  });

  it('states the act on one screen at a time for mobile, stacked for tablet', () => {
    // The three branches are Tailwind variants over ONE structure — so the DOM
    // order is identical in every branch, which is what §9 requires under
    // reduced motion. Both the track width and the column direction are here.
    const markup = render();
    expect(markup).toContain('data-walk-track');
    expect(markup).toContain('data-walk-station');
  });
});
