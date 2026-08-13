// Small, dependency-free date helpers shared by the dashboard header,
// the challenge-day generation logic, and lib/stats.js.
//
// IMPORTANT: every "what day is it" calculation in this app is pinned to
// a single canonical timezone (APP_TIMEZONE) instead of "ambient local
// time". This matters because this app runs its date logic in two very
// different places that do NOT share a clock:
//   - Server-side API routes (challenge creation/extension) run on
//     whatever machine/CI/deploy step executes them. Cloud platforms
//     (Vercel, GitHub Actions, Docker, etc.) default their Node process
//     to UTC regardless of where the user is.
//   - The dashboard's "today" is computed in the user's own browser,
//     which uses the *browser's* local timezone (e.g. IST for a user in
//     India).
// If each side independently asked "what's today, in MY local time?",
// they'd disagree for part of every day — a UTC server and an IST
// browser can compute two different calendar dates for the exact same
// instant (IST is 5:30 ahead, so the IST calendar flips to the next day
// while the UTC server is still on the previous one). Pinning both sides
// to the same explicit timeZone via Intl removes that dependency
// entirely — the answer is now the same everywhere, regardless of which
// machine/browser timezone actually runs the code.
const APP_TIMEZONE = 'Asia/Kolkata';

/** "Wednesday, 29 July 2026" for a given Date (defaults to now), rendered
 *  in APP_TIMEZONE so the header always matches the roadmap's day boundary. */
export function formatFullDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date);
  const get = (type) => parts.find(p => p.type === type)?.value ?? '';
  return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`;
}

/**
 * "YYYY-MM-DD" for a given Date, evaluated in APP_TIMEZONE — NOT the
 * ambient local time of whatever machine happens to run this code, and
 * NOT UTC via toISOString() (see the file header above for why both of
 * those are wrong here). This is the one function every "is this day
 * today / in the past / in the future" comparison in the app should go
 * through, so the seed script and the dashboard always agree.
 */
export function toLocalDateStr(date = new Date(), timeZone = APP_TIMEZONE) {
  // en-CA locale formats as YYYY-MM-DD directly — no manual string surgery.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** "13 August 2026" for a "YYYY-MM-DD" string — used by My Diary entries. */
export function formatDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(dt);
  const get = (type) => parts.find(p => p.type === type)?.value ?? '';
  return `${get('day')} ${get('month')} ${get('year')}`;
}

/**
 * "13 August 2026, 6:42 PM" for a Date/ISO timestamp, rendered in
 * APP_TIMEZONE — used for My Diary's "Last edited" stamps.
 */
export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);
  const get = (type) => parts.find(p => p.type === type)?.value ?? '';
  return `${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')} ${get('dayPeriod')}`;
}

/**
 * Adds `n` calendar days to a "YYYY-MM-DD" string and returns the result
 * as another "YYYY-MM-DD" string. Pure date-string arithmetic anchored
 * at UTC midnight of the given calendar date — deliberately NOT a real
 * timezone conversion, so it's immune to DST and to whatever timezone
 * the executing machine happens to be in. Used whenever a Challenge is
 * created or extended, to derive Day 2..Day N's date from Day 1's
 * (already-canonical) start date.
 */
export function addDaysToDateStr(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().split('T')[0];
}
