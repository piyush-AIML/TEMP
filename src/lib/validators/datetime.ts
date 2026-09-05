import { z } from 'zod';

/**
 * IST wall-time helpers for datetime-local form inputs (Dashboard Stage 2+).
 *
 * `<input type="datetime-local">` emits `"2026-09-10T11:00"` — a wall time
 * with NO offset. The school runs on Indian time, so every form input is
 * labelled IST and interpreted as such server-side. Range checks compare the
 * zero-padded strings lexicographically (no Date math, no tz drift); storage
 * stays UTC via istWallTimeToUtc.
 */

/** Matches the datetime-local input format exactly. */
export const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const datetimeLocalSchema = z
  .string({ message: 'Choose a date and time.' })
  .regex(DATETIME_LOCAL_PATTERN, 'Use the date-time picker (times are IST).');

/** Interpret the wall time as IST and return the UTC instant. */
export function istWallTimeToUtc(wallTime: string): Date {
  return new Date(`${wallTime}+05:30`);
}

/** Lexicographic comparison is valid for zero-padded ISO-like wall times. */
export function isAfterWallTime(a: string, b: string): boolean {
  return a > b;
}

/** Matches `<input type="date">` exactly (no time part). */
export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Optional due-date input: `''` (cleared) or `YYYY-MM-DD`; empty → null in the
 *  read layer (materials convention). The "does this date exist" check runs
 *  against the UTC parse of a bare midnight — existence only, no tz meaning. */
export const optionalDateOnlySchema = z
  .string()
  .trim()
  .max(10, 'Enter a date in YYYY-MM-DD format.')
  .default('')
  .refine((value) => value === '' || DATE_ONLY_PATTERN.test(value), 'Use the date picker (YYYY-MM-DD).')
  .refine(
    (value) => value === '' || !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    'That date does not exist.'
  );

/** `YYYY-MM-DD` is an IST *date* — store the UTC instant of IST midnight so
 *  the whole IST day is covered and the stored instant round-trips cleanly. */
export function istDateOnlyToUtc(dateOnly: string): Date {
  return new Date(`${dateOnly}T00:00:00+05:30`);
}
