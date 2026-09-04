'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, LoaderCircle } from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/notifications';

/**
 * Mark-read controls for the notifications page (Stage 2) — direct action
 * calls + router.refresh() (no form needed). Ownership is enforced inside
 * the actions' WHERE clauses.
 */
export function NotificationActions({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (id: string | null) => {
    setBusy(id ?? 'all');
    setError(null);
    const result = id ? await markNotificationRead(id) : await markAllNotificationsRead();
    setBusy(null);
    if (!result.ok) {
      setError(result.formError ?? 'Could not update notifications.');
      return;
    }
    router.refresh();
  };

  if (!hasUnread) return null;

  return (
    <div className='space-y-2'>
      {error && <p className='text-sm text-foreground/70'>{error}</p>}
      <button
        type='button'
        disabled={busy !== null}
        onClick={() => void run(null)}
        className="inline-flex items-center gap-2 rounded-full border border-ec-sky px-4 py-1.5 text-sm font-semibold text-foreground/70 transition-colors duration-150 hover:bg-ec-sky/60 hover:text-foreground disabled:opacity-60 dark:border-ec-canvas-deep dark:hover:bg-ec-canvas-deep/60"
      >
        {busy === 'all' ? (
          <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />
        ) : (
          <CheckCheck className='size-4' aria-hidden='true' />
        )}
        Mark all as read
      </button>
    </div>
  );
}

/** Small "mark read" affordance for one list row (used by the page). */
export function MarkOneRead({ id, onDone }: { id: string; onDone?: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type='button'
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await markNotificationRead(id);
        setBusy(false);
        if (result.ok) {
          router.refresh();
          onDone?.();
        }
      }}
      className="rounded-full border border-ec-sky px-3 py-1 text-xs font-semibold text-foreground/60 transition-colors duration-150 hover:bg-ec-sky/60 hover:text-foreground disabled:opacity-60 dark:border-ec-canvas-deep dark:hover:bg-ec-canvas-deep/60"
    >
      {busy ? '…' : 'Mark as read'}
    </button>
  );
}
