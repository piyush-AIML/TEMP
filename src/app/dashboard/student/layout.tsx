import { requireRole } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

/**
 * Student dashboard layout — server-side role gate: any non-student who
 * reaches /dashboard/student/* is redirected to their own role's root.
 */
export default async function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('student');
  return (
    <DashboardShell role='student' user={{ name: session.name, email: session.email, imageUrl: session.imageUrl }}>
      {children}
    </DashboardShell>
  );
}
