import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Proof from './Proof';

const markup = renderToStaticMarkup(createElement(Proof));

describe('Act 3 — Proof', () => {
  it('fixes the audience count, and says three', () => {
    // §1.3: the shipped section claimed "4 Audiences served — Schools ·
    // Parents · Students · Partners" while navigation.ts defines exactly three
    // audienceEntries. `Partners` has no entry point; the redesign resolves it
    // to 3.
    expect(markup).toContain('Audiences served');
    expect(markup).toContain('Schools · Parents · Students');
    expect(markup).not.toContain('Partners');
    expect(markup).not.toContain('4 Audiences');
  });

  it('keeps the stat row unboxed', () => {
    const markup2 = markup;
    expect(markup2).not.toContain('card-surface');
    expect(markup2).toContain('Vertical programmes');
    expect(markup2).toContain('Connected ecosystem');
    expect(markup2).toContain('Journey stages');
  });

  it('puts the four chain stations on the axis, in order', () => {
    for (const station of ['Confidence', 'Engagement', 'Skill', 'Readiness']) {
      expect(markup, station).toContain(station);
    }
    expect(markup.indexOf('Confidence')).toBeLessThan(markup.indexOf('Readiness'));
  });

  it('renders the axis in the unit frame', () => {
    expect(markup).toContain('viewBox="0 0 1 1"');
  });

  it('leads with one quote and two marginalia, not three cards', () => {
    expect((markup.match(/<blockquote/g) ?? []).length).toBe(1);
    // The entities compile to the character itself, so the assertion is on
    // U+201C — three of them: the pull quote and both marginalia.
    expect((markup.match(/“/g) ?? []).length).toBe(3);
  });

  it('keeps the seed-content warning visible', () => {
    // §4's carried caveat: leaning harder on seed testimonials makes replacing
    // them more urgent, not less. The warning is not allowed to become a
    // comment that nobody sees.
    expect(markup).toContain('placeholder');
  });
});
