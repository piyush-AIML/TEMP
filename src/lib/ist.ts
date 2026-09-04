/**
 * Client-safe IST wall-time helpers (Dashboard Stage 2). The server's
 * datetime helpers (validators/datetime.ts) are for zod + conversion; this
 * module is deliberately free of 'server-only' so form components can prefill
 * datetime-local inputs with IST wall times regardless of the visitor's
 * device timezone. Everything the app accepts as wall time is IST (forms are
 * labelled), so conversions target Asia/Kolkata explicitly.
 */

/** UTC instant → `YYYY-MM-DDTHH:mm` IST wall time (datetime-local value). */
export function toDatetimeLocalIST(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Kolkata',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** Default end-of-class suggestion: start + 90 minutes (IST wall arithmetic
 *  on the datetime-local string — safe, no tz math). */
export function addMinutesIST(wallTime: string, minutes: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(wallTime);
  if (!match) return wallTime;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]) + minutes
  );
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
