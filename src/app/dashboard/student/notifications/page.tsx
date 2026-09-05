import type { Metadata } from 'next';
import { Bell } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getMyNotifications, getNotificationPrefs } from '@/lib/dashboard/notifications';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { NotificationActions } from '@/components/dashboard/NotificationActions';
import { NotificationPrefsEditor } from '@/components/dashboard/NotificationPrefsEditor';

export const metadata: Metadata = { title: 'Notifications' };

/** Student notifications page (Stage 2, prefs editor Stage 4) — full list
 *  with unread emphasis, mark-read controls, role-aware course links, and
 *  the notification-preferences editor (every channel is a student event;
 *  professor-facing announcements arrive in a future stage with their own). */
export default async function StudentNotificationsPage() {
  const session = await getCurrentUser();
  const [notifications, prefs] = await Promise.all([
    getMyNotifications(session.userId, 50),
    getNotificationPrefs(session.userId),
  ]);
  const unread = notifications.filter((item) => !item.read).length;

  const courseHrefFor = (relatedEntity: string | null) => {
    if (!relatedEntity?.startsWith('course:')) return null;
    return `/dashboard/student/courses/${relatedEntity.slice('course:'.length)}`;
  };

  return (
    <section className='mx-auto w-full max-w-3xl'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='eyebrow'>Notifications</p>
          <h1 className='type-display-m mt-3'>Your updates</h1>
          {unread > 0 ? (
            <p className='mt-2 inline-flex items-center gap-1.5 rounded-full bg-ec-sky/70 px-3 py-1 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
              <Bell className='size-3.5' aria-hidden='true' />
              {unread} unread
            </p>
          ) : null}
        </div>
        <NotificationActions hasUnread={unread > 0} />
      </div>

      <div className='mt-8'>
        <NotificationList notifications={notifications} courseHrefFor={courseHrefFor} />
      </div>

      <div className='mt-8'>
        <NotificationPrefsEditor initial={prefs} />
      </div>
    </section>
  );
}
