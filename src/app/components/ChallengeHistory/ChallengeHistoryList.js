'use client';

import { useEffect, useState } from 'react';
import ChallengeHistoryDetail from './ChallengeHistoryDetail';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ChallengeHistoryList() {
  const [history, setHistory] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetch('/api/challenge-history')
      .then(r => r.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, []);

  if (!history) {
    return <p className="text-sm text-[var(--text-faint)]">Loading…</p>;
  }

  if (history.length === 0) {
    return (
      <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-6">
        <p className="text-sm text-[var(--text-faint)] italic">
          No completed challenges yet. Once you finish a challenge, it&apos;s archived here permanently.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map(item => (
        <div key={item.id} className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)] truncate">{item.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {formatDate(item.startDate)} → {formatDate(item.endDate)} · {item.duration} days
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="font-display text-lg font-bold text-[var(--text-primary)] tabular-nums">{item.completionPct}%</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">
                  {item.completedTasks}/{item.totalTasks} tasks
                </div>
              </div>
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors shrink-0"
              >
                {openId === item.id ? 'Hide History' : 'View History'}
              </button>
            </div>
          </div>

          {openId === item.id && <ChallengeHistoryDetail id={item.id} />}
        </div>
      ))}
    </div>
  );
}
