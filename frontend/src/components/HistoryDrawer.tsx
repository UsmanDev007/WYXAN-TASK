'use client';

import React from 'react';
import { X, Clock, ArrowUpRight, Globe, Compass, ExternalLink } from 'lucide-react';
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
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getSourceBadge = (source: Visit['source']) => {
    switch (source) {
      case 'typed':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-paper border border-line text-ink-soft">typed</span>;
      case 'link':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-active-tint text-active">link</span>;
      case 'back_forward':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-start-tint text-start">retrace</span>;
      case 'search':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-done-tint text-done">search</span>;
      case 'history':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-line-soft text-ink-soft">jump</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/20 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-card h-full shadow-2xl border-l border-line flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-paper/50">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ink" />
              <h2 className="font-display font-bold text-base text-ink">Browsing History</h2>
            </div>
            <p className="text-xs text-ink-faint mt-0.5">
              Everywhere <strong className="text-ink">{activeUser?.name || 'this persona'}</strong> has been
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visit List */}
        <div className="flex-1 overflow-y-auto divide-y divide-line-soft">
          {visits.length === 0 ? (
            <div className="p-8 text-center text-ink-faint">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No visits recorded yet for this user.</p>
              <p className="text-xs mt-1">Start typing addresses or following links to leave a trail.</p>
            </div>
          ) : (
            visits.map((visit) => {
              const isNowhere = visit.siteTitle === '[Nowhere]';
              return (
                <div
                  key={visit.id || visit.timestamp}
                  onClick={() => {
                    onJumpToVisit(visit.address);
                    onClose();
                  }}
                  className="p-3.5 hover:bg-paper cursor-pointer transition group flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm truncate ${isNowhere ? 'text-alert' : 'text-ink'}`}>
                        {visit.siteTitle}
                      </span>
                      {getSourceBadge(visit.source)}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-ink-soft group-hover:text-active transition">
                      <Globe className="w-3 h-3 text-ink-faint" />
                      <span className="truncate">{visit.address}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] text-ink-faint block">
                      {formatTime(visit.timestamp)}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-ink-faint opacity-0 group-hover:opacity-100 transition inline-block mt-1 text-active" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-line bg-paper text-[11px] font-mono text-ink-faint text-center">
          {visits.length} recorded visits · Click any visit to retrace
        </div>
      </div>
    </div>
  );
}
