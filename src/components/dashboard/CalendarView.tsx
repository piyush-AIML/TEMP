'use client';

import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, type ToolbarProps } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { utcIsoToIstLocalDate } from '@/lib/ist';
// Order matters: the override stylesheet must win over RBC's own CSS.
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

/**
 * Shared calendar view (Dashboard Stage 3) over react-big-calendar. Month and
 * week views, toolbar fully replaced with hand-rolled controls.
 *
 * Timezone strategy: RBC is timezone-naive — it renders whatever each Date's
 * LOCAL wall components read. The DB stores UTC, and this app displays IST, so
 * every event is mapped through utcIsoToIstLocalDate: the local wall
 * components of the resulting Date ARE the IST wall time, on any device.
 * Known cosmetic consequence: RBC's "today" ring derives from the device
 * clock, which can lag the IST date for visitors west of India near the IST
 * day boundary — accepted (the school runs on IST; labels stay explicit).
 */

export type CalendarViewEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

export function CalendarView({
  events,
  defaultView = Views.MONTH,
}: {
  events: CalendarViewEvent[];
  defaultView?: 'month' | 'week';
}) {
  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        start: utcIsoToIstLocalDate(event.startsAt),
        end: utcIsoToIstLocalDate(event.endsAt),
      })),
    [events]
  );

  return (
    // Height is responsive: RBC's month grid needs an explicit height, but a
    // phone viewport doesn't need (or fit) the desktop 560px.
    <div className='ec-calendar h-[440px] sm:h-[560px]'>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        views={['month', 'week']}
        defaultView={defaultView}
        defaultDate={new Date()}
        components={{ toolbar: EcToolbar }}
        formats={{
          monthHeaderFormat: 'MMMM yyyy',
          weekdayFormat: 'EEE',
          dayFormat: 'EEE d',
          eventTimeRangeFormat: 'h:mm a',
          timeGutterFormat: 'h:mm a',
        }}
      />
    </div>
  );
}

type EcToolbarProps = ToolbarProps;

/** Replaces RBC's default toolbar — Today + prev/next + Month/Week pills in
 *  the dashboard's segmented-control language. */
function EcToolbar({ label, onNavigate, view, onView }: EcToolbarProps) {
  const pill = (active: boolean) =>
    cn(
      'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150',
      active
        ? 'bg-ec-indigo text-white dark:bg-white dark:text-ec-indigo'
        : 'text-foreground/60 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
    );

  return (
    <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => onNavigate('TODAY')}
          className='rounded-full bg-ec-sky/70 px-4 py-1.5 text-sm font-semibold text-ec-indigo transition-colors duration-150 hover:bg-ec-sky dark:bg-ec-canvas-deep dark:text-white'
        >
          Today
        </button>
        <div className='ml-1 flex items-center gap-0.5'>
          <button
            type='button'
            onClick={() => onNavigate('PREV')}
            aria-label='Previous'
            className='rounded-full p-1.5 text-foreground/60 transition-colors duration-150 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
          >
            <ChevronLeft className='size-4' aria-hidden='true' />
          </button>
          <button
            type='button'
            onClick={() => onNavigate('NEXT')}
            aria-label='Next'
            className='rounded-full p-1.5 text-foreground/60 transition-colors duration-150 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
          >
            <ChevronRight className='size-4' aria-hidden='true' />
          </button>
        </div>
      </div>

      <p className='text-sm font-bold tracking-tight text-foreground'>{label}</p>

      <div className='flex gap-1.5' role='radiogroup' aria-label='Calendar view'>
        <button type='button' role='radio' aria-checked={view === Views.MONTH} onClick={() => onView(Views.MONTH)} className={pill(view === Views.MONTH)}>
          Month
        </button>
        <button type='button' role='radio' aria-checked={view === Views.WEEK} onClick={() => onView(Views.WEEK)} className={pill(view === Views.WEEK)}>
          Week
        </button>
      </div>
    </div>
  );
}
