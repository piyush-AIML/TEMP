import type { Metadata } from 'next';
import { CalendarClock, CalendarDays, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getProfessorStudents, getProfessorUpcomingMeetings } from '@/lib/dashboard/meetings';
import { MeetingForm } from '@/components/dashboard/MeetingForm';
import { MeetingsManager } from '@/components/dashboard/MeetingsManager';
import { MeetingItem } from '@/components/dashboard/MeetingItem';
import { CalendarView, type CalendarViewEvent } from '@/components/dashboard/CalendarView';
import { EmptyState } from '@/components/dashboard/EmptyState';

export const metadata: Metadata = { title: 'Meetings' };

/**
 * Professor meetings page (Dashboard Stage 3) — schedule one-on-ones with
 * students, parents or colleagues, see them on a month/week calendar, and
 * manage the upcoming list. All times are IST (the calendar converts UTC →
 * IST wall time client-side); STUDENT meetings notify the student, PARENT and
 * OTHER meetings notify nobody.
 */
export default async function ProfessorMeetingsPage() {
  const session = await getCurrentUser();
  const [meetings, students] = await Promise.all([
    getProfessorUpcomingMeetings(session.userId),
    getProfessorStudents(session.userId),
  ]);

  // Server-rendered display rows keyed by meeting id (RSC payloads — the
  // client MeetingsManager toggles edit/cancel around them).
  const meetingNodes: Record<string, React.ReactNode> = {};
  for (const meeting of meetings) {
    meetingNodes[meeting.id] = <MeetingItem meeting={meeting} />;
  }

  const calendarEvents: CalendarViewEvent[] = meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    startsAt: meeting.startsAt,
    endsAt: meeting.endsAt,
  }));

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Meetings</p>
        <h1 className='type-display-m mt-3'>One-on-ones &amp; check-ins</h1>
        <p className='mt-3 text-foreground/70'>
          All times are Indian Standard Time (IST). Students are notified when a meeting is with them;
          parent and other meetings stay private to you.
        </p>
      </div>

      <section className='mt-8'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <Plus className='size-5 text-foreground/50' aria-hidden='true' />
          Schedule a meeting
        </h2>
        <div className='card-surface mt-4 max-w-2xl rounded-3xl p-5 sm:p-6'>
          <MeetingForm
            students={students.map((student) => ({ studentId: student.studentId, name: student.name }))}
          />
          {students.length === 0 && (
            <p className='mt-3 text-xs font-medium text-foreground/50'>
              You have no students enrolled in your classes yet — student meetings need a linked
              enrollment, so they are unavailable until you do. Parent and other meetings work regardless.
            </p>
          )}
        </div>
      </section>

      {meetings.length === 0 ? (
        <section className='mt-10'>
          <EmptyState
            icon={CalendarClock}
            title='No meetings yet'
            description='Meetings you schedule will appear here on the calendar and in the list below.'
          />
        </section>
      ) : (
        <>
          <section className='mt-10'>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <CalendarDays className='size-5 text-foreground/50' aria-hidden='true' />
              Calendar
            </h2>
            <div className='card-surface mt-4 rounded-3xl p-4 sm:p-5'>
              <CalendarView events={calendarEvents} />
            </div>
            <p className='mt-2 text-xs font-medium text-foreground/50'>All times shown are IST.</p>
          </section>

          <section className='mt-10'>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <CalendarClock className='size-5 text-foreground/50' aria-hidden='true' />
              Upcoming meetings
            </h2>
            <div className='card-surface mt-4 rounded-3xl px-6'>
              <MeetingsManager
                meetings={meetings}
                meetingNodes={meetingNodes}
                students={students.map((student) => ({ studentId: student.studentId, name: student.name }))}
              />
            </div>
          </section>
        </>
      )}
    </section>
  );
}
