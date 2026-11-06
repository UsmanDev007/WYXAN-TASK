'use client';

import { useState, useEffect } from 'react';
import { fetchUsers, User } from '@/lib/api';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    async function checkBackend() {
      try {
        const u = await fetchUsers();
        setUsers(u);
        if (u.length > 0) setActiveUser(u[0]);
        setApiStatus('connected');
      } catch (e) {
        setApiStatus('disconnected');
      }
    }
    checkBackend();
  }, []);

  return (
    <main className="flex flex-col h-screen w-screen bg-paper text-ink overflow-hidden font-body">
      {/* Header bar / Initial shell */}
      <header className="h-14 border-b border-line bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-faint">
            The Small Web
          </span>
          <span className="text-line">/</span>
          <span className="text-xs font-mono text-ink-soft">Browser Chrome</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-ink-faint">Backend API:</span>
          <span
            className={`px-2 py-0.5 rounded-full font-mono font-medium ${
              apiStatus === 'connected'
                ? 'bg-done-tint text-done'
                : apiStatus === 'checking'
                ? 'bg-start-tint text-start'
                : 'bg-alert-tint text-alert'
            }`}
          >
            {apiStatus}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-display text-3xl font-bold mb-2">The Small Web Browser</h1>
        <p className="text-ink-soft max-w-lg mb-6">
          The browser that reads a few hundred one-page websites living in a database.
        </p>
        <div className="p-4 border border-line rounded-xl bg-card max-w-md w-full text-left font-mono text-xs text-ink-soft">
          <div className="font-semibold text-ink mb-2">System Initialized:</div>
          <div>• Frontend: Next.js + Tailwind CSS</div>
          <div>• Backend: NestJS on port 3001</div>
          <div>• Database: MongoDB (with high-fidelity fallback)</div>
        </div>
      </div>
    </main>
  );
}
