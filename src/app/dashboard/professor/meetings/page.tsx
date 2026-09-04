import type { Metadata } from 'next';
import { CalendarClock } from 'lucide-react';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';

export const metadata: Metadata = { title: 'Meetings' };

export default function ProfessorMeetingsPage() {
  return (
    <PlaceholderPage
      stage='Stage 3'
      title='Meetings & Planner'
      icon={CalendarClock}
      description='Schedule and view one-on-ones with students, parents or colleagues — alongside the per-course task planner and its completion monitor.'
    />
  );
}
