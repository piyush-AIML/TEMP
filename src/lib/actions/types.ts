import type { StepErrors } from '@/lib/validation';

/**
 * Shared Server Action result shape (Dashboard Stage 2). Plain serializable
 * objects only (no Dates) — consumed by useActionState forms and direct
 * client calls alike.
 *
 * Contract:
 * - Authorization failures throw (requireRole redirects).
 * - Ownership failures → { ok: false, formError } — never leak whether the
 *   resource exists ("Course not found." for missing AND not-owned).
 * - Validation failures → { ok: false, fieldErrors } keyed by input name.
 */
export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; fieldErrors?: StepErrors; formError?: string };

export function formError(message: string): ActionResult {
  return { ok: false, formError: message };
}

export function success(message?: string): ActionResult {
  return { ok: true, message };
}
