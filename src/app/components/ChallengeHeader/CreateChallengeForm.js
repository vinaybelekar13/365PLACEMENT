'use client';

import { useState } from 'react';
import { toLocalDateStr } from '@/lib/date';

export default function CreateChallengeForm({ onCreate, error, clearError }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(toLocalDateStr());
  const [duration, setDuration] = useState(45);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    const d = Number(duration);
    if (!trimmed || !startDate || !Number.isFinite(d) || d < 1) return;
    setBusy(true);
    await onCreate({ name: trimmed, startDate, duration: d });
    setBusy(false);
  };

  return (
    <div className="border border-[var(--border-strong)] rounded-lg bg-[var(--bg-surface)] p-6 sm:p-8">
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1.5">No active challenge</div>
      <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Start a new challenge</h1>

      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Challenge name</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. DSA Sprint" required
            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Start date</label>
          <input
            type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required
            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1">Duration (days)</label>
          <input
            type="number" min={1} value={duration} onChange={e => setDuration(e.target.value)} required
            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
          />
        </div>
        <div className="sm:col-span-3">
          <button type="submit" disabled={busy} className="ink-fill rounded px-4 py-2 text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-50">
            {busy ? 'Creating…' : 'Create challenge'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded px-3 py-2">
          <span>{error}</span>
          <button onClick={clearError} className="text-[var(--text-faint)] hover:text-[var(--text-primary)]">✕</button>
        </div>
      )}
    </div>
  );
}
