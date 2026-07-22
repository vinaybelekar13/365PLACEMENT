'use client';

import { useState } from 'react';

export const TAG_CONFIG = {
  dsa:      { label: 'DSA',     pattern: 'tag-dsa' },
  da:       { label: 'DA',      pattern: 'tag-da' },
  genai:    { label: 'GenAI',   pattern: 'tag-genai' },
  backend:  { label: 'Backend', pattern: 'tag-backend' },
  core:     { label: 'Core',    pattern: 'tag-core' },
  aptitude: { label: 'Apt',     pattern: 'tag-aptitude' },
};

const TAG_ORDER = ['dsa', 'da', 'genai', 'backend', 'core', 'aptitude'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function DayCard({ day, isToday, expanded, isAdmin, onToggleExpand, onAddTopic, onToggleTopic, onDeleteTopic, onEditTopic, onUpdateTag, onAddNote }) {
  const [newTopic, setNewTopic] = useState('');
  const [newTag, setNewTag] = useState('dsa');
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(day.note || '');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicText, setEditTopicText] = useState('');

  const totalTopics = day.topics.length;
  const doneTopics = day.topics.filter(t => t.done).length;
  const allDone = totalTopics > 0 && doneTopics === totalTopics;

  const handleAdd = () => {
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    onAddTopic(day.id, trimmed, newTag);
    setNewTopic('');
  };

  const handleNoteBlur = () => { onAddNote(day.id, noteText); setEditingNote(false); };
  const cycleTag = (currentTag) => TAG_ORDER[(TAG_ORDER.indexOf(currentTag) + 1) % TAG_ORDER.length];
  const startEditTopic = (topic) => { setEditingTopicId(topic.id); setEditTopicText(topic.text); };
  const saveEditTopic = (topicId) => { const t = editTopicText.trim(); if (t) onEditTopic(day.id, topicId, t); setEditingTopicId(null); setEditTopicText(''); };
  const cancelEditTopic = () => { setEditingTopicId(null); setEditTopicText(''); };

  const isPast = new Date(day.date + 'T00:00:00') < new Date(new Date().toDateString());
  const presentTags = TAG_ORDER.filter(tag => day.topics.some(t => t.tag === tag));

  return (
    <div className={`flex border rounded-md transition-colors overflow-hidden ${
      isToday  ? 'border-[var(--text-primary)] bg-[var(--bg-surface)]'
      : allDone ? 'border-[var(--border-strong)] bg-[var(--bg-base)]'
      : 'border-[var(--border-subtle)] bg-[var(--bg-base)] hover:border-[var(--border-default)]'
    }`}>
      {/* Stub: day index */}
      <div className={`w-14 sm:w-16 shrink-0 flex flex-col items-center justify-center gap-1 py-3 ${isToday ? 'ink-fill' : ''}`}>
        <span className="font-display text-lg font-bold leading-none">{String(day.id).padStart(2, '0')}</span>
        <span className={`text-[9px] uppercase tracking-widest ${isToday ? 'opacity-70' : 'text-[var(--text-faint)]'}`}>
          {allDone ? 'done' : isPast && totalTopics === 0 ? '—' : 'day'}
        </span>
      </div>
      <div className="stub-divider" />

      {/* Body */}
      <div className="flex-1 min-w-0">
        <button onClick={onToggleExpand} className="w-full flex items-center gap-3 px-4 py-3 text-left">
          <span className={`text-sm flex-1 truncate ${isToday ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-muted)]'}`}>
            {formatDate(day.date)}
            {isToday && <span className="ml-2 text-[9px] uppercase tracking-widest border border-[var(--border-strong)] rounded px-1 py-0.5 align-middle">today</span>}
          </span>

          {totalTopics > 0 && (
            <span className="text-xs text-[var(--text-faint)] hidden sm:inline">{doneTopics}/{totalTopics}</span>
          )}

          <div className="flex gap-1.5 flex-wrap justify-end">
            {presentTags.map(tag => <span key={tag} className="text-[9px] uppercase tracking-wide text-[var(--text-faint)]">{TAG_CONFIG[tag].label}</span>)}
          </div>

          {totalTopics > 0 && (
            <div className="w-16 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full transition-all ${allDone ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-muted)]'}`}
                style={{ width: `${(doneTopics / totalTopics) * 100}%` }}
              />
            </div>
          )}

          <span className={`text-[var(--text-faint)] text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {/* Expanded */}
        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)] pt-3">
            <div className="space-y-1.5">
              {day.topics.length === 0 && <p className="text-xs text-[var(--text-faint)] italic">No topics yet.</p>}
              {day.topics.map(topic => (
                <div key={topic.id} className={`flex items-center gap-2 group rounded px-2 py-1.5 border transition-colors ${
                  topic.done ? 'bg-[var(--accent-done)]/10 border-[var(--accent-done)]/40' : 'bg-[var(--bg-surface)] border-transparent'
                }`}>
                  <button
                    onClick={() => isAdmin && onToggleTopic(day.id, topic.id)}
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
                      type="text" autoFocus value={editTopicText}
                      onChange={e => setEditTopicText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEditTopic(topic.id); if (e.key === 'Escape') cancelEditTopic(); }}
                      onBlur={() => saveEditTopic(topic.id)}
                      className="flex-1 bg-[var(--bg-base)] border border-[var(--text-primary)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => isAdmin && startEditTopic(topic)}
                      className={`flex-1 text-sm transition-colors ${isAdmin ? 'cursor-text' : ''} ${
                        topic.done ? 'text-[var(--accent-done-text)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {topic.text}
                    </span>
                  )}

                  {isAdmin && editingTopicId !== topic.id && (
                    <button onClick={() => startEditTopic(topic)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Edit topic">
                      ✎
                    </button>
                  )}

                  {isAdmin ? (
                    <button onClick={() => onUpdateTag(day.id, topic.id, cycleTag(topic.tag))} className="tag-chip hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors" title="Click to cycle tag">
                      {TAG_CONFIG[topic.tag].label}
                    </button>
                  ) : (
                    <span className="tag-chip">
                      {TAG_CONFIG[topic.tag].label}
                    </span>
                  )}

                  {isAdmin && (
                    <button onClick={() => onDeleteTopic(day.id, topic.id)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <select
                  value={newTag} onChange={e => setNewTag(e.target.value)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 text-xs text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)] shrink-0"
                >
                  {TAG_ORDER.map(tag => <option key={tag} value={tag}>{TAG_CONFIG[tag].label}</option>)}
                </select>
                <input
                  type="text" placeholder="Add topic..." value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                />
                <button onClick={handleAdd} className="ink-fill rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-85 shrink-0">
                  + Add
                </button>
              </div>
            )}

            <div>
              {isAdmin ? (
                editingNote ? (
                  <textarea
                    autoFocus value={noteText} onChange={e => setNoteText(e.target.value)} onBlur={handleNoteBlur}
                    placeholder="Day notes, links, or reflections..." rows={2}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors resize-none"
                  />
                ) : (
                  <button onClick={() => setEditingNote(true)} className="text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors text-left w-full">
                    {day.note ? <span className="text-[var(--text-muted)]">{day.note}</span> : '+ Add note'}
                  </button>
                )
              ) : (
                day.note && <p className="text-xs text-[var(--text-muted)]">{day.note}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}