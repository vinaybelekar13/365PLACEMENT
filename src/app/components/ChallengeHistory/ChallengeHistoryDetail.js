'use client';

import { useEffect, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ChallengeHistoryDetail({ id }) {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetch(`/api/challenge-history/${id}`)
      .then(r => r.json())
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [id]);

  if (!detail) {
    return <p className="text-xs text-[var(--text-faint)] mt-4">Loading activity…</p>;
  }

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-4 max-h-[28rem] overflow-y-auto pr-1">
      {detail.days.map(day => (
        <div key={day.id}>
          <div className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">
            Day {day.dayNumber} — {formatDate(day.date)}
          </div>
          {day.tasks.length === 0 ? (
            <p className="text-xs text-[var(--text-faint)] italic pl-1">No tasks logged.</p>
          ) : (
            <div className="space-y-1 pl-1">
              {day.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <span className={task.done ? 'text-[var(--accent-done-text)]' : 'text-[var(--text-faint)]'}>
                    {task.done ? '✓' : '○'}
                  </span>
                  <span className={task.done ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}>{task.text}</span>
                  <span className="tag-chip">{task.type === 'skill' ? (task.skillName || 'Skill') : (task.category || 'General')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
