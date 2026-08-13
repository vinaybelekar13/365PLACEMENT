'use client';

import Link from 'next/link';
import ChallengeHistoryList from '../components/ChallengeHistory/ChallengeHistoryList';

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-mono">
      <div className="border-b border-[var(--border-subtle)] px-4 py-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Challenge History
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              A permanent record of every challenge you&apos;ve completed — what you set out to do, and what you actually did.
            </p>
          </div>
          <Link
            href="/"
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        <ChallengeHistoryList />
      </div>
    </main>
  );
}
