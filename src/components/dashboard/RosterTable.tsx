'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Users, X } from 'lucide-react';
import type { RosterRowDTO } from '@/lib/dashboard/professor';
import { unenrollStudent } from '@/lib/actions/courses';
import { EmptyState } from '@/components/dashboard/EmptyState';

/**
 * Student roster for one course (Stage 2 table, course-allocation rework
 * 2026-09-05) — ACTIVE enrollments with a two-step Remove action per row
 * (soft drop to DROPPED: the student keeps their history and can be enrolled
 * again from the form above; they receive an ENROLLMENT notification).
 * Display rows are server-fed DTOs; this client table owns the confirm
 * state and refreshes the page after the direct action succeeds.
 */

export function RosterTable({ courseId, roster }: { courseId: string; roster: RosterRowDTO[] }) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (roster.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title='No enrolled students yet'
        description='When students are enrolled in this course, they will appear here.'
      />
    );
  }

  const confirmRemove = async (row: RosterRowDTO) => {
    setBusyId(row.studentId);
    setError(null);
    const result = await unenrollStudent(courseId, row.studentId);
    setBusyId(null);
    if (!result.ok) {
      setError(result.formError ?? 'Could not remove that student.');
      return;
    }
    setConfirmingId(null);
    router.refresh();
  };

  return (
    <div className='card-surface overflow-hidden rounded-3xl'>
      {error && (
        <p className='flex items-center gap-2 border-b border-ec-sky px-6 py-3 text-sm text-red-600 dark:border-ec-canvas-deep dark:text-red-400'>
          <AlertTriangle className='size-4 shrink-0' aria-hidden='true' />
          {error}
        </p>
      )}
      <table className='w-full text-left text-sm'>
        <caption className='sr-only'>Students enrolled in this course</caption>
        <thead>
          <tr className='border-b border-ec-sky text-xs uppercase tracking-widest text-foreground/50 dark:border-ec-canvas-deep'>
            <th scope='col' className='px-6 py-3.5 font-semibold'>
              Student
            </th>
            <th scope='col' className='hidden px-6 py-3.5 font-semibold sm:table-cell'>
              Email
            </th>
            <th scope='col' className='px-6 py-3.5 text-right font-semibold'>
              <span className='sr-only'>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
          {roster.map((row) => (
            <tr key={row.studentId}>
              <td className='px-6 py-3.5 font-medium'>{row.name}</td>
              <td className='hidden px-6 py-3.5 text-foreground/60 sm:table-cell'>{row.email}</td>
              <td className='px-6 py-3.5 text-right'>
                {confirmingId === row.studentId ? (
                  <span className='inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm'>
                    <span className='inline-flex items-center gap-1.5 font-semibold text-foreground'>
                      <AlertTriangle className='size-3.5 text-ec-indigo dark:text-white' aria-hidden='true' />
                      Remove {row.name.split(' ')[0]} from this course?
                      <span className='hidden font-normal text-foreground/50 xl:inline'>
                        They can be enrolled again anytime.
                      </span>
                    </span>
                    <button
                      type='button'
                      disabled={busyId === row.studentId}
                      onClick={() => void confirmRemove(row)}
                      className='font-semibold text-red-600 underline-offset-2 hover:underline disabled:opacity-60 dark:text-red-400'
                    >
                      {busyId === row.studentId ? 'Removing…' : 'Yes, remove'}
                    </button>
                    <button
                      type='button'
                      onClick={() => setConfirmingId(null)}
                      aria-label='Keep the student enrolled'
                      className='rounded-lg p-1 text-foreground/50 transition-colors duration-150 hover:text-foreground'
                    >
                      <X className='size-4' aria-hidden='true' />
                    </button>
                  </span>
                ) : (
                  <button
                    type='button'
                    onClick={() => setConfirmingId(row.studentId)}
                    className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-red-600 dark:hover:text-red-400'
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
