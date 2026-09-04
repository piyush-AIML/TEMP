import 'server-only';

/**
 * Dashboard display formatting (Stage 1). The DB stores UTC; the school runs
 * on Indian time, so everything renders in Asia/Kolkata with an explicit IST
 * label (en-IN's own short timezone output is not guaranteed).
 *
 * All calendar-day logic derives the date *in IST* via Intl.formatToParts —
 * never Date UTC getters (a 23:30 UTC session is 05:00 the next day in IST).
 * Formatters are cached at module scope; this module is server-only, so the
 * instances live in one Node runtime.
 */

const TIME_ZONE = 'Asia/Kolkata';

/** Normalises narrow no-break spaces some ICU builds emit around am/pm. */
function clean(value: string): string {
  return value.replace(/[  ]/g, ' ');
}

const dayDateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TIME_ZONE,
});

const fullDateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

/** `Friday, 5 September` in IST (no year — used for near-future day labels). */
const longDayDateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
});

const dateKeyFormatter = new Intl.DateTimeFormat('en-IN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIME_ZONE,
});

/** ISO string → IST calendar date as `YYYY-MM-DD`. */
export function toISTDateKey(iso: string): string {
  const parts = Object.fromEntries(
    dateKeyFormatter.formatToParts(new Date(iso)).map((part) => [part.type, part.value])
  ) as Record<string, string>;
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** `Fri, 5 Sep` in IST. */
function formatISTDayDate(iso: string): string {
  return clean(dayDateFormatter.format(new Date(iso)));
}

/** `11:00 am` in IST. */
function formatISTTime(iso: string): string {
  return clean(timeFormatter.format(new Date(iso)));
}

/** One session line, e.g. `Fri, 5 Sep · 11:00 am – 12:30 pm IST`. */
export function formatSessionRange(startIso: string, endIso: string): string {
  return `${formatISTDayDate(startIso)} · ${formatISTTime(startIso)} – ${formatISTTime(endIso)} IST`;
}

/** `Friday, 5 September 2026` in IST. */
export function formatFullDate(iso: string): string {
  return clean(fullDateFormatter.format(new Date(iso)));
}

/** Short IST date, e.g. `Fri, 5 Sep` — used for feed item timestamps. */
export function formatShortDate(iso: string): string {
  return formatISTDayDate(iso);
}

/**
 * Relative day label: `Today` / `Tomorrow` for the next two IST days,
 * otherwise a full IST date (`Friday, 5 September`).
 */
export function formatDayLabel(iso: string): string {
  const todayKey = toISTDateKey(new Date().toISOString());
  const targetKey = toISTDateKey(iso);

  if (targetKey === todayKey) return 'Today';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (targetKey === toISTDateKey(tomorrow.toISOString())) return 'Tomorrow';

  return clean(longDayDateFormatter.format(new Date(iso)));
}

/** Groups a session list into IST-day buckets, preserving input order. */
export function groupSessionsByISTDay<T extends { startsAt: string }>(
  sessions: T[]
): Array<{ dateKey: string; label: string; sessions: T[] }> {
  const groups: Array<{ dateKey: string; label: string; sessions: T[] }> = [];
  for (const session of sessions) {
    const dateKey = toISTDateKey(session.startsAt);
    const existing = groups.find((group) => group.dateKey === dateKey);
    if (existing) {
      existing.sessions.push(session);
    } else {
      groups.push({ dateKey, label: formatDayLabel(session.startsAt), sessions: [session] });
    }
  }
  return groups;
}
