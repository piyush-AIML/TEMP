import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getMyNotifications } from '@/lib/dashboard/notifications';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { NotificationActions } from '@/components/dashboard/NotificationActions';

export const metadata: Metadata = { title: 'Notifications' };

/** Professor notifications page (Stage 2). Professor-facing notifications
 *  don't exist yet (announcements target students) — the honest empty state
 *  explains that; the page and bell stay wired for when they do. */
export default async function ProfessorNotificationsPage() {
  const session = await getCurrentUser();
  const notifications = await getMyNotifications(session.userId, 50);
  const unread = notifications.filter((item) => !item.read).length;

  const courseHrefFor = (relatedEntity: string | null) => {
    if (!relatedEntity?.startsWith('course:')) return null;
    return `/dashboard/professor/courses/${relatedEntity.slice('course:'.length)}`;
  };

  return (
    <section className='mx-auto w-full max-w-3xl'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='eyebrow'>Notifications</p>
          <h1 className='type-display-m mt-3'>Your updates</h1>
        </div>
        <NotificationActions hasUnread={unread > 0} />
      </div>

      <div className='mt-8'>
        <NotificationList notifications={notifications} courseHrefFor={courseHrefFor} />
      </div>

      <p className='mt-6 text-sm leading-relaxed text-foreground/50'>
        Students are notified when you post materials or change classes — announcements to professors
        themselves will appear here in a future stage. Need a quick route back?{' '}
        <Link href='/dashboard/professor/schedule' className='font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'>
          View your schedule
        </Link>
        .
      </p>
    </section>
  );
}
