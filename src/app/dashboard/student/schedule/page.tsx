import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getStudentUpcomingSessions } from '@/lib/dashboard/sessions';
import { groupSessionsByISTDay } from '@/lib/dashboard/format';
import { SessionItem } from '@/components/dashboard/SessionItem';
import { EmptyState } from '@/components/dashboard/EmptyState';

export const metadata: Metadata = { title: 'Schedule' };

/** Stage 1: every upcoming class across the student's enrolled courses,
 *  grouped by its IST calendar day (never UTC). */
export default async function StudentSchedulePage() {
  const session = await getCurrentUser();
  const sessions = await getStudentUpcomingSessions(session.userId);
  const dayGroups = groupSessionsByISTDay(sessions);

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Schedule</p>
        <h1 className='type-display-m mt-3'>Upcoming classes</h1>
        <p className='mt-3 text-foreground/70'>
          All times are Indian Standard Time (IST). Join links and venues come from your professors.
        </p>
      </div>

      {dayGroups.length === 0 ? (
        <div className='mt-10'>
          <EmptyState
            icon={CalendarDays}
            title='No upcoming classes'
            description='Classes for your enrolled courses will show up here as professors schedule them.'
          />
        </div>
      ) : (
        <div className='mt-10 space-y-10'>
          {dayGroups.map((group) => (
            <section key={group.dateKey}>
              <h2 className='text-lg font-semibold'>{group.label}</h2>
              <ul className='card-surface mt-4 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
                {group.sessions.map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
