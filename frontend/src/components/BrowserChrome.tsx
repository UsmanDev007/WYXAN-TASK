'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/lib/types';

interface BrowserChromeProps {
  currentAddress: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  users: User[];
  activeUser: User | null;
  onNavigate: (address: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
  onOpenSearch: () => void;
  onOpenHistory: () => void;
  onOpenPublish: () => void;
  onSelectUser: (user: User) => void;
}

export function BrowserChrome({
  currentAddress,
  canGoBack,
  canGoForward,
  isLoading,
  users,
  activeUser,
  onNavigate,
  onGoBack,
  onGoForward,
  onRefresh,
  onOpenSearch,
  onOpenHistory,
  onOpenPublish,
  onSelectUser,
}: BrowserChromeProps) {
  const [inputVal, setInputVal] = useState(currentAddress);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(currentAddress);
  }, [currentAddress]);

  // Global keyboard shortcuts: Ctrl+L to focus address bar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        addressInputRef.current?.focus();
        addressInputRef.current?.select();
      } else if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        addressInputRef.current?.focus();
        addressInputRef.current?.select();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) onNavigate(inputVal.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
  };

  return (
    <header className="browser-chrome">
      {/* Nav Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <button
          className="nav-btn"
          onClick={onGoBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          className="nav-btn"
          onClick={onGoForward}
          disabled={!canGoForward}
          title="Go forward"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button
          className={`nav-btn${isLoading ? ' spinning' : ''}`}
          onClick={onRefresh}
          title="Reload"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* Address Bar */}
      <form onSubmit={handleSubmit} style={{ flex: 1, maxWidth: 640, margin: '0 8px' }}>
        <div className="address-bar-wrap">
          <div className="address-globe">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <input
            ref={addressInputRef}
            className="address-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDown}
            placeholder="Type an address (e.g. tidepool.zz)..."
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button type="submit" className="address-go-btn" title="Navigate (Enter)">Go</button>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="chrome-actions">
        <button className="action-btn" onClick={onOpenSearch} title="Full-text search (Ctrl+K)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search</span>
          <span style={{ fontSize: 9, opacity: 0.5, border: '1px solid rgba(255,255,255,0.2)', padding: '0 3px', borderRadius: 3 }}>⌘K</span>
        </button>

        <button className="action-btn" onClick={onOpenHistory} title="View history">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>History</span>
        </button>

        <button className="action-btn publish" onClick={onOpenPublish} title="Publish a site">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>Publish</span>
        </button>

        <div className="chrome-sep" />

        {/* User Picker */}
        <div className="user-picker" ref={dropdownRef}>
          <button
            className="user-picker-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--active)', flexShrink: 0 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="user-picker-name">
              {activeUser ? activeUser.name : 'Select user'}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showUserDropdown && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-label">Browsing Identity</div>
                <div className="user-dropdown-sub">Visits & publishing belong to:</div>
              </div>
              {users.map((u) => (
                <button
                  key={u.handle}
                  className={`user-dropdown-item${activeUser?.handle === u.handle ? ' active' : ''}`}
                  onClick={() => { onSelectUser(u); setShowUserDropdown(false); }}
                >
                  <div>
                    <div>{u.name}</div>
                    <div className="user-handle">@{u.handle}</div>
                  </div>
                  {activeUser?.handle === u.handle && <div className="user-dot" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
