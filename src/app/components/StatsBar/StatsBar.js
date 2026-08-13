'use client';

export default function StatsBar({ total, done, skillProgress, daysPassed, totalDays }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const dayPct =
    totalDays > 0
      ? Math.round((Math.min(daysPassed, totalDays) / totalDays) * 100)
      : 0;

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] overflow-hidden">
      {/* Progress block */}
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
        <div className="p-4">
          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
            <span>Overall completion</span>
            <span className="text-[var(--text-primary)] font-semibold">{done}/{total} &nbsp;·&nbsp; {pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
            <span>Time elapsed</span>
            <span className="text-[var(--text-primary)] font-semibold">
  {Math.min(daysPassed, totalDays)}/{totalDays} days &nbsp;·&nbsp; {dayPct}%
</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--border-strong)] rounded-full transition-all duration-500" style={{ width: `${dayPct}%` }} />
          </div>
        </div>
      </div>

      {/* Skill ledger — one column per user-defined skill, however many there are */}
      {skillProgress.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[var(--border-subtle)]">
          {skillProgress.map(skill => (
            <div key={skill.id} className="p-3 flex flex-col gap-2 min-w-0">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] truncate" title={skill.name}>
                {skill.name}
              </span>
              <span className="font-display text-xl font-bold text-[var(--text-primary)]">{skill.done}</span>
            </div>
          ))}
        </div>
      )}

      {/* Completed / remaining */}
      <div className="border-t border-[var(--border-subtle)] grid grid-cols-2 divide-x divide-[var(--border-subtle)]">
        <div className="p-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">Completed</span>
          <span className="font-display text-lg font-bold text-[var(--text-primary)]">{done}</span>
        </div>
        <div className="p-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">Remaining</span>
          <span className="font-display text-lg font-bold text-[var(--text-muted)]">{total - done}</span>
        </div>
      </div>
    </div>
  );
}
