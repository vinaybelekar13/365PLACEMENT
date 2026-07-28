'use client';

import { useState, useEffect } from 'react';
import DayCard from './components/DayCard/DayCard';
import StatsBar from './components/StatsBar/StatsBar';
import FilterBar from './components/FilterBar/FilterBar';
import RoleSection from './components/RoleSection/RoleSection';

export default function Home() {
  const [days, setDays] = useState([]);
  const [roles, setRoles] = useState([]);
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
    fetch('/api/days').then(r => r.json()).then(data => {
      setDays(data); setLoading(false);
      const today = new Date().toISOString().split('T')[0];
      const todayDay = data.find(d => d.date === today);
      if (todayDay) setExpandedDay(todayDay.id);
    });
  }, []);

  useEffect(() => {
    fetch('/api/roles')
      .then(r => r.json())
      .then(data => setRoles(Array.isArray(data) ? data : []));
  }, []);

  const authHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-password': adminPassword });

  const handleUnauthorized = () => {
    if (isAdmin) { localStorage.removeItem('admin-password'); setAdminPassword(''); setIsAdmin(false); }
    setPopup({ title: 'Admin login required', message: 'Only the admin can add or update tasks. Please log in with the admin password to make changes.' });
  };

  const addTopic = async (dayId, text, tag) => {
    const res = await fetch('/api/topics', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ dayId, text, tag }) });
    if (res.status === 401) return handleUnauthorized();
    const topic = await res.json();
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, topics: [...d.topics, topic] } : d));
  };

  const toggleTopic = async (dayId, topicId) => {
    const day = days.find(d => d.id === dayId);
    const topic = day.topics.find(t => t.id === topicId);
    const res = await fetch(`/api/topics/${topicId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ done: !topic.done }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, topics: d.topics.map(t => t.id === topicId ? updated : t) } : d));
  };

  const deleteTopic = async (dayId, topicId) => {
    const res = await fetch(`/api/topics/${topicId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.status === 401) return handleUnauthorized();
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, topics: d.topics.filter(t => t.id !== topicId) } : d));
  };

  const editTopic = async (dayId, topicId, newText) => {
    const res = await fetch(`/api/topics/${topicId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ text: newText }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, topics: d.topics.map(t => t.id === topicId ? updated : t) } : d));
  };

  const updateTopicTag = async (dayId, topicId, tag) => {
    const res = await fetch(`/api/topics/${topicId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ tag }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, topics: d.topics.map(t => t.id === topicId ? updated : t) } : d));
  };

  const addNote = async (dayId, note) => {
    const res = await fetch(`/api/days/${dayId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ note }) });
    if (res.status === 401) return handleUnauthorized();
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, note } : d));
  };

  // ---- Role handlers ----

  const addRole = async (name) => {
    const res = await fetch('/api/roles', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name }) });
    if (res.status === 401) return handleUnauthorized();
    const role = await res.json();
    setRoles(prev => [...prev, { ...role, topics: [] }]);
  };

  const deleteRole = async (roleId) => {
    const res = await fetch(`/api/roles/${roleId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.status === 401) return handleUnauthorized();
    setRoles(prev => prev.filter(r => r.id !== roleId));
  };

  const addRoleTopic = async (roleId, text) => {
    const res = await fetch(`/api/roles/${roleId}/topics`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ text }) });
    if (res.status === 401) return handleUnauthorized();
    const topic = await res.json();
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, topics: [...r.topics, topic] } : r));
  };

  const toggleRoleTopic = async (roleId, topicId) => {
    const role = roles.find(r => r.id === roleId);
    const topic = role.topics.find(t => t.id === topicId);
    const res = await fetch(`/api/role-topics/${topicId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ done: !topic.done }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, topics: r.topics.map(t => t.id === topicId ? updated : t) } : r));
  };

  const deleteRoleTopic = async (roleId, topicId) => {
    const res = await fetch(`/api/role-topics/${topicId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.status === 401) return handleUnauthorized();
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, topics: r.topics.filter(t => t.id !== topicId) } : r));
  };

  const editRoleTopic = async (roleId, topicId, newText) => {
    const res = await fetch(`/api/role-topics/${topicId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ text: newText }) });
    if (res.status === 401) return handleUnauthorized();
    const updated = await res.json();
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, topics: r.topics.map(t => t.id === topicId ? updated : t) } : r));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-muted)] flex items-center justify-center font-mono text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-pulse" />
          Loading roadmap…
        </span>
      </main>
    );
  }
  const totalTopics = days.reduce(
  (acc, day) => acc + day.topics.length,
  0
);

const doneTopics = days.reduce(
  (acc, day) => acc + day.topics.filter(t => t.done).length,
  0
);

  const dsaTopics      = days.reduce((a, d) => a + d.topics.filter(t => t.tag === 'dsa').length, 0);
const webTopics      = days.reduce((a, d) => a + d.topics.filter(t => t.tag === 'web').length, 0);
const mlTopics       = days.reduce((a, d) => a + d.topics.filter(t => t.tag === 'ml').length, 0);
const collegeTopics  = days.reduce((a, d) => a + d.topics.filter(t => t.tag === 'college').length, 0);
const aptitudeTopics = days.reduce((a, d) => a + d.topics.filter(t => t.tag === 'aptitude').length, 0);
const gymTopics      = days.reduce((a, d) => a + d.topics.filter(t => t.tag === 'gym').length, 0);

  const today = new Date().toISOString().split('T')[0];
  const daysPassed = days.filter(d => d.date < today).length;

  const filteredDays = days.filter(d => {
    const matchSearch = search ? d.topics.some(t => t.text.toLowerCase().includes(search.toLowerCase())) : true;
    if (!matchSearch) return false;
    if (filter === 'pending') return d.topics.some(t => !t.done);
    if (filter === 'today')   return d.date === today;
    if (filter === 'done')    return d.topics.length > 0 && d.topics.every(t => t.done);
    return true;
  });

  const LEGEND = [
  { label: 'DSA', pattern: 'tag-dsa' },
  { label: 'Web Development', pattern: 'tag-web' },
  { label: 'Machine Learning', pattern: 'tag-ml' },
  { label: 'College Study', pattern: 'tag-college' },
  { label: 'Aptitude', pattern: 'tag-aptitude' },
  { label: 'Gym', pattern: 'tag-gym' },
];

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-mono">
      <div className="border-b border-[var(--border-subtle)] px-4 py-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">Road to Offer</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
  365-Day Placement Roadmap &nbsp;·&nbsp; Day {Math.min(daysPassed + 1, 365)} of 365
</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex gap-1.5 flex-wrap items-center border border-[var(--border-subtle)] rounded px-2 py-1.5 bg-[var(--bg-surface)]">
              {LEGEND.map(({ label }) => (
                <span key={label} className="px-1.5 py-0.5 rounded text-[10px] text-[var(--text-muted)]">
                  {label}
                </span>
              ))}
            </div>
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
        <StatsBar
  total={totalTopics}
  done={doneTopics}
  dsa={dsaTopics}
  web={webTopics}
  ml={mlTopics}
  college={collegeTopics}
  aptitude={aptitudeTopics}
  gym={gymTopics}
  daysPassed={daysPassed}
  totalDays={days.length}
/>
        <div className="mt-5">
          <FilterBar filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />
        </div>

        {filter === 'roles' ? (
          <div className="mt-5">
            <RoleSection
              roles={roles} isAdmin={isAdmin}
              onAddRole={addRole} onDeleteRole={deleteRole}
              onAddTopic={addRoleTopic} onToggleTopic={toggleRoleTopic}
              onDeleteTopic={deleteRoleTopic} onEditTopic={editRoleTopic}
            />
          </div>
        ) : (
          <>
            {!isAdmin && (
              <div className="mt-4 bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] rounded-lg px-4 py-2 text-xs text-[var(--text-muted)]">
                Viewing in read-only mode — only the admin can add or update tasks.
              </div>
            )}

            <div className="mt-5 space-y-2">
              {[...filteredDays].map(day => (
                <DayCard
                  key={day.id} day={day} isToday={day.date === today}
                  expanded={expandedDay === day.id} isAdmin={isAdmin}
                  onToggleExpand={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                  onAddTopic={addTopic} onToggleTopic={toggleTopic} onDeleteTopic={deleteTopic}
                  onEditTopic={editTopic} onUpdateTag={updateTopicTag} onAddNote={addNote}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
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
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg p-5 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
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