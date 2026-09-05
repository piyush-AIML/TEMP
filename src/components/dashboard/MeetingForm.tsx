'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CalendarPlus, LoaderCircle } from 'lucide-react';
import { createMeeting, updateMeeting } from '@/lib/actions/meetings';
import type { ActionResult } from '@/lib/actions/types';
import { addMinutesIST, toDatetimeLocalIST } from '@/lib/ist';
import { cn } from '@/lib/utils';

/**
 * One-on-one meeting form (Dashboard Stage 3) — mirrors SessionForm: IST
 * datetime-local inputs (wall times interpreted IST server-side), a
 * withWhom pill group, and a conditional student picker that appears only for
 * STUDENT meetings. Switching away from Student clears the selection so a
 * stale id can never ride along in the hidden input.
 */

export type MeetingFormStudent = { studentId: string; name: string };
type WithWhom = 'STUDENT' | 'PARENT' | 'OTHER';

export function MeetingForm({
  students,
  mode = 'create',
  meeting,
  onDone,
}: {
  students: MeetingFormStudent[];
  mode?: 'create' | 'edit';
  meeting?: {
    id: string;
    title: string;
    withWhom: WithWhom;
    studentId: string | null;
    /** The linked student's name — shown only when they left the roster
     *  (their id alone would be a meaningless select label). */
    studentName: string | null;
    startsAt: string;
    endsAt: string;
    link: string | null;
  };
  onDone?: () => void;
}) {
  const action = mode === 'edit' && meeting ? updateMeeting : createMeeting;
  const [state, formAction] = useActionState(action, { ok: true } as ActionResult);

  const initial = meeting
    ? {
        title: meeting.title,
        withWhom: meeting.withWhom,
        studentId: meeting.studentId ?? '',
        startsAt: toDatetimeLocalIST(meeting.startsAt),
        endsAt: toDatetimeLocalIST(meeting.endsAt),
        link: meeting.link ?? '',
      }
    : { title: '', withWhom: 'STUDENT' as WithWhom, studentId: '', startsAt: '', endsAt: '', link: '' };

  const [title, setTitle] = useState(initial.title);
  const [withWhom, setWithWhom] = useState<WithWhom>(initial.withWhom);
  const [studentId, setStudentId] = useState(initial.studentId);
  const [startsAt, setStartsAt] = useState(initial.startsAt);
  const [endsAt, setEndsAt] = useState(initial.endsAt);
  const [link, setLink] = useState(initial.link);

  const errors = state.ok ? {} : (state.fieldErrors ?? {});

  // Editing a meeting whose student left the roster: keep the option visible
  // but disabled so the select never silently flips to another student.
  const linkedStudentKnown =
    mode === 'edit' && meeting?.studentId
      ? students.some((student) => student.studentId === meeting.studentId)
      : true;

  const onStartChange = (value: string) => {
    setStartsAt(value);
    if (mode === 'create' && !endsAt) setEndsAt(addMinutesIST(value, 60));
  };

  const pickWithWhom = (value: WithWhom) => {
    setWithWhom(value);
    if (value !== 'STUDENT') setStudentId('');
  };

  return (
    <form action={formAction} className='space-y-4'>
      {meeting && <input type='hidden' name='meetingId' value={meeting.id} />}

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Title
        </span>
        <input
          type='text'
          name='title'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder='Mock test review'
          maxLength={120}
          required
          className={inputClasses}
        />
        {errors.title && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.title}</span>}
      </label>

      <div className='space-y-2'>
        <span className='block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          With
        </span>
        <div className='flex gap-1.5' role='radiogroup' aria-label='Who the meeting is with'>
          {(['STUDENT', 'PARENT', 'OTHER'] as const).map((value) => (
            <button
              key={value}
              type='button'
              role='radio'
              aria-checked={withWhom === value}
              onClick={() => pickWithWhom(value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150',
                withWhom === value
                  ? 'bg-ec-indigo text-white dark:bg-white dark:text-ec-indigo'
                  : 'text-foreground/60 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
              )}
            >
              {value === 'STUDENT' ? 'Student' : value === 'PARENT' ? 'Parent' : 'Other'}
            </button>
          ))}
        </div>
        <input type='hidden' name='withWhom' value={withWhom} />
      </div>

      {withWhom === 'STUDENT' && (
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Student
          </span>
          <select
            name='studentId'
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className={selectClasses}
            required
          >
            <option value='' disabled>
              Choose a student from your classes…
            </option>
            {students.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.name}
              </option>
            ))}
            {mode === 'edit' && meeting?.studentId && !linkedStudentKnown && (
              <option value={meeting.studentId} disabled>
                {meeting.studentName ?? 'Linked student'} (no longer in your classes)
              </option>
            )}
          </select>
          {errors.studentId && (
            <span className='mt-1.5 block text-sm text-foreground/70'>{errors.studentId}</span>
          )}
        </label>
      )}

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
            Schedule meeting
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
