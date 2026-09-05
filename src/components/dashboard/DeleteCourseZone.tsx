'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react';
import { deleteCourse } from '@/lib/actions/courses';

/**
 * Course delete danger zone (course-allocation rework 2026-09-05). Deleting a
 * course cascades to its classes, materials (including stored files), tasks,
 * completion logs and enrollments — so this is deliberately two-stepped AND
 * typed-code-gated (the code must be typed exactly) before the delete action
 * runs. Accounts are never touched. On success the page leaves for the
 * courses index (the action already revalidated every role layout).
 */

export function DeleteCourseZone({
  course,
}: {
  course: { id: string; code: string; title: string };
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [typedCode, setTypedCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    setBusy(true);
    setError(null);
    const result = await deleteCourse(course.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? 'Could not delete the course.');
      return;
    }
    router.push('/dashboard/admin/courses');
  };

  const canDelete = !busy && armed && typedCode === course.code;

  return (
    <div className='card-surface rounded-3xl border border-red-300/60 p-5 sm:p-6 dark:border-red-400/20'>
      <h3 className='flex items-center gap-2 font-semibold text-red-700 dark:text-red-300'>
        <AlertTriangle className='size-5' aria-hidden='true' />
        Danger zone
      </h3>
      <p className='mt-2 max-w-2xl text-sm leading-relaxed text-foreground/70'>
        Deleting <span className='font-semibold'>{course.title}</span> permanently removes its classes,
        materials (including stored files), coursework tasks and every enrolment — for students and professors
        alike. Student and professor accounts themselves are never touched.
      </p>

      {!armed ? (
        <button
          type='button'
          onClick={() => setArmed(true)}
          className='mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300/80 px-4 py-2 text-sm font-semibold text-red-700 transition-colors duration-150 hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-400/10'
        >
          <Trash2 className='size-4' aria-hidden='true' />
          Delete this course
        </button>
      ) : (
        <div className='mt-4 rounded-2xl border border-red-300/70 bg-red-50/60 p-4 sm:p-5 dark:border-red-400/20 dark:bg-red-400/5'>
          {error && (
            <p className='mb-3 text-sm text-red-700 dark:text-red-300'>{error}</p>
          )}
          <label className='block'>
            <span className='text-sm font-medium text-foreground/80'>
              Type <span className='rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs font-bold text-red-800 dark:bg-red-400/20 dark:text-red-200'>{course.code}</span>{' '}
              to confirm this cannot be undone.
            </span>
            <input
              type='text'
              value={typedCode}
              onChange={(event) => {
                setTypedCode(event.target.value.toUpperCase());
                setError(null);
              }}
              placeholder={course.code}
              autoComplete='off'
              spellCheck={false}
              className='mt-2 w-full max-w-sm rounded-xl border border-red-300/70 bg-background px-3.5 py-2.5 font-mono text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-red-500 dark:border-red-400/30 dark:focus:border-red-300'
            />
          </label>
          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <button
              type='button'
              disabled={!canDelete}
              onClick={() => void confirmDelete()}
              className='inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-red-700 disabled:opacity-40'
            >
              {busy && <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />}
              <Trash2 className='size-4' aria-hidden='true' />
              {busy ? 'Deleting…' : 'Delete permanently'}
            </button>
            <button
              type='button'
              onClick={() => {
                setArmed(false);
                setTypedCode('');
                setError(null);
              }}
              disabled={busy}
              className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground disabled:opacity-50'
            >
              <X className='size-4' aria-hidden='true' />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
