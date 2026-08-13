'use client';

import { useState } from 'react';

export default function GoalsPanel({ goals, isAdmin, onAdd, onToggle, onEdit, onDelete, onReorder }) {
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const submitAdd = () => {
    const text = newText.trim();
    if (text) onAdd(text);
    setNewText('');
    setAdding(false);
  };

  const startEdit = (goal) => { setEditingId(goal.id); setEditText(goal.text); };
  const submitEdit = (id) => {
    const text = editText.trim();
    if (text) onEdit(id, text);
    setEditingId(null);
  };

  const move = (index, dir) => {
    const swapWith = index + dir;
    if (swapWith < 0 || swapWith >= goals.length) return;
    const reordered = [...goals];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    onReorder(reordered.map(g => g.id));
  };

  return (
    <div className="border border-[var(--border-strong)] rounded-lg bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">Goals</h2>
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)} className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
            + Add goal
          </button>
        )}
      </div>

      {goals.length === 0 && !adding && (
        <p className="text-xs text-[var(--text-faint)] italic">No goals yet.{isAdmin ? ' Add your first one.' : ''}</p>
      )}

      <div className="space-y-1.5">
        {goals.map((goal, index) => (
          <div key={goal.id} className="group flex items-center gap-2 rounded px-1 py-1">
            <span className="text-[10px] text-[var(--text-faint)] w-4 text-right shrink-0 tabular-nums">{index + 1}.</span>
            <button
              onClick={() => isAdmin && onToggle(goal.id, !goal.done)}
              disabled={!isAdmin}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                goal.done ? 'done-fill' : 'border-[var(--border-default)]'
              } ${isAdmin ? 'hover:border-[var(--text-primary)] cursor-pointer' : 'cursor-default opacity-80'}`}
            >
              {goal.done && (
                <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,8.5 6.5,12 13,4" />
                </svg>
              )}
            </button>

            {isAdmin && editingId === goal.id ? (
              <input
                type="text" autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitEdit(goal.id); if (e.key === 'Escape') setEditingId(null); }}
                onBlur={() => submitEdit(goal.id)}
                className="flex-1 bg-[var(--bg-base)] border border-[var(--text-primary)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            ) : (
              <span
                onDoubleClick={() => isAdmin && startEdit(goal)}
                className={`flex-1 text-sm transition-colors ${isAdmin ? 'cursor-text' : ''} ${goal.done ? 'text-[var(--accent-done-text)] line-through' : 'text-[var(--text-primary)]'}`}
              >
                {goal.text}
              </span>
            )}

            {isAdmin && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => move(index, -1)} disabled={index === 0} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-20 text-xs px-0.5" title="Move up">▲</button>
                <button onClick={() => move(index, 1)} disabled={index === goals.length - 1} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-20 text-xs px-0.5" title="Move down">▼</button>
                <button onClick={() => startEdit(goal)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs px-0.5" title="Edit">✎</button>
                <button onClick={() => onDelete(goal.id)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs px-0.5" title="Delete">✕</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdmin && adding && (
        <div className="flex gap-2 mt-2">
          <input
            type="text" autoFocus value={newText} onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="New goal…" onBlur={submitAdd}
            className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
          />
        </div>
      )}
    </div>
  );
}
