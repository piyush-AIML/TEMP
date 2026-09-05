import { GraduationCap, Handshake, Users } from 'lucide-react';
import { formatSessionRange } from '@/lib/dashboard/format';
import type { MeetingDTO } from '@/lib/dashboard/meetings';

/**
 * One upcoming meeting row (Dashboard Stage 3). Server-rendered — dates were
 * formatted in IST server-side. The right column names who the meeting is
 * with (the student name for STUDENT meetings) and carries the join link.
 */

const WITH_WHOM: Record<MeetingDTO['withWhom'], { icon: typeof GraduationCap; label: string }> = {
  STUDENT: { icon: GraduationCap, label: 'Student' },
  PARENT: { icon: Users, label: 'Parent' },
  OTHER: { icon: Handshake, label: 'Other' },
};

export function MeetingItem({ meeting }: { meeting: MeetingDTO }) {
  const withWhom = WITH_WHOM[meeting.withWhom];
  const person = meeting.withWhom === 'STUDENT' && meeting.studentName ? ` · ${meeting.studentName}` : '';

  return (
    <li className='flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between'>
      <div className='min-w-0'>
        <p className='font-semibold leading-snug'>{meeting.title}</p>
        <p className='mt-1 text-sm text-foreground/70'>
          <time dateTime={meeting.startsAt}>{formatSessionRange(meeting.startsAt, meeting.endsAt)}</time>
        </p>
      </div>

      <div className='flex shrink-0 flex-col items-start gap-1.5 sm:items-end'>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-ec-sky px-3 py-1 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          <withWhom.icon className='size-3.5' aria-hidden='true' />
          {withWhom.label}
          {person}
        </span>

        {meeting.link ? (
          <a
            href={meeting.link}
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'
          >
            Join meeting
          </a>
        ) : (
          <p className='text-xs text-foreground/50'>Link shared before the meeting</p>
        )}
      </div>
    </li>
  );
}
