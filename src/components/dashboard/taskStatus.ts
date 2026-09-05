import { TaskStatus } from '@/generated/prisma/enums';

/**
 * Task-status presentation maps (Dashboard Stage 3) — client-safe literal
 * Tailwind classes only (§18 rule 5: no dynamic construction). Status hues are
 * the design system's semantic tokens (--ec-success/--ec-warning/slate) and
 * every render pairs them with a label — never color alone. CVD note: the
 * green/amber pair sits in the 6–8 ΔE floor band; legal because chips carry
 * text labels + the completion monitor carries counts.
 */

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

/** Chip surfaces (soft tinted bg + same-hue ink). */
export const TASK_STATUS_CHIP: Record<TaskStatus, string> = {
  DONE: 'bg-ec-success/15 text-ec-success dark:bg-ec-success/25 dark:text-ec-success',
  IN_PROGRESS: 'bg-ec-warning/15 text-ec-warning dark:bg-ec-warning/25 dark:text-ec-warning',
  TODO: 'bg-ec-sky/70 text-ec-indigo dark:bg-ec-canvas-deep dark:text-white',
};

/** Solid dot hues — also the completion-bar segment fills. */
export const TASK_STATUS_DOT: Record<TaskStatus, string> = {
  DONE: 'bg-ec-success',
  IN_PROGRESS: 'bg-ec-warning',
  TODO: 'bg-ec-slate/70 dark:bg-ec-slate',
};
