'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, Pencil, Play, RotateCcw, Trash2, X } from 'lucide-react';
import type { TaskDTO } from '@/lib/dashboard/tasks';
import { deleteTask, updateTaskStatus } from '@/lib/actions/tasks';
import { TaskForm } from '@/components/dashboard/TaskForm';
import { TASK_STATUS_DOT, TASK_STATUS_LABEL } from '@/components/dashboard/taskStatus';
import { cn } from '@/lib/utils';

/**
 * Three-column coursework board (Dashboard Stage 3). No drag library — status
 * buttons are the interaction (a11y-clean, zero deps). Display cards are
 * server-rendered RSC nodes keyed by task id; this client wrapper owns the
 * status buttons, edit-in-place and the two-step delete confirm, then calls
 * router.refresh() so the fresh RSC payloads (and the completion monitor in
 * the same panel) repaint under the still-active tab.
 */

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
type Column = (typeof COLUMNS)[number];

export function TaskBoard({
  courseId,
  tasks,
  taskNodes,
}: {
  courseId: string;
  /** Drives grouping + action rows; the server nodes are the visual content. */
  tasks: TaskDTO[];
  /** Server-rendered content per task, keyed by task id. */
  taskNodes: Record<string, React.ReactNode>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const byStatus = (status: Column) => tasks.filter((task) => task.status === status);

  const move = async (task: TaskDTO, status: Column) => {
    setBusyId(task.id);
    setError(null);
    const result = await updateTaskStatus(task.id, status);
    setBusyId(null);
    if (!result.ok) {
      setError(result.formError ?? 'Could not move the task.');
      return;
    }
    router.refresh();
  };

  const confirmDelete = async (task: TaskDTO) => {
    setBusyId(task.id);
    setError(null);
    const result = await deleteTask(task.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.formError ?? 'Could not delete the task.');
      return;
    }
    setDeletingId(null);
    router.refresh();
  };

  return (
    <div>
      {error && (
        <p className='mb-4 flex items-center gap-2 rounded-xl bg-ec-sky/50 px-3.5 py-2.5 text-sm text-foreground dark:bg-ec-canvas-deep/50'>
          <AlertTriangle className='size-4 shrink-0 text-ec-indigo dark:text-white' aria-hidden='true' />
          {error}
        </p>
      )}

      <div className='grid gap-4 md:grid-cols-3'>
        {COLUMNS.map((status) => (
          <section key={status} aria-label={`${TASK_STATUS_LABEL[status]} tasks`}>
            <h3 className='flex items-center gap-2 px-1 text-sm font-semibold text-foreground/70'>
              <span className={cn('size-2 rounded-full', TASK_STATUS_DOT[status])} aria-hidden='true' />
              {TASK_STATUS_LABEL[status]}
              <span className='rounded-full bg-ec-sky/70 px-2 py-0.5 text-[11px] font-bold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
                {byStatus(status).length}
              </span>
            </h3>

            <div className='mt-3 space-y-3'>
              {byStatus(status).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'rounded-2xl border p-4',
                    editingId === task.id
                      ? 'border-ec-sky bg-ec-sky/30 dark:border-ec-canvas-deep dark:bg-ec-canvas-deep/30'
                      : 'border-ec-sky bg-background dark:border-ec-canvas-deep'
                  )}
                >
                  {editingId === task.id ? (
                    <TaskForm
                      courseId={courseId}
                      mode='edit'
                      task={{
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        dueDate: task.dueDate,
                      }}
                      onDone={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      {taskNodes[task.id] ?? null}
                      <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ec-sky pt-2.5 text-sm dark:border-ec-canvas-deep'>
                        {status === 'TODO' && (
                          <button
                            type='button'
                            disabled={busyId === task.id}
                            onClick={() => void move(task, 'IN_PROGRESS')}
                            className='inline-flex items-center gap-1.5 font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground disabled:opacity-60'
                          >
                            {busyId === task.id ? <Spin /> : <Play className='size-3.5' aria-hidden='true' />}
                            Start
                          </button>
                        )}
                        {status === 'IN_PROGRESS' && (
                          <>
                            <button
                              type='button'
                              disabled={busyId === task.id}
                              onClick={() => void move(task, 'DONE')}
                              className='inline-flex items-center gap-1.5 font-semibold text-ec-success transition-colors duration-150 hover:text-foreground disabled:opacity-60'
                            >
                              {busyId === task.id ? <Spin /> : <Check className='size-3.5' aria-hidden='true' />}
                              Mark done
                            </button>
                            <button
                              type='button'
                              disabled={busyId === task.id}
                              onClick={() => void move(task, 'TODO')}
                              className='inline-flex items-center gap-1.5 font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground disabled:opacity-60'
                            >
                              <RotateCcw className='size-3.5' aria-hidden='true' />
                              Back to to-do
                            </button>
                          </>
                        )}
                        {status === 'DONE' && (
                          <button
                            type='button'
                            disabled={busyId === task.id}
                            onClick={() => void move(task, 'TODO')}
                            className='inline-flex items-center gap-1.5 font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground disabled:opacity-60'
                          >
                            <RotateCcw className='size-3.5' aria-hidden='true' />
                            Reopen
                          </button>
                        )}

                        <span className='ml-auto flex items-center gap-4'>
                          <button
                            type='button'
                            onClick={() => {
                              setEditingId(task.id);
                              setDeletingId(null);
                            }}
                            aria-label={`Edit ${task.title}`}
                            className='text-foreground/50 transition-colors duration-150 hover:text-foreground'
                          >
                            <Pencil className='size-3.5' aria-hidden='true' />
                          </button>

                          {deletingId === task.id ? (
                            <span className='inline-flex items-center gap-2'>
                              <button
                                type='button'
                                disabled={busyId === task.id}
                                onClick={() => void confirmDelete(task)}
                                className='font-semibold text-ec-error underline-offset-2 hover:underline disabled:opacity-60'
                              >
                                {busyId === task.id ? 'Deleting…' : 'Delete?'}
                              </button>
                              <button
                                type='button'
                                onClick={() => setDeletingId(null)}
                                aria-label='Keep the task'
                                className='text-foreground/50 transition-colors duration-150 hover:text-foreground'
                              >
                                <X className='size-3.5' aria-hidden='true' />
                              </button>
                            </span>
                          ) : (
                            <button
                              type='button'
                              onClick={() => {
                                setDeletingId(task.id);
                                setEditingId(null);
                              }}
                              aria-label={`Delete ${task.title}`}
                              className='text-foreground/50 transition-colors duration-150 hover:text-ec-error'
                            >
                              <Trash2 className='size-3.5' aria-hidden='true' />
                            </button>
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {byStatus(status).length === 0 && (
                <p className='rounded-2xl border border-dashed border-ec-sky px-4 py-6 text-center text-xs font-medium text-foreground/40 dark:border-ec-canvas-deep'>
                  Nothing here yet
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Spin() {
  return <span className='size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' aria-hidden='true' />;
}

