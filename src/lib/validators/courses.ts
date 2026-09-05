import { z } from 'zod';

/**
 * Course-setup input validation (Dashboard course slice). Enrolling a student
 * takes their account email; creating a course takes the course identity plus
 * the professor emails to assign (comma-separated in the form, an array here —
 * co-teaching is supported through CourseProfessors). The vertical must be one
 * of the five programme slugs — kept as a literal here so validators stay
 * dependency-free; keep in sync with the slugs in data/programmes.ts and the
 * keys of src/lib/pillarStyles.ts.
 */

export const COURSE_VERTICALS = [
  'linguistics',
  'inclusive-education',
  'wellbeing-counseling',
  'ai-digital-tech',
  'neet-jee',
] as const;

export type CourseVertical = (typeof COURSE_VERTICALS)[number];

export const verticalLabel: Record<CourseVertical, string> = {
  linguistics: 'Linguistics',
  'inclusive-education': 'Inclusive Education',
  'wellbeing-counseling': 'Wellbeing & Counseling',
  'ai-digital-tech': 'AI & Digital Tech',
  'neet-jee': 'NEET & JEE Prep',
};

export const enrollStudentInputSchema = z.object({
  email: z
    .string({ message: 'Enter the student’s email.' })
    .trim()
    .min(1, 'Enter the student’s email.')
    .max(254, 'That email is too long.')
    .refine(
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Enter a valid email address.'
    ),
});

export type EnrollStudentInput = z.infer<typeof enrollStudentInputSchema>;

export const createCourseInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Give the course a code (e.g. LING-101).')
    .max(20, 'Keep the code under 20 characters.')
    .regex(/^[A-Za-z0-9-]+$/, 'Use only letters, numbers and dashes (e.g. LING-101).')
    .transform((value) => value.toUpperCase()),
  title: z.string().trim().min(1, 'Give the course a title.').max(120, 'Keep the title under 120 characters.'),
  vertical: z.enum(COURSE_VERTICALS, { message: 'Choose a programme vertical.' }),
  description: z
    .string()
    .trim()
    .max(2000, 'Keep the description under 2,000 characters.')
    .optional()
    .or(z.literal('')),
  professorEmails: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(254)
        .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Enter valid email addresses.')
    )
    .min(1, 'Assign at least one professor.'),
});

export type CreateCourseInput = z.infer<typeof createCourseInputSchema>;
