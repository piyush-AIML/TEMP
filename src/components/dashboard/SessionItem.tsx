import { MapPin, Video } from 'lucide-react';
import { formatSessionRange } from '@/lib/dashboard/format';
import type { SessionDTO } from '@/lib/dashboard/sessions';

/**
 * One upcoming class row (Stage 1). Server-rendered — dates were formatted in
 * IST server-side, so no client timezone can disagree. ONLINE sessions carry
 * their join link when present; IN_PERSON sessions their venue.
 */
export function SessionItem({ session }: { session: SessionDTO }) {
  const isOnline = session.mode === 'ONLINE';

  return (
    <li className='flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between'>
      <div className='min-w-0'>
        <p className='font-semibold leading-snug'>
          {session.courseTitle}
          <span className='ml-2 align-middle text-xs font-semibold text-foreground/50'>
            {session.courseCode}
          </span>
        </p>
        <p className='mt-1 text-sm text-foreground/70'>
          <time dateTime={session.startsAt}>{formatSessionRange(session.startsAt, session.endsAt)}</time>
        </p>
      </div>

      <div className='flex shrink-0 flex-col items-start gap-1.5 sm:items-end'>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-ec-sky px-3 py-1 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          {isOnline ? (
            <Video className='size-3.5' aria-hidden='true' />
          ) : (
            <MapPin className='size-3.5' aria-hidden='true' />
          )}
          {isOnline ? 'Online' : 'In person'}
        </span>

        {isOnline ? (
          session.link ? (
            <a
              href={session.link}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'
            >
              Join class
            </a>
          ) : (
            <p className='text-xs text-foreground/50'>Join link shared before the class</p>
          )
        ) : session.location ? (
          <p className='text-sm text-foreground/70'>{session.location}</p>
        ) : (
          <p className='text-xs text-foreground/50'>Venue to be announced</p>
        )}
      </div>
    </li>
  );
}
