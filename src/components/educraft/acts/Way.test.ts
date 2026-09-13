import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Way from './Way';

const markup = renderToStaticMarkup(createElement(Way));

describe('Act 2 — The Way', () => {
  it('argues the why and the how as one act', () => {
    expect(markup).toContain('A different kind of education company.');
    expect(markup).toContain('Five steps, one method');
  });

  it('de-duplicates "Portfolios, dashboards" to a single statement', () => {
    // §4: it appeared 4 times across the landing page; the spec counted 4, the
    // tree holds 3 live strings, and exactly one survives here — inside
    // "Progress you can actually see".
    const hits = markup.match(/Portfolios, dashboards/g) ?? [];
    expect(hits.length).toBe(1);
  });

  it('cuts the five proofPillars', () => {
    // §4: People/Process/Evidence/Partnerships/Outcomes overlap the
    // differentiators almost entirely; Evidence and Partnerships fold into Act 3.
    for (const name of ['People', 'Process', 'Partnerships', 'Outcomes']) {
      expect(markup).not.toContain(`>${name}<`);
    }
  });

  it('renders all five differentiators and all five method steps, in order', () => {
    for (const title of [
      'One ecosystem, not five silos',
      'Specialists in every room',
      'Families are partners, not spectators',
      'Progress you can actually see',
      'Wellbeing woven in, not bolted on',
    ]) {
      expect(markup, title).toContain(title);
    }
    for (const step of ['Understand', 'Map', 'Learn', 'Measure', 'Grow']) {
      expect(markup, step).toContain(step);
    }
    expect(markup.indexOf('Understand')).toBeLessThan(markup.indexOf('Grow'));
  });

  it('numbers the nodes rather than using list markers', () => {
    expect(markup).toContain('01');
    expect(markup).toContain('05');
  });

  it('carries no cards', () => {
    expect(markup).not.toContain('card-surface');
  });

  it('draws one strand in the unit frame', () => {
    expect(markup).toContain('viewBox="0 0 1 1"');
    expect((markup.match(/data-line-path/g) ?? []).length).toBeGreaterThan(0);
  });

  it('links to the full method treatment', () => {
    expect(markup).toContain('Read the full methodology');
    expect(markup).toContain('href="/methodology"');
  });
});
