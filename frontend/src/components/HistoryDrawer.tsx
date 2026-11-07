'use client';

import React from 'react';
import { Visit, User } from '@/lib/types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  visits: Visit[];
  activeUser: User | null;
  onJumpToVisit: (address: string) => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  visits,
  activeUser,
  onJumpToVisit,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const sourceLabel: Record<string, string> = {
    typed: 'typed',
    link: 'link',
    back_forward: 'retrace',
    search: 'search',
    history: 'jump',
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Browsing History
          </div>
          <button className="drawer-close" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {activeUser && (
          <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--line-soft)', background: 'var(--paper)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-faint)' }}>
              Everywhere <strong style={{ color: 'var(--ink)' }}>{activeUser.name}</strong> has been
            </span>
          </div>
        )}

        <div className="drawer-body">
          {visits.length === 0 ? (
            <div className="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p>No visits recorded yet.</p>
              <p style={{ marginTop: 4, fontSize: 11 }}>Start typing addresses or following links to leave a trail.</p>
            </div>
          ) : (
            visits.map((visit) => (
              <button
                key={`${visit.id || visit.timestamp}-${visit.address}`}
                className="visit-item"
                onClick={() => { onJumpToVisit(visit.address); onClose(); }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="visit-addr" style={{ color: visit.siteTitle === '[Nowhere]' ? 'var(--alert)' : 'var(--ink)' }}>
                    {visit.siteTitle || visit.address}
                  </div>
                  <div className="visit-meta">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{visit.address}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={`source-badge ${visit.source}`}>
                    {sourceLabel[visit.source] || visit.source}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>
                    {formatTime(visit.timestamp)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line-soft)', background: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', textAlign: 'center' }}>
          {visits.length} recorded visit{visits.length !== 1 ? 's' : ''} · Click any to retrace
        </div>
      </aside>
    </>
  );
}
