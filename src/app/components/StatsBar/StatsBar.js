'use client';

const CATEGORIES = [
  { key: 'dsa',      label: 'DSA',          pattern: 'tag-dsa' },
  { key: 'da',       label: 'Data Analyst', pattern: 'tag-da' },
  { key: 'genai',    label: 'Gen AI',       pattern: 'tag-genai' },
  { key: 'backend',  label: 'Backend Web',  pattern: 'tag-backend' },
  { key: 'core',     label: 'Core',         pattern: 'tag-core' },
  { key: 'aptitude', label: 'Aptitude',     pattern: 'tag-aptitude' },
];

export default function StatsBar({ total, done, dsa, da, genai, backend, core, aptitude, daysPassed }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const dayPct = Math.round((Math.min(daysPassed, 45) / 45) * 100);
  const values = { dsa, da, genai, backend, core, aptitude };

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
            <span className="text-[var(--text-primary)] font-semibold">{Math.min(daysPassed, 45)}/45 days &nbsp;·&nbsp; {dayPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--border-strong)] rounded-full transition-all duration-500" style={{ width: `${dayPct}%` }} />
          </div>
        </div>
      </div>

      {/* Category ledger */}
      <div className="border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[var(--border-subtle)]">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="p-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">
              {cat.label}
            </span>
            <span className="font-display text-xl font-bold text-[var(--text-primary)]">{values[cat.key]}</span>
          </div>
        ))}
      </div>

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