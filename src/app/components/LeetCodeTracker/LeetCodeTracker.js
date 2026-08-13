'use client';

import { useEffect, useState } from 'react';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

export default function LeetCodeTracker({ isAdmin, authHeaders, onUnauthorized }) {
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(null); // which field is mid-request, for a subtle disabled state

  useEffect(() => {
    fetch('/api/leetcode')
      .then(r => r.json())
      .then(data => { setStats({ easy: data.easy ?? 0, medium: data.medium ?? 0, hard: data.hard ?? 0 }); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const bump = async (field, delta) => {
    if (!isAdmin) return;
    if (delta < 0 && stats[field] <= 0) return; // never negative

    // Optimistic update.
    setStats(prev => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }));
    setPending(field);
    const res = await fetch('/api/leetcode', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ field, delta }),
    });
    if (res.status === 401) {
      onUnauthorized();
      setStats(prev => ({ ...prev, [field]: Math.max(0, prev[field] - delta) })); // revert
    } else {
      const updated = await res.json();
      setStats({ easy: updated.easy, medium: updated.medium, hard: updated.hard });
    }
    setPending(null);
  };

  if (!loaded) return null;

  const total = stats.easy + stats.medium + stats.hard;

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">
          LeetCode Tracker
        </h2>
        <span className="text-xs text-[var(--text-muted)]">
          Solved <span className="text-[var(--text-primary)] font-semibold">{total}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DIFFICULTIES.map(({ key, label }) => (
          <div key={key} className="border border-[var(--border-subtle)] rounded-md px-3 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">{label}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => bump(key, -1)}
                disabled={!isAdmin || pending === key || stats[key] <= 0}
                className="w-5 h-5 flex items-center justify-center rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                aria-label={`Decrease ${label}`}
              >
                −
              </button>
              <span className="font-display text-base font-bold text-[var(--text-primary)] w-6 text-center tabular-nums">
                {stats[key]}
              </span>
              <button
                onClick={() => bump(key, 1)}
                disabled={!isAdmin || pending === key}
                className="w-5 h-5 flex items-center justify-center rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                aria-label={`Increase ${label}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      {!isAdmin && (
        <p className="text-[10px] text-[var(--text-faint)] mt-3">Log in as admin to update counts.</p>
      )}
    </div>
  );
}
