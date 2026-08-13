'use client';

import { useState } from 'react';
import { formatDateTime } from '@/lib/date';

export default function DiaryEntryModal({ entry, kind, isAdmin, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(entry.date);
  const [module, setModule] = useState(entry.module || '');
  const [title, setTitle] = useState(entry.title || '');
  const [category, setCategory] = useState(entry.category || '');
  const [content, setContent] = useState(entry.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const heading = kind === 'mistake' ? entry.module : (entry.title || 'Untitled entry');

  const submitSave = async () => {
    if (!content.trim()) return;
    if (kind === 'mistake' && !module.trim()) return;
    setBusy(true);
    const payload = kind === 'mistake'
      ? { date, module: module.trim(), content: content.trim() }
      : { date, title: title.trim(), category: category.trim(), content: content.trim() };
    await onSave(entry.id, payload);
    setBusy(false);
    setEditing(false);
  };

  const submitDelete = async () => {
    setBusy(true);
    await onDelete(entry.id);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-lg shadow-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {!editing ? (
          <>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">{heading}</h2>
              <button onClick={onClose} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] shrink-0">✕</button>
            </div>
            {kind === 'entry' && entry.category && <span className="tag-chip inline-block mb-1">{entry.category}</span>}
            <p className="text-xs text-[var(--text-faint)] mb-4">Last edited: {formatDateTime(entry.updatedAt)}</p>

            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{entry.content}</p>

            {isAdmin && (
              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
                <button onClick={() => setEditing(true)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
                  Edit
                </button>
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Delete this entry permanently?</span>
                    <button disabled={busy} onClick={submitDelete} className="ink-fill text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-85 disabled:opacity-50">
                      Confirm
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="font-display text-sm font-bold text-[var(--text-primary)] mb-3">
              Edit {kind === 'mistake' ? 'mistake' : 'diary'} entry
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Date</label>
                <input
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {kind === 'mistake' ? (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Module</label>
                  <input
                    type="text" value={module} onChange={e => setModule(e.target.value)} placeholder="e.g. MPMC"
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Title</label>
                    <input
                      type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Optional"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Category</label>
                    <input
                      type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Optional"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Content</label>
                <textarea
                  value={content} onChange={e => setContent(e.target.value)} rows={8}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] resize-y"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                Cancel
              </button>
              <button disabled={busy} onClick={submitSave} className="ink-fill text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-85 disabled:opacity-50">
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
