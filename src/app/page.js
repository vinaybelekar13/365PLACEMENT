'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DayCard from './components/DayCard/DayCard';
import StatsBar from './components/StatsBar/StatsBar';
import FilterBar from './components/FilterBar/FilterBar';
import Heatmap from './components/Heatmap/Heatmap';
import StreakCard from './components/StreakCard/StreakCard';
import SkillsPanel from './components/SkillProgress/SkillsPanel';
import GlobalNotes from './components/GlobalNotes/GlobalNotes';
import LeetCodeTracker from './components/LeetCodeTracker/LeetCodeTracker';
import ChallengeHeader from './components/ChallengeHeader/ChallengeHeader';
import CreateChallengeForm from './components/ChallengeHeader/CreateChallengeForm';
import GoalsPanel from './components/GoalsPanel/GoalsPanel';
import TasksLeftPanel from './components/TasksLeftPanel/TasksLeftPanel';
import { formatFullDate, toLocalDateStr } from '@/lib/date';
import {
  getHeatmapData,
  getDaysRemaining,
  getCurrentDayNumber,
  getSkillProgress,
  getTaskTotals,
  getTasksLeft,
} from '@/lib/stats';

export default function Home() {
  const [challenge, setChallenge] = useState(null);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [popup, setPopup] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [challengeError, setChallengeError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('admin-password');
    if (saved) { setAdminPassword(saved); setIsAdmin(true); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const openLoginModal = () => { setLoginInput(''); setLoginError(''); setShowLoginModal(true); };

  const submitLogin = async () => {
    if (!loginInput) { setLoginError('Please enter a password.'); return; }
    setLoginError(''); setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) { setLoginError('Incorrect password. Please try again.'); setLoggingIn(false); return; }
      localStorage.setItem('admin-password', loginInput);
      setAdminPassword(loginInput); setIsAdmin(true); setShowLoginModal(false); setLoggingIn(false);
      setPopup({ title: 'Logged in', message: 'Admin mode enabled. You can now add, edit, and complete tasks.' });
    } catch { setLoginError('Something went wrong. Please try again.'); setLoggingIn(false); }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin-password');
    setAdminPassword(''); setIsAdmin(false);
    setPopup({ title: 'Logged out', message: 'You are now in view-only mode.' });
  };

  useEffect(() => {
    fetch('/api/challenge').then(r => r.json()).then(data => {
  console.log('CHALLENGE FROM API:', data);
  console.log('START DATE FROM API:', data?.startDate);

  setChallenge(data ?? null);
  setLoading(false);
      if (data) {
        const today = toLocalDateStr();
        const todayDay = data.days.find(d => d.date === today);
        if (todayDay) setExpandedDay(todayDay.id);
      }
    });
  }, []);

  useEffect(() => {
    fetch('/api/skills').then(r => r.json()).then(data => setSkills(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetch('/api/general-categories').then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetch('/api/goals').then(r => r.json()).then(data => setGoals(Array.isArray(data) ? data : []));
  }, []);

  const authHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-password': adminPassword });

  const handleUnauthorized = () => {
    if (isAdmin) { localStorage.removeItem('admin-password'); setAdminPassword(''); setIsAdmin(false); }
    setPopup({ title: 'Admin login required', message: 'Only the admin can add or update entries. Please log in with the admin password to make changes.' });
  };

  // ---- Challenge handlers ----

  const createChallenge = async ({ name, startDate, duration }) => {
    setChallengeError('');
    const res = await fetch('/api/challenge', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, startDate, duration }) });
    if (res.status === 401) return handleUnauthorized();
    const data = await res.json();
    if (!res.ok) { setChallengeError(data.error || 'Failed to create challenge.'); return; }
    setChallenge(data);
    const today = toLocalDateStr();
    const todayDay = data.days.find(d => d.date === today);
    if (todayDay) setExpandedDay(todayDay.id);
  };

  const renameChallenge = async (name) => {
    setChallengeError('');
    const res = await fetch('/api/challenge', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ name }) });
    if (res.status === 401) return handleUnauthorized();
    const data = await res.json();
    if (!res.ok) { setChallengeError(data.error || 'Failed to rename challenge.'); return; }
    setChallenge(data);
  };

  const extendChallenge = async (duration) => {
    setChallengeError('');
    const res = await fetch('/api/challenge', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ duration }) });
    if (res.status === 401) { handleUnauthorized(); return false; }
    const data = await res.json();
    if (!res.ok) { setChallengeError(data.error || 'Failed to update duration.'); return false; }
    setChallenge(data);
    return true;
  };

  const completeChallenge = async () => {
    setChallengeError('');
    const res = await fetch('/api/challenge/complete', { method: 'POST', headers: authHeaders() });
    if (res.status === 401) return handleUnauthorized();
    const data = await res.json();
    if (!res.ok) { setChallengeError(data.error || 'Failed to complete challenge.'); return; }
    setChallenge(null);
    setExpandedDay(null);
    setPopup({ title: 'Challenge archived', message: `"${data.name}" is now saved permanently in Challenge History. Start a new challenge whenever you're ready.` });
  };

  // ---- Task handlers ----

  const addTask = async (dayId, { text, type, skillId, category }) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ challengeDayId: dayId, text, type, skillId, category }) });
    if (res.status === 401) return handleUnauthorized();
    const task = await res.json();
    setChallenge(prev => ({ ...prev, days: prev.days.map(d => d.id === dayId ? { ...d, tasks: [...d.tasks, task] } : d) }));
  };

  const toggleTask = async (dayId, taskId) => {
    const day = challenge.days.find(d => d.id === dayId);
    const task = day.tasks.find(t => t.id === taskId);
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ done: !task.done }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setChallenge(prev => ({ ...prev, days: prev.days.map(d => d.id === dayId ? { ...d, tasks: d.tasks.map(t => t.id === taskId ? updated : t) } : d) }));
  };

  const deleteTask = async (dayId, taskId) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.status === 401) return handleUnauthorized();
    setChallenge(prev => ({ ...prev, days: prev.days.map(d => d.id === dayId ? { ...d, tasks: d.tasks.filter(t => t.id !== taskId) } : d) }));
  };

  const editTask = async (dayId, taskId, newText) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ text: newText }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setChallenge(prev => ({ ...prev, days: prev.days.map(d => d.id === dayId ? { ...d, tasks: d.tasks.map(t => t.id === taskId ? updated : t) } : d) }));
  };

  const reorderTask = async (dayId, taskIds) => {
    // Optimistic reorder.
    setChallenge(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.id !== dayId) return d;
        const byId = Object.fromEntries(d.tasks.map(t => [t.id, t]));
        return { ...d, tasks: taskIds.map((id, i) => ({ ...byId[id], order: i })) };
      }),
    }));
    const res = await fetch('/api/tasks/reorder', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ taskIds }) });
    if (res.status === 401) return handleUnauthorized();
  };

  const addNote = async (dayId, note) => {
    const res = await fetch(`/api/challenge-days/${dayId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ note }) });
    if (res.status === 401) return handleUnauthorized();
    setChallenge(prev => ({ ...prev, days: prev.days.map(d => d.id === dayId ? { ...d, note } : d) }));
  };

  // ---- Skill handlers ----

  const addSkill = async (name) => {
    const res = await fetch('/api/skills', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name }) });
    if (res.status === 401) return handleUnauthorized();
    if (!res.ok) return;
    const skill = await res.json();
    setSkills(prev => [...prev, skill]);
  };

  const renameSkill = async (id, name) => {
    const res = await fetch(`/api/skills/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ name }) });
    if (res.status === 401) return handleUnauthorized();
    if (!res.ok) return;
    const updated = await res.json();
    setSkills(prev => prev.map(s => s.id === id ? updated : s));
  };

  const deleteSkill = async (id) => {
    const res = await fetch(`/api/skills/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.status === 401) return handleUnauthorized();
    setSkills(prev => prev.filter(s => s.id !== id));
    // Unassigned tasks stay on their day; just drop the skill's client-side link.
    setChallenge(prev => prev && ({
      ...prev,
      days: prev.days.map(d => ({ ...d, tasks: d.tasks.map(t => t.skillId === id ? { ...t, skillId: null, skill: null } : t) })),
    }));
  };

  const reorderSkills = async (skillIds) => {
    setSkills(prev => {
      const byId = Object.fromEntries(prev.map(s => [s.id, s]));
      return skillIds.map((id, i) => ({ ...byId[id], order: i }));
    });
    const res = await fetch('/api/skills/reorder', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ skillIds }) });
    if (res.status === 401) return handleUnauthorized();
  };

  // ---- Goal handlers ----

  const addGoal = async (text) => {
    const res = await fetch('/api/goals', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ text }) });
    if (res.status === 401) return handleUnauthorized();
    const goal = await res.json();
    setGoals(prev => [...prev, goal]);
  };

  const toggleGoal = async (id, done) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ done }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
  };

  const editGoal = async (id, text) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ text }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
  };

  const deleteGoal = async (id) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.status === 401) return handleUnauthorized();
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const reorderGoals = async (goalIds) => {
    setGoals(prev => {
      const byId = Object.fromEntries(prev.map(g => [g.id, g]));
      return goalIds.map((id, i) => ({ ...byId[id], order: i }));
    });
    const res = await fetch('/api/goals/reorder', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ goalIds }) });
    if (res.status === 401) return handleUnauthorized();
  };

  // Hooks must run unconditionally on every render, so the derived-stats
  // memos live above the `loading` early-return below.
  const days = useMemo(() => challenge?.days ?? [], [challenge]);
  const heatmapCells = useMemo(() => getHeatmapData(days), [days]);
  const daysRemaining = useMemo(() => getDaysRemaining(challenge), [challenge]);
  const currentDayNumber = useMemo(() => getCurrentDayNumber(challenge), [challenge]);
  const skillProgress = useMemo(() => getSkillProgress(days, skills), [days, skills]);
  const { total: totalTasks, done: doneTasks } = useMemo(() => getTaskTotals(days), [days]);
  const tasksLeft = useMemo(() => getTasksLeft(days), [days]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-muted)] flex items-center justify-center font-mono text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-pulse" />
          Loading dashboard…
        </span>
      </main>
    );
  }

  const today = toLocalDateStr();
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleSelectDay = (dayId) => {
    setFilter('all');
    setExpandedDay(dayId);
    // Wait a tick for the (possible) filter switch + re-render before scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`day-${dayId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  };

  const filteredDays = days.filter(d => {
    const matchSearch = search
      ? (d.tasks ?? []).some(t => t.text.toLowerCase().includes(search.toLowerCase()))
      : true;
    if (!matchSearch) return false;
    if (filter === 'pending') return (d.tasks ?? []).some(t => !t.done);
    if (filter === 'today') return d.date === today;
    if (filter === 'done') return (d.tasks ?? []).length > 0 && (d.tasks ?? []).every(t => t.done);
    return true;
  });

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-mono">
      <div className="border-b border-[var(--border-subtle)] px-4 py-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              ProjectProg
            </h1>

            <p className="text-lg text-[var(--text-muted)] mt-2">
              Track any challenge, any skill, any duration — one focused dashboard.
            </p>

            <p className="text-xs text-[var(--text-faint)] mt-3">
              {formatFullDate()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Link
              href="/diary"
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
            >
              My Diary
            </Link>
            <Link
              href="/history"
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
            >
              Challenge History
            </Link>
            {isAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="border border-[var(--border-strong)] px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors flex items-center gap-1.5"
                title="Click to log out of admin mode"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
                Admin
              </button>
            ) : (
              <button
                onClick={openLoginModal}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
              >
                Admin Login
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? '○ Light' : '● Dark'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        <div className="dash-fade-in">
          {challenge ? (
            <ChallengeHeader
              challenge={challenge}
              currentDayNumber={currentDayNumber}
              daysRemaining={daysRemaining}
              completionPct={completionPct}
              isAdmin={isAdmin}
              onRename={renameChallenge}
              onExtend={extendChallenge}
              onComplete={completeChallenge}
              error={challengeError}
              clearError={() => setChallengeError('')}
            />
          ) : isAdmin ? (
            <CreateChallengeForm onCreate={createChallenge} error={challengeError} clearError={() => setChallengeError('')} />
          ) : (
            <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-6">
              <p className="text-sm text-[var(--text-faint)] italic">No active challenge right now. Log in as admin to start one.</p>
            </div>
          )}
        </div>

        {challenge && (
          <>
            <div className="mt-6 dash-fade-in">
              <StatsBar
                total={totalTasks}
                done={doneTasks}
                skillProgress={skillProgress}
                daysPassed={currentDayNumber - 1}
                totalDays={challenge.duration}
              />
            </div>

            <div className="mt-4 dash-fade-in">
              <Heatmap cells={heatmapCells} onSelectDay={handleSelectDay} title={`${challenge.name} Activity`} />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 dash-fade-in">
              <StreakCard icon="📅" label="Days Left" value={daysRemaining} unit={daysRemaining === 1 ? 'day' : 'days'} />
              <StreakCard icon="🎯" label="Current Day" value={currentDayNumber} unit={`of ${challenge.duration}`} />
              <StreakCard icon="✅" label="Completion" value={`${completionPct}%`} />
            </div>
          </>
        )}

        <div className="mt-4 grid sm:grid-cols-2 gap-3 dash-fade-in">
          <GoalsPanel
            goals={goals} isAdmin={isAdmin}
            onAdd={addGoal} onToggle={toggleGoal} onEdit={editGoal} onDelete={deleteGoal} onReorder={reorderGoals}
          />
          {challenge && <TasksLeftPanel tasks={tasksLeft} onJump={handleSelectDay} />}
        </div>

        <div className="mt-4 dash-fade-in">
          <SkillsPanel
            skillProgress={skillProgress} isAdmin={isAdmin}
            onAdd={addSkill} onRename={renameSkill} onDelete={deleteSkill} onReorder={reorderSkills}
          />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3 dash-fade-in">
          <GlobalNotes isAdmin={isAdmin} authHeaders={authHeaders} onUnauthorized={handleUnauthorized} />
          <LeetCodeTracker isAdmin={isAdmin} authHeaders={authHeaders} onUnauthorized={handleUnauthorized} />
        </div>

        {challenge && (
          <>
            <div className="mt-6">
              <FilterBar filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />
            </div>

            {!isAdmin && (
              <div className="mt-4 bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] rounded-lg px-4 py-2 text-xs text-[var(--text-muted)]">
                Viewing in read-only mode — only the admin can add or update tasks.
              </div>
            )}

            <div className="mt-5 space-y-2">
              {filteredDays.map(day => (
                <DayCard
                  key={day.id} day={day} isToday={day.date === today}
                  expanded={expandedDay === day.id} isAdmin={isAdmin}
                  skills={skills} categories={categories}
                  onToggleExpand={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                  onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask}
                  onEditTask={editTask} onReorderTask={reorderTask}
                  onAddNote={addNote}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-sm shadow-lg" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-sm font-bold text-[var(--text-primary)] mb-1">Admin Login</h2>
            <p className="text-xs text-[var(--text-muted)] mb-3">Enter the admin password to enable editing.</p>
            <input
              type="password" autoFocus value={loginInput}
              onChange={e => { setLoginInput(e.target.value); if (loginError) setLoginError(''); }}
              onKeyDown={e => e.key === 'Enter' && submitLogin()}
              placeholder="Password"
              className={`w-full bg-[var(--bg-base)] border rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none mb-2 ${
                loginError ? 'border-[var(--text-primary)]' : 'border-[var(--border-default)] focus:border-[var(--text-primary)]'
              }`}
            />
            {loginError && <p className="text-xs text-[var(--text-primary)] mb-3">⚠ {loginError}</p>}
            <div className={`flex justify-end gap-2 ${loginError ? '' : 'mt-3'}`}>
              <button onClick={() => setShowLoginModal(false)} className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
                Cancel
              </button>
              <button onClick={submitLogin} disabled={loggingIn} className="text-xs px-3 py-1.5 rounded ink-fill disabled:opacity-50 hover:opacity-85 transition-opacity">
                {loggingIn ? 'Checking...' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal */}
      {popup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setPopup(null)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-sm shadow-lg" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-sm font-bold text-[var(--text-primary)] mb-1">{popup.title}</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">{popup.message}</p>
            <div className="flex justify-end">
              <button onClick={() => setPopup(null)} className="text-xs px-3 py-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
