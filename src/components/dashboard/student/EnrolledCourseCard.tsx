import { CalendarDays, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatSessionRange } from '@/lib/dashboard/format';
import type { EnrolledCourseDTO } from '@/lib/dashboard/courses';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';

/**
 * One enrolled course card (Stage 1). The whole card links to the course's
 * dashboard page. Programme identity (eyebrow + accent) comes from the course
 * vertical via the literal pillar class maps; unknown verticals fall back to
 * the neutral sky/indigo treatment.
 */
export function EnrolledCourseCard({ course }: { course: EnrolledCourseDTO }) {
  const accent = getPillarAccentForVertical(course.vertical);
  const professors = course.professorNames.join(', ');
  const materialLabel = `${course.materialCount} material${course.materialCount === 1 ? '' : 's'}`;

  return (
    <Link
      href={`/dashboard/student/courses/${course.id}`}
      className={cn(
        'card-surface group flex flex-col rounded-3xl border p-6 transition-all duration-150 hover:-translate-y-0.5',
        accent ? accent.border : 'border-ec-sky dark:border-ec-canvas-deep'
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-widest',
              accent ? accent.text : 'text-ec-indigo dark:text-white'
            )}
          >
            {accent ? accent.name : 'Programme'}
          </p>
          <h3 className='mt-1.5 font-semibold leading-snug'>{course.title}</h3>
        </div>
        <span className='shrink-0 rounded-full bg-ec-sky/70 px-3 py-1 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          {course.code}
        </span>
      </div>

      {course.description && (
        <p className='mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/70'>{course.description}</p>
      )}

      <p className='mt-3 text-sm text-foreground/60'>With {professors}</p>

      <div className='mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-ec-sky pt-4 text-sm dark:border-ec-canvas-deep'>
        {course.nextSession ? (
          <p className='flex min-w-0 items-center gap-2 text-foreground/70'>
            <CalendarDays className='size-4 shrink-0 text-foreground/50' aria-hidden='true' />
            <span className='truncate'>
              Next:{' '}
              <time dateTime={course.nextSession.startsAt}>
                {formatSessionRange(course.nextSession.startsAt, course.nextSession.endsAt)}
              </time>
            </span>
          </p>
        ) : (
          <p className='flex items-center gap-2 text-foreground/50'>
            <CalendarDays className='size-4 shrink-0' aria-hidden='true' />
            No classes scheduled yet
          </p>
        )}
        <p className='flex shrink-0 items-center gap-2 text-foreground/60'>
          <FileText className='size-4 text-foreground/50' aria-hidden='true' />
          {materialLabel}
        </p>
      </div>
    </Link>
  );
}
