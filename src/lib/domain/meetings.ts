import 'server-only';
import { db } from '@/lib/db';
import { EnrollmentStatus, SessionStatus } from '@/generated/prisma/enums';
import type { MeetingInput } from '@/lib/validators/meetings';
import { istWallTimeToUtc } from '@/lib/validators/datetime';
import { formatSessionRange } from '@/lib/dashboard/format';
import { createStudentNotification } from '@/lib/notifications/notify';
import { DomainError } from './errors';

/**
 * One-on-one meeting domain operations (Dashboard Stage 3) — plain async
 * functions taking an explicit professorId; the action layer only gates +
 * validates. Meetings are professor-owned rows (no CourseProfessors join — the
 * professorId column IS the owner), with an optional student link. Students
 * get a MEETING notification when the meeting is with them; parent/other
 * meetings notify nobody (the title carries who they're with, and there is no
 * parent/other User row to notify).
 */

/** Throws when the student is not ACTIVE-enrolled in any course this
 *  professor teaches (roster data is professor-scoped — honest message, no
 *  existence oracle). */
export async function assertStudentInRoster(professorId: string, studentId: string): Promise<void> {
  const enrollment = await db().enrollment.findFirst({
    where: {
      studentId,
      status: EnrollmentStatus.ACTIVE,
      course: { professors: { some: { professorId } } },
    },
    select: { id: true },
  });
  if (!enrollment) {
    throw new DomainError('STUDENT_NOT_IN_ROSTER', 'That student is not in any of your classes.');
  }
}

/** First name of the professor, for notification copy a student sees — a
 *  student may have several professors, so the recipient must know WHO
 *  scheduled. Honest fallback rather than an empty string. */
async function professorFirstName(professorId: string): Promise<string> {
  const professor = await db().user.findUnique({
    where: { id: professorId },
    select: { name: true },
  });
  const name = professor?.name?.trim();
  if (!name) return 'your professor';
  return name.split(/\s+/)[0] ?? name;
}

/** Notifies the linked student about a meeting with this professor. */
async function notifyStudentMeeting(
  professorId: string,
  studentId: string,
  event: { verb: 'scheduled' | 'rescheduled' | 'updated' | 'cancelled'; meetingTitle: string; startsAt: Date; endsAt: Date }
): Promise<void> {
  const firstName = await professorFirstName(professorId);
  const range = formatSessionRange(event.startsAt.toISOString(), event.endsAt.toISOString());
  const verbTitle: Record<typeof event.verb, string> = {
    scheduled: 'Meeting scheduled with',
    rescheduled: 'Meeting rescheduled with',
    updated: 'Meeting details updated with',
    cancelled: 'Meeting cancelled with',
  };
  const body =
    event.verb === 'cancelled'
      ? `${event.meetingTitle} · ${range} — this meeting is cancelled.`
      : `${event.meetingTitle} · ${range}`;
  await createStudentNotification(studentId, {
    type: 'MEETING',
    title: `${verbTitle[event.verb]} ${firstName}`,
    body,
    // No relatedEntity: meeting notifications have no role-agnostic deep link
    // (NotificationList renders unlinked rows for anything not "course:").
    relatedEntity: null,
  });
}

export async function createMeetingForProfessor(
  professorId: string,
  input: MeetingInput
): Promise<{ id: string }> {
  const withStudent = input.withWhom === 'STUDENT';
  const studentId = withStudent ? input.studentId || null : null;
  if (withStudent && !studentId) {
    // Defensive: validation requires the id, but a non-form caller must not
    // slip through (assertStudentInRoster needs a concrete id to check).
    throw new DomainError('STUDENT_NOT_IN_ROSTER', 'That student is not in any of your classes.');
  }
  if (studentId) await assertStudentInRoster(professorId, studentId);

  const startsAt = istWallTimeToUtc(input.startsAt);
  const endsAt = istWallTimeToUtc(input.endsAt);

  const meeting = await db().meeting.create({
    data: {
      professorId,
      title: input.title.trim(),
      withWhom: input.withWhom,
      studentId,
      startsAt,
      endsAt,
      link: input.link || null,
      status: SessionStatus.SCHEDULED,
    },
  });

  if (studentId) {
    await notifyStudentMeeting(professorId, studentId, {
      verb: 'scheduled',
      meetingTitle: meeting.title,
      startsAt,
      endsAt,
    });
  }

  return { id: meeting.id };
}

export async function updateMeetingForProfessor(
  professorId: string,
  meetingId: string,
  input: MeetingInput
): Promise<void> {
  const existing = await db().meeting.findUnique({ where: { id: meetingId } });
  // Missing AND not-owned share one message — no existence oracle.
  if (!existing || existing.professorId !== professorId) {
    throw new DomainError('MEETING_NOT_FOUND', 'Meeting not found.');
  }

  const withStudent = input.withWhom === 'STUDENT';
  const newStudentId = withStudent ? input.studentId || null : null;
  if (withStudent && !newStudentId) {
    throw new DomainError('STUDENT_NOT_IN_ROSTER', 'That student is not in any of your classes.');
  }
  if (newStudentId && newStudentId !== existing.studentId) {
    await assertStudentInRoster(professorId, newStudentId);
  }

  const startsAt = istWallTimeToUtc(input.startsAt);
  const endsAt = istWallTimeToUtc(input.endsAt);

  await db().meeting.update({
    where: { id: meetingId },
    data: {
      title: input.title.trim(),
      withWhom: input.withWhom,
      studentId: newStudentId,
      startsAt,
      endsAt,
      link: input.link || null,
    },
  });

  if (newStudentId) {
    const timeChanged =
      existing.startsAt.getTime() !== startsAt.getTime() || existing.endsAt.getTime() !== endsAt.getTime();
    if (existing.studentId !== newStudentId) {
      // Retargeted to a different student — they never knew; the former
      // student keeps their (now stale) row until a future stage syncs it.
      await notifyStudentMeeting(professorId, newStudentId, {
        verb: 'scheduled',
        meetingTitle: input.title.trim(),
        startsAt,
        endsAt,
      });
    } else {
      await notifyStudentMeeting(professorId, newStudentId, {
        verb: timeChanged ? 'rescheduled' : 'updated',
        meetingTitle: input.title.trim(),
        startsAt,
        endsAt,
      });
    }
  }
}

export async function cancelMeetingForProfessor(professorId: string, meetingId: string): Promise<void> {
  const existing = await db().meeting.findUnique({ where: { id: meetingId } });
  if (!existing || existing.professorId !== professorId) {
    throw new DomainError('MEETING_NOT_FOUND', 'Meeting not found.');
  }

  await db().meeting.update({
    where: { id: meetingId },
    data: { status: SessionStatus.CANCELLED },
  });

  if (existing.studentId) {
    await notifyStudentMeeting(professorId, existing.studentId, {
      verb: 'cancelled',
      meetingTitle: existing.title,
      startsAt: existing.startsAt,
      endsAt: existing.endsAt,
    });
  }
}
