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

  it('positions the strand against the act, and the axis in the act’s frame', () => {
    // Measured before this: the strand's box was a `lg:h-[24rem]` container
    // sitting in the middle of the act, so its `y = 0` was not the act's top
    // edge and `proof.exit` rendered ~800px above the act's bottom — the seam
    // the contract checks was not on any edge on screen.
    expect(markup).toMatch(
      /<section id="proof"[^>]*><div class="[^"]*pointer-events-none absolute inset-0 lg:hidden/
    );
    // The stations read the same fractions the strand does — which is only true
    // while nothing between the section and the `li` is positioned. Measured:
    // with a `relative` spacer there, `lg:h-[34rem]` → `lg:h-[30rem]` slid every
    // station 4rem up the act, away from its tick, with 355 tests green.
    expect(markup).not.toMatch(/<div class="relative lg:h-/);
    expect(markup).toContain('left:15%');
    // The station's top edge *is* the tick's end: the two numbers are one fact
    // in two places, so pinning both is what stops them drifting apart.
    expect(markup).toContain('top:44%');
    expect(markup).toContain('M 0.15 0.4 L 0.15 0.44');
  });

  it('carries the seam with a plain spine below lg', () => {
    // §8: below lg the thread runs parallel to the scroll, and four labels
    // cannot sit on a scale on a phone. Both strands start at `proof.enter` and
    // end at `proof.exit`, so the handoff is the same two anchors at any width.
    expect(markup).toContain('d="M 0.75 0 C 0.75 0 0.75 0.85 0.75 1"');
    expect(markup).toContain('hidden lg:block');
  });

  it('keeps the four stations in order, each on its own tick', () => {
    // Measured before this: the check compared first against last, so swapping
    // two interior stations — titles, bodies and tick positions together — left
    // the file green. The evidence chain could run in the wrong order with the
    // axis unchanged.
    const titles = [...markup.matchAll(/<h4[^>]*>([^<]+)<\/h4>/g)].map((m) => m[1]);
    expect(titles).toEqual(['Confidence', 'Engagement', 'Skill', 'Readiness']);
    for (const x of ['15%', '38%', '62%', '85%']) {
      expect(markup, `no station at ${x}`).toContain(`left:${x}`);
    }
  });

  it('renders Act 3’s copy verbatim', () => {
    // Measured: truncating a station body, and replacing the eyebrow and the
    // heading together, each left all 8 cases green. Act 3's copy — the act
    // header, the axis label, the four bodies, the seed warning — was pinned by
    // nothing, which is the "pins titles but not bodies" class restated.
    // Escaped the way React writes them: `&` and `"` are entities in the output.
    for (const line of [
      'Outcomes &amp; evidence',
      'What &quot;better learning&quot; looks like here',
      'We do not claim transformation with adjectives.',
      'How we build evidence',
      'Students who can see their own progress',
      'These are placeholder quotes pending consented testimonials.',
    ]) {
      expect(markup, line).toContain(line);
    }
  });

  it('pins the axis geometry, ticks included', () => {
    // The plan's own words: these are internal geometry the seam contract does
    // not cover, "and pinning them in the test is what makes a change visible".
    // Measured — dropping the ticks, moving them along the axis, and moving the
    // axis itself down the act all left the suite green.
    expect(markup).toContain('M 0.15 0.4 L 0.85 0.4'); // the run between the arcs
    for (const x of [0.15, 0.38, 0.62, 0.85]) {
      expect(markup, `tick at ${x}`).toContain(`M ${x} 0.4 L ${x} 0.44`);
    }
  });

  it('leads with the first testimonial, not whichever comes last', () => {
    // `_copy.md`: the pull quote is `testimonials[0]` and the marginalia are
    // [1] and [2]. Measured — reversing the list left the suite green, because
    // every quote still appears somewhere. Read from inside the blockquote,
    // which is what makes the *position* the assertion.
    const blockquote = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/.exec(markup)?.[1] ?? '';
    expect(blockquote).toContain('For the first time, we could actually see');
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
