import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import Way from './Way';

const markup = renderToStaticMarkup(createElement(Way));

describe('Act 2 — The Way', () => {
  it('argues the why and the how as one act', () => {
    expect(markup).toContain('A different kind of education company.');
    expect(markup).toContain('Five steps, one method');
  });

  it('positions the strand against the act, not an inner box', () => {
    // The seam contract is act-local: `y = 0` must be the act's own top edge and
    // `y = 1` its bottom, or the line stops short at every boundary. Measured:
    // the strand's containing block was `div.mx-auto.max-w-5xl.px-6.pb-24`, so
    // it began ~300px into the act and ended 96px above its bottom — a ~400px
    // hole in the line the redesign is named after. Structural, not a class
    // string: the strand's wrapper is the section's first child.
    expect(markup).toMatch(/<section id="way"[^>]*><div class="[^"]*pointer-events-none absolute inset-0/);
  });

  it('measures the rows against the act, not a narrower box', () => {
    // The node x and the copy gutter are both read from this row's own width, so
    // the row must span the act: 75% of an inner 976px box put every node 104px
    // off the line at 1440, while `Way.tsx`'s comment claimed they landed on it.
    expect(markup).not.toContain('max-w-5xl');
    expect(markup).toContain('padding-right:calc(25% + 2.75rem)');
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

  it('places every node on the strand, not near it', () => {
    // The act's own join: the strand and the nodes read the same anchor, so a
    // node's `left` and the line's x are one number. Measured — moving the spine
    // off the anchor (SPINE_X = 0.5, nodes at 50% while the line stays at 75%)
    // left the suite green. Ten nodes: five differentiators, five steps.
    const spine = ACT_ANCHORS.way.enter.x;
    expect((markup.match(new RegExp(`left:${spine * 100}%`, 'g')) ?? []).length).toBe(10);
  });

  it('renders the differentiator copy verbatim', () => {
    // §4 moves all five **unedited** out of the file Task 11 deletes, and the
    // plan's reason for the temporary duplication is that these tests pin them —
    // which only holds if the descriptions are pinned too. Measured: truncating
    // one left the suite green while the title test above still passed.
    const copy = [
      [
        'One ecosystem, not five silos',
        'Programmes are designed to work together. A student building language confidence can also access wellbeing support; an exam aspirant can pause for counselling without leaving the system. Learners move between paths without starting over.',
      ],
      [
        'Specialists in every room',
        'Each vertical is led by people trained for it — language specialists, certified special educators, licensed counsellors, technologists, and exam mentors. Nobody is improvising outside their field.',
      ],
      [
        'Families are partners, not spectators',
        'Goals are agreed with families, not announced to them. Structured check-ins, plain-language reports, and home strategies keep parents genuinely part of the journey.',
      ],
      [
        'Progress you can actually see',
        'Portfolios, dashboards, and benchmarked checkpoints replace vague reassurance. Every programme answers the same question with evidence: what can the student do now that they could not do before?',
      ],
      [
        'Wellbeing woven in, not bolted on',
        'Steadiness is designed into every programme — realistic targets, study-rest cycles, and access to counselling. We treat sustainable learning as a performance advantage, not a soft option.',
      ],
    ];
    for (const [title, description] of copy) {
      expect(markup, title).toContain(description);
    }
  });

  it('renders the section and method copy verbatim', () => {
    expect(markup).toContain('Why Educraft');
    expect(markup).toContain(
      'Most education offerings are collections of courses. Educraft is a connected system — five specialist verticals sharing one philosophy, one standard of evidence, and one view of the learner.'
    );
    expect(markup).toContain('How it works');
    expect(markup).toContain(
      'Every programme — whatever the vertical — runs on the same five-step method. It is why the ecosystem stays coherent as it grows.'
    );
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
