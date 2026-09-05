import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Dashboard stat tile (Stage 1, layout 2026-09-05). Numbers are always
 * DB-derived; the label sits beside the number (baseline-aligned) rather than
 * stacked under it, and the icon tile centres against the value+label row.
 * Optional href wraps the whole tile as a link.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  href?: string;
}) {
  const body = (
    <div className='flex items-center gap-4'>
      <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
        <Icon className='size-5' aria-hidden='true' />
      </div>
      <p className='flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
        <span className='font-display text-3xl font-bold tracking-tight text-foreground'>{value}</span>
        <span className='text-sm font-medium text-foreground/60'>{label}</span>
      </p>
    </div>
  );

  const classes = cn(
    'card-surface flex flex-col rounded-3xl p-6 transition-all duration-150',
    href && 'hover:-translate-y-0.5'
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}
