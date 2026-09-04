import 'server-only';
import { db } from '@/lib/db';
import { DomainError } from './errors';

/**
 * Shared ownership helpers (Dashboard Stage 2). Every professor mutation and
 * query funnels through CourseProfessors — co-teaching means course ownership
 * is a join lookup, never a single professorId column.
 */

/** Throws COURSE_NOT_OWNED when the professor is not on the course. */
export async function assertCourseOwned(professorId: string, courseId: string): Promise<void> {
  if (!(await professorOwnsCourse(professorId, courseId))) {
    throw new DomainError('COURSE_NOT_OWNED', 'Course not found.');
  }
}

/** Non-throwing form — used where a decision is needed (e.g. before minting
 *  an upload grant) rather than an error. */
export async function professorOwnsCourse(professorId: string, courseId: string): Promise<boolean> {
  const link = await db().courseProfessors.findUnique({
    where: { courseId_professorId: { courseId, professorId } },
  });
  return link !== null;
}

/** Returns the display title (with code) for notification copy. */
export async function getCourseDisplayTitle(courseId: string): Promise<string> {
  const course = await db().course.findUnique({
    where: { id: courseId },
    select: { code: true, title: true },
  });
  if (!course) throw new DomainError('COURSE_NOT_OWNED', 'Course not found.');
  return `${course.title} (${course.code})`;
}
