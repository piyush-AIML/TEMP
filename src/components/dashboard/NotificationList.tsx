import Link from 'next/link';
import {
  Bell,
  FileText,
  CalendarDays,
  CalendarClock,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationDTO } from '@/lib/dashboard/notifications';
import { formatShortDate } from '@/lib/dashboard/format';
import { cn } from '@/lib/utils';

/**
 * Full notifications list (Stage 2, server-rendered) — shared by the student
 * and professor notifications pages. Times are full IST dates via format.ts;
 * the unread rows carry an emphasis chip. relatedEntity ("course:<id>")
 * resolves to the role-appropriate course link when known.
 */

const TYPE_ICON: Record<NotificationDTO['type'], LucideIcon> = {
  NEW_MATERIAL: FileText,
  NEW_CLASS: CalendarDays,
  MEETING: CalendarClock,
  TASK_DUE: AlertTriangle,
};

export function NotificationList({
  notifications,
  courseHrefFor,
}: {
  notifications: NotificationDTO[];
  /** Resolve "course:<id>" relatedEntity → dashboard course href. */
  courseHrefFor: (relatedEntity: string | null) => string | null;
}) {
  if (notifications.length === 0) {
    return (
      <div className='card-surface flex flex-col items-start gap-4 rounded-3xl p-8'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          <Bell className='size-6' aria-hidden='true' />
        </div>
        <div>
          <p className='font-semibold'>Nothing yet</p>
          <p className='mt-1 max-w-xl text-sm leading-relaxed text-foreground/70'>
            Updates about new classes, materials and meetings will land here — on this page and in the bell.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className='divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
      {notifications.map((item) => {
        const Icon = TYPE_ICON[item.type] ?? Bell;
        const href = item.relatedEntity?.startsWith('course:')
          ? courseHrefFor(item.relatedEntity)
          : null;
        const row = (
          <div className='flex items-start gap-3.5'>
            <div
              className={cn(
                'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl',
                'bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'
              )}
            >
              <Icon className='size-5' aria-hidden='true' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className={cn('leading-snug', item.read ? 'font-medium text-foreground/70' : 'font-semibold')}>
                {item.title}
              </p>
              {item.body && (
                <p className='mt-1 text-sm leading-relaxed text-foreground/60'>{item.body}</p>
              )}
              <p className='mt-1.5 text-xs text-foreground/45'>{formatShortDate(item.createdAt)}</p>
            </div>
            {!item.read && (
              <span className='mt-1.5 shrink-0 rounded-full bg-ec-indigo px-2.5 py-0.5 text-[11px] font-bold text-white dark:bg-white dark:text-ec-indigo'>
                New
              </span>
            )}
          </div>
        );
        return (
          <li key={item.id} className={cn('py-5 first:pt-0 last:pb-0', !item.read && 'rounded-2xl')}>
            {href ? (
              <Link href={href} className='block rounded-2xl px-3 py-1 -mx-3 transition-colors duration-150 hover:bg-ec-sky/50 dark:hover:bg-ec-canvas-deep/50'>
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ol>
  );
}
