'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Link2, MessageSquareText, Paperclip, StickyNote } from 'lucide-react';
import { createLinkMaterial, createTextMaterial } from '@/lib/actions/materials';
import type { ActionResult } from '@/lib/actions/types';
import { FileDropzone } from '@/components/dashboard/FileDropzone';
import { cn } from '@/lib/utils';

/**
 * Professor material composer (Dashboard Stage 2) — tabs Note / Remark /
 * Link / File. Text + link forms use useActionState with server-side zod;
 * the File tab is the provider-agnostic FileDropzone (direct-to-storage).
 * Server actions revalidate both role layouts, so enrolled students see new
 * materials on their next render (and the bell announces them via poll).
 */

type Tab = 'note' | 'remark' | 'link' | 'file';

const TABS: Array<{ id: Tab; label: string; icon: typeof StickyNote }> = [
  { id: 'note', label: 'Note', icon: StickyNote },
  { id: 'remark', label: 'Remark', icon: MessageSquareText },
  { id: 'link', label: 'Link', icon: Link2 },
  { id: 'file', label: 'File', icon: Paperclip },
];

const INITIAL: ActionResult = { ok: true };

export function MaterialComposer({ courseId }: { courseId: string }) {
  const [tab, setTab] = useState<Tab>('note');

  return (
    <div className='card-surface rounded-3xl p-5 sm:p-6'>
      <div role='tablist' aria-label='Compose material' className='flex gap-1.5 overflow-x-auto'>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role='tab'
            id={`composer-tab-${id}`}
            aria-selected={tab === id}
            aria-controls='composer-panel'
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150',
              tab === id
                ? 'bg-ec-indigo text-white dark:bg-white dark:text-ec-indigo'
                : 'text-foreground/60 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
            )}
          >
            <Icon className='size-3.5' aria-hidden='true' />
            {label}
          </button>
        ))}
      </div>

      <div id='composer-panel' role='tabpanel' aria-labelledby={`composer-tab-${tab}`} className='mt-5'>
        {tab === 'note' && <TextMaterialForm courseId={courseId} type='NOTE' />}
        {tab === 'remark' && <TextMaterialForm courseId={courseId} type='REMARK' />}
        {tab === 'link' && <LinkMaterialForm courseId={courseId} />}
        {tab === 'file' && <FileDropzone courseId={courseId} />}
      </div>
    </div>
  );
}

function TextMaterialForm({ courseId, type }: { courseId: string; type: 'NOTE' | 'REMARK' }) {
  const [state, action] = useActionState(createTextMaterial, INITIAL);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const errors = state.ok ? {} : (state.fieldErrors ?? {});

  return (
    <form action={action} className='space-y-4'>
      <input type='hidden' name='type' value={type} />
      <input type='hidden' name='courseId' value={courseId} />

      <Field label={type === 'NOTE' ? 'Note title' : 'Remark title'} error={errors.title}>
        <input
          type='text'
          name='title'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          className={inputClasses}
          placeholder={type === 'NOTE' ? 'e.g. Week 1 — what we covered' : 'e.g. Everyone passed the mock test'}
        />
      </Field>

      <Field label='Content' error={errors.body}>
        <textarea
          name='body'
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          maxLength={10_000}
          className={cn(inputClasses, 'resize-y')}
          placeholder={
            type === 'NOTE'
              ? 'Notes your students can keep and come back to…'
              : 'A remark to the whole class…'
          }
        />
      </Field>

      <FormFooter state={state} formError={errors.form as string | undefined} submitLabel={type === 'NOTE' ? 'Post note' : 'Post remark'} />
    </form>
  );
}

function LinkMaterialForm({ courseId }: { courseId: string }) {
  const [state, action] = useActionState(createLinkMaterial, INITIAL);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const errors = state.ok ? {} : (state.fieldErrors ?? {});

  return (
    <form action={action} className='space-y-4'>
      <input type='hidden' name='courseId' value={courseId} />

      <Field label='Link title' error={errors.title}>
        <input
          type='text'
          name='title'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          className={inputClasses}
          placeholder='e.g. Practice worksheets'
        />
      </Field>

      <Field label='URL' error={errors.url}>
        <input
          type='text'
          name='url'
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          maxLength={2048}
          required
          className={inputClasses}
          placeholder='https://… or an Educraft page like /programmes/linguistics'
        />
      </Field>

      <FormFooter state={state} formError={errors.form as string | undefined} submitLabel='Share link' />
    </form>
  );
}

/** Field + inline server error. */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className='block'>
      <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>{label}</span>
      {children}
      {error && <span className='mt-1.5 block text-sm text-foreground/70'>{error}</span>}
    </label>
  );
}

function FormFooter({
  state,
  formError,
  submitLabel,
}: {
  state: ActionResult;
  formError?: string;
  submitLabel: string;
}) {
  return (
    <div className='space-y-3'>
      {formError && <p className='text-sm text-foreground/70'>{formError}</p>}
      {state.ok && state.message && (
        <p className='rounded-xl bg-ec-sky/70 px-3.5 py-2.5 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          {state.message}
        </p>
      )}
      <SubmitButton label={submitLabel} />
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:opacity-60 dark:bg-white dark:text-ec-indigo'
    >
      {pending ? 'Posting…' : label}
    </button>
  );
}

const inputClasses =
  'w-full rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40';
