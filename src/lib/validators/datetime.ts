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
