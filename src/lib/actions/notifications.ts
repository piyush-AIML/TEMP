'use server';

import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { notificationPrefsInputSchema, type NotificationPrefsInput } from '@/lib/validators/preferences';
import { type ActionResult, formError, success } from './types';

/**
 * Notification actions (Stage 2 read-state; Stage 4 preferences). Ownership
 * is enforced in the WHERE clause — a user can only ever touch their own
 * rows. The preferences write is student-gated: today every fan-out channel
 * targets students (professor-facing notifications "arrive in a future
 * stage"), so only students have channels to configure. The stored Json is
 * full-shape (all four keys) — the parse side tolerates missing keys, the
 * write side never produces them.
 */

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const session = await requireRole('student', 'professor', 'admin');
  await db().notification.updateMany({
    where: { id: notificationId, userId: session.userId },
    data: { read: true },
  });
  return success();
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await requireRole('student', 'professor', 'admin');
  await db().notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });
  return success();
}

/** Replaces the caller's stored preferences (own row, WHERE-scoped). */
export async function updateNotificationPrefs(input: NotificationPrefsInput): Promise<ActionResult> {
  const session = await requireRole('student');
  const parsed = notificationPrefsInputSchema.safeParse(input);
  if (!parsed.success) return formError('Could not save those preferences — please try again.');
  await db().user.update({
    where: { id: session.userId },
    data: { notifPrefs: parsed.data },
  });
  return success('Preferences saved — they apply from the next notification.');
}
