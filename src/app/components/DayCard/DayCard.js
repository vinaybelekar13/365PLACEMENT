'use client';

import { useEffect, useRef, useState } from 'react';

const NOTE_SAVE_DELAY = 700;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function taskLabel(task) {
  if (task.type === 'skill') return task.skill?.name ?? 'Unassigned skill';
  return task.category || 'General';
}

export default function DayCard({
  day, isToday, expanded, isAdmin, skills, categories,
  onToggleExpand, onAddTask, onToggleTask, onDeleteTask, onEditTask,
  onReorderTask, onAddNote,
}) {
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('general');
  const [newSkillId, setNewSkillId] = useState(skills[0]?.id ?? '');
  const [newCategory, setNewCategory] = useState(categories[0]?.name ?? 'General');
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(day.note || '');
  const [noteStatus, setNoteStatus] = useState('idle'); // idle | saving | saved
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const noteDebounceRef = useRef(null);
  const noteSavedTimeoutRef = useRef(null);
  const skipNextAutosave = useRef(true);

  // Debounced autosave while typing, on top of the existing save-on-blur.
  useEffect(() => {
    if (!editingNote) return;
    if (skipNextAutosave.current) { skipNextAutosave.current = false; return; }
    clearTimeout(noteDebounceRef.current);
    setNoteStatus('saving');
    noteDebounceRef.current = setTimeout(async () => {
      await onAddNote(day.id, noteText);
      setNoteStatus('saved');
      clearTimeout(noteSavedTimeoutRef.current);
      noteSavedTimeoutRef.current = setTimeout(() => setNoteStatus('idle'), 1200);
    }, NOTE_SAVE_DELAY);
    return () => clearTimeout(noteDebounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteText]);

  const tasks = day.tasks ?? [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.done).length;
  const allDone = totalTasks > 0 && doneTasks === totalTasks;

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    if (newType === 'skill') {
      if (!newSkillId) return;
      onAddTask(day.id, { text: trimmed, type: 'skill', skillId: Number(newSkillId) });
    } else {
      onAddTask(day.id, { text: trimmed, type: 'general', category: newCategory || 'General' });
    }
    setNewText('');
  };

  const handleNoteBlur = () => { onAddNote(day.id, noteText); setEditingNote(false); };
  const startEditTask = (task) => { setEditingTaskId(task.id); setEditTaskText(task.text); };
  const saveEditTask = (taskId) => { const t = editTaskText.trim(); if (t) onEditTask(day.id, taskId, t); setEditingTaskId(null); setEditTaskText(''); };
  const cancelEditTask = () => { setEditingTaskId(null); setEditTaskText(''); };

  const moveTask = (index, dir) => {
    const swapWith = index + dir;
    if (swapWith < 0 || swapWith >= tasks.length) return;
    const reordered = [...tasks];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    onReorderTask(day.id, reordered.map(t => t.id));
  };

  const isPast = new Date(day.date + 'T00:00:00') < new Date(new Date().toDateString());

  return (
    <div
      id={`day-${day.id}`}
      className={`flex border rounded-md transition-colors overflow-hidden scroll-mt-6 ${
      isToday  ? 'border-[var(--text-primary)] bg-[var(--bg-surface)]'
      : allDone ? 'border-[var(--border-strong)] bg-[var(--bg-base)]'
      : 'border-[var(--border-subtle)] bg-[var(--bg-base)] hover:border-[var(--border-default)]'
    }`}>
      {/* Stub: day index */}
      <div className={`w-14 sm:w-16 shrink-0 flex flex-col items-center justify-center gap-1 py-3 ${isToday ? 'ink-fill' : ''}`}>
        <span className="font-display text-lg font-bold leading-none">{String(day.dayNumber).padStart(2, '0')}</span>
        <span className={`text-[9px] uppercase tracking-widest ${isToday ? 'opacity-70' : 'text-[var(--text-faint)]'}`}>
          {allDone ? 'done' : isPast && totalTasks === 0 ? '—' : 'day'}
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

          {totalTasks > 0 && (
            <span className="text-xs text-[var(--text-faint)] hidden sm:inline">{doneTasks}/{totalTasks}</span>
          )}

          {totalTasks > 0 && (
            <div className="w-16 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full transition-all ${allDone ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-muted)]'}`}
                style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
              />
            </div>
          )}

          <span className={`text-[var(--text-faint)] text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {/* Expanded */}
        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)] pt-3">
            <div className="space-y-1.5">
              {tasks.length === 0 && <p className="text-xs text-[var(--text-faint)] italic">No tasks yet.</p>}
              {tasks.map((task, index) => (
                <div key={task.id} className={`flex items-center gap-2 group rounded px-2 py-1.5 border transition-colors ${
                  task.done ? 'bg-[var(--accent-done)]/10 border-[var(--accent-done)]/40' : 'bg-[var(--bg-surface)] border-transparent'
                }`}>
                  <button
                    onClick={() => isAdmin && onToggleTask(day.id, task.id)}
                    disabled={!isAdmin}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      task.done ? 'done-fill' : 'border-[var(--border-default)]'
                    } ${isAdmin ? 'hover:border-[var(--text-primary)] cursor-pointer' : 'cursor-default opacity-80'}`}
                  >
                    {task.done && (
                      <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,8.5 6.5,12 13,4" />
                      </svg>
                    )}
                  </button>

                  {isAdmin && editingTaskId === task.id ? (
                    <input
                      type="text" autoFocus value={editTaskText}
                      onChange={e => setEditTaskText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEditTask(task.id); if (e.key === 'Escape') cancelEditTask(); }}
                      onBlur={() => saveEditTask(task.id)}
                      className="flex-1 bg-[var(--bg-base)] border border-[var(--text-primary)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => isAdmin && startEditTask(task)}
                      className={`flex-1 text-sm transition-colors ${isAdmin ? 'cursor-text' : ''} ${
                        task.done
                          ? 'text-[var(--accent-done-text)] line-through decoration-2 [text-decoration-color:var(--accent-done)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {task.text}
                    </span>
                  )}

                  {isAdmin && editingTaskId !== task.id && (
                    <button onClick={() => startEditTask(task)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Edit task">
                      ✎
                    </button>
                  )}

                  <span className={`tag-chip ${task.type === 'skill' ? '' : 'opacity-70'}`} title={task.type === 'skill' ? 'Skill task' : 'General task'}>
                    {taskLabel(task)}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveTask(index, -1)} disabled={index === 0} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-20 text-xs px-0.5" title="Move up">▲</button>
                      <button onClick={() => moveTask(index, 1)} disabled={index === tasks.length - 1} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-20 text-xs px-0.5" title="Move down">▼</button>
                    </div>
                  )}

                  {isAdmin && (
                    <button onClick={() => onDeleteTask(day.id, task.id)} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 shrink-0">
                  <select
                    value={newType} onChange={e => setNewType(e.target.value)}
                    className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 text-xs text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]"
                  >
                    <option value="general">General</option>
                    <option value="skill">Skill</option>
                  </select>
                  {newType === 'skill' ? (
                    <select
                      value={newSkillId} onChange={e => setNewSkillId(e.target.value)}
                      className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 text-xs text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]"
                    >
                      {skills.length === 0 && <option value="">No skills yet</option>}
                      {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  ) : (
                    <select
                      value={newCategory} onChange={e => setNewCategory(e.target.value)}
                      className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 text-xs text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]"
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  )}
                </div>
                <input
                  type="text" placeholder="Add task..." value={newText}
                  onChange={e => setNewText(e.target.value)}
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
                  <div>
                    <textarea
                      autoFocus value={noteText} onChange={e => setNoteText(e.target.value)} onBlur={handleNoteBlur}
                      placeholder="Day notes, links, or reflections..." rows={2}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors resize-none"
                    />
                    <span className="text-[10px] text-[var(--text-faint)]">
                      {noteStatus === 'saving' && 'Saving…'}
                      {noteStatus === 'saved' && '✓ Saved'}
                    </span>
                  </div>
                ) : (
                  <button onClick={() => { skipNextAutosave.current = true; setEditingNote(true); }} className="text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors text-left w-full">
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
