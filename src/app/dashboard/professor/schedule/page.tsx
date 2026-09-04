import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';

export const metadata: Metadata = { title: 'Schedule' };

export default function ProfessorSchedulePage() {
  return (
    <PlaceholderPage
      stage='Stage 2'
      title='Schedule'
      icon={CalendarDays}
      description='Every class across your courses, with create/edit/cancel controls. Changes are visible to enrolled students the moment they save.'
    />
  );
}
