'use client';

import { useEffect, useState } from 'react';
import DiaryEntryCard from './DiaryEntryCard';
import DiaryEntryModal from './DiaryEntryModal';
import DiaryCreateModal from './DiaryCreateModal';

export default function PersonalDiarySection({ isAdmin, authHeaders, onUnauthorized }) {
  const [entries, setEntries] = useState(null);
  const [openEntry, setOpenEntry] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/diary/entries').then(r => r.json()).then(data => setEntries(Array.isArray(data) ? data : []));
  }, []);

  const resort = (list) => [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const create = async (payload) => {
    const res = await fetch('/api/diary/entries', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
    if (res.status === 401) return onUnauthorized();
    const entry = await res.json();
    if (!res.ok) return;
    setEntries(prev => resort([entry, ...prev]));
    setCreating(false);
  };

  const save = async (id, payload) => {
    const res = await fetch(`/api/diary/entries/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(payload) });
    if (res.status === 401) return onUnauthorized();
    const updated = await res.json();
    if (!res.ok) return;
    setEntries(prev => resort(prev.map(e => e.id === id ? updated : e)));
    setOpenEntry(updated);
  };

  const remove = async (id) => {
    const res = await fetch(`/api/diary/entries/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.status === 401) return onUnauthorized();
    setEntries(prev => prev.filter(e => e.id !== id));
    setOpenEntry(null);
  };

  return (
    <div>
      <div className="border border-[var(--border-strong)] rounded-lg bg-[var(--bg-surface)] p-5">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">My Personal Diary</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">Write whatever you want.</p>
        {isAdmin && (
          <button
            onClick={() => setCreating(true)}
            className="mt-3 ink-fill rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-85"
          >
            + New Diary Entry
          </button>
        )}
      </div>

      {entries === null ? (
        <p className="text-xs text-[var(--text-faint)] mt-3">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-[var(--text-faint)] italic mt-3">
          No entries yet.{isAdmin ? ' Write your first one.' : ''}
        </p>
      ) : (
        <div className="mt-3">
          <h3 className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] mb-2">Recent Entries</h3>
          <div className="space-y-2">
            {entries.map(entry => (
              <DiaryEntryCard key={entry.id} entry={entry} kind="entry" onOpen={setOpenEntry} />
            ))}
          </div>
        </div>
      )}

      {openEntry && (
        <DiaryEntryModal
          entry={openEntry} kind="entry" isAdmin={isAdmin}
          onClose={() => setOpenEntry(null)} onSave={save} onDelete={remove}
        />
      )}

      {creating && (
        <DiaryCreateModal kind="entry" onClose={() => setCreating(false)} onCreate={create} />
      )}
    </div>
  );
}
