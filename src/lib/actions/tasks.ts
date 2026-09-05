'use server';

import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  taskInputSchema,
  updateTaskStatusInputSchema,
  type TaskInput,
} from '@/lib/validators/tasks';
import { flattenZodErrors } from '@/lib/validation';
import {
  createTaskForProfessor,
  deleteTaskForProfessor,
  updateTaskForProfessor,
  updateTaskStatusForProfessor,
} from '@/lib/domain/tasks';
import { DomainError } from '@/lib/domain/errors';
import { type ActionResult, formError, success } from './types';

/**
 * Coursework task Server Actions (Dashboard Stage 3) — thin orchestrators,
 * mirroring actions/sessions.ts. Every mutation revalidates BOTH role layouts:
 * a task the professor moves to DONE must refresh the students' read-only
 * Coursework section on their next render.
 */

function readTaskForm(formData: FormData) {
  return {
    courseId: String(formData.get('courseId') ?? ''),
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    dueDate: String(formData.get('dueDate') ?? ''),
  };
}

async function runMutation(
  formData: FormData,
  mutate: (professorId: string, input: TaskInput) => Promise<unknown>
): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = taskInputSchema.safeParse(readTaskForm(formData));
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

function revalidateDashboards(): void {
  revalidatePath('/dashboard/professor', 'layout');
  revalidatePath('/dashboard/student', 'layout');
}

export async function createTask(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = await runMutation(formData, (professorId, parsed) =>
    createTaskForProfessor(professorId, parsed)
  );
  return result.ok ? success('Task added to the course.') : result;
}

export async function updateTask(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const taskId = String(formData.get('taskId') ?? '');
  const result = await runMutation(formData, (professorId, parsed) =>
    updateTaskForProfessor(professorId, taskId, parsed)
  );
  return result.ok ? success('Task updated.') : result;
}

/** Direct call (not a form) — Kanban status buttons call this + router.refresh(). */
export async function updateTaskStatus(
  taskId: string,
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
): Promise<ActionResult> {
  const session = await requireRole('professor');
  const parsed = updateTaskStatusInputSchema.safeParse({ taskId, status });
  if (!parsed.success) return { ok: false, formError: 'Task is missing.' };
  try {
    await updateTaskStatusForProfessor(session.userId, parsed.data.taskId, parsed.data.status);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidateDashboards();
  return success('Task moved.');
}

/** Direct call (not a form) — two-step confirm + router.refresh() on the client. */
export async function deleteTask(taskId: string): Promise<ActionResult> {
  const session = await requireRole('professor');
  try {
    await deleteTaskForProfessor(session.userId, taskId);
  } catch (error) {
    if (error instanceof DomainError) return formError(error.message);
    throw error;
  }
  revalidateDashboards();
  return success('Task deleted.');
}
