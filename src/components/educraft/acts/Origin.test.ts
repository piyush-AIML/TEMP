import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EnquiryModalProvider } from '@/context/EnquiryModalContext';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import { forkPaths, seedAnchors } from '@/components/educraft/line/frames';
import { pathFor } from '@/components/educraft/line/pathBuilders';
import Origin, { type OriginProps } from './Origin';

const PROPS = {
  eyebrow: 'Global Digital Education Platform',
  h1Lines: ['Five paths.', 'One learning ecosystem.'],
  lede: 'From language and inclusion to wellbeing, AI literacy, and competitive exam preparation — Educraft connects the pieces that help students move forward.',
  trustLine: 'Five verticals · One trust umbrella · Built for schools, families, and students',
  primaryLabel: 'Talk to us',
  secondaryLabel: 'Explore programmes',
  secondaryHref: '/programmes',
  pillarCount: 5,
} as const;

// `EnquireButton` reads `useEnquiryModal` at render time and throws outside its
// provider, so the act is rendered the way the app mounts it: the provider is in
// `app/(site)/layout.tsx`, above every marketing page. The brief's harness
// omitted it and threw on all seven cases; the assertions below are unchanged.
// Typed by the component's own props, not by `typeof PROPS`: `PROPS` is
// `as const`, so its `pillarCount` is the literal `5`, and the sixth-pillar
// case below cannot be passed through a `Partial<typeof PROPS>`. Overrides are
// checked against the contract the component actually accepts.
const render = (overrides: Partial<OriginProps> = {}) =>
  renderToStaticMarkup(
    createElement(
      EnquiryModalProvider,
      null,
      createElement(Origin, { ...PROPS, ...overrides })
    )
  );

describe('Act 0 — Origin', () => {
  it('draws the fork at every width, and one strand on a phone', () => {
    // The branch tween sat below `if (!isDesktop || !copy.current) return`, so
    // on tablet and phone the reader saw five seed dots with no lines reaching
    // them — and §8's tablet row says "fork still happens". Below `sm` the five
    // branches give way to §8's "simplified vertical fall", which is what keeps
    // the arc's endpoint reachable on a 390px screen.
    const markup = render();
    expect(markup).toContain('data-origin-fork');
    expect(markup).toContain('data-origin-fall');
    expect(markup).toContain('d="M 0.5 0.85 L 0.5 1"'); // the fall
    expect(markup).toContain('sm:hidden');
  });

  it('renders the approved scroll cue', () => {
    // `_copy.md` approves an Act 0 `sr-only scroll cue · Scroll`, sourced to the
    // retired hero. Nothing rendered it.
    expect(render()).toContain('<span class="sr-only">Scroll</span>');
  });

  it('renders the hero copy verbatim', () => {
    const markup = render();
    for (const line of PROPS.h1Lines) expect(markup).toContain(line);
    expect(markup).toContain(PROPS.eyebrow);
    expect(markup).toContain(PROPS.lede);
    expect(markup).toContain(PROPS.trustLine);
  });

  it('relabels the CTAs so the same words stop doing two jobs', () => {
    // §4 Act 0: `Explore Programmes` opened the modal while `View all
    // programmes` navigated — the same words, two jobs. Primary opens the
    // modal; secondary navigates.
    const markup = render();
    expect(markup).toContain('Talk to us');
    expect(markup).toContain('Explore programmes');
    expect(markup).toContain('href="/programmes"');
    expect(markup).not.toContain('Explore Programmes');
    expect(markup).not.toContain('View all programmes');
  });

  it('draws the arc and one fork branch per pillar, in one stage', () => {
    const markup = render();
    const expected = [pathFor(ACT_ANCHORS.origin.enter, ACT_ANCHORS.origin.exit, 'arc'), ...forkPaths(5)];
    for (const d of expected) expect(markup).toContain(d);
    // The fork stage carries the arc and one branch per pillar; the phone's fall
    // is a second stage and a second path, and exactly one of the two displays.
    const fork = markup.slice(markup.indexOf('data-origin-fork'), markup.indexOf('data-origin-fall'));
    expect((fork.match(/data-line-path/g) ?? []).length).toBe(1 + 5);
    expect((markup.match(/data-line-path/g) ?? []).length).toBe(1 + 5 + 1);
  });

  it('uses the unit frame, so the act-local anchors need no arithmetic', () => {
    expect(render()).toContain('viewBox="0 0 1 1"');
  });

  it('places a seed node exactly where each branch lands', () => {
    // The join's promise, asserted in the markup: node x and branch end x are
    // the same number, because both come from seedAnchors.
    const markup = render();
    for (const seed of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(markup).toContain(`left:${seed * 100}%`);
    }
  });

  it('keeps the strand decorative', () => {
    const markup = render();
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('role="img"');
  });

  it('scales to a sixth pillar with no rewrite', () => {
    const markup = render({ pillarCount: 6 });
    // Six branches plus the arc in the fork stage, plus the phone's one fall.
    expect((markup.match(/data-line-path/g) ?? []).length).toBe(1 + 6 + 1);
    // The branches and the nodes come from the same array, so a sixth branch
    // that no node marks is the join half-applied. Measured on Task 5's
    // mutation pass: without this, `seedAnchors(5)` left in place kept the
    // suite green while the title above claimed the coverage.
    for (const seed of seedAnchors(6)) {
      expect(markup).toContain(`left:${seed.x * 100}%`);
    }
  });
});
