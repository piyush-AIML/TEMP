import { CalendarDays, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProfessorCourseDTO } from '@/lib/dashboard/professor';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';

/**
 * One course card on the professor's My Courses grid (Stage 2) — counts are
 * DB-derived and honest; the whole card links to the course management page.
 */
export function ProfessorCourseCard({ course }: { course: ProfessorCourseDTO }) {
  const accent = getPillarAccentForVertical(course.vertical);
  const professors = course.professorNames.join(', ');

  return (
    <Link
      href={`/dashboard/professor/courses/${course.id}`}
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

      <div className='mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ec-sky pt-4 text-sm text-foreground/70 dark:border-ec-canvas-deep'>
        <p className='flex items-center gap-2'>
          <Users className='size-4 text-foreground/50' aria-hidden='true' />
          {course.activeStudents} student{course.activeStudents === 1 ? '' : 's'}
        </p>
        <p className='flex items-center gap-2'>
          <CalendarDays className='size-4 text-foreground/50' aria-hidden='true' />
          {course.upcomingSessions} class{course.upcomingSessions === 1 ? '' : 'es'} coming up
        </p>
        <p className='flex items-center gap-2'>
          <FileText className='size-4 text-foreground/50' aria-hidden='true' />
          {course.materials} material{course.materials === 1 ? '' : 's'}
        </p>
      </div>
    </Link>
  );
}
