'use client';

const FILTERS = [
  { id: 'all',     label: 'All Days' },
  { id: 'today',   label: 'Today' },
  { id: 'roles',   label: 'Role-wise Prep' },
];

export default function FilterBar({ filter, setFilter, search, setSearch }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              filter === f.id
                ? 'ink-fill border-[var(--text-primary)]'
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {typeof setSearch === 'function' && (
        <input
          type="text"
          value={search || ''}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="sm:ml-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors w-full sm:w-56"
        />
      )}
    </div>
  );
}