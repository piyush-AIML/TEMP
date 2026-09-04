import { requireRole } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

/**
 * Admin dashboard layout (2026-09-05) — server-side role gate: only an
 * `admin` (publicMetadata.role) reaches /dashboard/admin/*; everyone else is
 * redirected to their own role's root.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('admin');
  return (
    <DashboardShell
      role='admin'
      user={{ name: session.name, email: session.email, imageUrl: session.imageUrl }}
    >
      {children}
    </DashboardShell>
  );
}
