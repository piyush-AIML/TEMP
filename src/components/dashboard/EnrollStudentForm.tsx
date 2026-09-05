'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { LoaderCircle, UserPlus } from 'lucide-react';
import { enrollStudent } from '@/lib/actions/courses';
import type { ActionResult } from '@/lib/actions/types';

/**
 * Professor enroll-a-student form (course slice) — lives above the Roster
 * table on the course page. Enrollment needs the student's account row, which
 * only exists after they signed in once (invite acceptance alone is not
 * enough) — the domain error says exactly that. On success the roster list
 * and the professor's meeting-student picker repaint via router.refresh()
 * (the revalidatePath in the action clears the router cache for everyone).
 */

export function EnrollStudentForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(enrollStudent, { ok: true } as ActionResult);
  const [email, setEmail] = useState('');
  const errors = state.ok ? {} : (state.fieldErrors ?? {});
  const [sawSuccess, setSawSuccess] = useState(false);

  // Repaint the roster + picker once after a successful enrolment (the action
  // already revalidated both role layouts server-side).
  useEffect(() => {
    if (state.ok && state.message && !sawSuccess) {
      setSawSuccess(true);
      setEmail('');
      router.refresh();
    }
  }, [state, sawSuccess, router]);

  return (
    <div>
      <form action={formAction} className='flex flex-col gap-3 sm:flex-row sm:items-start'>
        <input type='hidden' name='courseId' value={courseId} />
        <label className='min-w-0 flex-1'>
          <span className='sr-only'>Student account email</span>
          <input
            type='email'
            name='email'
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSawSuccess(false);
            }}
            placeholder='student@example.com'
            autoComplete='off'
            required
            className={inputClasses}
          />
          {errors.email && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.email}</span>}
        </label>
        <SubmitButton />
      </form>
      {!state.ok && state.formError && (
        <p className='mt-2 text-sm text-foreground/70'>{state.formError}</p>
      )}
      {state.ok && state.message && (
        <p className='mt-2 rounded-xl bg-ec-sky/70 px-3.5 py-2.5 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          {state.message}
        </p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex shrink-0 items-center gap-2 rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:opacity-60 dark:bg-white dark:text-ec-indigo'
    >
      {pending ? <LoaderCircle className='size-4 animate-spin' aria-hidden='true' /> : <UserPlus className='size-4' aria-hidden='true' />}
      Enroll student
    </button>
  );
}

const inputClasses =
  'w-full rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40';
