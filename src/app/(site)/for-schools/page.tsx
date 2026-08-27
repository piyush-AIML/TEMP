import type { Metadata } from 'next';
import AudiencePage from '@/components/educraft/pages/AudiencePage';

export const metadata: Metadata = {
  title: 'For Schools — Educraft',
  description:
    'Five specialist verticals under one school partnership: linguistics, inclusive education, wellbeing, AI & digital literacy, and NEET/JEE preparation — with shared reporting and safeguarding.',
  alternates: { canonical: '/for-schools' },
};

export default function ForSchools() {
  return <AudiencePage slug='schools' />;
}
