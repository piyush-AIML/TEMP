'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X, AlertTriangle } from 'lucide-react';
import type { ProfessorSessionDTO } from '@/lib/dashboard/professor';
import { cancelClassSession } from '@/lib/actions/sessions';
import { SessionForm } from '@/components/dashboard/SessionForm';

/**
 * Professor session manager list (Dashboard Stage 2). Display rows are
 * server-rendered (nodes keyed by session id — RSC payloads, never function
 * props); this client wrapper owns edit-in-place + the two-step cancel
 * confirm. Only SCHEDULED sessions are editable.
 */

export function SessionsManager({
  sessions,
  sessionNodes,
}: {
  sessions: ProfessorSessionDTO[];
  /** Server-rendered display per session, keyed by session id. */
  sessionNodes: Record<string, React.ReactNode>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmCancel = async (session: ProfessorSessionDTO) => {
    setBusyId(session.id);
    setError(null);
    const result = await cancelClassSession(session.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.formError ?? 'Could not cancel the class.');
      return;
    }
    setCancellingId(null);
    router.refresh();
  };

  if (sessions.length === 0) {
    return (
      <p className='rounded-2xl bg-ec-sky/40 px-4 py-6 text-center text-sm text-foreground/60 dark:bg-ec-canvas-deep/40'>
        No classes scheduled for this course yet.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className='mb-4 flex items-center gap-2 rounded-xl bg-ec-sky/50 px-3.5 py-2.5 text-sm text-foreground dark:bg-ec-canvas-deep/50'>
          <AlertTriangle className='size-4 shrink-0 text-ec-indigo dark:text-white' aria-hidden='true' />
          {error}
        </p>
      )}

      {/* SessionItem renders <li> rows itself — wrap in a div, never nest. */}
      <div className='divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
        {sessions.map((session) => (
          <div key={session.id}>
            {editingId === session.id ? (
              <div className='rounded-2xl border border-ec-sky bg-ec-sky/30 px-4 py-4 sm:px-5 dark:border-ec-canvas-deep dark:bg-ec-canvas-deep/30'>
                <SessionForm
                  courseId={session.courseId}
                  mode='edit'
                  session={{
                    id: session.id,
                    startsAt: session.startsAt,
                    endsAt: session.endsAt,
                    mode: session.mode,
                    link: session.link,
                    location: session.location,
                  }}
                  onDone={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className='py-2'>
                {sessionNodes[session.id] ?? null}
                {session.status === 'SCHEDULED' && (
                  <div className='flex items-center gap-5 pb-2 pl-1'>
                    <button
                      type='button'
                      onClick={() => {
                        setEditingId(session.id);
                        setCancellingId(null);
                      }}
                      className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
                    >
                      <Pencil className='size-3.5' aria-hidden='true' />
                      Edit
                    </button>

                    {cancellingId === session.id ? (
                      <span className='inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                        <span className='inline-flex items-center gap-1.5 font-semibold text-foreground'>
                          <AlertTriangle className='size-3.5 text-ec-indigo dark:text-white' aria-hidden='true' />
                          Cancel this class for everyone?
                        </span>
                        <button
                          type='button'
                          disabled={busyId === session.id}
                          onClick={() => void confirmCancel(session)}
                          className='font-semibold text-foreground underline-offset-2 hover:underline disabled:opacity-60'
                        >
                          {busyId === session.id ? 'Cancelling…' : 'Yes, cancel'}
                        </button>
                        <button
                          type='button'
                          onClick={() => setCancellingId(null)}
                          aria-label='Keep the class'
                          className='rounded-lg p-1 text-foreground/50 transition-colors duration-150 hover:text-foreground'
                        >
                          <X className='size-4' aria-hidden='true' />
                        </button>
                      </span>
                    ) : (
                      <button
                        type='button'
                        onClick={() => {
                          setCancellingId(session.id);
                          setEditingId(null);
                        }}
                        className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
                      >
                        Cancel class
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
