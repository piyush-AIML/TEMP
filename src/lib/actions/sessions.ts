'use server';

import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sessionInputSchema, type SessionInput } from '@/lib/validators/sessions';
import { flattenZodErrors } from '@/lib/validation';
import {
  cancelClassSessionForProfessor,
  createClassSessionForProfessor,
  updateClassSessionForProfessor,
} from '@/lib/domain/sessions';
import { DomainError } from '@/lib/domain/errors';
import { type ActionResult, formError, success } from './types';

/**
 * Class-session Server Actions (Dashboard Stage 2) — thin orchestrators:
 * requireRole('professor') → zod validate → domain op → revalidate BOTH role
 * layouts (the professor's change must show up on the enrolled students'
 * dashboards without a hard refresh; pages are dynamic so this clears the
 * router cache on their next navigation).
 */

function readForm(formData: FormData) {
  return {
    courseId: String(formData.get('courseId') ?? ''),
    startsAt: String(formData.get('startsAt') ?? ''),
    endsAt: String(formData.get('endsAt') ?? ''),
    mode: String(formData.get('mode') ?? ''),
    link: String(formData.get('link') ?? ''),
    location: String(formData.get('location') ?? ''),
  };
}

async function runMutation(
  formData: FormData,
  mutate: (professorId: string, input: SessionInput) => Promise<unknown>
): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = sessionInputSchema.safeParse(readForm(formData));
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

export async function createClassSession(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = await runMutation(formData, (professorId, parsed) =>
    createClassSessionForProfessor(professorId, parsed)
  );
  return result.ok ? success('Class scheduled — enrolled students can see it now.') : result;
}

export async function updateClassSession(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const sessionId = String(formData.get('sessionId') ?? '');
  const result = await runMutation(formData, (professorId, parsed) =>
    updateClassSessionForProfessor(professorId, sessionId, parsed)
  );
  return result.ok ? success('Class updated — students will see the change.') : result;
}

/** Direct call (not a form) — returns ActionResult for client-side refresh. */
export async function cancelClassSession(sessionId: string): Promise<ActionResult> {
  const session = await requireRole('professor');
  try {
    await cancelClassSessionForProfessor(session.userId, sessionId);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidatePath('/dashboard/professor', 'layout');
  revalidatePath('/dashboard/student', 'layout');
  return success('Class cancelled — students have been notified.');
}
