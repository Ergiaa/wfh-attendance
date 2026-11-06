// Mirrors attendance-service's WORK_TIMEZONE: the server decides which work day a check-in
// belongs to in this zone, so "today" and displayed times must use it too, not the browser's.
export const WORK_TIMEZONE = 'Asia/Jakarta';
export const WORK_TIMEZONE_LABEL = 'WIB';

const isoDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: WORK_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const longDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const time = new Intl.DateTimeFormat('en-GB', {
  timeZone: WORK_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
});

const timeWithSeconds = new Intl.DateTimeFormat('en-GB', {
  timeZone: WORK_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Today's work date as YYYY-MM-DD, the format the API filters on. */
export function todayWorkDate(now = new Date()): string {
  return isoDate.format(now);
}

/** "Thu, 6 Nov 2026" for a YYYY-MM-DD work date. */
export function formatWorkDate(workDate: string): string {
  // A date-only value has no zone; reading it as UTC midnight keeps the calendar day intact.
  return longDate.format(new Date(`${workDate}T00:00:00Z`));
}

/** "Thu, 6 Nov 2026" for a timestamp, taking the calendar day in the work timezone. */
export function formatDate(iso: string): string {
  return formatWorkDate(isoDate.format(new Date(iso)));
}

/** "08:15" in the work timezone. */
export function formatTime(iso: string | Date, { seconds = false } = {}): string {
  return (seconds ? timeWithSeconds : time).format(typeof iso === 'string' ? new Date(iso) : iso);
}
