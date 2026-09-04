'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { requireRole } from '@/lib/auth';
import {
  INVITE_ROLES_BY_INVITER,
  inviteInputSchema,
  type DashboardRole,
} from '@/lib/validators/auth';
import { flattenZodErrors } from '@/lib/validation';
import { type ActionResult, formError, success } from './types';

/**
 * Invitation Server Action (2026-09-05). Thin orchestrator in the established
 * pattern: requireRole gate → zod v4 validate → Clerk Invitations API.
 *
 * Role policy (single-sourced in validators/auth.ts): an `admin` inviter may
 * invite professors and students; a `professor` inviter may invite only
 * students. The client form only renders the inviter's allowed choices, but
 * the role is RE-validated here server-side — a tampered request cannot invite
 * a role the inviter may not hand out.
 *
 * The invitation carries `publicMetadata: { role }` — when the invitee signs
 * up through the invitation link, Clerk copies it into the new user's
 * publicMetadata, so getCurrentUser() (lib/auth.ts) accepts them on their
 * first dashboard hit with no webhook sync needed.
 */

export async function createInvitation(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole('admin', 'professor');

  const parsed = inviteInputSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    role: String(formData.get('role') ?? ''),
  });
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };

  // requireRole guarantees admin|professor here (anything else redirected).
  const allowed: readonly DashboardRole[] = INVITE_ROLES_BY_INVITER[session.role as 'admin' | 'professor'];
  if (!allowed.includes(parsed.data.role)) {
    return formError(
      session.role === 'professor'
        ? 'Professors can only invite students.'
        : 'Admins can only invite professors and students.'
    );
  }

  try {
    await (await clerkClient()).invitations.createInvitation({
      emailAddress: parsed.data.email,
      publicMetadata: { role: parsed.data.role },
      notify: true, // Clerk emails the invitee with a sign-up link
    });
  } catch (error) {
    // Clerk rejects duplicates (account already exists / invitation pending)
    // and malformed emails — honest generic message, detail logged.
    console.error('createInvitation failed:', error);
    return formError(
      'The invitation could not be sent. The email may already have an account or a pending invitation.'
    );
  }

  return success(`Invitation sent to ${parsed.data.email} — they will receive an email to create their account.`);
}
