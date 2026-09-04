import { z } from 'zod';

/**
 * Dashboard auth validation (Stage 0-C). Clerk publicMetadata is the single
 * source of truth for roles; this schema is the typed gate between it and the
 * app. Uses zod v4 syntax (§18 rule 3). passthrough() so Clerk's other
 * metadata keys never cause a rejection.
 */
export const dashboardRoles = ['student', 'professor', 'admin'] as const;
export type DashboardRole = (typeof dashboardRoles)[number];

export const publicMetadataSchema = z.object({
  role: z.enum(dashboardRoles, {
    message: 'publicMetadata.role must be one of: student, professor, admin.',
  }),
});

export type PublicMetadata = z.infer<typeof publicMetadataSchema>;

/**
 * Invitation policy (2026-09-05) — who may hand out which roles, kept beside
 * the single role source so role strings never diverge. `admin` invites both
 * professors and students; `professor` invites only students. Enforced
 * server-side in the invitation action (never trusted from the client form,
 * which only renders the choices).
 */
export const INVITE_ROLES_BY_INVITER = {
  admin: ['professor', 'student'],
  professor: ['student'],
} as const satisfies Record<Extract<DashboardRole, 'admin' | 'professor'>, readonly DashboardRole[]>;

/** The role a signed-in user is allowed to invite (typed per inviter). */
export type InvitableRole = (typeof INVITE_ROLES_BY_INVITER)[keyof typeof INVITE_ROLES_BY_INVITER][number];

/** Invitation form input — email + one of the dashboard roles. The role is
 *  checked against INVITE_ROLES_BY_INVITER at the action, not only here. */
export const inviteInputSchema = z.object({
  email: z.email({ message: 'Enter a valid email address.' }),
  role: z.enum(dashboardRoles, { message: 'Select a role for the invitation.' }),
});

export type InviteInput = z.infer<typeof inviteInputSchema>;
