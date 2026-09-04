'use server';

import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { type ActionResult, success } from './types';

/**
 * Notification read-state actions (Dashboard Stage 2). Ownership is enforced
 * in the WHERE clause — a user can only ever mark their own rows.
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
