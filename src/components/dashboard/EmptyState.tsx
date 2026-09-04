import type { LucideIcon } from 'lucide-react';

/**
 * Honest empty state for real-empty data (Stage 1) — distinct from the
 * PlaceholderPage stubs that say "lands in Stage X". Copy always says what
 * appears here and when, never invents content.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className='card-surface flex flex-col items-start gap-5 rounded-3xl p-8 sm:flex-row sm:items-center'>
      <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
        <Icon className='size-6' aria-hidden='true' />
      </div>
      <div>
        <p className='font-semibold'>{title}</p>
        <p className='mt-1 text-sm leading-relaxed text-foreground/70'>{description}</p>
      </div>
    </div>
  );
}
