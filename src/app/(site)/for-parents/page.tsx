import type { Metadata } from 'next';
import AudiencePage from '@/components/educraft/pages/AudiencePage';

export const metadata: Metadata = {
  title: 'For Parents — Educraft',
  description:
    'Clear progress, real partnership: understand exactly what your child is learning, how progress is measured, and where they are headed.',
  alternates: { canonical: '/for-parents' },
};

export default function ForParents() {
  return <AudiencePage slug='parents' />;
}
