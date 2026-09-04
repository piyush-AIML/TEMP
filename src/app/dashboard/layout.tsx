import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard — Educraft',
    template: '%s — Educraft Dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Dashboard group shell (Stage 0-D). Route-group-isolated from the marketing
 * site: ClerkProvider wraps Clerk UI (UserButton), role gating happens in the
 * per-role layouts below, and nothing here touches (site) components. Auth
 * presence is enforced by middleware (protect) and again per-role here.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl='/'>{children}</ClerkProvider>;
}
