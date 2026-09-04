import type { Metadata } from 'next';
import { UserRound } from 'lucide-react';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfessorProfilePage() {
  return (
    <PlaceholderPage
      stage='Stage 1'
      title='Profile'
      icon={UserRound}
      description='View and edit your personal details. Identity (name, email, photo) is owned by Clerk — the DB row is its mirror.'
    />
  );
}
