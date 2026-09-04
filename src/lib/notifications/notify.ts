import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus } from '@/generated/prisma/enums';
import {
  buildNotificationRows,
  parseNotifPrefs,
  type NotificationEvent,
} from '@/lib/notifications/builder';

/**
 * Notification fan-out (Dashboard Stage 2). Server-only: fetches recipients
 * and their preferences in one query, then creates rows through the pure
 * builder. Stage 4 adds preference editing — no call-site changes.
 */

/** NEW_CLASS/NEW_MATERIAL-style events → every ACTIVE-enrolled student. */
export async function createCourseNotifications(courseId: string, event: NotificationEvent): Promise<void> {
  const enrollments = await db().enrollment.findMany({
    where: { courseId, status: EnrollmentStatus.ACTIVE },
    select: { student: { select: { id: true, notifPrefs: true } } },
  });
  const rows = buildNotificationRows(
    enrollments.map((enrollment) => ({
      userId: enrollment.student.id,
      prefs: parseNotifPrefs(enrollment.student.notifPrefs),
    })),
    event
  );
  if (rows.length > 0) {
    await db().notification.createMany({ data: rows });
  }
}

/** MEETING-style events → one student (with their pref gate). */
export async function createStudentNotification(studentId: string, event: NotificationEvent): Promise<void> {
  const student = await db().user.findUnique({
    where: { id: studentId },
    select: { id: true, notifPrefs: true },
  });
  if (!student) return; // unknown student — nothing to notify
  const rows = buildNotificationRows(
    [{ userId: student.id, prefs: parseNotifPrefs(student.notifPrefs) }],
    event
  );
  if (rows.length > 0) {
    await db().notification.createMany({ data: rows });
  }
}
