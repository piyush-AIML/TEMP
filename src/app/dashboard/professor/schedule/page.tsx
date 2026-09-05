import type { Metadata } from 'next';
import { CalendarDays, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getProfessorCourses, getProfessorUpcomingSessions } from '@/lib/dashboard/professor';
import { groupSessionsByISTDay } from '@/lib/dashboard/format';
import { SessionItem } from '@/components/dashboard/SessionItem';
import { SessionForm } from '@/components/dashboard/SessionForm';
import { ScheduleViewToggle } from '@/components/dashboard/ScheduleViewToggle';
import { EmptyState } from '@/components/dashboard/EmptyState';

export const metadata: Metadata = { title: 'Schedule' };

/** Professor schedule (Stage 2, calendar toggle Stage 3) — create across any
 *  taught course, view all upcoming classes as an IST-day-grouped list or on
 *  the shared month/week calendar (default stays the list). */
export default async function ProfessorSchedulePage() {
  const session = await getCurrentUser();
  const [courses, sessions] = await Promise.all([
    getProfessorCourses(session.userId),
    getProfessorUpcomingSessions(session.userId),
  ]);
  const dayGroups = groupSessionsByISTDay(sessions);

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Schedule</p>
        <h1 className='type-display-m mt-3'>Upcoming classes</h1>
        <p className='mt-3 text-foreground/70'>
          All times are Indian Standard Time (IST). Students see every change the moment you save.
        </p>
      </div>

      <section className='mt-8'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <Plus className='size-5 text-foreground/50' aria-hidden='true' />
          Schedule a class
        </h2>
        <div className='card-surface mt-4 max-w-2xl rounded-3xl p-5 sm:p-6'>
          {courses.length > 0 ? (
            <SessionForm
              courses={courses.map((course) => ({ id: course.id, title: course.title, code: course.code }))}
            />
          ) : (
            <p className='text-sm text-foreground/60'>
              You are not assigned to any courses yet — once you are, you can schedule classes here.
            </p>
          )}
        </div>
      </section>

      <section className='mt-10'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <CalendarDays className='size-5 text-foreground/50' aria-hidden='true' />
          All upcoming classes
        </h2>
        {sessions.length === 0 ? (
          <div className='mt-5'>
            <EmptyState
              icon={CalendarDays}
              title='Nothing scheduled'
              description='Classes you schedule will be listed here, day by day.'
            />
          </div>
        ) : (
          <div className='mt-5'>
            <ScheduleViewToggle
              events={sessions.map((session) => ({
                id: session.id,
                title: session.courseTitle,
                startsAt: session.startsAt,
                endsAt: session.endsAt,
              }))}
              list={
                <div className='space-y-8'>
                  {dayGroups.map((group) => (
                    <section key={group.dateKey}>
                      <h3 className='text-lg font-semibold'>{group.label}</h3>
                      <ul className='card-surface mt-3 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
                        {group.sessions.map((session) => (
                          <SessionItem key={session.id} session={session} />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              }
            />
          </div>
        )}
      </section>
    </section>
  );
}
