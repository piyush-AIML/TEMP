'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { BookPlus, LoaderCircle } from 'lucide-react';
import { createCourse } from '@/lib/actions/courses';
import type { ActionResult } from '@/lib/actions/types';
import { COURSE_VERTICALS, verticalLabel } from '@/lib/validators/courses';

/**
 * Admin course-creation form (course slice). Code/title/vertical/description
 * plus the professors to assign (comma-separated emails — co-teaching is a
 * CourseProfessors join, so a course can have several). Professors must have
 * signed in once (invite acceptance alone does not create their account row).
 */

export function CourseForm() {
  const [state, formAction] = useActionState(createCourse, { ok: true } as ActionResult);
  const errors = state.ok ? {} : (state.fieldErrors ?? {});

  return (
    <form action={formAction} className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Course code
          </span>
          <input
            type='text'
            name='code'
            placeholder='LING-101'
            maxLength={20}
            required
            className={inputClasses}
          />
          {errors.code && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.code}</span>}
        </label>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Programme vertical
          </span>
          <select name='vertical' defaultValue={COURSE_VERTICALS[0]} required className={selectClasses}>
            {COURSE_VERTICALS.map((vertical) => (
              <option key={vertical} value={vertical}>
                {verticalLabel[vertical]}
              </option>
            ))}
          </select>
          {errors.vertical && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.vertical}</span>}
        </label>
      </div>

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Course title
        </span>
        <input
          type='text'
          name='title'
          placeholder='Linguistics & Communication Skills'
          maxLength={120}
          required
          className={inputClasses}
        />
        {errors.title && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.title}</span>}
      </label>

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Professor emails <span className='normal-case tracking-normal text-foreground/40'>(comma-separated)</span>
        </span>
        <input
          type='text'
          name='professorEmails'
          placeholder='professor@example.com, colleague@example.com'
          autoComplete='off'
          required
          className={inputClasses}
        />
        {errors.professorEmails && (
          <span className='mt-1.5 block text-sm text-foreground/70'>{errors.professorEmails}</span>
        )}
      </label>

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Description <span className='normal-case tracking-normal text-foreground/40'>(optional)</span>
        </span>
        <textarea
          name='description'
          rows={3}
          maxLength={2000}
          placeholder='What this course covers and who it is for.'
          className='w-full resize-y rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40'
        />
        {errors.description && <span className='mt-1.5 block text-sm text-foreground/70'>{errors.description}</span>}
      </label>

      <div className='space-y-3'>
        {!state.ok && state.formError && <p className='text-sm text-foreground/70'>{state.formError}</p>}
        {state.ok && state.message && (
          <p className='rounded-xl bg-ec-sky/70 px-3.5 py-2.5 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            {state.message}
          </p>
        )}
        <SubmitRow />
      </div>
    </form>
  );
}

function SubmitRow() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex items-center gap-2 rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:opacity-60 dark:bg-white dark:text-ec-indigo'
    >
      {pending && <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />}
      <BookPlus className='size-4' aria-hidden='true' />
      Create course
    </button>
  );
}

const inputClasses =
  'w-full rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40';
const selectClasses = `${inputClasses} appearance-none`;
