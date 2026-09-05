'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing, Check, FileText, CalendarDays, CalendarClock, AlertTriangle, GraduationCap, type LucideIcon } from 'lucide-react';
import type { NotificationDTO } from '@/lib/dashboard/notifications';

/**
 * Polling notification bell (Dashboard Stage 2). Client component — it talks
 * only to /api/dashboard/notifications (never imports server-only modules).
 * Polls immediately + every 30 s, pauses while the tab is hidden, resumes on
 * visibility. Times are shown as client-side relative ("5m ago") — honest,
 * no timezone claims; full IST dates live on the notifications pages.
 */

const POLL_MS = 30_000;

const TYPE_ICON: Record<NotificationDTO['type'], LucideIcon> = {
  NEW_MATERIAL: FileText,
  NEW_CLASS: CalendarDays,
  MEETING: CalendarClock,
  TASK_DUE: AlertTriangle,
  ENROLLMENT: GraduationCap,
};

/** Approximate relative time from the client clock — no tz conversion. */
function relativeTime(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

export function NotificationBell({ role }: { role: 'student' | 'professor' }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [error, setError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/notifications', { cache: 'no-store' });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { unreadCount: number; notifications: NotificationDTO[] };
      setUnreadCount(data.unreadCount);
      setItems(data.notifications);
      setError(false);
    } catch {
      setError(true); // silent retry next poll; never crash the shell
    }
  }, []);

  // Initial + interval poll, paused on hidden tabs.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      void poll();
      interval = setInterval(() => void poll(), POLL_MS);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = undefined;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        stop();
        start(); // fresh poll immediately on return
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [poll]);

  // Outside click + Escape close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const markRead = useCallback(
    async (id: string) => {
      await fetch('/api/dashboard/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => undefined);
      // Optimistic local update; the next poll reconciles.
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
    },
    []
  );

  const Icon = unreadCount > 0 ? BellRing : Bell;

  return (
    <div ref={rootRef} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup='menu'
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className='relative inline-flex size-9 items-center justify-center rounded-2xl text-foreground/70 transition-colors duration-150 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
      >
        <Icon className='size-4.5' aria-hidden='true' />
        {unreadCount > 0 && (
          <span className='absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ec-indigo px-1 text-[10px] font-bold text-white dark:bg-white dark:text-ec-indigo'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role='menu'
          className='card-surface absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-ec-sky shadow-[0_16px_48px_rgba(14,19,48,0.14)] dark:border-ec-canvas-deep'
        >
          <div className='flex items-center justify-between border-b border-ec-sky px-5 py-3 dark:border-ec-canvas-deep'>
            <p className='text-sm font-semibold'>Notifications</p>
            {unreadCount > 0 && (
              <span className='rounded-full bg-ec-sky px-2.5 py-0.5 text-[11px] font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
                {unreadCount} unread
              </span>
            )}
          </div>

          <ul className='max-h-80 overflow-y-auto divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
            {items.length === 0 && (
              <li className='px-5 py-6 text-center text-sm text-foreground/60'>
                {error ? 'Notifications are unavailable right now.' : 'Nothing yet — updates land here.'}
              </li>
            )}
            {items.slice(0, 5).map((item) => {
              const ItemIcon = TYPE_ICON[item.type] ?? Bell;
              return (
                <li key={item.id} className={item.read ? 'opacity-60' : undefined}>
                  <div className='flex items-start gap-3 px-5 py-3'>
                    <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
                      <ItemIcon className='size-4' aria-hidden='true' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-medium leading-snug'>{item.title}</p>
                      <p className='mt-0.5 text-xs text-foreground/50'>
                        {relativeTime(item.createdAt)}
                      </p>
                    </div>
                    {!item.read && (
                      <button
                        type='button'
                        onClick={() => void markRead(item.id)}
                        aria-label={`Mark "${item.title}" as read`}
                        className='mt-0.5 rounded-lg p-1 text-foreground/40 transition-colors duration-150 hover:bg-ec-sky hover:text-ec-indigo dark:hover:bg-ec-canvas-deep dark:hover:text-white'
                      >
                        <Check className='size-3.5' aria-hidden='true' />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className='border-t border-ec-sky px-5 py-2.5 dark:border-ec-canvas-deep'>
            <Link
              href={`/dashboard/${role}/notifications`}
              onClick={() => setOpen(false)}
              className='block py-1 text-center text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
