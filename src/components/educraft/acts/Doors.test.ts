import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EnquiryModalProvider } from '@/context/EnquiryModalContext';
import Doors from './Doors';

// `FinalCTA` reads `useEnquiryModal` at render time and throws outside its
// provider, which lives in `app/(site)/layout.tsx`, above every marketing page.
// The brief's harness omitted it — the same trap that killed Task 5's seven
// Origin cases — so the act is rendered the way the app mounts it. The
// assertions below are the brief's, unchanged.
const markup = renderToStaticMarkup(
  createElement(EnquiryModalProvider, null, createElement(Doors))
);

/** The href of the first anchor whose visible text contains `label`. */
function hrefFor(label: string): string | undefined {
  for (const anchor of markup.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (anchor[2].includes(label)) return anchor[1];
  }
  return undefined;
}

describe('Act 4 — the doors', () => {
  it('renders the fields the shipped component imported and never used', () => {
    // §4 Act 4, verified at Stage 2 planning: `headline` and `ctaLabel` exist on
    // every audienceEntry and the retired component rendered neither.
    expect(markup).toContain('A partner your school can build on.');
    expect(markup).toContain('Clear progress, real partnership.');
    expect(markup).toContain('A path that feels like yours.');
    expect(markup).toContain('Talk to the Education Team');
    expect(markup).toContain('Find the Right Programme');
    expect(markup).toContain('Explore Your Path');
  });

  it('trims each door to two benefits', () => {
    for (const cut of [
      'Safeguarding-first policies',
      'Flexible delivery',
      'Guidance resources',
      'Confidential wellbeing support',
      'Programmes built around real skills',
      'Small groups where your voice matters',
    ]) {
      expect(markup, cut).not.toContain(cut);
    }
    for (const kept of [
      'One partner across five specialist verticals',
      'Mentors who actually know your name',
    ]) {
      expect(markup, kept).toContain(kept);
    }
  });

  it('separates the doors with rules, not cards', () => {
    expect(markup).not.toContain('card-surface');
    expect(markup).toContain('divide-x');
  });

  it('ends the strand on the CTA node', () => {
    // doors.exit is { x: 0.75, y: 0.5 } — mid-band, because the strand stops
    // here rather than leaving the page.
    expect(markup).toContain('viewBox="0 0 1 1"');
  });

  it('keeps the closer copy verbatim', () => {
    expect(markup).toContain('The next step is a conversation.');
    expect(markup).toContain('Start a Conversation');
    expect(markup).toContain('Browse Programmes');
    expect(markup).toContain('No commitment — just a conversation about where a learner could go.');
  });

  // ---- Pins the brief's prose promises but its test did not write (R19) ----

  it('renders Act 4’s own header, verbatim', () => {
    // `_copy.md` Act 4 rows 1–3, all `[VERBATIM]` from `AudienceEntryPoints.tsx`.
    // The brief's Step 1 pinned the doors and the closer and left the frame's
    // own copy unasserted, so a blank or reworded eyebrow/heading/lede — the
    // three strings that tell the reader what this act *is* — passed.
    expect(markup).toContain('Who are you?');
    expect(markup).toContain('Every journey starts from somewhere different');
    expect(markup).toContain(
      'Three doors into the same ecosystem — pick the one that describes you, and the conversation starts on your terms.'
    );
  });

  it('keeps all six surviving benefits, not just the two named in the brief', () => {
    // The brief named one kept benefit per door in its `kept` loop and left the
    // other three unpinned; `_copy.md`'s cut table keeps six. Measured target:
    // dropping any single kept benefit left the suite green.
    for (const kept of [
      'Consistent reporting and progress visibility',
      'Regular, plain-language progress updates',
      'Visible learning plans and goals',
      'Portfolio projects that show what you can do',
    ]) {
      expect(markup, kept).toContain(kept);
    }
  });

  it('wires each door to its own ctaHref, not the audience landing page', () => {
    // §4: `ctaLabel` is "rendered for the first time", and it goes to
    // `ctaHref`. The retired component pointed every door at
    // `audiencePageHrefs[slug]` (`/for-schools` …) and used `a.label` as the
    // link text — the reading this replaces. Asserted per anchor: a mutant
    // swapping one door's href for its landing page is invisible to a
    // whole-file `toContain`.
    expect(hrefFor('Talk to the Education Team')).toBe('/contact');
    expect(hrefFor('Find the Right Programme')).toBe('/programmes');
    expect(hrefFor('Explore Your Path')).toBe('/programmes');
  });

  it('renders each headline as a heading, not as body copy', () => {
    for (const headline of [
      'A partner your school can build on.',
      'Clear progress, real partnership.',
      'A path that feels like yours.',
    ]) {
      expect(markup, headline).toMatch(
        new RegExp(`<h3[^>]*>${headline.replace('.', '\\.')}</h3>`)
      );
    }
  });

  it('draws the strand to the door act’s exit anchor', () => {
    // The brief's Step 3 states the geometry and its Step 1 never pinned it, so
    // the path, its frame and the node were free to move. doors.enter is the
    // act's top edge and doors.exit is the CTA node at mid-band.
    expect(markup).toContain('data-line-path');
    expect(markup).toContain('d="M 0.75 0 C 0.75 0 0.75 0.43 0.75 0.5"');
  });

  it('carries the strand’s terminal node into the closer', () => {
    // The brief's Step 3: `FinalCTA` "accepts the strand's terminal node as a
    // child … at the CTA button's edge". The node's *position* is not
    // expressible here; its presence and its spine x are.
    expect(markup).toContain('data-terminal-node');
    expect(markup).toContain('calc(50% + 25vw)');
  });
});
