'use client';

import { useState } from 'react';

export default function RoleSection({
  roles, isAdmin, onAddRole, onDeleteRole, onAddTopic, onToggleTopic, onDeleteTopic, onEditTopic,
}) {
  const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id ?? null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editText, setEditText] = useState('');

  const activeRole = roles.find(r => r.id === activeRoleId) || roles[0] || null;

  const activeTotal = activeRole?.topics.length ?? 0;
  const activeDone = activeRole?.topics.filter(t => t.done).length ?? 0;
  const activeAllDone = activeTotal > 0 && activeDone === activeTotal;

  const handleAddRole = () => {
    const trimmed = newRoleName.trim();
    if (!trimmed) return;
    onAddRole(trimmed);
    setNewRoleName('');
  };

  const handleAddTopic = () => {
    const trimmed = newTopic.trim();
    if (!trimmed || !activeRole) return;
    onAddTopic(activeRole.id, trimmed);
    setNewTopic('');
  };

  const startEdit = (topic) => { setEditingTopicId(topic.id); setEditText(topic.text); };
  const saveEdit = (topicId) => {
    const t = editText.trim();
    if (t) onEditTopic(activeRole.id, topicId, t);
    setEditingTopicId(null); setEditText('');
  };
  const cancelEdit = () => { setEditingTopicId(null); setEditText(''); };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[var(--accent-blue)] tracking-tight">Role-wise Prep</h2>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 flex-wrap items-center mb-4">
        {roles.map(role => {
          const total = role.topics.length;
          const done = role.topics.filter(t => t.done).length;
          const allDone = total > 0 && done === total;
          const active = activeRole?.id === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setActiveRoleId(role.id)}
              className={`group relative text-xs px-3 py-1.5 rounded border transition-colors flex items-center gap-2 ${
                active
                  ? 'bg-[var(--accent-blue)] border-[var(--accent-blue)] text-white'
                  : allDone
                    ? 'bg-[var(--bg-surface)] border-[var(--accent-green)] text-[var(--accent-green-text)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
              }`}
            >
              {allDone && <span>✓</span>}
              {role.name}
              {total > 0 && (
                <span className={active ? 'text-white/80' : allDone ? 'text-[var(--accent-green-text)]/80' : 'text-[var(--text-faint)]'}>
                  {done}/{total}
                </span>
              )}
              {isAdmin && (
                <span
                  onClick={(e) => { e.stopPropagation(); onDeleteRole(role.id); }}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'text-white/80 hover:text-white' : 'text-[var(--text-faint)] hover:text-[#f78166]'}`}
                >
                  ✕
                </span>
              )}
            </button>
          );
        })}

        {isAdmin && (
          <div className="flex gap-1 items-center">
            <input
              type="text" placeholder="New role (e.g. Backend)" value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddRole()}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent-blue)] w-40"
            />
            <button
              onClick={handleAddRole}
              className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] transition-colors"
            >
              + Role
            </button>
          </div>
        )}
      </div>

      {!activeRole && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-4 py-6 text-center text-xs text-[var(--text-faint)] italic">
          No roles yet. {isAdmin ? 'Add one above to start tracking role-specific interview topics.' : ''}
        </div>
      )}

      {activeRole && (
        <div className={`border rounded-lg bg-[var(--bg-base)] p-4 transition-colors ${
          activeAllDone ? 'border-[var(--accent-green)]' : 'border-[var(--border-subtle)]'
        }`}>
          {/* Completed banner */}
          {activeAllDone && (
            <div className="mb-3 bg-[var(--accent-green)]/10 border border-[var(--accent-green)] rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-[var(--accent-green-text)] text-sm">✓</span>
              <span className="text-xs text-[var(--accent-green-text)] font-semibold">
                All {activeTotal} topics done for {activeRole.name} 🎉
              </span>
            </div>
          )}

          {/* progress */}
          {activeTotal > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>Progress</span>
                <span className={activeAllDone ? 'text-[var(--accent-green-text)]' : 'text-[var(--text-primary)]'}>
                  {activeDone}/{activeTotal} &nbsp;·&nbsp; {Math.round((activeDone / activeTotal) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-green)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((activeDone / activeTotal) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {activeRole.topics.length === 0 && (
              <p className="text-xs text-[var(--text-faint)] italic">No topics yet.</p>
            )}
            {activeRole.topics.map(topic => (
              <div
                key={topic.id}
                className={`flex items-center gap-2 group rounded px-2 py-1.5 transition-colors ${
                  topic.done ? 'bg-[var(--bg-base)]' : 'bg-[var(--bg-surface)]'
                }`}
              >
                <button
                  onClick={() => isAdmin && onToggleTopic(activeRole.id, topic.id)}
                  disabled={!isAdmin}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    topic.done ? 'bg-[var(--accent-green)] border-[var(--accent-green)]' : 'border-[var(--border-default)]'
                  } ${isAdmin ? 'hover:border-[var(--accent-blue)] cursor-pointer' : 'cursor-default opacity-80'}`}
                >
                  {topic.done && <span className="text-white text-[10px]">✓</span>}
                </button>

                {isAdmin && editingTopicId === topic.id ? (
                  <input
                    type="text" autoFocus value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(topic.id); if (e.key === 'Escape') cancelEdit(); }}
                    onBlur={() => saveEdit(topic.id)}
                    className="flex-1 bg-[var(--bg-base)] border border-[var(--accent-blue)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                ) : (
                  <span
                    onDoubleClick={() => isAdmin && startEdit(topic)}
                    className={`flex-1 text-sm transition-colors ${isAdmin ? 'cursor-text' : ''} ${
                      topic.done ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {topic.text}
                  </span>
                )}

                {topic.done && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--accent-green)] text-[var(--accent-green-text)] font-mono shrink-0">
                    Done
                  </span>
                )}

                {isAdmin && editingTopicId !== topic.id && (
                  <button onClick={() => startEdit(topic)} className="text-[var(--text-faint)] hover:text-[var(--accent-blue)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ✎
                  </button>
                )}

                {isAdmin && (
                  <button onClick={() => onDeleteTopic(activeRole.id, topic.id)} className="text-[var(--text-faint)] hover:text-[#f78166] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="flex gap-2 mt-3">
              <input
                type="text" placeholder="Add interview question / topic..." value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
              />
              <button onClick={handleAddTopic} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] transition-colors shrink-0">
                + Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}