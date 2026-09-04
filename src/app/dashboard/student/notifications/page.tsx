import type { Metadata } from 'next';
import { Bell } from 'lucide-react';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';

export const metadata: Metadata = { title: 'Notifications' };

export default function StudentNotificationsPage() {
  return (
    <PlaceholderPage
      stage='Stage 2'
      title='Notifications'
      icon={Bell}
      description='A bell in the shell header shows new material, class changes and reminders — powered by the DB Notification table, polled (no websockets in v1).'
    />
  );
}
