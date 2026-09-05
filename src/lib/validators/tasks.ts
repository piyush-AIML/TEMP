import { z } from 'zod';
import { optionalDateOnlySchema } from './datetime';

/**
 * Coursework task input validation (Dashboard Stage 3). Tasks are course-wide
 * (no per-student assignee in the schema — the whole class works the same
 * plan). dueDate is an optional IST date-only input; the action read layer
 * maps '' → null and the domain stores IST midnight UTC.
 */

export const taskInputSchema = z.object({
  courseId: z.string().min(1, { message: 'Choose a course.' }),
  title: z.string().trim().min(1, 'Give the task a title.').max(200, 'Keep the title under 200 characters.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Keep the description under 2,000 characters.')
    .optional()
    .or(z.literal('')),
  dueDate: optionalDateOnlySchema,
});

export const updateTaskStatusInputSchema = z.object({
  taskId: z.string().min(1, 'Task is missing.'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], { message: 'Choose a task status.' }),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
export type TaskStatusInput = z.infer<typeof updateTaskStatusInputSchema>;
