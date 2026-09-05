'use server';

import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { meetingInputSchema, type MeetingInput } from '@/lib/validators/meetings';
import { flattenZodErrors } from '@/lib/validation';
import {
  cancelMeetingForProfessor,
  createMeetingForProfessor,
  updateMeetingForProfessor,
} from '@/lib/domain/meetings';
import { DomainError } from '@/lib/domain/errors';
import { type ActionResult, formError, success } from './types';

/**
 * Meeting Server Actions (Dashboard Stage 3) — thin orchestrators, mirroring
 * actions/sessions.ts: requireRole('professor') → zod validate → domain op →
 * revalidate BOTH role layouts (a STUDENT meeting the professor schedules or
 * cancels must reach the student's bell on next navigation).
 */

function readForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    withWhom: String(formData.get('withWhom') ?? ''),
    studentId: String(formData.get('studentId') ?? ''),
    startsAt: String(formData.get('startsAt') ?? ''),
    endsAt: String(formData.get('endsAt') ?? ''),
    link: String(formData.get('link') ?? ''),
  };
}

async function runMutation(
  formData: FormData,
  mutate: (professorId: string, input: MeetingInput) => Promise<unknown>
): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = meetingInputSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, fieldErrors: flattenZodErrors(parsed) };
  try {
    await mutate(session.userId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidatePath('/dashboard/professor', 'layout');
  revalidatePath('/dashboard/student', 'layout');
  return success();
}

export async function createMeeting(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = await runMutation(formData, (professorId, parsed) =>
    createMeetingForProfessor(professorId, parsed)
  );
  return result.ok ? success('Meeting scheduled — the student is notified for 1:1 meetings.') : result;
}

export async function updateMeeting(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const meetingId = String(formData.get('meetingId') ?? '');
  const result = await runMutation(formData, (professorId, parsed) =>
    updateMeetingForProfessor(professorId, meetingId, parsed)
  );
  return result.ok ? success('Meeting updated.') : result;
}

/** Direct call (not a form) — returns ActionResult for client-side refresh. */
export async function cancelMeeting(meetingId: string): Promise<ActionResult> {
  const session = await requireRole('professor');
  try {
    await cancelMeetingForProfessor(session.userId, meetingId);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidatePath('/dashboard/professor', 'layout');
  revalidatePath('/dashboard/student', 'layout');
  return success('Meeting cancelled — the student has been notified.');
}
