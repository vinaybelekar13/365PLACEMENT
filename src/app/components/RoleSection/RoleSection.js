'use client';

import { useState } from 'react';

export default function RoleSection({
  roles = [], isAdmin, onAddRole, onDeleteRole, onAddTopic, onToggleTopic, onDeleteTopic, onEditTopic,
}) {
  const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id ?? null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editText, setEditText] = useState('');
  const [confirmDeleteRole, setConfirmDeleteRole] = useState(null);   // { id, name, topicCount } | null
  const [confirmDeleteTopic, setConfirmDeleteTopic] = useState(null); // { roleId, topicId, text } | null

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

  const requestDeleteRole = (role) => {
    setConfirmDeleteRole({ id: role.id, name: role.name, topicCount: role.topics.length });
  };

  const confirmDeleteRoleAction = () => {
    if (!confirmDeleteRole) return;
    onDeleteRole(confirmDeleteRole.id);
    if (activeRoleId === confirmDeleteRole.id) {
      const remaining = roles.filter(r => r.id !== confirmDeleteRole.id);
      setActiveRoleId(remaining[0]?.id ?? null);
    }
    setConfirmDeleteRole(null);
  };

  const requestDeleteTopic = (roleId, topic) => {
    setConfirmDeleteTopic({ roleId, topicId: topic.id, text: topic.text });
  };

  const confirmDeleteTopicAction = () => {
    if (!confirmDeleteTopic) return;
    onDeleteTopic(confirmDeleteTopic.roleId, confirmDeleteTopic.topicId);
    setConfirmDeleteTopic(null);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-bold text-[var(--text-primary)] tracking-tight uppercase">Role-wise Prep</h2>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 flex-wrap items-center mb-4 border-b border-[var(--border-subtle)] pb-3">
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
                  ? 'ink-fill border-[var(--text-primary)]'
                  : allDone
                    ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
              }`}
            >
              {allDone && <span>✓</span>}
              {role.name}
              {total > 0 && (
                <span className={active ? 'opacity-70' : allDone ? 'text-[var(--text-muted)]' : 'text-[var(--text-faint)]'}>
                  {done}/{total}
                </span>
              )}
              {isAdmin && (
                <span
                  onClick={(e) => { e.stopPropagation(); requestDeleteRole(role); }}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'hover:opacity-60' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`}
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
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] w-40"
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
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] rounded-lg px-4 py-6 text-center text-xs text-[var(--text-faint)] italic">
          No roles yet. {isAdmin ? 'Add one above to start tracking role-specific interview topics.' : ''}
        </div>
      )}

      {activeRole && (
        <div className={`border rounded-lg bg-[var(--bg-base)] p-4 transition-colors ${
          activeAllDone ? 'border-[var(--border-strong)]' : 'border-[var(--border-subtle)]'
        }`}>
          {/* Completed banner */}
          {activeAllDone && (
            <div className="mb-3 border border-[var(--border-strong)] rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-[var(--text-primary)] text-sm">✓</span>
              <span className="text-xs text-[var(--text-primary)] font-semibold">
                All {activeTotal} topics done for {activeRole.name}
              </span>
            </div>
          )}

          {/* progress */}
          {activeTotal > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>Progress</span>
                <span className="text-[var(--text-primary)]">
                  {activeDone}/{activeTotal} &nbsp;·&nbsp; {Math.round((activeDone / activeTotal) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-500"
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
                className={`flex items-center gap-2 group rounded px-2 py-1.5 border transition-colors ${
                  topic.done ? 'bg-[var(--accent-done)]/10 border-[var(--accent-done)]/40' : 'bg-[var(--bg-surface)] border-transparent'
                }`}
              >
                <button
                  onClick={() => isAdmin && onToggleTopic(activeRole.id, topic.id)}
                  disabled={!isAdmin}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    topic.done ? 'done-fill' : 'border-[var(--border-default)]'
                  } ${isAdmin ? 'hover:border-[var(--text-primary)] cursor-pointer' : 'cursor-default opacity-80'}`}
                >
                  {topic.done && (
                    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,8.5 6.5,12 13,4" />
                    </svg>
                  )}
                </button>

                {isAdmin && editingTopicId === topic.id ? (
                  <input
                    type="text" autoFocus value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(topic.id); if (e.key === 'Escape') cancelEdit(); }}
                    onBlur={() => saveEdit(topic.id)}
                    className="flex-1 bg-[var(--bg-base)] border border-[var(--text-primary)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                ) : (
                  <span
                    onDoubleClick={() => isAdmin && startEdit(topic)}
                    className={`flex-1 text-sm transition-colors ${isAdmin ? 'cursor-text' : ''} ${
                      topic.done ? 'text-[var(--accent-done-text)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {topic.text}
                  </span>
                )}

                {topic.done && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-strong)] text-[var(--text-primary)] font-mono shrink-0">
                    Done
                  </span>
                )}

                {isAdmin && editingTopicId !== topic.id && (
                  <button onClick={() => startEdit(topic)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ✎
                  </button>
                )}

                {isAdmin && (
                  <button onClick={() => requestDeleteTopic(activeRole.id, topic)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
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
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
              />
              <button onClick={handleAddTopic} className="ink-fill rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-85 shrink-0">
                + Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete role confirmation modal */}
      {confirmDeleteRole && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setConfirmDeleteRole(null)}
        >
          <div
            className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Delete "{confirmDeleteRole.name}"?</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              This will permanently delete this role{confirmDeleteRole.topicCount > 0
                ? <> and all <span className="text-[var(--text-primary)] font-semibold">{confirmDeleteRole.topicCount}</span> topic{confirmDeleteRole.topicCount === 1 ? '' : 's'} under it</>
                : null}. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteRole(null)}
                className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRoleAction}
                className="text-xs px-3 py-1.5 rounded ink-fill hover:opacity-85 transition-opacity"
              >
                Delete role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete topic confirmation modal */}
      {confirmDeleteTopic && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setConfirmDeleteTopic(null)}
        >
          <div
            className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Delete this topic?</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              "<span className="text-[var(--text-primary)]">{confirmDeleteTopic.text}</span>" will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteTopic(null)}
                className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTopicAction}
                className="text-xs px-3 py-1.5 rounded ink-fill hover:opacity-85 transition-opacity"
              >
                Delete topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}