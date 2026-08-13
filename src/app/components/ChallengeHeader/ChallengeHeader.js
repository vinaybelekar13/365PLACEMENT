'use client';

import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ChallengeHeader({
  challenge, currentDayNumber, daysRemaining, completionPct,
  isAdmin, onRename, onExtend, onComplete, error, clearError,
}) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(challenge.name);
  const [extending, setExtending] = useState(false);
  const [newDuration, setNewDuration] = useState(challenge.duration);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  const submitRename = async () => {
    const trimmed = name.trim();
    setEditingName(false);
    if (!trimmed || trimmed === challenge.name) { setName(challenge.name); return; }
    await onRename(trimmed);
  };

  const submitExtend = async () => {
    const duration = Number(newDuration);
    if (!Number.isFinite(duration) || duration < 1) return;
    setBusy(true);
    const ok = await onExtend(duration);
    setBusy(false);
    if (ok) setExtending(false);
  };

  const submitComplete = async () => {
    setBusy(true);
    await onComplete();
    setBusy(false);
    setConfirmComplete(false);
  };

  return (
    <div className="border border-[var(--border-strong)] rounded-lg bg-[var(--bg-surface)] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-1.5">Current Challenge</div>
          {isAdmin && editingName ? (
            <input
              type="text" autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') { setName(challenge.name); setEditingName(false); } }}
              onBlur={submitRename}
              className="font-display text-2xl sm:text-3xl font-bold bg-[var(--bg-base)] border border-[var(--text-primary)] rounded px-2 py-0.5 text-[var(--text-primary)] focus:outline-none w-full"
            />
          ) : (
            <h1
              onDoubleClick={() => isAdmin && setEditingName(true)}
              className={`font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-tight truncate ${isAdmin ? 'cursor-text' : ''}`}
              title={isAdmin ? 'Double-click to rename' : undefined}
            >
              {challenge.name}
            </h1>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatDate(challenge.startDate)} · {challenge.duration}-day challenge
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {currentDayNumber} <span className="text-[var(--text-faint)] font-normal text-base">/ {challenge.duration}</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">{daysRemaining} days left</div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">{completionPct}%</div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">complete</div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
          {!extending ? (
            <button onClick={() => { setNewDuration(challenge.duration); setExtending(true); }} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
              Change duration
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} value={newDuration} autoFocus
                onChange={e => setNewDuration(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitExtend()}
                className="w-20 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
              />
              <span className="text-xs text-[var(--text-faint)]">days</span>
              <button disabled={busy} onClick={submitExtend} className="ink-fill text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-85 disabled:opacity-50">
                Save
              </button>
              <button onClick={() => setExtending(false)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
                Cancel
              </button>
            </div>
          )}

          {!confirmComplete ? (
            <button onClick={() => setConfirmComplete(true)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
              Complete challenge
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Archive to history and end this challenge?</span>
              <button disabled={busy} onClick={submitComplete} className="ink-fill text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-85 disabled:opacity-50">
                Confirm
              </button>
              <button onClick={() => setConfirmComplete(false)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded px-3 py-2">
          <span>{error}</span>
          <button onClick={clearError} className="text-[var(--text-faint)] hover:text-[var(--text-primary)]">✕</button>
        </div>
      )}
    </div>
  );
}
