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
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={onClose} />
      <aside className="chrome-side-panel">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #dadce0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: '#202124' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Chrome History
          </div>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Persona Indicator */}
        {activeUser && (
          <div style={{ padding: '8px 18px', background: '#f8f9fa', borderBottom: '1px solid #dadce0', fontSize: 12, color: '#5f6368' }}>
            Browsing history for <strong style={{ color: '#202124' }}>{activeUser.name}</strong>
          </div>
        )}

        {/* Visit Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {visits.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#5f6368', fontSize: 13 }}>
              No history found for this persona.
            </div>
          ) : (
            visits.map((visit) => (
              <button
                key={`${visit.id || visit.timestamp}-${visit.address}`}
                onClick={() => { onJumpToVisit(visit.address); onClose(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderBottom: '1px solid #f1f3f4',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: visit.siteTitle === '[Nowhere]' ? '#d93025' : '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {visit.siteTitle || visit.address}
                  </div>
                  <div style={{ fontSize: 11, color: '#1a73e8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {visit.address}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span className={`source-chip ${visit.source}`}>
                    {visit.source}
                  </span>
                  <span style={{ fontSize: 10, color: '#80868b' }}>
                    {formatTime(visit.timestamp)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid #dadce0', background: '#f8f9fa', fontSize: 11, color: '#5f6368', textAlign: 'center' }}>
          {visits.length} pages visited · Click any to retrace
        </div>
      </aside>
    </>
  );
}
