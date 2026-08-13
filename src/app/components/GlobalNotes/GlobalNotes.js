'use client';

import { useEffect, useRef, useState } from 'react';

const SAVE_DELAY = 700;

export default function GlobalNotes({ isAdmin, authHeaders, onUnauthorized }) {
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | saving | saved
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);
  const savedTimeoutRef = useRef(null);
  const skipNextSave = useRef(true); // don't autosave the value we just loaded from the server

  useEffect(() => {
    fetch('/api/note')
      .then(r => r.json())
      .then(data => { setContent(data.content || ''); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  // Auto-expand to fit content.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    if (!isAdmin) return;

    clearTimeout(debounceRef.current);
    setStatus('saving');
    debounceRef.current = setTimeout(async () => {
      const res = await fetch('/api/note', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) { onUnauthorized(); setStatus('idle'); return; }
      setStatus('saved');
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setStatus('idle'), 1500);
    }, SAVE_DELAY);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!loaded) return null;

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">
          Notes
        </h2>
        <span className="text-[10px] text-[var(--text-faint)] h-3">
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && '✓ Saved'}
        </span>
      </div>

      {isAdmin ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Anything worth remembering across the whole challenge — links, reminders, reflections…"
          rows={2}
          className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-primary)] transition-colors resize-none overflow-hidden"
        />
      ) : content ? (
        <p className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{content}</p>
      ) : (
        <p className="text-xs text-[var(--text-faint)] italic">No notes yet.</p>
      )}
    </div>
  );
}
