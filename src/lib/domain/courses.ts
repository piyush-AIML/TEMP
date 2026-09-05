import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus, MaterialType, Role } from '@/generated/prisma/enums';
import { getStorage } from '@/lib/storage';
import { createStudentNotification } from '@/lib/notifications/notify';
import type {
  AddCourseProfessorsInput,
  CourseIdentityInput,
  CreateCourseInput,
  EnrollStudentInput,
} from '@/lib/validators/courses';
import { DomainError } from './errors';
import { assertCourseOwned, getCourseDisplayTitle } from './ownership';

/**
 * Course-allocation domain operations (reworked 2026-09-05) — plain async
 * functions taking explicit actor ids; the action layer gates + validates.
 *
 * Professor surface: enroll a student by account email (row exists only after
 * they signed in once) and unenroll (soft DROPPED — re-enrollment reactivates).
 * Admin surface: create/update/delete courses and assign professors (M2M —
 * co-teaching). Email matching is case-insensitive by construction: the
 * validators lowercase, so the DB `email in [...]` lookups below only ever
 * see lowercase input.
 *
 * Every enrolment/removal change notifies the student (ENROLLMENT channel,
 * created AFTER the row change — same shape as the materials domain's
 * notify-after-create). Professor-facing notices (assignment/removal) wait
 * for the professor-facing notification stage.
 */

type ProfessorResolution = {
  resolved: Array<{ id: string; name: string; email: string }>;
  failed: Array<{ email: string; reason: string }>;
};

/** One-query resolution of professor emails → rows or per-email honest reasons. */
async function resolveProfessorEmails(emails: string[]): Promise<ProfessorResolution> {
  const rows = await db().user.findMany({
    where: { email: { in: emails } },
    select: { id: true, name: true, email: true, role: true },
  });
  const byEmail = new Map(rows.map((row) => [row.email, row]));
  const resolution: ProfessorResolution = { resolved: [], failed: [] };
  for (const email of emails) {
    const user = byEmail.get(email);
    if (!user) {
      resolution.failed.push({
        email,
        reason: 'no Educraft account yet — they need to accept an invitation and sign in once first',
      });
    } else if (user.role !== Role.PROFESSOR) {
      resolution.failed.push({ email, reason: 'not a professor account — only professors can teach' });
    } else {
      resolution.resolved.push({ id: user.id, name: user.name, email: user.email });
    }
  }
  return resolution;
}

function throwResolutionFailed(failed: Array<{ email: string; reason: string }>): never {
  const listed = failed.map((f) => `${f.email} (${f.reason})`).join('; ');
  throw new DomainError('PROFESSOR_RESOLUTION_FAILED', `Could not assign: ${listed}.`);
}

/** Prisma P2002 duck-check — unique-constraint violations are mapped to
 *  domain errors, never surfaced as raw 500s (validator dedupe handles the
 *  usual causes; this is the concurrency backstop). */
function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002';
}

// ---------------------------------------------------------------------------
// Professor surface
// ---------------------------------------------------------------------------

/**
 * Enrolls a student (by account email) into a course the professor teaches.
 * Existing rows reactivate to ACTIVE (a DROPPED student returning, or a
 * COMPLETED course being repeated) rather than failing — an ACTIVE row is the
 * only "already enrolled" case. The read-then-write runs in a transaction so
 * two co-professors enrolling the same student at once cannot crash on the
 * composite unique key. The student is notified after the row lands.
 */
export async function enrollStudentForProfessor(
  professorId: string,
  courseId: string,
  input: EnrollStudentInput
): Promise<{ studentName: string; reenrolled: boolean }> {
  await assertCourseOwned(professorId, courseId);
  const student = await db().user.findUnique({ where: { email: input.email } });
  if (!student) {
    throw new DomainError(
      'USER_NOT_FOUND',
      'No Educraft account found for that email — they need to accept an invitation and sign in once first.'
    );
  }
  if (student.role !== Role.STUDENT) {
    throw new DomainError('USER_NOT_STUDENT', 'That account is not a student — only students can be enrolled.');
  }
  const displayName = student.name?.trim() || input.email;

  let reenrolled: boolean;
  try {
    reenrolled = await db().$transaction(async (tx) => {
      const existing = await tx.enrollment.findUnique({
        where: { studentId_courseId: { studentId: student.id, courseId } },
        select: { status: true },
      });
      if (existing) {
        if (existing.status === EnrollmentStatus.ACTIVE) {
          throw new DomainError('ALREADY_ENROLLED', `${displayName} is already enrolled in this course.`);
        }
        await tx.enrollment.update({
          where: { studentId_courseId: { studentId: student.id, courseId } },
          data: { status: EnrollmentStatus.ACTIVE },
        });
        return true;
      }
      await tx.enrollment.create({
        data: { studentId: student.id, courseId, status: EnrollmentStatus.ACTIVE },
      });
      return false;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DomainError('ALREADY_ENROLLED', `${displayName} is already enrolled in this course.`);
    }
    throw error;
  }

  const display = await getCourseDisplayTitle(courseId);
  await createStudentNotification(student.id, {
    type: 'ENROLLMENT',
    title: reenrolled ? `Enrolled again in ${display}` : `Enrolled in ${display}`,
    relatedEntity: `course:${courseId}`,
  });
  return { studentName: displayName, reenrolled };
}

/**
 * Unenrolls a student from a course the professor teaches — a soft drop to
 * DROPPED so history survives and the enroll form can reactivate later. Only
 * an ACTIVE row can be dropped; anything else is "not enrolled". The student
 * is notified (no relatedEntity — they can no longer open the course).
 */
export async function unenrollStudentForProfessor(
  professorId: string,
  courseId: string,
  studentId: string
): Promise<{ studentName: string }> {
  await assertCourseOwned(professorId, courseId);
  const enrollment = await db().enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true, status: true, student: { select: { name: true } } },
  });
  if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
    throw new DomainError('NOT_ENROLLED', 'That student is not enrolled in this course.');
  }
  await db().enrollment.update({
    where: { id: enrollment.id },
    data: { status: EnrollmentStatus.DROPPED },
  });
  const studentName = enrollment.student.name?.trim() || 'That student';
  const display = await getCourseDisplayTitle(courseId);
  await createStudentNotification(studentId, {
    type: 'ENROLLMENT',
    title: `Removed from ${display}`,
    body: 'Your course access has ended — classes and materials for this course are no longer available to you.',
  });
  return { studentName };
}

// ---------------------------------------------------------------------------
// Admin surface
// ---------------------------------------------------------------------------

async function requireCourse(courseId: string): Promise<{ code: string; title: string }> {
  const course = await db().course.findUnique({
    where: { id: courseId },
    select: { code: true, title: true },
  });
  if (!course) throw new DomainError('COURSE_NOT_FOUND', 'Course not found.');
  return course;
}

/**
 * Creates a course and assigns its professors (all-or-nothing: any email that
 * does not resolve to a professor account blocks the create and the message
 * names every failure). The code is the natural key — duplicate or racy codes
 * surface as COURSE_CODE_TAKEN, never a raw P2002.
 */
export async function createCourseForAdmin(
  input: CreateCourseInput
): Promise<{ id: string; code: string; assignedNames: string[] }> {
  const existing = await db().course.findUnique({ where: { code: input.code }, select: { id: true } });
  if (existing) {
    throw new DomainError('COURSE_CODE_TAKEN', `A course with the code ${input.code} already exists.`);
  }

  const resolution = await resolveProfessorEmails(input.professorEmails);
  if (resolution.failed.length > 0) throwResolutionFailed(resolution.failed);

  try {
    const course = await db().course.create({
      data: {
        code: input.code,
        title: input.title.trim(),
        vertical: input.vertical,
        description: input.description?.trim() || null,
        professors: {
          create: resolution.resolved.map((professor) => ({ professorId: professor.id })),
        },
      },
      select: { id: true },
    });
    return { id: course.id, code: input.code, assignedNames: resolution.resolved.map((p) => p.name) };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DomainError('COURSE_CODE_TAKEN', `A course with the code ${input.code} already exists.`);
    }
    throw error;
  }
}

/** Updates a course's identity (code/title/vertical/description). */
export async function updateCourseForAdmin(courseId: string, input: CourseIdentityInput): Promise<{ code: string }> {
  const course = await requireCourse(courseId);
  if (course.code !== input.code) {
    const taken = await db().course.findUnique({ where: { code: input.code }, select: { id: true } });
    if (taken && taken.id !== courseId) {
      throw new DomainError('COURSE_CODE_TAKEN', `A course with the code ${input.code} already exists.`);
    }
  }
  try {
    await db().course.update({
      where: { id: courseId },
      data: {
        code: input.code,
        title: input.title.trim(),
        vertical: input.vertical,
        description: input.description?.trim() || null,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DomainError('COURSE_CODE_TAKEN', `A course with the code ${input.code} already exists.`);
    }
    throw error;
  }
  return { code: input.code };
}

/**
 * Adds professors to an existing course. Partial success is allowed and
 * reported: valid new professors are added, already-assigned ones are noted,
 * and unresolvable emails are returned for the action to enumerate — the
 * course already exists, so there is nothing half-built to worry about.
 */
export async function addCourseProfessorsForAdmin(
  courseId: string,
  emails: AddCourseProfessorsInput['emails']
): Promise<{
  added: Array<{ id: string; name: string; email: string }>;
  alreadyAssigned: Array<{ name: string; email: string }>;
  failed: Array<{ email: string; reason: string }>;
}> {
  await requireCourse(courseId);
  const resolution = await resolveProfessorEmails(emails);

  const assignedEmails = new Set(
    (
      await db().courseProfessors.findMany({
        where: { courseId, professorId: { in: resolution.resolved.map((p) => p.id) } },
        select: { professorId: true },
      })
    ).map((link) => link.professorId)
  );

  const added: Array<{ id: string; name: string; email: string }> = [];
  const alreadyAssigned: Array<{ name: string; email: string }> = [];
  for (const professor of resolution.resolved) {
    if (assignedEmails.has(professor.id)) {
      alreadyAssigned.push({ name: professor.name, email: professor.email });
    } else {
      added.push({ id: professor.id, name: professor.name, email: professor.email });
    }
  }
  if (added.length > 0) {
    await db().courseProfessors.createMany({
      data: added.map((p) => ({ courseId, professorId: p.id })),
    });
  }
  return { added, alreadyAssigned, failed: resolution.failed };
}

/** Removes one professor from a course (co-teaching: others stay). */
export async function removeCourseProfessorForAdmin(
  courseId: string,
  professorId: string
): Promise<{ professorName: string }> {
  await requireCourse(courseId);
  const link = await db().courseProfessors.findUnique({
    where: { courseId_professorId: { courseId, professorId } },
    select: { professor: { select: { name: true } } },
  });
  if (!link) {
    throw new DomainError('PROFESSOR_NOT_ASSIGNED', 'That professor is not assigned to this course.');
  }
  await db().courseProfessors.delete({
    where: { courseId_professorId: { courseId, professorId } },
  });
  return { professorName: link.professor.name };
}

/**
 * Deletes a course and everything that hangs off it (sessions, materials,
 * tasks, completion logs, enrollments — all FK cascades). FILE materials'
 * stored objects are removed from storage first, best-effort: an orphaned
 * object is worse than a failed delete, so provider trouble logs and never
 * blocks the removal (same rule as deleteMaterial).
 */
export async function deleteCourseForAdmin(courseId: string): Promise<{ code: string; removedFiles: number }> {
  const course = await requireCourse(courseId);

  const fileKeys = await db().material.findMany({
    where: { courseId, type: MaterialType.FILE, fileKey: { not: null } },
    select: { fileKey: true },
  });
  for (const material of fileKeys) {
    if (!material.fileKey) continue;
    try {
      await getStorage().delete(material.fileKey);
    } catch (error) {
      console.error('storage delete failed during course removal (continuing):', error);
    }
  }

  await db().course.delete({ where: { id: courseId } });
  return { code: course.code, removedFiles: fileKeys.length };
}
