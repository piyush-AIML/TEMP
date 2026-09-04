import type { Metadata } from 'next';
import { ArrowRight, BookOpen, CalendarDays, Users } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
  getProfessorCourses,
  getProfessorStats,
  getProfessorUpcomingSessions,
} from '@/lib/dashboard/professor';
import { groupSessionsByISTDay } from '@/lib/dashboard/format';
import { StatCard } from '@/components/dashboard/StatCard';
import { SessionItem } from '@/components/dashboard/SessionItem';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ProfessorCourseCard } from '@/components/dashboard/ProfessorCourseCard';

export const metadata: Metadata = { title: 'Overview' };

/** Professor overview (Stage 2) — DB-derived stats, next classes and the
 *  course list that links into each course's management tabs. */
export default async function ProfessorOverviewPage() {
  const session = await getCurrentUser();
  const [stats, courses, upcoming] = await Promise.all([
    getProfessorStats(session.userId),
    getProfessorCourses(session.userId),
    getProfessorUpcomingSessions(session.userId, { limit: 3 }),
  ]);
  const firstName = session.name.split(' ')[0];
  const nextGroups = groupSessionsByISTDay(upcoming);

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <p className='eyebrow'>Professor dashboard</p>
      <h1 className='type-display-m mt-3'>Welcome back, {firstName}.</h1>
      <p className='mt-3 max-w-2xl text-foreground/70'>
        Your courses, the classes coming up, and what your students have been sent.
      </p>

      <div className='mt-10 grid gap-5 sm:grid-cols-3'>
        <StatCard icon={BookOpen} label='Courses you teach' value={stats.courses} href='/dashboard/professor/courses' />
        <StatCard icon={CalendarDays} label='Upcoming classes' value={stats.upcomingSessions} href='/dashboard/professor/schedule' />
        <StatCard icon={Users} label='Students enrolled' value={stats.activeStudents} />
      </div>

      <section className='mt-12'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-lg font-semibold'>Up next</h2>
          <Link
            href='/dashboard/professor/schedule'
            className='inline-flex items-center gap-1 text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'
          >
            Full schedule
            <ArrowRight className='size-4' aria-hidden='true' />
          </Link>
        </div>
        {nextGroups.length === 0 ? (
          <div className='mt-5'>
            <EmptyState
              icon={CalendarDays}
              title='Nothing scheduled yet'
              description='Schedule a class from any course page — your students see it the moment you save.'
            />
          </div>
        ) : (
          <div className='mt-5 space-y-6'>
            {nextGroups.map((group) => (
              <div key={group.dateKey}>
                <h3 className='text-sm font-semibold text-foreground/70'>{group.label}</h3>
                <ul className='card-surface mt-2 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
                  {group.sessions.map((session) => (
                    <SessionItem key={session.id} session={session} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className='mt-12'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-lg font-semibold'>Your courses</h2>
          {courses.length > 3 && (
            <Link
              href='/dashboard/professor/courses'
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
              title='No courses yet'
              description='Courses you are assigned to teach will appear here.'
            />
          </div>
        ) : (
          <div className='mt-5 grid gap-5 sm:grid-cols-2'>
            {courses.slice(0, 4).map((course) => (
              <ProfessorCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
