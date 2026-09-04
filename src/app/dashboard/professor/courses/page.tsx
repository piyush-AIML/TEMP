import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';

export const metadata: Metadata = { title: 'My Courses' };

export default function ProfessorCoursesPage() {
  return (
    <PlaceholderPage
      stage='Stage 2'
      title='My Courses'
      icon={BookOpen}
      description='Your teaching load with a roster per course. From each course you will schedule classes, post materials and remarks, and manage its students.'
    />
  );
}
