'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { LoaderCircle, Save } from 'lucide-react';
import { updateCourse } from '@/lib/actions/courses';
import type { ActionResult } from '@/lib/actions/types';
import { COURSE_VERTICALS, verticalLabel } from '@/lib/validators/courses';

/**
 * Admin course-details editor (course-allocation rework 2026-09-05) — edit a
 * course's code / title / vertical / description in place on the manage page.
 * The code stays unique (the domain excludes this course from the check);
 * changing it flows to every surface that renders it via the action's
 * revalidations. Values stay put after save (this is an editor, not a
 * creator) — only a refresh of the server-rendered header follows.
 */

export function CourseDetailsForm({
  course,
}: {
  course: { id: string; code: string; title: string; vertical: string; description: string | null };
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateCourse, { ok: true } as ActionResult);
  const errors = state.ok ? {} : (state.fieldErrors ?? {});

  const [code, setCode] = useState(course.code);
  const [title, setTitle] = useState(course.title);
  const [vertical, setVertical] = useState(course.vertical);
  const [description, setDescription] = useState(course.description ?? '');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (state.ok && state.message) router.refresh();
    setShowResult(true);
  }, [state, router]);

  return (
    <form action={formAction} className='space-y-4'>
      <input type='hidden' name='courseId' value={course.id} />
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Course code
          </span>
          <input
            type='text'
            name='code'
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              setShowResult(false);
            }}
            maxLength={20}
            required
            className={inputClasses}
          />
          {errors.code && <span className='mt-1.5 block text-sm text-red-600 dark:text-red-400'>{errors.code}</span>}
        </label>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Programme vertical
          </span>
          <select
            name='vertical'
            value={vertical}
            onChange={(event) => {
              setVertical(event.target.value);
              setShowResult(false);
            }}
            required
            className={selectClasses}
          >
            {COURSE_VERTICALS.map((item) => (
              <option key={item} value={item}>
                {verticalLabel[item]}
              </option>
            ))}
          </select>
          {errors.vertical && (
            <span className='mt-1.5 block text-sm text-red-600 dark:text-red-400'>{errors.vertical}</span>
          )}
        </label>
      </div>

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Course title
        </span>
        <input
          type='text'
          name='title'
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setShowResult(false);
          }}
          maxLength={120}
          required
          className={inputClasses}
        />
        {errors.title && <span className='mt-1.5 block text-sm text-red-600 dark:text-red-400'>{errors.title}</span>}
      </label>

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Description <span className='normal-case tracking-normal text-foreground/40'>(optional)</span>
        </span>
        <textarea
          name='description'
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setShowResult(false);
          }}
          rows={3}
          maxLength={2000}
          placeholder='What this course covers and who it is for.'
          className='w-full resize-y rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40'
        />
        {errors.description && (
          <span className='mt-1.5 block text-sm text-red-600 dark:text-red-400'>{errors.description}</span>
        )}
      </label>

      <div className='space-y-3'>
        {showResult && !state.ok && state.formError && (
          <p className='text-sm text-red-600 dark:text-red-400'>{state.formError}</p>
        )}
        {showResult && state.ok && state.message && (
          <p className='rounded-xl bg-ec-sky/70 px-3.5 py-2.5 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            {state.message}
          </p>
        )}
        <SaveRow />
      </div>
    </form>
  );
}

function SaveRow() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex items-center gap-2 rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:opacity-60 dark:bg-white dark:text-ec-indigo'
    >
      {pending && <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />}
      <Save className='size-4' aria-hidden='true' />
      Save changes
    </button>
  );
}

const inputClasses =
  'w-full rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40';
const selectClasses = `${inputClasses} appearance-none`;
