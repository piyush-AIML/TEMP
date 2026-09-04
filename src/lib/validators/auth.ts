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
