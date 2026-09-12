import { z } from 'zod';
import type { PillarSlug } from '@/data/pillars';

/**
 * Course-allocation input validation (Dashboard course slice, reworked
 * 2026-09-05). Enrolling a student takes their account email; creating a
 * course takes the course identity plus the professor emails to assign
 * (chips in the form, an array here — co-teaching is supported through
 * CourseProfessors). The vertical must be one of the five programme slugs —
 * kept as a literal here so validators stay dependency-free at runtime; it is
 * held in agreement with the pillar registry by the compile-time assertion
 * below, not by a comment asking future readers to keep it in sync.
 *
 * Email contract (whole slice): emails are trimmed AND lowercased — Clerk
 * stores primary emails lowercase, so matching is case-insensitive by
 * normalization, never by guessing the stored casing.
 */

/**
 * Course verticals — the five programme slugs. `Course.vertical` stores one of
 * these (Prisma schema comment: validated-at-the-edge string, not an FK).
 *
 * Kept as a literal tuple rather than `pillars.map(p => p.slug)` because zod's
 * `z.enum()` needs a tuple for literal inference. The assertion below is what
 * keeps it honest: it is a **compile-time** proof that this list and the pillar
 * registry agree, in both directions. Adding or renaming a pillar slug breaks
 * the build here instead of drifting silently.
 */
export const COURSE_VERTICALS = [
  'linguistics',
  'inclusive-education',
  'wellbeing-counseling',
  'ai-digital-tech',
  'neet-jee',
] as const;

type _VerticalsMatchPillarSlugs = PillarSlug extends (typeof COURSE_VERTICALS)[number]
  ? (typeof COURSE_VERTICALS)[number] extends PillarSlug
    ? true
    : never
  : never;
const _verticalsMatchPillarSlugs: _VerticalsMatchPillarSlugs = true;

export type CourseVertical = (typeof COURSE_VERTICALS)[number];

/**
 * Human label per vertical, for the dashboard's course forms.
 *
 * **Hand-written, and NOT derived from the pillar registry.** A previous
 * version of this comment claimed otherwise; it was wrong. These are the
 * deliberately shorter labels the course form's vertical `<select>` shows,
 * while the marketing pages render the longer `pillar.vertical` from
 * `src/data/pillars.ts`. Nothing keeps the two in step — no type, no test,
 * no shared constant — so they can and do drift.
 *
 * Three of the five differ today:
 *
 *   pillar.vertical              verticalLabel
 *   Wellbeing & Counselling      Wellbeing & Counseling
 *   AI & Digital Technologies    AI & Digital Tech
 *   NEET & JEE Preparation       NEET & JEE Prep
 *
 * The Counselling/Counseling split is a live inconsistency in the shipped
 * product: the same programme is spelled two ways, in a place a student can
 * see both. Reconciling the copy is a product decision, so the values here are
 * left exactly as they were — do not "fix" one spelling without the other.
 * If the copy is ever reconciled, delete the table above, but keep the warning:
 * these strings are hand-maintained, not derived.
 */
export const verticalLabel: Record<CourseVertical, string> = {
  linguistics: 'Linguistics',
  'inclusive-education': 'Inclusive Education',
  'wellbeing-counseling': 'Wellbeing & Counseling',
  'ai-digital-tech': 'AI & Digital Tech',
  'neet-jee': 'NEET & JEE Prep',
};

export const MAX_PROFESSORS_PER_COURSE = 8;

/** Trim + lowercase — the one email normalization for every course action. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSchema = z
  .string({ message: 'Enter a valid email address.' })
  .trim()
  .min(1, 'Enter a valid email address.')
  .max(254, 'That email is too long.')
  .refine((value) => EMAIL_RE.test(value), 'Enter a valid email address.')
  .transform(normalizeEmail);

/** Course code — letters/numbers with single interior dashes, upper-cased. */
const courseCodeSchema = z
  .string({ message: 'Give the course a code (e.g. LING-101).' })
  .trim()
  .min(1, 'Give the course a code (e.g. LING-101).')
  .max(20, 'Keep the code under 20 characters.')
  .regex(
    /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/,
    'Use letters, numbers and single dashes between them (e.g. LING-101).'
  )
  .transform((value) => value.toUpperCase());

/** A list of professor emails, deduped in order, bounded in size. */
function emailListSchema(message: string) {
  return z
    .array(emailSchema)
    .transform((emails) => [...new Set(emails)])
    .refine((emails) => emails.length > 0, message)
    .refine(
      (emails) => emails.length <= MAX_PROFESSORS_PER_COURSE,
      `A course can have up to ${MAX_PROFESSORS_PER_COURSE} professors at once.`
    );
}

export const enrollStudentInputSchema = z.object({
  email: emailSchema,
});

export type EnrollStudentInput = z.infer<typeof enrollStudentInputSchema>;

export const courseIdentitySchema = z.object({
  code: courseCodeSchema,
  title: z.string().trim().min(1, 'Give the course a title.').max(120, 'Keep the title under 120 characters.'),
  vertical: z.enum(COURSE_VERTICALS, { message: 'Choose a programme vertical.' }),
  description: z
    .string()
    .trim()
    .max(2000, 'Keep the description under 2,000 characters.')
    .optional()
    .or(z.literal('')),
});

export type CourseIdentityInput = z.infer<typeof courseIdentitySchema>;

export const createCourseInputSchema = courseIdentitySchema.extend({
  professorEmails: emailListSchema('Assign at least one professor.'),
});

export type CreateCourseInput = z.infer<typeof createCourseInputSchema>;

export const updateCourseInputSchema = courseIdentitySchema.extend({
  courseId: z.string().min(1, 'Course id is missing.'),
});

export type UpdateCourseInput = z.infer<typeof updateCourseInputSchema>;

export const addCourseProfessorsInputSchema = z.object({
  courseId: z.string().min(1, 'Course id is missing.'),
  emails: emailListSchema('Add at least one professor email.'),
});

export type AddCourseProfessorsInput = z.infer<typeof addCourseProfessorsInputSchema>;

/** Direct-call inputs — ids are validated here, never trusted raw. */
export const unenrollStudentInputSchema = z.object({
  courseId: z.string().min(1),
  studentId: z.string().min(1),
});

export type UnenrollStudentInput = z.infer<typeof unenrollStudentInputSchema>;

export const removeCourseProfessorInputSchema = z.object({
  courseId: z.string().min(1),
  professorId: z.string().min(1),
});

export type RemoveCourseProfessorInput = z.infer<typeof removeCourseProfessorInputSchema>;

export const courseIdSchema = z.object({ courseId: z.string().min(1) });

export type CourseIdInput = z.infer<typeof courseIdSchema>;
