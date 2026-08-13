'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MistakeDiarySection from '../components/Diary/MistakeDiarySection';
import PersonalDiarySection from '../components/Diary/PersonalDiarySection';

export default function DiaryPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [popup, setPopup] = useState(null);

  // Admin session is shared with the main dashboard via the same
  // localStorage key, so logging in on one page carries over to the other.
  useEffect(() => {
    const saved = localStorage.getItem('admin-password');
    if (saved) { setAdminPassword(saved); setIsAdmin(true); }
  }, []);

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
    } catch { setLoginError('Something went wrong. Please try again.'); setLoggingIn(false); }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin-password');
    setAdminPassword(''); setIsAdmin(false);
  };

  const authHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-password': adminPassword });

  const handleUnauthorized = () => {
    if (isAdmin) { localStorage.removeItem('admin-password'); setAdminPassword(''); setIsAdmin(false); }
    setPopup({ title: 'Admin login required', message: 'Only the admin can add, edit, or delete diary entries. Please log in with the admin password to make changes.' });
  };

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-mono">
      <div className="border-b border-[var(--border-subtle)] px-4 py-5 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              My Diary
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Mistakes worth remembering, and thoughts worth keeping.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Link
              href="/"
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
            >
              ← Back to dashboard
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
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
        {!isAdmin && (
          <div className="mb-5 bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] rounded-lg px-4 py-2 text-xs text-[var(--text-muted)]">
            Viewing in read-only mode — only the admin can add, edit, or delete entries.
          </div>
        )}

        <div className="space-y-8">
          <MistakeDiarySection isAdmin={isAdmin} authHeaders={authHeaders} onUnauthorized={handleUnauthorized} />
          <PersonalDiarySection isAdmin={isAdmin} authHeaders={authHeaders} onUnauthorized={handleUnauthorized} />
        </div>
      </div>

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
