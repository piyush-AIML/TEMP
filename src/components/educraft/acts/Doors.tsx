'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { AudienceEntry } from '@/types';
import ActSection from './ActSection';
import FinalCTA from './FinalCTA';
import { LineStage } from '@/components/educraft/line/LineStage';
import { ACT_ANCHORS } from '@/components/educraft/line/anchors';
import { ACT_VIEW_BOX } from '@/components/educraft/line/frames';
import { pathFor } from '@/components/educraft/line/pathBuilders';
import { audienceEntries } from '@/data/navigation';

export type DoorsProps = { className?: string };

/**
 * The spine: the x the strand and the terminal node both read, so the node
 * lands **on** the line rather than near it. `ACT_ANCHORS.doors` is the seam
 * contract's value, not a layout choice — as in `Way`, the geometry comes from
 * there and the copy is arranged around it.
 */
const SPINE_X = ACT_ANCHORS.doors.enter.x;

/** Room kept to the right of the spine, past the copy, for the strand. */
const NODE_GUTTER = '2.75rem';

/**
 * §4 trims each door's four benefits to two ("Benefits trimmed 4 → 2"); the cut
 * table in `_copy.md` names the two kept as "the two that name something
 * concrete" and the two dropped as the ones that could appear on any education
 * site.
 *
 * **Positions, not strings.** The copy lives in `data/navigation.ts`; repeating
 * it here would be a second source that can drift from the first. `Doors.test.ts`
 * pins the strings these positions resolve to, so a reorder in the data is a
 * failing test rather than silently different copy.
 */
const KEPT_BENEFITS: Record<AudienceEntry['slug'], readonly [number, number]> = {
  schools: [0, 1],
  parents: [0, 1],
  students: [2, 3],
};

const keptBenefits = (door: AudienceEntry) => KEPT_BENEFITS[door.slug].map((i) => door.benefits[i]);

/**
 * Act 4 — the doors, and the strand's end (§4). Three columns separated by
 * vertical hairline rules rather than three cards, each rendering the two
 * `data/navigation.ts` fields the retired section imported and never read:
 * `headline` as its heading, `ctaLabel` as its link.
 *
 * **The strand's box is the act's band** — the whole `<section>`, not the
 * content div below the header — because the seam contract is act-local: `y = 0`
 * has to be the act's top edge, where Act 3's exit lands. That is what
 * `ACT_VIEW_BOX` over the section gives, and why the grid below reserves the
 * spine's gutter instead of the strand being moved aside.
 *
 * **The residual, in both axes, stated rather than implied.** §4 asks for the
 * strand to "converge to a single point, and that point is the CTA". The strand
 * is drawn to `doors.exit`, which the seam contract fixes at **mid-band**
 * (`y = 0.5`), while the terminal node rides in `FinalCTA` at the primary CTA's
 * edge — and the CTA row is centred in a `max-w-3xl` box, so the buttons sit
 * near the middle of the band while the node sits on the spine at 75%.
 *
 * Vertically the two cannot coincide: the closer's own eyebrow, heading and lede
 * sit between the band's top and its buttons, so the line's end is above the
 * button in every layout, by construction rather than by measurement.
 * Horizontally they do not meet either, and that one is a design decision rather
 * than a constraint: either the node moves to the button's centre (and the line
 * stops ending on the spine, which breaks the seam contract's x), or the CTA row
 * moves to the spine. Both are one-line changes; both are the owner's, and the
 * plan's checklist item 10 is where the call is recorded.
 */
export default function Doors({ className }: DoorsProps = {}) {
  const strand = pathFor(ACT_ANCHORS.doors.enter, ACT_ANCHORS.doors.exit, 'arc');
  // The copy sits left of the spine, so the grid reserves the same gutter the
  // other vertical acts keep: the strand runs down the reserved strip, never
  // across a door's words.
  const copyStyle = { paddingRight: `calc(${(1 - SPINE_X) * 100}% + ${NODE_GUTTER})` };

  return (
    <ActSection
      id='doors'
      eyebrow='Who are you?'
      heading='Every journey starts from somewhere different'
      lede='Three doors into the same ecosystem — pick the one that describes you, and the conversation starts on your terms.'
      className={className}
    >
      <LineStage
        paths={[strand]}
        viewBox={ACT_VIEW_BOX}
        className='pointer-events-none absolute inset-0 z-10'
      />

      <div className='mx-auto max-w-5xl px-6 pb-24'>
        <div
          className='grid grid-cols-3 divide-x divide-ec-border max-lg:grid-cols-1 max-lg:divide-x-0 max-lg:divide-y'
          style={copyStyle}
        >
          {audienceEntries.map((door) => (
            <div
              key={door.slug}
              className='flex flex-col py-8 first:pt-0 last:pb-0 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0'
            >
              <h3 className='type-heading-m text-balance text-ec-ink dark:text-white'>
                {door.headline}
              </h3>

              <ul className='mt-6 flex-1 space-y-2.5'>
                {keptBenefits(door).map((benefit) => (
                  <li
                    key={benefit}
                    className='type-body-s flex items-start gap-2.5 text-ec-slate'
                  >
                    <span
                      className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ec-teal-graphic'
                      aria-hidden='true'
                    />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Link
                href={door.ctaHref}
                className='group mt-8 inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo transition-opacity hover:opacity-80 dark:text-white'
              >
                {door.ctaLabel}
                <ArrowRight
                  className='h-4 w-4 transition-transform duration-150 group-hover:translate-x-1'
                  aria-hidden='true'
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <FinalCTA>
        <span
          data-terminal-node
          aria-hidden='true'
          className='pointer-events-none absolute top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ec-teal-graphic'
          // The closer's container is centred in a full-bleed band, so the spine
          // is half a band-width plus `SPINE_X`'s quarter — expressed in `vw`,
          // which is the band's own width. No measurement, no layout read.
          style={{ left: `calc(50% + ${(SPINE_X - 0.5) * 100}vw)` }}
        />
      </FinalCTA>
    </ActSection>
  );
}
