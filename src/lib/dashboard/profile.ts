import 'server-only';
import { db } from '@/lib/db';

/**
 * Profile reads (Dashboard Stage 1). Identity (name/email/photo) comes from
 * the Clerk session via getCurrentUser(); the DB row is its mirror, so the
 * only extra datum here is the row's createdAt — honestly labelled
 * "dashboard member since" (first dashboard visit), never account signup.
 */

/** ISO-8601 string of the mirror row's creation time, or null (row missing). */
export async function getProfileRecord(userId: string): Promise<{ createdAt: string } | null> {
  const row = await db().user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  return row ? { createdAt: row.createdAt.toISOString() } : null;
}
