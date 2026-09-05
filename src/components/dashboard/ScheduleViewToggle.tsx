'use client';

import { useState } from 'react';
import { CalendarDays, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarView, type CalendarViewEvent } from '@/components/dashboard/CalendarView';
import { EmptyState } from '@/components/dashboard/EmptyState';

/**
 * List / calendar toggle for the professor schedule page (Dashboard Stage 3 —
 * the Stage 2 comment "A calendar/list toggle arrives with Stage 3").
 * Defaults to the current list view (no regression); the calendar is opt-in.
 * The list node is server-rendered; only the visible branch is mounted.
 */

export function ScheduleViewToggle({
  events,
  list,
}: {
  /** Class sessions as calendar events (RBC converts UTC → IST wall). */
  events: CalendarViewEvent[];
  /** Server-rendered IST-day-grouped list. */
  list: React.ReactNode;
}) {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const pill = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150',
      active
        ? 'bg-ec-indigo text-white dark:bg-white dark:text-ec-indigo'
        : 'text-foreground/60 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
    );

  return (
    <div>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex gap-1.5' role='radiogroup' aria-label='Schedule view'>
          <button type='button' role='radio' aria-checked={view === 'list'} onClick={() => setView('list')} className={pill(view === 'list')}>
            <List className='size-4' aria-hidden='true' />
            List
          </button>
          <button
            type='button'
            role='radio'
            aria-checked={view === 'calendar'}
            onClick={() => setView('calendar')}
            className={pill(view === 'calendar')}
          >
            <CalendarDays className='size-4' aria-hidden='true' />
            Calendar
          </button>
        </div>
        {view === 'calendar' && (
          <p className='text-xs font-medium text-foreground/50'>All times shown are IST</p>
        )}
      </div>

      <div className='mt-4'>
        {view === 'list' ? (
          list
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title='Nothing on the calendar'
            description='Scheduled classes will appear here as calendar events.'
          />
        ) : (
          <div className='card-surface rounded-3xl p-4 sm:p-5'>
            <CalendarView events={events} />
          </div>
        )}
      </div>
    </div>
  );
}
