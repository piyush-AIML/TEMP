'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ClipboardPlus, LoaderCircle } from 'lucide-react';
import { createTask, updateTask } from '@/lib/actions/tasks';
import type { ActionResult } from '@/lib/actions/types';
import { toDateOnlyIST } from '@/lib/ist';

/**
 * Coursework task form (Dashboard Stage 3). Title + description + optional
 * due date (IST date-only). Create mode lives on the Planner tab; edit mode
 * swaps in place on the board. Mirrors SessionForm's action-state pattern.
 */

export function TaskForm({
  courseId,
  mode = 'create',
  task,
  onDone,
}: {
  courseId: string;
  mode?: 'create' | 'edit';
  task?: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
  };
  onDone?: () => void;
}) {
  const action = mode === 'edit' && task ? updateTask : createTask;
  const [state, formAction] = useActionState(action, { ok: true } as ActionResult);

  const initial = task
    ? {
        title: task.title,
        description: task.description ?? '',
        dueDate: task.dueDate ? toDateOnlyIST(task.dueDate) : '',
      }
    : { title: '', description: '', dueDate: '' };

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [dueDate, setDueDate] = useState(initial.dueDate);

  const errors = state.ok ? {} : (state.fieldErrors ?? {});

  return (
    <form action={formAction} className='space-y-4'>
      <input type='hidden' name='courseId' value={courseId} />
      {task && <input type='hidden' name='taskId' value={task.id} />}

      <div className='grid gap-4 sm:grid-cols-[1fr_auto]'>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Task title
          </span>
          <input
            type='text'
            name='title'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder='Physics revision grid — week 1'
            maxLength={200}
            required
            className={inputClasses}
          />
          {errors.title && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.title}</span>}
        </label>
        <label className='block sm:w-48'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Due date <span className='normal-case tracking-normal text-foreground/40'>(IST, optional)</span>
          </span>
          <input
            type='date'
            name='dueDate'
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={inputClasses}
          />
          {errors.dueDate && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.dueDate}</span>}
        </label>
      </div>

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Description <span className='normal-case tracking-normal text-foreground/40'>(optional)</span>
        </span>
        <textarea
          name='description'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder='What should the class do, and what does done look like?'
          className={cnTextArea}
        />
        {errors.description && (
          <span className='mt-1.5 block text-sm text-foreground/70'>{errors.description}</span>
        )}
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
            <ClipboardPlus className='size-4' aria-hidden='true' />
            Add task
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
const cnTextArea =
  'w-full resize-y rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40';
