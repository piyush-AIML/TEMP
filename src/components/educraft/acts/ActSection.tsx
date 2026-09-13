import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Eyebrow from '@/components/educraft/ui/Eyebrow';

export type ActSectionProps = {
  /** The act's anchor id, from `ACT_ORDER`. */
  id: string;
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
export default function ActSection({ id, eyebrow, heading, lede, className, children }: ActSectionProps) {
  return (
    <section id={id} className={cn('relative', className)}>
      {(eyebrow || heading || lede) && (
        <header className='mx-auto max-w-3xl px-6 pt-24 md:pt-32'>
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
