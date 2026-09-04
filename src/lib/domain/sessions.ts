import 'server-only';
import { db } from '@/lib/db';
import { SessionStatus } from '@/generated/prisma/enums';
import type { SessionInput } from '@/lib/validators/sessions';
import { istWallTimeToUtc } from '@/lib/validators/datetime';
import { formatSessionRange } from '@/lib/dashboard/format';
import { createCourseNotifications } from '@/lib/notifications/notify';
import { DomainError } from './errors';
import { assertCourseOwned, getCourseDisplayTitle } from './ownership';

/**
 * Class-session domain operations (Dashboard Stage 2) — plain async functions
 * taking an explicit professorId; the action layer only gates + validates.
 * Every mutation verifies CourseProfessors ownership server-side, writes,
 * then fans out honest NEW_CLASS notifications to enrolled students.
 */

export async function createClassSessionForProfessor(
  professorId: string,
  input: SessionInput
): Promise<{ id: string }> {
  await assertCourseOwned(professorId, input.courseId);
  const courseTitle = await getCourseDisplayTitle(input.courseId);

  const startsAt = istWallTimeToUtc(input.startsAt);
  const endsAt = istWallTimeToUtc(input.endsAt);
  const isOnline = input.mode === 'ONLINE';

  const session = await db().classSession.create({
    data: {
      courseId: input.courseId,
      startsAt,
      endsAt,
      mode: input.mode,
      link: isOnline && input.link ? input.link : null,
      location: !isOnline && input.location ? input.location : null,
      status: SessionStatus.SCHEDULED,
    },
  });

  await createCourseNotifications(input.courseId, {
    type: 'NEW_CLASS',
    title: `New class scheduled: ${courseTitle}`,
    body: `${formatSessionRange(startsAt.toISOString(), endsAt.toISOString())}`,
    relatedEntity: `course:${input.courseId}`,
  });

  return { id: session.id };
}

export async function updateClassSessionForProfessor(
  professorId: string,
  sessionId: string,
  input: SessionInput
): Promise<void> {
  const existing = await db().classSession.findUnique({ where: { id: sessionId } });
  if (!existing) throw new DomainError('SESSION_NOT_FOUND', 'Session not found.');
  if (existing.courseId !== input.courseId) {
    // Course switch not offered by the UI; treat as not-owned rather than guess.
    throw new DomainError('COURSE_NOT_OWNED', 'Course not found.');
  }
  await assertCourseOwned(professorId, input.courseId);
  const courseTitle = await getCourseDisplayTitle(input.courseId);

  const startsAt = istWallTimeToUtc(input.startsAt);
  const endsAt = istWallTimeToUtc(input.endsAt);
  const isOnline = input.mode === 'ONLINE';

  await db().classSession.update({
    where: { id: sessionId },
    data: {
      startsAt,
      endsAt,
      mode: input.mode,
      link: isOnline && input.link ? input.link : null,
      location: !isOnline && input.location ? input.location : null,
    },
  });

  const timeChanged = existing.startsAt.getTime() !== startsAt.getTime() || existing.endsAt.getTime() !== endsAt.getTime();
  await createCourseNotifications(input.courseId, {
    type: 'NEW_CLASS',
    title: timeChanged
      ? `Class rescheduled: ${courseTitle}`
      : `Class details updated: ${courseTitle}`,
    body: `${formatSessionRange(startsAt.toISOString(), endsAt.toISOString())}`,
    relatedEntity: `course:${input.courseId}`,
  });
}

export async function cancelClassSessionForProfessor(professorId: string, sessionId: string): Promise<void> {
  const existing = await db().classSession.findUnique({ where: { id: sessionId } });
  if (!existing) throw new DomainError('SESSION_NOT_FOUND', 'Session not found.');
  await assertCourseOwned(professorId, existing.courseId);
  const courseTitle = await getCourseDisplayTitle(existing.courseId);

  await db().classSession.update({
    where: { id: sessionId },
    data: { status: SessionStatus.CANCELLED },
  });

  await createCourseNotifications(existing.courseId, {
    type: 'NEW_CLASS',
    title: `Class cancelled: ${courseTitle}`,
    body: `${formatSessionRange(existing.startsAt.toISOString(), existing.endsAt.toISOString())} — this class is cancelled.`,
    relatedEntity: `course:${existing.courseId}`,
  });
}
