import type { NotificationType } from '@/generated/prisma/enums';

/**
 * Pure notification-row builder (Dashboard Stage 2) — no DB, no Clerk, fully
 * unit-testable. notify.ts fetches recipients + their prefs and delegates
 * here. Stage 4 adds the user-facing preferences UI; the builder already
 * honours prefs, so no call site changes.
 */

export type NotificationPrefs = {
  newMaterial: boolean;
  newClass: boolean;
  meeting: boolean;
  taskDue: boolean;
  enrollment: boolean;
};

export const NOTIFICATION_PREF_MAP: Record<NotificationType, keyof NotificationPrefs> = {
  NEW_MATERIAL: 'newMaterial',
  NEW_CLASS: 'newClass',
  MEETING: 'meeting',
  TASK_DUE: 'taskDue',
  ENROLLMENT: 'enrollment',
};

/**
 * Parses the raw JSON from User.notifPrefs into typed prefs. Missing fields
 * default to ON (null/absent prefs = everything enabled, current behaviour
 * until Stage 4 ships the preference editor).
 */
export function parseNotifPrefs(raw: unknown): NotificationPrefs {
  if (!raw || typeof raw !== 'object') {
    return { newMaterial: true, newClass: true, meeting: true, taskDue: true, enrollment: true };
  }
  const source = raw as Record<string, unknown>;
  return {
    newMaterial: source.newMaterial !== false,
    newClass: source.newClass !== false,
    meeting: source.meeting !== false,
    taskDue: source.taskDue !== false,
    // Absent key (pre-2026-09-05 stored prefs) = ON — same drift-safe rule as the rest.
    enrollment: source.enrollment !== false,
  };
}

export type NotificationEvent = {
  type: NotificationType;
  title: string;
  body?: string | null;
  /** e.g. "course:<courseId>" — role-aware links resolve this. */
  relatedEntity?: string | null;
};

export type Recipient = { userId: string; prefs: NotificationPrefs | null };

export type NotificationRowInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  relatedEntity: string | null;
};

/** Recipients whose pref for this event type is enabled (null prefs = all on). */
export function buildNotificationRows(
  recipients: Recipient[],
  event: NotificationEvent
): NotificationRowInput[] {
  const prefKey = NOTIFICATION_PREF_MAP[event.type];
  const rows: NotificationRowInput[] = [];
  for (const recipient of recipients) {
    const prefs = recipient.prefs ?? parseNotifPrefs(null);
    if (!prefs[prefKey]) continue;
    rows.push({
      userId: recipient.userId,
      type: event.type,
      title: event.title,
      body: event.body ?? null,
      relatedEntity: event.relatedEntity ?? null,
    });
  }
  return rows;
}
