'use client';

import { useState } from 'react';
import { toLocalDateStr } from '@/lib/date';

export default function DiaryCreateModal({ kind, onClose, onCreate }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [module, setModule] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (kind === 'mistake' && !module.trim()) return;
    setBusy(true);
    const payload = kind === 'mistake'
      ? { date, module: module.trim(), content: content.trim() }
      : { date, title: title.trim(), category: category.trim(), content: content.trim() };
    await onCreate(payload);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-lg shadow-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display text-sm font-bold text-[var(--text-primary)] mb-3">
          {kind === 'mistake' ? 'Add mistake entry' : 'New diary entry'}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Date</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)} required
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
            />
          </div>

          {kind === 'mistake' ? (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Module</label>
              <input
                type="text" autoFocus value={module} onChange={e => setModule(e.target.value)} placeholder="e.g. MPMC" required
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)]"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Title</label>
                <input
                  type="text" autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Optional"
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
            <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">
              {kind === 'mistake' ? 'What went wrong?' : 'Write freely'}
            </label>
            <textarea
              value={content} onChange={e => setContent(e.target.value)} rows={8} required
              placeholder={kind === 'mistake'
                ? 'I made mistakes in the 8051 timer calculations...'
                : 'How did today go?'}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] resize-y"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="ink-fill text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-85 disabled:opacity-50">
              {busy ? 'Saving…' : 'Save entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
