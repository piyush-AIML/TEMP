import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Eyebrow from '@/components/educraft/ui/Eyebrow';

export type ActSectionProps = {
  /** The act's anchor id. `ACT_ORDER` names the act set; every act still passes
   * its own literal here, so a renamed key does not rename the DOM id. */
  id: string;
  /**
   * The act's strand, positioned by the caller against **this section**.
   *
   * Rendered as the section's first child and never wrapped, so the element the
   * strand is measured against is the act's own band — which is what the seam
   * contract assumes and what makes the line continuous on screen. An act that
   * renders its strand inside its content box breaks screen continuity with
   * every check still green: `assertContinuity` compares fractions of each act's
   * own box and cannot see a box (`pathBuilders.ts`).
   */
  line?: ReactNode;
  eyebrow?: string;
  heading?: ReactNode;
  lede?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * The common frame for an act: the section element, the header, and the copy.
 *
 * **Written as a server component** (spec §3.3), and that is conditional in
 * practice. Tasks 8–10 are client components and *import* this frame, so once an
 * act is mounted this file — and the copy passed to it — travel in that route's
 * client bundle. Keeping them out needs a server parent to render the frame:
 * `page.tsx` wrapping each act in `<ActSection …>`. The stage's composition does
 * the opposite — the page renders each act bare, and the act renders this frame
 * itself — so the bundle cost is accepted here rather than quietly assumed away.
 * **Measurable at Task 11**, the first build in which an act is mounted; until
 * then this file is in no bundle at all, because nothing imports it.
 *
 * Not used by Act 0: the hero's H1 mask-reveals line by line and its layout has
 * no header, so it composes its own markup and uses `MaskLine` directly.
 */
export default function ActSection({ id, line, eyebrow, heading, lede, className, children }: ActSectionProps) {
  return (
    <section id={id} className={cn('relative', className)}>
      {line}
      {(eyebrow || heading || lede) && (
        // The right gutter keeps the header's words clear of the spine, which
        // sits at 75% of the act and at every width below 1536px falls inside
        // the header's own box. The reservation differs by regime because the
        // box does: under `md` it is the full width minus `px-6`, so the gap is
        // `25vw + 1.25rem` (the rows' `2.75rem` gutter, less the `1.5rem` of
        // padding already there); from `md` up it is a centred `max-w-3xl`, so
        // the gap is its right edge `(100vw + 48rem) / 2` minus `75vw`, plus the
        // same gutter — `25.25rem - 25vw`. Above 1536px the spine clears the box
        // unaided and the max floors it at zero. It was `lg:`-only for one
        // round, which left the strand drawn across the heading at every width
        // below 1024.
        <header className='mx-auto max-w-3xl px-6 pt-24 pr-[calc(25vw+1.25rem)] md:pt-32 md:pr-[max(0px,calc(25.25rem-25vw))]'>
          {eyebrow && <Eyebrow className='eyebrow-rule text-ec-teal'>{eyebrow}</Eyebrow>}
          {heading && (
            <h2 className='type-heading-l mt-4 text-balance text-ec-ink dark:text-white'>{heading}</h2>
          )}
          {lede && <p className='type-body-m mt-4 max-w-2xl text-pretty text-ec-slate'>{lede}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
