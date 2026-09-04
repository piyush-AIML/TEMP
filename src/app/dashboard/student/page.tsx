import type { Metadata } from 'next';
import { ArrowRight, BookOpen, CalendarDays, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { getStudentStats, getStudentEnrolledCourses } from '@/lib/dashboard/courses';
import { getStudentUpcomingSessions } from '@/lib/dashboard/sessions';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';
import { StatCard } from '@/components/dashboard/StatCard';
import { SessionItem } from '@/components/dashboard/SessionItem';
import { EmptyState } from '@/components/dashboard/EmptyState';

export const metadata: Metadata = { title: 'Overview' };

/**
 * Student overview (Stage 1). Every number is DB-derived — counts come from
 * getStudentStats, "Up next" from the shared upcoming-sessions query, and the
 * course list links into the per-course pages.
 */
export default async function StudentOverviewPage() {
  const session = await getCurrentUser();
  const [stats, courses, upcoming] = await Promise.all([
    getStudentStats(session.userId),
    getStudentEnrolledCourses(session.userId),
    getStudentUpcomingSessions(session.userId, { limit: 3 }),
  ]);
  const firstName = session.name.split(' ')[0];

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <p className='eyebrow'>Student dashboard</p>
      <h1 className='type-display-m mt-3'>Welcome back, {firstName}.</h1>
      <p className='mt-3 max-w-2xl text-foreground/70'>
        Here is what is happening across your courses — classes coming up, and materials shared with you.
      </p>

      <div className='mt-10 grid gap-5 sm:grid-cols-3'>
        <StatCard icon={BookOpen} label='Enrolled courses' value={stats.activeCourses} href='/dashboard/student/courses' />
        <StatCard icon={CalendarDays} label='Upcoming classes' value={stats.upcomingSessions} href='/dashboard/student/schedule' />
        <StatCard icon={FileText} label='Materials shared' value={stats.materials} />
      </div>

      <section className='mt-12'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-lg font-semibold'>Up next</h2>
          {upcoming.length > 3 && (
            <Link
              href='/dashboard/student/schedule'
              className='inline-flex items-center gap-1 text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'
            >
              View full schedule
              <ArrowRight className='size-4' aria-hidden='true' />
            </Link>
          )}
        </div>
        {upcoming.length === 0 ? (
          <div className='mt-5'>
            <EmptyState
              icon={CalendarDays}
              title='No classes coming up'
              description='Scheduled classes will appear here — professors typically set the week ahead.'
            />
          </div>
        ) : (
          <ul className='card-surface mt-5 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
            {upcoming.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </ul>
        )}
      </section>

      <section className='mt-12'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-lg font-semibold'>Your courses</h2>
          {courses.length > 5 && (
            <Link
              href='/dashboard/student/courses'
              className='inline-flex items-center gap-1 text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'
            >
              View all
              <ArrowRight className='size-4' aria-hidden='true' />
            </Link>
          )}
        </div>
        {courses.length === 0 ? (
          <div className='mt-5'>
            <EmptyState
              icon={BookOpen}
              title='No enrolled courses yet'
              description='Once your enrolment is active, your courses will be listed here.'
            />
          </div>
        ) : (
          <ol className='card-surface mt-5 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
            {courses.map((course) => {
              const accent = getPillarAccentForVertical(course.vertical);
              return (
                <li key={course.id}>
                  <Link
                    href={`/dashboard/student/courses/${course.id}`}
                    className='group flex items-center justify-between gap-4 py-4 transition-colors duration-150'
                  >
                    <div className='min-w-0'>
                      <p
                        className={cn(
                          'text-xs font-semibold uppercase tracking-widest',
                          accent ? accent.text : 'text-ec-indigo dark:text-white'
                        )}
                      >
                        {accent ? accent.name : 'Programme'} · {course.code}
                      </p>
                      <p className='mt-1 truncate font-semibold'>{course.title}</p>
                    </div>
                    <ArrowRight
                      className='size-5 shrink-0 text-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground'
                      aria-hidden='true'
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </section>
  );
}
