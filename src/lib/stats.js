// Pure, side-effect-free helpers that derive dashboard statistics from
// the active challenge's `days` array (each day carrying its `tasks`)
// already held in page.js (fetched once from /api/challenge). Nothing
// here touches the network or the DB.
//
// Every calculation here is driven by the ACTIVE CHALLENGE's own
// startDate + duration — never a fixed day count. A 30-day challenge and
// a 100-day challenge run through the exact same functions.

import { toLocalDateStr } from './date';

/** A day "counts" as complete when it has tasks and every task is done. */
export function isDayComplete(day) {
  return (day.tasks?.length ?? 0) > 0 && day.tasks.every(t => t.done);
}

function completionPct(day) {
  const total = day.tasks?.length ?? 0;
  if (total === 0) return 0;
  const done = day.tasks.filter(t => t.done).length;
  return Math.round((done / total) * 100);
}

/** 0–4, matching GitHub's five-step contribution intensity. */
function intensityLevel(pct, total) {
  if (total === 0) return 0;
  if (pct >= 100) return 4;
  if (pct >= 75) return 3;
  if (pct >= 50) return 2;
  if (pct > 0) return 1;
  return 0;
}

/**
 * Builds one cell per challenge day for the heatmap, in day-number order.
 * Each cell carries everything the tooltip / click handler needs so the
 * Heatmap component itself stays presentational. Works for a challenge
 * of any duration — nothing here assumes a fixed length.
 */
export function getHeatmapData(days = []) {
  if (!Array.isArray(days)) return [];

  const todayStr = toLocalDateStr();

  return days.map(day => {
    const total = day.tasks?.length ?? 0;
    const done = day.tasks?.filter(t => t.done).length ?? 0;
    const pct = completionPct(day);

    return {
      id: day.id,
      dayNumber: day.dayNumber,
      date: day.date,
      total,
      done,
      pct,
      level: intensityLevel(pct, total),
      isFuture: day.date > todayStr,
      isToday: day.date === todayStr,
    };
  });
}

/**
 * Calendar-driven "days left" for the active challenge, based purely on
 * challenge.startDate + challenge.duration + today's date — independent
 * of task completion state. Day 1 (today) -> duration - 1 left, ...,
 * final day -> 0 left. Recomputed from today's actual date on every
 * call, so it advances correctly after a refresh or on any future day.
 */
export function getDaysRemaining(challenge) {
  if (!challenge) return 0;
  const todayStr = toLocalDateStr();
  const daysPassed = daysBetween(challenge.startDate, todayStr);
  const currentDayNumber = Math.min(Math.max(daysPassed + 1, 1), challenge.duration);
  return Math.max(challenge.duration - currentDayNumber, 0);
}

/** 1-indexed "which day of the challenge is today", clamped to [1, duration]. */
export function getCurrentDayNumber(challenge) {
  if (!challenge) return 0;
  const todayStr = toLocalDateStr();
  const daysPassed = daysBetween(challenge.startDate, todayStr);
  return Math.min(Math.max(daysPassed + 1, 1), challenge.duration);
}

/** Whole calendar days between two "YYYY-MM-DD" strings (b - a), UTC-anchored. */
function daysBetween(aStr, bStr) {
  const [ay, am, ad] = aStr.split('-').map(Number);
  const [by, bm, bd] = bStr.split('-').map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86400000);
}

/**
 * Per-skill completed / total / percentage, ordered by each Skill's
 * `order` field. Only tasks with type === 'skill' contribute — general
 * (non-skill) tasks never count toward any skill's progress.
 */
export function getSkillProgress(days, skills = []) {
  const totals = Object.fromEntries(skills.map(s => [s.id, { done: 0, total: 0 }]));

  for (const day of days) {
    for (const task of day.tasks ?? []) {
      if (task.type !== 'skill' || task.skillId == null) continue;
      if (!totals[task.skillId]) continue; // defensive: skill may have been deleted
      totals[task.skillId].total++;
      if (task.done) totals[task.skillId].done++;
    }
  }

  return skills.map(skill => {
    const { done, total } = totals[skill.id] ?? { done: 0, total: 0 };
    return {
      id: skill.id,
      name: skill.name,
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });
}

/** Overall total / completed task counts across every day of the active challenge. */
export function getTaskTotals(days) {
  let total = 0;
  let done = 0;
  for (const day of days) {
    total += day.tasks?.length ?? 0;
    done += day.tasks?.filter(t => t.done).length ?? 0;
  }
  return { total, done };
}

/**
 * Flat, ordered list of every incomplete task across the active
 * challenge, each carrying its day's number/date so the "Tasks Left"
 * panel can render and jump to it. Sorted by day, then by the task's
 * own order within that day.
 */
export function getTasksLeft(days) {
  const out = [];
  for (const day of [...days].sort((a, b) => a.dayNumber - b.dayNumber)) {
    for (const task of [...(day.tasks ?? [])].sort((a, b) => a.order - b.order)) {
      if (!task.done) {
        out.push({ ...task, dayId: day.id, dayNumber: day.dayNumber, date: day.date });
      }
    }
  }
  return out;
}
