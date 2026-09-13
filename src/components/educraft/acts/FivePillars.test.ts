import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ribbonFrame } from '@/components/educraft/line/frames';
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

// `stages` is required by the component (Task 7), so every render passes it —
// including the walk's own tests, which therefore render the ribbon too. `STAGES`
// is declared with the ribbon's suite below; the call is inside a test body, so
// it is initialised by then.
const render = (stations: Station[] = STATIONS, pillarCount = stations.length) =>
  renderToStaticMarkup(createElement(FivePillars, { stations, pillarCount, stages: STAGES }));

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
    // The walk's segments, matched by shape rather than by `data-line-path`
    // count: the ribbon renders a second `LineStage` in this component, so the
    // bare count is five now, and what this test is about is that the *walk's*
    // rail is one segment per station.
    expect((markup.match(/M \d+ 0\.5 L \d+ 0\.5/g) ?? []).length).toBe(2);
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
    // reduced motion.
    //
    // Measured: the class lists that *implement* those branches were pinned by
    // nothing. Replacing the snap container's list with `''`, and the track's
    // with `'relative flex'`, each left the file's 17 tests green — killing the
    // mobile swipe, the tablet stack and the track's width together. The
    // comment promised "both the track width and the column direction"; now the
    // assertions do.
    const markup = render();
    expect(markup).toContain('data-walk-track');
    expect(markup).toContain('data-walk-station');
    expect(markup).toContain('snap-x snap-mandatory');
    expect(markup).toContain('sm:flex-col');
    expect(markup).toContain('w-[var(--track-w)]');
  });

  it('puts the ribbon’s exit on the act’s bottom edge, at the act’s spine', () => {
    // Measured before this: the strip was 976px × 160px inside
    // `max-w-5xl px-6 py-24`, so its exit rendered at x ≈ 964px and 96px above
    // the act's bottom — while `way.enter` is at 0.75 × viewport on the next
    // section's top edge. A 116px sideways jog and a gap, at every desktop width.
    const ribbon = render().slice(render().indexOf('The student journey'));
    expect(ribbon).toContain('viewBox="0 0 8 1"');
    expect(ribbon).not.toContain('max-w-5xl');
  });

  it('gives every path exactly one writer', () => {
    // A source scan, because the effects are unreachable from the node test
    // environment (ADR 0007) and this is the strongest check available — the
    // same instrument Task 12 uses for the reduced-motion pairing.
    //
    // Measured before this fix: the walk's `onUpdate` scoped to the `<section>`
    // and wrote to all eleven paths; `drawAt(progress, i, 5)` is 0 for every
    // i ≥ 5, so each scroll tick forced the ribbon's seven paths to undrawn.
    const source = readFileSync('src/components/educraft/acts/FivePillars.tsx', 'utf8');
    expect(source).toContain("scope.querySelector('[data-walk-rail]')");
    expect(source).toContain('segments.length !== frame.railSegments.length');
    // The ribbon draws every path it renders, not only the last one. Read the
    // code, not the prose: the comment above explains the defect it replaced,
    // and a whole-file `toContain` would match that explanation.
    const code = source
      .split('\n')
      .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
      .join('\n');
    expect(code).toContain('paths.forEach((path, index)');
    expect(code).not.toContain('.at(-1)');
  });

  it('gives each station one viewport of the track, at every breakpoint', () => {
    // `sm:w-full` is emitted after `w-screen` in the built CSS (byte 65607 vs
    // 24451), so without an `lg` override each station was 100% of its flex
    // container — 500vw at five pillars — and stations 1–4 sat past the end of
    // the 500vw the tween travels. Measured on the built stylesheet.
    expect(render()).toContain('lg:w-screen');
  });

  it('keeps the rail inside the pinned viewport', () => {
    // Two rounds of getting this wrong, and the first check could not tell them
    // apart: in flow, the rail sat 32px below the fold for all 400vh of the
    // walk; given `lg:absolute` against the `<section>` — which is the walk
    // *plus* the ribbon — it sat ~400px below instead. The class string alone
    // cannot distinguish the correct nesting from either, so this reads the
    // file: the rail must come after the pinned wrapper and before the ribbon.
    expect(render()).toContain('lg:absolute lg:inset-x-0 lg:bottom-6');
    const source = readFileSync('src/components/educraft/acts/FivePillars.tsx', 'utf8');
    const pin = source.indexOf('data-walk-pin');
    const rail = source.indexOf('lg:inset-x-0 lg:bottom-6');
    const ribbon = source.indexOf('<RibbonStage');
    expect(pin).toBeGreaterThan(-1);
    expect(rail, 'the rail is declared before the pinned wrapper').toBeGreaterThan(pin);
    expect(rail, 'the rail is declared after the ribbon, so it is outside the wrapper').toBeLessThan(ribbon);
  });

  it('paints the pillar band instead of a border colour with no width', () => {
    // `pillarAccent[...].border` is `border-ec-learn` — a colour; with no border
    // width, Tailwind's preflight left the 4px strip transparent.
    expect(render()).toMatch(/w-1 bg-ec-learn-soft/);
  });

  it('puts one node on the strand per pillar, at the slot centres', () => {
    // `(i + 0.5) / N` is the centre of slot `i` — the point `drawAt` begins
    // drawing segment `i` from, and the point the particle sits on. The fixture
    // is two pillars of a two-slot track, so the centres are 25% and 75%.
    const markup = render();
    expect((markup.match(/data-walk-node/g) ?? []).length).toBe(2);
    expect(markup).toContain('left:25%');
    expect(markup).toContain('left:75%');
  });

  it('exposes each stage’s title to assistive tech, not only its number', () => {
    // As shipped, the number was real DOM text and the title was `aria-hidden`,
    // so assistive tech heard "Stage 01 … Stage 06" and none of the six titles.
    // §9: every word is real DOM text, in logical order.
    const markup = render();
    expect(markup).not.toMatch(/aria-hidden="true"[^>]*>Curious/);
    expect(markup).toContain('>Curious<');
    expect(markup).toContain('Stage 01');
  });
});

const STAGES = [
  { stage: '01', title: 'Curious' },
  { stage: '02', title: 'Supported' },
  { stage: '03', title: 'Practising' },
  { stage: '04', title: 'Confident' },
  { stage: '05', title: 'Capable' },
  { stage: '06', title: 'Ready' },
] as const;

describe('Act 1 — the journey ribbon', () => {
  const markup = renderToStaticMarkup(
    createElement(FivePillars, { stations: STATIONS, pillarCount: 2, stages: STAGES })
  );

  it('puts all six stages on one continuing strand, left to right', () => {
    let cursor = -1;
    for (const stage of STAGES) {
      const at = markup.indexOf(stage.title);
      expect(at, `${stage.title} is rendered`).toBeGreaterThan(-1);
      expect(at, `${stage.title} comes after the previous stage`).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it('renders the ribbon in its own frame, not the walk frame', () => {
    // Six stages plus a convergence slot and a trailing exit slot.
    expect(markup).toContain('viewBox="0 0 8 1"');
  });

  it('converges one strand per pillar', () => {
    const convergences = markup.match(/M 0 0\.\d+ C/g) ?? [];
    expect(convergences.length).toBe(2);
  });

  it('exits on the page spine, as a fraction of its own frame', () => {
    // pixels.exit.x === 0.75 * 8 — the value ACT_ANCHORS.pillars.exit holds, so
    // the ribbon and the vertical acts cannot disagree about where the seam is.
    expect(markup).toContain('L 6 1');
  });

  it('labels each stage with its number and title as real text', () => {
    for (const stage of STAGES) expect(markup).toContain(`Stage ${stage.stage}`);
  });

  it('renders the ribbon copy verbatim', () => {
    // Both strings are approved in `_copy.md` and were unpinned: rewriting
    // either left the suite green.
    expect(markup).toContain('The student journey');
    expect(markup).toContain('Six stages, one direction: forward.');
  });

  it('places each label on its node, as a fraction of the frame', () => {
    // The join, for the ribbon: the label's position and the node it names are
    // the same number, both from `ribbonFrame`. Measured — dropping the
    // `/ frame.width` left the suite green, so nothing pinned it.
    const frame = ribbonFrame(STAGES.length, 2);
    for (const node of frame.nodes) {
      expect(markup).toContain(`left:${(node.x / frame.width) * 100}%`);
    }
  });

  it('takes the convergence arity from pillarCount, not the station list', () => {
    // Three pillars rendered against two stations: the ribbon follows
    // `pillarCount`, which is the same contract the walk's geometry states and
    // that nothing enforces (a mutant taking the walk's own axis from
    // `stations.length` survives Task 6's suite). Hardcoding the arity to the
    // fixture's two pillars also survived before this test existed.
    const three = renderToStaticMarkup(
      createElement(FivePillars, { stations: STATIONS, pillarCount: 3, stages: STAGES })
    );
    expect((three.match(/M 0 0\.\d+ C/g) ?? []).length).toBe(3);
  });

  it('keeps the strand decorative', () => {
    // Two strands now — the walk's and the ribbon's — and both must be hidden
    // from assistive tech. A bare `toContain` passes on the walk's strand alone:
    // measured, this test was green at the red phase, before any ribbon existed.
    expect((markup.match(/<svg[^>]*aria-hidden="true"/g) ?? []).length).toBe(2);
  });
});
