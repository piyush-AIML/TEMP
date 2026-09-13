import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EnquiryModalProvider } from '@/context/EnquiryModalContext';
import { ACT_ORDER } from '@/components/educraft/line/anchors';
import { programmes } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import Home from './page';

// `Origin` and `Doors` both reach the enquiry modal, which throws outside its
// provider; the provider lives in `app/(site)/layout.tsx`, above every marketing
// page — so the page is rendered the way the app mounts it.
const markup = renderToStaticMarkup(
  createElement(EnquiryModalProvider, null, createElement(Home))
);

/**
 * `renderToStaticMarkup` escapes entities, and two programme names carry an
 * `&` — "Wellbeing & Counselling" and "AI & Digital Technologies" — so the
 * expectation has to be escaped the same way the data is.
 */
const asMarkup = (text: string) => text.replace(/&/g, '&amp;');

/**
 * The only check in the repo that can see the composition.
 *
 * Measured before this file existed: deleting `<Way />` from the page left the
 * suite at 334 passed, and removing `<EnquiryModalProvider>` from the layout
 * left it there too. No test imported either file, so every act could be
 * dropped, reordered, or wired to the wrong data with the whole gate green —
 * `tsc && lint && test && build` included.
 */
describe('the homepage composes five acts', () => {
  it('renders every act, in scroll order', () => {
    const positions = ACT_ORDER.map((act) => markup.indexOf(`<section id="${act}"`));
    for (const [index, at] of positions.entries()) {
      expect(at, `Act ${ACT_ORDER[index]} is missing from the page`).toBeGreaterThan(-1);
    }
    expect(positions, 'the acts are out of scroll order').toEqual(
      [...positions].sort((a, b) => a - b)
    );
  });

  it('wires every station to its own programme', () => {
    // Read from the data rather than written out, so this cannot rot when a
    // programme is renamed. `Station` carries five unbranded strings, so
    // `programmeName: pillar.name` typechecks *and* renders — measured green
    // before this test, with the walk labelling every station by its pillar.
    for (const programme of programmes) {
      const pillar = pillars.find((candidate) => candidate.id === programme.pillarId);
      expect(pillar, programme.slug).toBeDefined();
      expect(markup, `${programme.slug} is missing its programme name`).toContain(
        asMarkup(programme.name)
      );
      expect(markup, `${programme.slug} is missing its tagline`).toContain(asMarkup(programme.tagline));
      // Guards the assertion above: if the two names were equal, swapping them
      // would render identical text and this test could not tell.
      expect(programme.name, `${programme.slug} shares its pillar's name`).not.toBe(pillar?.name);
    }
    expect(markup).toContain(`/programmes/${programmes[0].slug}`);
  });

  it('renders the five acts’ own section copy', () => {
    // One string per act, so a page that renders five sections of nothing fails
    // here rather than looking correct to the order check above.
    for (const [index, line] of [
      'Five paths.',
      'The student journey',
      'A different kind of education company.',
      'How we build evidence',
      'Every journey starts from somewhere different',
    ].entries()) {
      expect(markup, `Act ${index}'s copy is missing`).toContain(line);
    }
  });
});
