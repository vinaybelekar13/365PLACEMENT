'use client';

/**
 * Small, premium stat card — used for Current Streak, Best Streak and
 * Days Left. Intentionally minimal: icon, label, value. No charts.
 */
export default function StreakCard({ icon, label, value, unit }) {
  return (
    <div className="flex-1 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] px-4 py-3 flex items-center gap-3 transition-colors hover:border-[var(--border-default)]">
      <span className="text-lg leading-none shrink-0" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">{label}</div>
        <div className="font-display text-lg font-bold text-[var(--text-primary)] leading-tight">
          {value}
          {unit && <span className="text-xs font-normal text-[var(--text-muted)] ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
