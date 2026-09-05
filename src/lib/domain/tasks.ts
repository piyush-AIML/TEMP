import 'server-only';
import { db } from '@/lib/db';
import { TaskStatus } from '@/generated/prisma/enums';
import type { TaskInput } from '@/lib/validators/tasks';
import { istDateOnlyToUtc } from '@/lib/validators/datetime';
import { formatShortDate } from '@/lib/dashboard/format';
import { createCourseNotifications } from '@/lib/notifications/notify';
import { assertCourseOwned } from './ownership';
import { DomainError } from './errors';

/**
 * Coursework task domain operations (Dashboard Stage 3). Tasks are
 * course-wide (no per-student assignee — the whole class works the same
 * plan). Every mutation verifies CourseProfessors ownership server-side,
 * writes, and keeps the CompletionLog write-through ledger in step:
 *
 *   TASK_PERCENT: TODO 0 · IN_PROGRESS 50 · DONE 100
 *
 * The log mirrors Task.status and is populated per schema/seed requirements —
 * it is NEVER the read source (the completion monitor counts live Task.status
 * so the two can never drift). Status changes make no noise; due-date changes
 * fan out honest TASK_DUE notifications to every ACTIVE-enrolled student.
 */

const TASK_PERCENT: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 50, DONE: 100 };

/** Fetches the task and asserts the professor owns its course. */
async function getOwnedTask(professorId: string, taskId: string) {
  const task = await db().task.findUnique({ where: { id: taskId } });
  if (!task) throw new DomainError('TASK_NOT_FOUND', 'Task not found.');
  await assertCourseOwned(professorId, task.courseId);
  return task;
}

/** Fans out a TASK_DUE event to every ACTIVE-enrolled student of the course. */
function notifyTaskDue(
  courseId: string,
  event: { title: string; dueDate: Date }
): Promise<void> {
  return createCourseNotifications(courseId, {
    type: 'TASK_DUE',
    title: event.title,
    body: `Due ${formatShortDate(event.dueDate.toISOString())}`,
    relatedEntity: `course:${courseId}`,
  });
}

export async function createTaskForProfessor(
  professorId: string,
  input: TaskInput
): Promise<{ id: string }> {
  await assertCourseOwned(professorId, input.courseId);

  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const dueDate = input.dueDate ? istDateOnlyToUtc(input.dueDate) : null;

  const task = await db().task.create({
    data: {
      courseId: input.courseId,
      createdById: professorId,
      title,
      description,
      dueDate,
      status: TaskStatus.TODO,
    },
  });

  await db().completionLog.create({
    data: { courseId: input.courseId, taskId: task.id, percentComplete: TASK_PERCENT.TODO },
  });

  if (dueDate) {
    await notifyTaskDue(input.courseId, { title: `New task: ${title}`, dueDate });
  }

  return { id: task.id };
}

export async function updateTaskForProfessor(
  professorId: string,
  taskId: string,
  input: TaskInput
): Promise<void> {
  const task = await getOwnedTask(professorId, taskId);

  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const dueDate = input.dueDate ? istDateOnlyToUtc(input.dueDate) : null;

  await db().task.update({
    where: { id: taskId },
    data: { title, description, dueDate },
  });

  // Notify only when the due date CHANGED TO a value (null→set or set→other).
  // Set→cleared and unchanged dates stay silent — "no noise" (materials rule).
  const dueChanged =
    (task.dueDate ? task.dueDate.getTime() : null) !== (dueDate ? dueDate.getTime() : null);
  if (dueChanged && dueDate) {
    await notifyTaskDue(task.courseId, { title: `Task due date updated: ${title}`, dueDate });
  }
}

export async function updateTaskStatusForProfessor(
  professorId: string,
  taskId: string,
  status: TaskStatus
): Promise<void> {
  const task = await getOwnedTask(professorId, taskId);

  await db().task.update({ where: { id: taskId }, data: { status } });
  await db().completionLog.upsert({
    where: { taskId },
    create: { courseId: task.courseId, taskId, percentComplete: TASK_PERCENT[status] },
    update: { courseId: task.courseId, percentComplete: TASK_PERCENT[status] },
  });
}

export async function deleteTaskForProfessor(professorId: string, taskId: string): Promise<void> {
  const task = await getOwnedTask(professorId, taskId);
  await db().task.delete({ where: { id: taskId } }); // CompletionLog row cascades via FK
}
