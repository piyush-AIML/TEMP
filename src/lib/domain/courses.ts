import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus, Role } from '@/generated/prisma/enums';
import type { CreateCourseInput, EnrollStudentInput } from '@/lib/validators/courses';
import { DomainError } from './errors';
import { assertCourseOwned } from './ownership';

/**
 * Course-setup domain operations (Dashboard course slice) — closes the
 * §24.8 "known gap": invites create accounts only, and until now the seed was
 * the only writer of CourseProfessors/Enrollment rows. A professor enrolls a
 * student by account email (the User row exists only after the student signed
 * in once — invite acceptance does not create one); an admin creates a course
 * and assigns its professors. No notifications: enrollment has no
 * NotificationType today, so the UI copy carries the outcome honestly.
 */

/** Looks up an account by email and checks it is a student row. */
async function requireStudentByEmail(email: string) {
  const user = await db().user.findUnique({ where: { email } });
  if (!user) {
    throw new DomainError(
      'USER_NOT_FOUND',
      'No Educraft account found for that email — they need to accept an invitation and sign in once first.'
    );
  }
  if (user.role !== Role.STUDENT) {
    throw new DomainError('USER_NOT_STUDENT', 'That account is not a student — only students can be enrolled.');
  }
  return user;
}

/**
 * Enrolls a student (by account email) into a course the professor teaches.
 * Existing rows are reactivated to ACTIVE (a DROPPED student returning, or a
 * COMPLETED course being repeated) rather than failing — an ACTIVE row is the
 * only "already enrolled" case.
 */
export async function enrollStudentForProfessor(
  professorId: string,
  courseId: string,
  input: EnrollStudentInput
): Promise<{ studentName: string; reenrolled: boolean }> {
  await assertCourseOwned(professorId, courseId);
  const student = await requireStudentByEmail(input.email);
  const displayName = student.name?.trim() || input.email;

  const existing = await db().enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
  });
  if (existing) {
    if (existing.status === EnrollmentStatus.ACTIVE) {
      throw new DomainError('ALREADY_ENROLLED', `${displayName} is already enrolled in this course.`);
    }
    await db().enrollment.update({
      where: { id: existing.id },
      data: { status: EnrollmentStatus.ACTIVE },
    });
    return { studentName: displayName, reenrolled: true };
  }

  await db().enrollment.create({
    data: { studentId: student.id, courseId, status: EnrollmentStatus.ACTIVE },
  });
  return { studentName: displayName, reenrolled: false };
}

/** Looks up an account by email and checks it is a professor row. */
async function requireProfessorByEmail(email: string) {
  const user = await db().user.findUnique({ where: { email } });
  if (!user) {
    throw new DomainError(
      'USER_NOT_FOUND',
      `No Educraft account found for ${email} — they need to accept an invitation and sign in once first.`
    );
  }
  if (user.role !== Role.PROFESSOR) {
    throw new DomainError('USER_NOT_PROFESSOR', `${email} is not a professor account — only professors can teach.`);
  }
  return user;
}

/**
 * Creates a course and assigns its professors (M2M). The code is the natural
 * key — a duplicate is a DomainError, never a raw Prisma P2002 at the action.
 */
export async function createCourseForAdmin(input: CreateCourseInput): Promise<{ id: string; code: string }> {
  const code = input.code.toUpperCase();
  const existing = await db().course.findUnique({ where: { code } });
  if (existing) {
    throw new DomainError('COURSE_CODE_TAKEN', `A course with the code ${code} already exists.`);
  }

  const professors = await Promise.all(input.professorEmails.map(requireProfessorByEmail));

  const course = await db().course.create({
    data: {
      code,
      title: input.title.trim(),
      vertical: input.vertical,
      description: input.description?.trim() || null,
      professors: {
        create: professors.map((professor) => ({ professorId: professor.id })),
      },
    },
  });

  return { id: course.id, code: course.code };
}
