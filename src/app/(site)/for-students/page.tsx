import type { Metadata } from 'next';
import AudiencePage from '@/components/educraft/pages/AudiencePage';

export const metadata: Metadata = {
  title: 'For Students — Educraft',
  description:
    'A path that feels like yours: real projects, real conversations, and progress you can see — learning that connects to the life you want next.',
  alternates: { canonical: '/for-students' },
};

export default function ForStudents() {
  return <AudiencePage slug='students' />;
}
