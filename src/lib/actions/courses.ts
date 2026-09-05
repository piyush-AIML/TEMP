'use server';

import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createCourseInputSchema, enrollStudentInputSchema } from '@/lib/validators/courses';
import { flattenZodErrors } from '@/lib/validation';
import { createCourseForAdmin, enrollStudentForProfessor } from '@/lib/domain/courses';
import { DomainError } from '@/lib/domain/errors';
import { type ActionResult, formError, success } from './types';

/**
 * Course-setup Server Actions (course slice) — thin orchestrators on the
 * Stage 2 pattern. Enrolling revalidates BOTH role layouts so the student's
 * new course (and the professor's roster + meeting-student picker) appear on
 * their next render; course creation revalidates the admin layout.
 */

function readEnrollForm(formData: FormData) {
  return { email: String(formData.get('email') ?? '') };
}

export async function enrollStudent(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const courseId = String(formData.get('courseId') ?? '');
  const session = await requireRole('professor');
  const parsed = enrollStudentInputSchema.safeParse(readEnrollForm(formData));
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  try {
    const result = await enrollStudentForProfessor(session.userId, courseId, parsed.data);
    revalidatePath('/dashboard/professor', 'layout');
    revalidatePath('/dashboard/student', 'layout');
    return success(
      result.reenrolled
        ? `${result.studentName} is enrolled again — their course access is active.`
        : `${result.studentName} is now enrolled — they will see this course on their next visit.`
    );
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

function readCourseForm(formData: FormData) {
  // The form sends professor emails comma-separated; split + trim here so the
  // validator works on a clean array.
  const rawEmails = String(formData.get('professorEmails') ?? '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
  return {
    code: String(formData.get('code') ?? ''),
    title: String(formData.get('title') ?? ''),
    vertical: String(formData.get('vertical') ?? ''),
    description: String(formData.get('description') ?? ''),
    professorEmails: rawEmails,
  };
}

export async function createCourse(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole('admin');
  const parsed = createCourseInputSchema.safeParse(readCourseForm(formData));
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  try {
    const result = await createCourseForAdmin(parsed.data);
    revalidatePath('/dashboard/admin', 'layout');
    return success(`${result.code} created — the assigned professors can now run it.`);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}
