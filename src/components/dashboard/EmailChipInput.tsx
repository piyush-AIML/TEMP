'use client';

import { useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { MAX_PROFESSORS_PER_COURSE, isValidEmail } from '@/lib/validators/courses';

/**
 * Reusable email chip input (course-allocation rework 2026-09-05). Type an
 * email and press Enter (or paste a list — commas, spaces or newlines split
 * it) and it becomes a removable chip. Emails are lowercased + deduped the
 * moment they are added — the same normalization the validators apply
 * server-side, so chips and submission can never disagree.
 *
 * Controlled by the parent (`emails`/`onChange`). When `hiddenName` is set,
 * one hidden input per chip is rendered so the enclosing form submits
 * `formData.getAll(hiddenName)`. Deliberately dumb about max: the cap is the
 * validator's constant, surfaced here so the UI refuses before the server.
 */

export function EmailChipInput({
  hiddenName,
  emails,
  onChange,
  max = MAX_PROFESSORS_PER_COURSE,
  placeholder = 'professor@example.com',
}: {
  hiddenName?: string;
  emails: string[];
  onChange: (emails: string[]) => void;
  max?: number;
  placeholder?: string;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addCandidates = (raw: string) => {
    const candidates = raw
      .split(/[\s,;]+/)
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    if (candidates.length === 0) return;

    const invalid = candidates.find((candidate) => !isValidEmail(candidate));
    if (invalid) {
      setError(`“${invalid}” isn't a valid email address.`);
      return;
    }
    const next = [...emails];
    for (const candidate of candidates) {
      if (!next.includes(candidate)) next.push(candidate);
    }
    if (next.length > max) {
      setError(`A course can have up to ${max} professors at once.`);
      return;
    }
    setError(null);
    onChange(next);
    setText('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addCandidates(text);
    } else if (event.key === 'Backspace' && text === '' && emails.length > 0) {
      onChange(emails.slice(0, -1));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    addCandidates(text + event.clipboardData.getData('text'));
  };

  return (
    <div>
      <div className='flex min-h-[46px] flex-wrap items-center gap-2 rounded-xl border border-ec-sky bg-background px-3 py-2 transition-colors duration-150 focus-within:border-ec-indigo dark:border-ec-canvas-deep dark:focus-within:border-white/40'>
        {hiddenName &&
          emails.map((email) => <input key={email} type='hidden' name={hiddenName} value={email} />)}
        {emails.map((email) => (
          <span
            key={email}
            className='inline-flex items-center gap-1.5 rounded-full bg-ec-sky/70 py-1 pl-3 pr-1.5 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'
          >
            {email}
            <button
              type='button'
              onClick={() => onChange(emails.filter((other) => other !== email))}
              aria-label={`Remove ${email}`}
              className='rounded-full p-0.5 text-ec-indigo/60 transition-colors duration-150 hover:bg-ec-indigo/10 hover:text-ec-indigo dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white'
            >
              <X className='size-3.5' aria-hidden='true' />
            </button>
          </span>
        ))}
        <input
          type='text'
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={emails.length === 0 ? placeholder : ''}
          aria-label='Add an email, then press Enter'
          autoComplete='off'
          spellCheck={false}
          className='min-w-[220px] flex-1 border-none bg-transparent py-1 text-sm outline-none placeholder:text-foreground/40'
        />
      </div>
      <p className='mt-1.5 text-xs text-foreground/50'>
        Type an email and press Enter — or paste a list. Emails are matched case-insensitively.
      </p>
      {error && <p className='mt-1.5 text-sm text-red-600 dark:text-red-400'>{error}</p>}
    </div>
  );
}
