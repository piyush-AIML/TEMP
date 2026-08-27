import { z } from 'zod';

/**
 * Enquiry validation (plan §31, §49) — one schema shared by the client
 * (per-step validation) and the server (authoritative validation).
 * The client should never determine whether a submission succeeded —
 * the server re-validates everything.
 */

export const enquiryRoles = ['parent', 'student', 'school', 'partner', 'other'] as const;
export type EnquiryRole = (typeof enquiryRoles)[number];

const emailSchema = z.string().trim().email('Please enter a valid email address.');
const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Please enter a valid phone number.')
  .max(20, 'Please enter a valid phone number.');

/** Step 1 — about you. */
export const stepAboutYouSchema = z.object({
  role: z.enum(enquiryRoles, { message: 'Please tell us who you are.' }),
  fullName: z.string().trim().min(2, 'Please enter your name.').max(100, 'Name is too long.'),
  email: emailSchema,
  phone: phoneSchema,
});

/** Step 2 — what you are looking for. */
export const stepLookingForSchema = z.object({
  programmeSlug: z
    .string()
    .trim()
    .min(1, 'Please select a programme.')
    .max(60, 'Programme value is too long.'),
  contactTime: z.string().trim().max(40).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .max(2000, 'Please keep your message under 2000 characters.')
    .optional()
    .or(z.literal('')),
});

/** Step 3 — contact preferences. */
export const stepContactPreferencesSchema = z.object({
  consent: z.literal(true, { message: 'Please agree to be contacted about this enquiry.' }),
});

/** Honeypot — must stay empty; bots fill it. */
export const honeypotSchema = z.object({
  website: z.string().max(0).optional().or(z.literal('')),
});

/** Full server-side schema. */
export const enquirySchema = stepAboutYouSchema
  .extend(stepLookingForSchema.shape)
  .extend(stepContactPreferencesSchema.shape)
  .extend(honeypotSchema.shape);

export type EnquiryPayload = z.infer<typeof enquirySchema>;

export type StepErrors = Partial<Record<string, string>>;

/** Structural shape of a zod safeParse result — avoids version-specific type exports. */
type ZodSafeResult = {
  success: boolean;
  error?: { issues: Array<{ path: PropertyKey[]; message: string }> };
};

/** Extracts human-readable errors from a zod result, keyed by field. */
export function flattenZodErrors(result: ZodSafeResult): StepErrors {
  if (result.success || !result.error) return {};
  const errors: StepErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
