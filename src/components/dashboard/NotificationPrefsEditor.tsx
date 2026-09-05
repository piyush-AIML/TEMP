'use client';

import { useState } from 'react';
import { BellRing, LoaderCircle } from 'lucide-react';
import type { NotificationPrefs } from '@/lib/notifications/builder';
import { updateNotificationPrefs } from '@/lib/actions/notifications';
import { cn } from '@/lib/utils';

/**
 * Notification-preference editor (Dashboard Stage 4, student page). One
 * switch per channel; changes stage locally and commit together on Save —
 * a full-shape replace that matches how the stored Json is written and how
 * the fan-out builder reads it. Every channel listed here is a
 * student-facing event; the professor page stays without an editor until
 * professor-facing announcements ship with their own channels.
 */

const CHANNELS: Array<{
  key: keyof NotificationPrefs;
  label: string;
  description: string;
}> = [
  {
    key: 'newClass',
    label: 'Classes',
    description: 'When a professor schedules, reschedules or cancels a class.',
  },
  {
    key: 'newMaterial',
    label: 'Materials & remarks',
    description: 'Notes, remarks, links and files posted to your courses.',
  },
  {
    key: 'taskDue',
    label: 'Task due dates',
    description: 'New coursework tasks and updated due dates.',
  },
  {
    key: 'meeting',
    label: 'One-on-one meetings',
    description: 'When a professor schedules or cancels a meeting with you.',
  },
  {
    key: 'enrollment',
    label: 'Course enrollment',
    description: 'When you are enrolled in a course, or removed from one.',
  },
];

export function NotificationPrefsEditor({ initial }: { initial: NotificationPrefs }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initial);
  const [savedPrefs, setSavedPrefs] = useState<NotificationPrefs>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = (Object.keys(prefs) as Array<keyof NotificationPrefs>).some(
    (key) => prefs[key] !== savedPrefs[key]
  );

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
    setMessage(null);
    setError(null);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const result = await updateNotificationPrefs(prefs);
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? 'Could not save your preferences — please try again.');
      return;
    }
    setSavedPrefs(prefs);
    setMessage(result.message ?? 'Preferences saved.');
  };

  return (
    <section className='card-surface rounded-3xl p-6 sm:p-8'>
      <h2 className='flex items-center gap-2 text-lg font-semibold'>
        <BellRing className='size-5 text-foreground/50' aria-hidden='true' />
        Notification preferences
      </h2>
      <p className='mt-1.5 max-w-2xl text-sm leading-relaxed text-foreground/70'>
        Choose what lands in your bell and this page. Preferences apply from the next notification —
        anything already delivered stays.
      </p>

      <div className='mt-5 divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
        {CHANNELS.map((channel) => {
          const on = prefs[channel.key];
          return (
            <div key={channel.key} className='flex items-center justify-between gap-6 py-4'>
              <div className='min-w-0'>
                <p className='text-sm font-semibold'>{channel.label}</p>
                <p className='mt-0.5 text-xs leading-relaxed text-foreground/60'>{channel.description}</p>
              </div>
              <button
                type='button'
                role='switch'
                aria-checked={on}
                aria-label={channel.label}
                onClick={() => toggle(channel.key)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
                  on ? 'bg-ec-indigo dark:bg-white' : 'bg-ec-slate/30 dark:bg-ec-slate/40'
                )}
              >
                <span
                  aria-hidden='true'
                  className={cn(
                    'inline-block size-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
                    on ? 'translate-x-[22px]' : 'translate-x-[3px]'
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className='mt-2 flex items-center gap-4'>
        <button
          type='button'
          disabled={!dirty || busy}
          onClick={() => void save()}
          className='inline-flex items-center gap-2 rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:opacity-50 dark:bg-white dark:text-ec-indigo'
        >
          {busy && <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />}
          {busy ? 'Saving…' : 'Save preferences'}
        </button>
        {message && <p className='text-sm font-medium text-ec-success'>{message}</p>}
        {error && <p className='text-sm text-foreground/70'>{error}</p>}
      </div>
    </section>
  );
}
