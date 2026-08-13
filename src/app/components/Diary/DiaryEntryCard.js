'use client';

import { formatDateStr, formatDateTime } from '@/lib/date';

export default function DiaryEntryCard({ entry, kind, onOpen }) {
  const heading = kind === 'mistake' ? entry.module : (entry.title || 'Untitled entry');

  return (
    <button
      onClick={() => onOpen(entry)}
      className="w-full text-left border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--border-default)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{heading}</div>
          {kind === 'entry' && entry.category && (
            <span className="tag-chip mt-1 inline-block">{entry.category}</span>
          )}
          <div className="text-xs text-[var(--text-muted)] mt-1">{formatDateStr(entry.date)}</div>
          <div className="text-[10px] text-[var(--text-faint)] mt-0.5">
            Last edited: {formatDateTime(entry.updatedAt)}
          </div>
        </div>
        <span className="text-[var(--text-faint)] text-xs shrink-0">→</span>
      </div>
    </button>
  );
}
