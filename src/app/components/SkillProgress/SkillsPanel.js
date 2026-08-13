'use client';

import { useState } from 'react';

export default function SkillsPanel({ skillProgress, isAdmin, onAdd, onRename, onDelete, onReorder }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const submitAdd = () => {
    const name = newName.trim();
    if (!name) { setAdding(false); return; }
    onAdd(name);
    setNewName('');
    setAdding(false);
  };

  const startEdit = (skill) => { setEditingId(skill.id); setEditName(skill.name); };
  const submitEdit = (id) => {
    const name = editName.trim();
    if (name) onRename(id, name);
    setEditingId(null);
  };

  const move = (index, dir) => {
    const swapWith = index + dir;
    if (swapWith < 0 || swapWith >= skillProgress.length) return;
    const reordered = [...skillProgress];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    onReorder(reordered.map(s => s.id));
  };

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">Skill Progress</h2>
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)} className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
            + Add skill
          </button>
        )}
      </div>

      {isAdmin && adding && (
        <div className="flex gap-2 mb-3">
          <input
            type="text" autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="e.g. System Design" onBlur={submitAdd}
            className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)]"
          />
        </div>
      )}

      {skillProgress.length === 0 && !adding && (
        <p className="text-xs text-[var(--text-faint)] italic">
          No skills yet.{isAdmin ? ' Add one to start tracking progress.' : ''}
        </p>
      )}

      <div className="space-y-3">
        {skillProgress.map((skill, index) => (
          <div key={skill.id} className="group">
            <div className="flex items-center justify-between mb-1 gap-2">
              {editingId === skill.id ? (
                <input
                  type="text" autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitEdit(skill.id); if (e.key === 'Escape') setEditingId(null); }}
                  onBlur={() => submitEdit(skill.id)}
                  className="flex-1 bg-[var(--bg-base)] border border-[var(--text-primary)] rounded px-2 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              ) : (
                <span
                  onDoubleClick={() => isAdmin && startEdit(skill)}
                  className={`text-xs text-[var(--text-muted)] truncate ${isAdmin ? 'cursor-text' : ''}`}
                  title={skill.name}
                >
                  {skill.name}
                </span>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[var(--text-faint)] tabular-nums">{skill.done}/{skill.total}</span>
                <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums w-9 text-right">{skill.pct}%</span>

                {isAdmin && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-20 text-[10px] px-0.5" title="Move up">▲</button>
                    <button onClick={() => move(index, 1)} disabled={index === skillProgress.length - 1} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-20 text-[10px] px-0.5" title="Move down">▼</button>
                    <button onClick={() => startEdit(skill)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-[10px] px-0.5" title="Rename">✎</button>
                    <button onClick={() => onDelete(skill.id)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-[10px] px-0.5" title="Delete">✕</button>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-500" style={{ width: `${skill.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
