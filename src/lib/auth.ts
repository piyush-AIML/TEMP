import 'server-only';
import { cache } from 'react';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Role } from '@/generated/prisma/enums';
import { db } from '@/lib/db';
import { publicMetadataSchema, type DashboardRole } from '@/lib/validators/auth';

/**
 * Dashboard auth helpers (Stage 0-C). The DB User row is a lazy mirror of the
 * Clerk user (created/adopted on first dashboard hit — never by the seed
 * script); role authority is Clerk publicMetadata, always read fresh via
 * clerkClient() (never session token claims, which go stale until re-sign-in).
 *
 * getCurrentUser is wrapped in React cache() (Stage 1): a layout's
 * requireRole() and the page below it call it within one request, and the
 * cache makes the second call await the first — one Clerk fetch + one
 * mirror-upsert per request, and no first-visit race between two concurrent
 * upserts of the same Clerk id (P2002).
 */

const ROLE_TO_DB: Record<DashboardRole, Role> = {
  student: Role.STUDENT,
  professor: Role.PROFESSOR,
  admin: Role.ADMIN,
};

export const ROLE_HOME: Record<DashboardRole, string> = {
  student: '/dashboard/student',
  professor: '/dashboard/professor',
  admin: '/dashboard/admin',
};

export type CurrentUser = {
  userId: string;
  /** Lowercase role from Clerk publicMetadata ('student' | 'professor' | 'admin'). */
  role: DashboardRole;
  name: string;
  email: string;
  imageUrl: string | null;
};

/**
 * Resolves the signed-in user's role from Clerk and mirrors their DB row.
 * Redirects to /sign-in when signed out (middleware already protects, this is
 * belt-and-suspenders for direct Server Action / RSC entry).
 *
 * Adoption: if no row exists under the Clerk id but one exists under the same
 * email (a pre-seeded demo row), the row is re-keyed to the Clerk id — its
 * FK relationships follow via onUpdate: Cascade on the schema.
 */
async function getCurrentUserImpl(): Promise<CurrentUser> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const parsed = publicMetadataSchema.safeParse(clerkUser.publicMetadata);
  if (!parsed.success) {
    throw new Error(
      `User ${userId} has no valid dashboard role in Clerk publicMetadata. ` +
        'Set it in the Clerk dashboard (Users → edit → public metadata): ' +
        '{"role": "student" | "professor" | "admin"}'
    );
  }

  const dbRole = ROLE_TO_DB[parsed.data.role];
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const name = clerkUser.fullName?.trim() || email.split('@')[0] || 'Educraft user';
  const imageUrl = clerkUser.imageUrl || null;

  const prisma = db();
  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    await prisma.$transaction(async (tx) => {
      const byEmail = await tx.user.findUnique({ where: { email } });
      if (byEmail) {
        await tx.user.update({
          where: { email },
          data: { id: userId, name, role: dbRole, avatarUrl: imageUrl },
        });
      } else {
        await tx.user.create({
          data: { id: userId, email, name, role: dbRole, avatarUrl: imageUrl },
        });
      }
    });
  } else if (
    existing.email !== email ||
    existing.name !== name ||
    existing.role !== dbRole ||
    existing.avatarUrl !== imageUrl
  ) {
    await prisma.user.update({ where: { id: userId }, data: { email, name, role: dbRole, avatarUrl: imageUrl } });
  }

  return { userId, role: parsed.data.role, name, email, imageUrl };
}

/** Deduped per-request — see the module docstring. */
export const getCurrentUser = cache(getCurrentUserImpl);

/**
 * Gate for dashboard pages/layouts. Redirects the user to their own role's
 * dashboard root when they don't hold one of the allowed roles — server-side
 * enforcement, never UI hiding.
 */
export async function requireRole(...allowed: DashboardRole[]): Promise<CurrentUser> {
  const session = await getCurrentUser();
  if (!allowed.includes(session.role)) {
    redirect(ROLE_HOME[session.role] ?? '/');
  }
  return session;
}
