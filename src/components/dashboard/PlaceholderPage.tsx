import type { LucideIcon } from 'lucide-react';

/**
 * Stub content for routes whose stage hasn't shipped yet (Stage 0-D). Lets the
 * shell be fully navigable now and gives each later stage a fixed mount point.
 * Each route file passes its owning stage so the copy never lies about what
 * exists.
 */
export function PlaceholderPage({
  stage,
  title,
  description,
  icon: Icon,
}: {
  stage: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>{`Landing in ${stage}`}</p>
        <h1 className='type-display-m mt-3'>{title}</h1>
      </div>
      <div className='card-surface mt-10 flex flex-col items-start gap-5 rounded-3xl p-8 sm:flex-row sm:items-center'>
        <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          <Icon className='size-6' aria-hidden='true' />
        </div>
        <div>
          <p className='text-sm leading-relaxed text-foreground/70'>{description}</p>
        </div>
      </div>
    </section>
  );
}
