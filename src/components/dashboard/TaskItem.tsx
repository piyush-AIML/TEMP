import { CalendarClock } from 'lucide-react';
import type { TaskDTO } from '@/lib/dashboard/tasks';
import { formatDayLabel, formatShortDate, toISTDateKey } from '@/lib/dashboard/format';
import { TASK_STATUS_CHIP, TASK_STATUS_LABEL } from '@/components/dashboard/taskStatus';
import { cn } from '@/lib/utils';

/**
 * One task's content block (Dashboard Stage 3) — server-rendered; renders no
 * wrapper so the professor board and the student list supply their own
 * <li>/card shells. DONE rows are muted to recede; the due line reads
 * "Due <Fri, 5 Sep>" with a Today/Tomorrow label where applicable, plus an
 * honest Overdue chip for past-due non-DONE tasks (IST date comparison).
 */

export function TaskItem({ task }: { task: TaskDTO }) {
  const isDone = task.status === 'DONE';

  let dueLine: string | null = null;
  if (task.dueDate) {
    const dayLabel = formatDayLabel(task.dueDate);
    const short = formatShortDate(task.dueDate);
    dueLine = dayLabel === 'Today' || dayLabel === 'Tomorrow' ? `${dayLabel} · ${short}` : short;
  }

  const isOverdue = Boolean(
    task.dueDate && !isDone && toISTDateKey(task.dueDate) < toISTDateKey(new Date().toISOString())
  );

  return (
    <div className={cn('min-w-0', isDone && 'opacity-70')}>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1.5'>
        <p className={cn('font-semibold leading-snug', isDone && 'line-through decoration-foreground/40')}>
          {task.title}
        </p>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
            TASK_STATUS_CHIP[task.status]
          )}
        >
          {TASK_STATUS_LABEL[task.status]}
        </span>
        {isOverdue && (
          <span className='inline-flex items-center rounded-full bg-ec-error/10 px-2.5 py-0.5 text-[11px] font-bold text-ec-error dark:bg-ec-error/20'>
            Overdue
          </span>
        )}
      </div>

      {task.description && (
        <p className='mt-1 text-sm leading-relaxed text-foreground/70'>{task.description}</p>
      )}

      {dueLine && (
        <p className='mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/60'>
          <CalendarClock className='size-3.5' aria-hidden='true' />
          <time dateTime={task.dueDate ?? undefined}>Due {dueLine}</time>
        </p>
      )}
    </div>
  );
}
