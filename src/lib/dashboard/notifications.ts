import 'server-only';
import { db } from '@/lib/db';
import type { NotificationType } from '@/generated/prisma/enums';

/**
 * Notification reads (Dashboard Stage 2) — shared by the student/professor
 * notifications pages (RSC) and the polling route handler. Always scoped to
 * the caller's own userId.
 */

export type NotificationDTO = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  /** e.g. "course:<id>" — role-aware links resolve this. */
  relatedEntity: string | null;
  read: boolean;
  /** ISO-8601 string. */
  createdAt: string;
};

/** Newest first; used by the bell (small limit) and full pages (larger). */
export async function getMyNotifications(userId: string, limit = 50): Promise<NotificationDTO[]> {
  const rows = await db().notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    relatedEntity: row.relatedEntity,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return db().notification.count({ where: { userId, read: false } });
}
