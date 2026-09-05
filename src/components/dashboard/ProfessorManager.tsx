'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LoaderCircle, UserRoundPlus, Users, X } from 'lucide-react';
import type { AdminCourseProfessorDTO } from '@/lib/dashboard/admin';
import { addCourseProfessors, removeCourseProfessor } from '@/lib/actions/courses';
import { EmailChipInput } from '@/components/dashboard/EmailChipInput';

/**
 * Professor assignment manager (course-allocation rework 2026-09-05) — the
 * admin manage page's professor surface: current professors with a two-step
 * Remove, and an add-by-email chip input below. Adding reports partial
 * outcomes honestly (added / already assigned / could-not-assign with
 * reasons); removing the last professor is allowed with explicit copy — the
 * course just sits un-owned until one is added.
 */

export function ProfessorManager({
  courseId,
  professors,
}: {
  courseId: string;
  professors: AdminCourseProfessorDTO[];
}) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [emails, setEmails] = useState<string[]>([]);

  const remove = async (professor: AdminCourseProfessorDTO) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const result = await removeCourseProfessor(courseId, professor.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? 'Could not remove that professor.');
      return;
    }
    setConfirmingId(null);
    setMessage(result.message ?? `${professor.name} was removed.`);
    router.refresh();
  };

  const assign = async () => {
    if (emails.length === 0) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    const result = await addCourseProfessors(courseId, emails);
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? 'Could not add those professors.');
      return;
    }
    setEmails([]);
    setMessage(result.message ?? 'Professors added.');
    router.refresh();
  };

  return (
    <div className='space-y-6'>
      {error && (
        <p className='flex items-center gap-2 rounded-xl bg-ec-sky/50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-ec-canvas-deep/50 dark:text-red-400'>
          <AlertTriangle className='size-4 shrink-0' aria-hidden='true' />
          {error}
        </p>
      )}
      {message && (
        <p className='rounded-xl bg-ec-sky/70 px-3.5 py-2.5 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          {message}
        </p>
      )}

      <div className='card-surface overflow-hidden rounded-3xl'>
        {professors.length === 0 ? (
          <div className='flex items-start gap-4 p-6'>
            <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
              <Users className='size-5' aria-hidden='true' />
            </div>
            <div>
              <p className='font-semibold'>No professors assigned yet</p>
              <p className='mt-1 text-sm text-foreground/60'>
                A course needs at least one professor to schedule classes and enrol students — add one below.
              </p>
            </div>
          </div>
        ) : (
          <ul className='divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
            {professors.map((professor) => (
              <li key={professor.id} className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3.5'>
                <div className='min-w-0'>
                  <p className='font-medium'>{professor.name}</p>
                  <p className='truncate text-sm text-foreground/60'>{professor.email}</p>
                </div>
                {confirmingId === professor.id ? (
                  <span className='inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm'>
                    <span className='inline-flex items-center gap-1.5 font-semibold text-foreground'>
                      <AlertTriangle className='size-3.5 text-ec-indigo dark:text-white' aria-hidden='true' />
                      Remove {professor.name.split(' ')[0]}?
                      {professors.length === 1 && (
                        <span className='hidden font-normal text-foreground/50 lg:inline'>
                          This course will have no professor until one is added.
                        </span>
                      )}
                    </span>
                    <button
                      type='button'
                      disabled={busy}
                      onClick={() => void remove(professor)}
                      className='font-semibold text-red-600 underline-offset-2 hover:underline disabled:opacity-60 dark:text-red-400'
                    >
                      {busy ? 'Removing…' : 'Yes, remove'}
                    </button>
                    <button
                      type='button'
                      onClick={() => setConfirmingId(null)}
                      aria-label='Keep the professor assigned'
                      className='rounded-lg p-1 text-foreground/50 transition-colors duration-150 hover:text-foreground'
                    >
                      <X className='size-4' aria-hidden='true' />
                    </button>
                  </span>
                ) : (
                  <button
                    type='button'
                    onClick={() => setConfirmingId(professor.id)}
                    className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-red-600 dark:hover:text-red-400'
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className='flex items-center gap-2 text-sm font-semibold'>
          <UserRoundPlus className='size-4 text-foreground/50' aria-hidden='true' />
          Add a professor
        </h3>
        <p className='mt-1 text-sm text-foreground/60'>
          They must be Educraft professor accounts — signed in once, not just invited.
        </p>
        <div className='card-surface mt-3 max-w-2xl rounded-3xl p-4'>
          <div className='space-y-3'>
            <EmailChipInput emails={emails} onChange={setEmails} placeholder='professor@example.com' />
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => void assign()}
                disabled={busy || emails.length === 0}
                className='inline-flex items-center gap-2 rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:opacity-50 dark:bg-white dark:text-ec-indigo'
              >
                {busy && <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />}
                {emails.length > 0
                  ? `Assign ${emails.length} professor${emails.length === 1 ? '' : 's'} to the course`
                  : 'Assign professor'}
              </button>
              {emails.length > 0 && !busy && (
                <button
                  type='button'
                  onClick={() => setEmails([])}
                  className='text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
