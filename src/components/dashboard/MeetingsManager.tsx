'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X, AlertTriangle } from 'lucide-react';
import type { MeetingDTO } from '@/lib/dashboard/meetings';
import { cancelMeeting } from '@/lib/actions/meetings';
import { MeetingForm, type MeetingFormStudent } from '@/components/dashboard/MeetingForm';

/**
 * Professor meeting list manager (Dashboard Stage 3) — mirrors SessionsManager:
 * display rows are server-rendered RSC nodes keyed by meeting id; this client
 * wrapper owns edit-in-place (MeetingForm swap) + the two-step cancel confirm.
 * The list is fed only SCHEDULED meetings, so every row is editable.
 */

export function MeetingsManager({
  meetings,
  meetingNodes,
  students,
}: {
  meetings: MeetingDTO[];
  /** Server-rendered display per meeting, keyed by meeting id. */
  meetingNodes: Record<string, React.ReactNode>;
  students: MeetingFormStudent[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmCancel = async (meeting: MeetingDTO) => {
    setBusyId(meeting.id);
    setError(null);
    const result = await cancelMeeting(meeting.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.formError ?? 'Could not cancel the meeting.');
      return;
    }
    setCancellingId(null);
    router.refresh();
  };

  if (meetings.length === 0) {
    return (
      <p className='rounded-2xl bg-ec-sky/40 px-4 py-6 text-center text-sm text-foreground/60 dark:bg-ec-canvas-deep/40'>
        No meetings scheduled yet.
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

      {/* MeetingItem renders <li> rows itself — wrap in a div, never nest. */}
      <div className='divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
        {meetings.map((meeting) => (
          <div key={meeting.id}>
            {editingId === meeting.id ? (
              <div className='rounded-2xl border border-ec-sky bg-ec-sky/30 px-4 py-4 sm:px-5 dark:border-ec-canvas-deep dark:bg-ec-canvas-deep/30'>
                <MeetingForm
                  students={students}
                  mode='edit'
                  meeting={{
                    id: meeting.id,
                    title: meeting.title,
                    withWhom: meeting.withWhom,
                    studentId: meeting.studentId,
                    studentName: meeting.studentName,
                    startsAt: meeting.startsAt,
                    endsAt: meeting.endsAt,
                    link: meeting.link,
                  }}
                  onDone={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className='py-2'>
                {meetingNodes[meeting.id] ?? null}
                <div className='flex items-center gap-5 pb-2 pl-1'>
                  <button
                    type='button'
                    onClick={() => {
                      setEditingId(meeting.id);
                      setCancellingId(null);
                    }}
                    className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
                  >
                    <Pencil className='size-3.5' aria-hidden='true' />
                    Edit
                  </button>

                  {cancellingId === meeting.id ? (
                    <span className='inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                      <span className='inline-flex items-center gap-1.5 font-semibold text-foreground'>
                        <AlertTriangle className='size-3.5 text-ec-indigo dark:text-white' aria-hidden='true' />
                        Cancel this meeting?
                        {meeting.studentName && <> The student will be notified.</>}
                      </span>
                      <button
                        type='button'
                        disabled={busyId === meeting.id}
                        onClick={() => void confirmCancel(meeting)}
                        className='font-semibold text-foreground underline-offset-2 hover:underline disabled:opacity-60'
                      >
                        {busyId === meeting.id ? 'Cancelling…' : 'Yes, cancel'}
                      </button>
                      <button
                        type='button'
                        onClick={() => setCancellingId(null)}
                        aria-label='Keep the meeting'
                        className='rounded-lg p-1 text-foreground/50 transition-colors duration-150 hover:text-foreground'
                      >
                        <X className='size-4' aria-hidden='true' />
                      </button>
                    </span>
                  ) : (
                    <button
                      type='button'
                      onClick={() => {
                        setCancellingId(meeting.id);
                        setEditingId(null);
                      }}
                      className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
                    >
                      Cancel meeting
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
