import { requireRole } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

/**
 * Professor dashboard layout — server-side role gate: any non-professor who
 * reaches /dashboard/professor/* is redirected to their own role's root.
 */
export default async function ProfessorDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('professor');
  return (
    <DashboardShell
      role='professor'
      user={{ name: session.name, email: session.email, imageUrl: session.imageUrl }}
    >
      {children}
    </DashboardShell>
  );
}
