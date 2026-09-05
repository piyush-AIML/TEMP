import { z } from 'zod';

/**
 * Notification-preference input validation (Dashboard Stage 4). The editor
 * submits all five channels at once (full-shape replace, like the stored
 * Json). Keys mirror NotificationPrefs in lib/notifications/builder.ts — the
 * parse side tolerates missing keys (absent = ON); the write side always
 * stores all five, so a stale editor can never drop a channel silently.
 */

export const notificationPrefsInputSchema = z.object({
  newMaterial: z.boolean({ message: 'Choose a setting for new materials.' }),
  newClass: z.boolean({ message: 'Choose a setting for classes.' }),
  meeting: z.boolean({ message: 'Choose a setting for meetings.' }),
  taskDue: z.boolean({ message: 'Choose a setting for task due dates.' }),
  enrollment: z.boolean({ message: 'Choose a setting for course enrollments.' }),
});

export type NotificationPrefsInput = z.infer<typeof notificationPrefsInputSchema>;
