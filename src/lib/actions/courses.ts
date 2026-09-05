'use server';

import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  addCourseProfessorsInputSchema,
  createCourseInputSchema,
  courseIdSchema,
  enrollStudentInputSchema,
  removeCourseProfessorInputSchema,
  unenrollStudentInputSchema,
  updateCourseInputSchema,
} from '@/lib/validators/courses';
import { flattenZodErrors } from '@/lib/validation';
import {
  addCourseProfessorsForAdmin,
  createCourseForAdmin,
  deleteCourseForAdmin,
  enrollStudentForProfessor,
  removeCourseProfessorForAdmin,
  unenrollStudentForProfessor,
  updateCourseForAdmin,
} from '@/lib/domain/courses';
import { DomainError } from '@/lib/domain/errors';
import { type ActionResult, formError, success } from './types';

/**
 * Course-allocation Server Actions (course slice, reworked 2026-09-05) —
 * thin orchestrators on the Stage 2 pattern, grouped by actor:
 *
 * Professor — enrollStudent (form) + unenrollStudent (direct call). Both
 * revalidate the professor AND student layouts so rosters, the student's My
 * Courses and the meeting-student picker all repaint.
 *
 * Admin — createCourse + updateCourse (forms) and deleteCourse /
 * addCourseProfessors / removeCourseProfessor (direct calls, client-side
 * refresh). Course identity changes flow to every surface that renders it.
 */

// ---------------------------------------------------------------------------
// Professor surface
// ---------------------------------------------------------------------------

export async function enrollStudent(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const courseId = String(formData.get('courseId') ?? '');
  const session = await requireRole('professor');
  const parsed = enrollStudentInputSchema.safeParse({
    email: String(formData.get('email') ?? ''),
  });
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  if (!courseId) return formError('Course id is missing — please reload the page.');
  try {
    const result = await enrollStudentForProfessor(session.userId, courseId, parsed.data);
    revalidatePath('/dashboard/professor', 'layout');
    revalidatePath('/dashboard/student', 'layout');
    return success(
      result.reenrolled
        ? `${result.studentName} is enrolled again — course access is active and a notification is in their bell.`
        : `${result.studentName} is now enrolled — the course will appear in their dashboard and a notification is in their bell.`
    );
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

/** Direct call — roster rows run this behind a two-step confirm, then refresh. */
export async function unenrollStudent(courseId: string, studentId: string): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = unenrollStudentInputSchema.safeParse({ courseId, studentId });
  if (!parsed.success) return formError('Could not remove that student — please reload the page.');
  try {
    const result = await unenrollStudentForProfessor(
      session.userId,
      parsed.data.courseId,
      parsed.data.studentId
    );
    revalidatePath('/dashboard/professor', 'layout');
    revalidatePath('/dashboard/student', 'layout');
    return success(`${result.studentName} was removed from the course — they can be enrolled again anytime.`);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Admin surface
// ---------------------------------------------------------------------------

/** The chips input repeats a hidden `professorEmails` input per email. */
function readEmailList(formData: FormData): string[] {
  return formData.getAll('professorEmails').map((value) => String(value)).filter(Boolean);
}

function readCourseIdentity(formData: FormData) {
  return {
    code: String(formData.get('code') ?? ''),
    title: String(formData.get('title') ?? ''),
    vertical: String(formData.get('vertical') ?? ''),
    description: String(formData.get('description') ?? ''),
  };
}

export async function createCourse(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole('admin');
  const parsed = createCourseInputSchema.safeParse({
    ...readCourseIdentity(formData),
    professorEmails: readEmailList(formData),
  });
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  try {
    const result = await createCourseForAdmin(parsed.data);
    revalidatePath('/dashboard/admin', 'layout');
    revalidatePath('/dashboard/professor', 'layout');
    return success(`${result.code} created — ${result.assignedNames.join(', ')} can now run it.`);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

export async function updateCourse(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole('admin');
  const courseId = String(formData.get('courseId') ?? '');
  const parsed = updateCourseInputSchema.safeParse({ ...readCourseIdentity(formData), courseId });
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  try {
    const { courseId: id, ...identity } = parsed.data;
    const result = await updateCourseForAdmin(id, identity);
    revalidatePath('/dashboard/admin', 'layout');
    revalidatePath('/dashboard/professor', 'layout');
    revalidatePath('/dashboard/student', 'layout');
    return success(`${result.code} saved.`);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

/** Direct call — the danger zone runs this after typed confirmation, then leaves. */
export async function deleteCourse(courseId: string): Promise<ActionResult> {
  await requireRole('admin');
  const parsed = courseIdSchema.safeParse({ courseId });
  if (!parsed.success) return formError('Could not delete the course — please reload the page.');
  try {
    const result = await deleteCourseForAdmin(parsed.data.courseId);
    revalidatePath('/dashboard/admin', 'layout');
    revalidatePath('/dashboard/professor', 'layout');
    revalidatePath('/dashboard/student', 'layout');
    return success(
      result.removedFiles > 0
        ? `${result.code} deleted — its stored files were removed with it.`
        : `${result.code} deleted.`
    );
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

/** Direct call — add professors by email; partial success is reported honestly. */
export async function addCourseProfessors(courseId: string, emails: string[]): Promise<ActionResult> {
  await requireRole('admin');
  const parsed = addCourseProfessorsInputSchema.safeParse({ courseId, emails });
  if (!parsed.success) return formError(parsed.error.issues[0]?.message ?? 'Could not add those professors.');
  try {
    const result = await addCourseProfessorsForAdmin(parsed.data.courseId, parsed.data.emails);
    revalidatePath('/dashboard/admin', 'layout');
    revalidatePath('/dashboard/professor', 'layout');
    if (result.added.length === 0 && result.failed.length > 0) {
      return formError(formatResolutionFailure(result.failed));
    }
    const parts: string[] = [];
    if (result.added.length > 0) {
      parts.push(`${result.added.map((p) => p.name).join(', ')} now teach${result.added.length === 1 ? 'es' : ''} this course.`);
    }
    if (result.alreadyAssigned.length > 0) {
      parts.push(`${result.alreadyAssigned.map((p) => p.name).join(', ')} ${result.alreadyAssigned.length === 1 ? 'already teaches' : 'already teach'} it.`);
    }
    if (result.failed.length > 0) parts.push(formatResolutionFailure(result.failed));
    return success(parts.join(' '));
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

/** Direct call — remove one professor from a course (co-teachers stay). */
export async function removeCourseProfessor(courseId: string, professorId: string): Promise<ActionResult> {
  await requireRole('admin');
  const parsed = removeCourseProfessorInputSchema.safeParse({ courseId, professorId });
  if (!parsed.success) return formError('Could not remove that professor — please reload the page.');
  try {
    const result = await removeCourseProfessorForAdmin(parsed.data.courseId, parsed.data.professorId);
    revalidatePath('/dashboard/admin', 'layout');
    revalidatePath('/dashboard/professor', 'layout');
    return success(`${result.professorName} was removed from this course.`);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
}

function formatResolutionFailure(
  failed: Array<{ email: string; reason: string }>
): string {
  return `Could not assign: ${failed.map((f) => `${f.email} (${f.reason})`).join('; ')}.`;
}
