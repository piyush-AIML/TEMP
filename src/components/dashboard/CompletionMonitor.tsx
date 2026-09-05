import { cn } from '@/lib/utils';
import type { CourseCompletion } from '@/lib/dashboard/tasks';
import { TASK_STATUS_DOT, TASK_STATUS_LABEL } from '@/components/dashboard/taskStatus';

/**
 * Coursework completion monitor (Dashboard Stage 3) — built to the dataviz
 * method: a single ratio reads as a PART-TO-WHOLE stacked bar (not a donut),
 * thin marks, 2px surface gaps between segments, 4px rounded ends on the
 * track, values in ink — never series color. Segment hues are the reserved
 * status palette and always ship with the label + count legend below
 * (identity is never color-alone). Colors were validated with the dataviz
 * palette validator (amber↔green sit in the legal CVD band only because of
 * those labels).
 *
 * Widths are inline styles — the classes themselves are literal (§18 rule 5).
 */

export function CompletionMonitor({ completion }: { completion: CourseCompletion }) {
  const { total, done, inProgress, todo, percentDone } = completion;

  if (total === 0) {
    return (
      <p className='rounded-2xl bg-ec-sky/40 px-4 py-6 text-center text-sm text-foreground/60 dark:bg-ec-canvas-deep/40'>
        No tasks yet — progress shows here once you add tasks.
      </p>
    );
  }

  const segments = (
    [
      { status: 'DONE' as const, count: done },
      { status: 'IN_PROGRESS' as const, count: inProgress },
      { status: 'TODO' as const, count: todo },
    ] as const
  )
    .map((segment) => ({ ...segment, pct: Math.round((segment.count / total) * 100) }))
    .filter((segment) => segment.pct > 0);

  return (
    <div className='space-y-5'>
      {/* State counts — identity is the label; hue is the dot only. */}
      <div className='grid gap-4 sm:grid-cols-3'>
        {(
          [
            { status: 'DONE' as const, count: done },
            { status: 'IN_PROGRESS' as const, count: inProgress },
            { status: 'TODO' as const, count: todo },
          ] as const
        ).map(({ status, count }) => (
          <div key={status} className='flex items-center gap-3 rounded-2xl bg-ec-sky/30 px-4 py-3 dark:bg-ec-canvas-deep/30'>
            <span className={cn('size-2.5 shrink-0 rounded-full', TASK_STATUS_DOT[status])} aria-hidden='true' />
            <span className='min-w-0'>
              <span className='block truncate text-sm font-medium text-foreground/70'>
                {TASK_STATUS_LABEL[status]}
              </span>
              <span className='block font-display text-xl font-bold tracking-tight text-foreground'>{count}</span>
            </span>
          </div>
        ))}
      </div>

      {/* The part-to-whole bar itself. */}
      <div>
        <div
          role='img'
          aria-label={`${done} of ${total} tasks done (${percentDone}%)`}
          className='flex h-2.5 w-full items-center overflow-hidden rounded-full bg-ec-slate/10 dark:bg-white/10'
        >
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            return (
              <div
                key={segment.status}
                // Every non-final segment yields its 2px gap so the total is
                // exactly 100% and the round ends stay on the track.
                style={{ width: isLast ? `${segment.pct}%` : `calc(${segment.pct}% - 2px)` }}
                className={cn('h-full shrink-0', TASK_STATUS_DOT[segment.status])}
              />
            );
          })}
        </div>

        <p className='mt-2.5 text-sm font-semibold text-foreground'>
          {done} of {total} done · {percentDone}%
        </p>
        <p className='text-xs font-medium text-foreground/50'>
          Moves as tasks change status on the board.
        </p>
      </div>
    </div>
  );
}

/** Across-courses meter row for the professor overview — compares MAGNITUDE
 *  across courses, so each row is a single-ratio meter (done share over a
 *  surface track) rather than a 3-segment stack; the state split is already
 *  the Planner monitor's job. One fill hue, direct ink label. */
export function CompletionCourseRow({
  course,
}: {
  course: { courseId: string; code: string; title: string } & CourseCompletion;
}) {
  if (course.total === 0) {
    return (
      <div className='flex items-center justify-between gap-4 py-4'>
        <p className='min-w-0 truncate text-sm font-semibold'>
          {course.title}
          <span className='ml-2 text-xs font-semibold text-foreground/50'>{course.code}</span>
        </p>
        <p className='shrink-0 text-xs font-medium text-foreground/50'>No tasks yet</p>
      </div>
    );
  }

  return (
    // Responsive row: on phones the fixed-width label + count would crush the
    // meter to a sliver, so the layout stacks (label / meter / count) below
    // `sm` and only becomes a three-column row from `sm` up.
    <div className='grid gap-2 py-4 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-4'>
      <p className='min-w-0 truncate text-sm font-semibold' title={`${course.title} (${course.code})`}>
        {course.title}
        <span className='ml-2 text-xs font-semibold text-foreground/50'>{course.code}</span>
      </p>
      <div
        role='img'
        aria-label={`${course.code}: ${course.percentDone}% of tasks done`}
        className='h-2 w-full overflow-hidden rounded-full bg-ec-slate/10 dark:bg-white/10 sm:min-w-0'
      >
        <div
          style={{ width: `${course.percentDone}%` }}
          className='h-full rounded-full bg-ec-success'
        />
      </div>
      <p className='shrink-0 text-sm font-semibold tabular-nums text-foreground sm:text-right'>
        {course.done}/{course.total} · {course.percentDone}%
      </p>
    </div>
  );
}
