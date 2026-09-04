'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CalendarPlus, LoaderCircle } from 'lucide-react';
import { createClassSession, updateClassSession } from '@/lib/actions/sessions';
import type { ActionResult } from '@/lib/actions/types';
import { toDatetimeLocalIST, addMinutesIST } from '@/lib/ist';
import { cn } from '@/lib/utils';

/**
 * Class-session form (Dashboard Stage 2). datetime-local inputs labelled IST:
 * the browser emits a plain wall time, the server interprets it as IST and
 * stores UTC; the prefilled values for edits are converted back to IST wall
 * time client-side (toDatetimeLocalIST) so the round trip is stable regardless
 * of the user's device timezone. `mode` toggles which of link/location shows.
 */

export type SessionFormCourse = { id: string; title: string; code: string };

export function SessionForm({
  courseId,
  courses,
  mode = 'create',
  session,
  onDone,
}: {
  courseId?: string; // fixed course (course pages); otherwise a course select
  courses?: SessionFormCourse[];
  mode?: 'create' | 'edit';
  session?: {
    id: string;
    startsAt: string;
    endsAt: string;
    mode: 'ONLINE' | 'IN_PERSON';
    link: string | null;
    location: string | null;
  };
  onDone?: () => void;
}) {
  const action = mode === 'edit' && session ? updateClassSession : createClassSession;
  const [state, formAction] = useActionState(action, { ok: true } as ActionResult);

  const initial = session
    ? {
        startsAt: toDatetimeLocalIST(session.startsAt),
        endsAt: toDatetimeLocalIST(session.endsAt),
        mode: session.mode,
        link: session.link ?? '',
        location: session.location ?? '',
      }
    : { startsAt: '', endsAt: '', mode: 'ONLINE' as const, link: '', location: '' };

  const [startsAt, setStartsAt] = useState(initial.startsAt);
  const [endsAt, setEndsAt] = useState(initial.endsAt);
  const [formMode, setFormMode] = useState<'ONLINE' | 'IN_PERSON'>(initial.mode);
  const [link, setLink] = useState(initial.link);
  const [location, setLocation] = useState(initial.location);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId ?? courses?.[0]?.id ?? '');

  const errors = state.ok ? {} : (state.fieldErrors ?? {});

  // Set the end time to start + 90 min when the start changes and end is
  // empty (create mode only).
  const onStartChange = (value: string) => {
    setStartsAt(value);
    if (mode === 'create' && !endsAt) setEndsAt(addMinutesIST(value, 90));
  };

  return (
    <form action={formAction} className='space-y-4'>
      {session && <input type='hidden' name='sessionId' value={session.id} />}

      {!courseId && (
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Course
          </span>
          <select
            name='courseId'
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className={selectClasses}
            required
          >
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.code})
              </option>
            ))}
          </select>
          {errors.courseId && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.courseId}</span>}
        </label>
      )}
      {courseId && <input type='hidden' name='courseId' value={courseId} />}

      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Starts <span className='normal-case tracking-normal text-foreground/40'>(IST)</span>
          </span>
          <input
            type='datetime-local'
            name='startsAt'
            value={startsAt}
            onChange={(event) => onStartChange(event.target.value)}
            required
            className={inputClasses}
          />
          {errors.startsAt && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.startsAt}</span>}
        </label>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Ends <span className='normal-case tracking-normal text-foreground/40'>(IST)</span>
          </span>
          <input
            type='datetime-local'
            name='endsAt'
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            required
            className={inputClasses}
          />
          {errors.endsAt && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.endsAt}</span>}
        </label>
      </div>

      <div className='flex gap-1.5' role='radiogroup' aria-label='Class mode'>
        {(['ONLINE', 'IN_PERSON'] as const).map((value) => (
          <button
            key={value}
            type='button'
            role='radio'
            aria-checked={formMode === value}
            onClick={() => {
              setFormMode(value);
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150',
              formMode === value
                ? 'bg-ec-indigo text-white dark:bg-white dark:text-ec-indigo'
                : 'text-foreground/60 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
            )}
          >
            {value === 'ONLINE' ? 'Online' : 'In person'}
          </button>
        ))}
        <input type='hidden' name='mode' value={formMode} />
      </div>

      {formMode === 'ONLINE' ? (
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Join link <span className='normal-case tracking-normal text-foreground/40'>(optional)</span>
          </span>
          <input
            type='text'
            name='link'
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder='https://meet…'
            className={inputClasses}
          />
          {errors.link && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.link}</span>}
        </label>
      ) : (
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Venue <span className='normal-case tracking-normal text-foreground/40'>(optional)</span>
          </span>
          <input
            type='text'
            name='location'
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder='Educraft Studio, Bangalore'
            maxLength={200}
            className={inputClasses}
          />
          {errors.location && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.location}</span>}
        </label>
      )}

      <div className='space-y-3'>
        {!state.ok && state.formError && <p className='text-sm text-foreground/70'>{state.formError}</p>}
        {state.ok && state.message && (
          <p className='rounded-xl bg-ec-sky/70 px-3.5 py-2.5 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            {state.message}
          </p>
        )}
        <SubmitRow mode={mode} onDone={onDone} />
      </div>
    </form>
  );
}

function SubmitRow({ mode, onDone }: { mode: 'create' | 'edit'; onDone?: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className='flex items-center gap-3'>
      <button
        type='submit'
        disabled={pending}
        className='inline-flex items-center gap-2 rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:opacity-60 dark:bg-white dark:text-ec-indigo'
      >
        {pending && <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />}
        {mode === 'create' ? (
          <>
            <CalendarPlus className='size-4' aria-hidden='true' />
            Schedule class
          </>
        ) : (
          'Save changes'
        )}
      </button>
      {mode === 'edit' && onDone && (
        <button
          type='button'
          onClick={onDone}
          className='text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
        >
          Cancel
        </button>
      )}
    </div>
  );
}

const inputClasses =
  'w-full rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40';
const selectClasses = cn(inputClasses, 'appearance-none');
