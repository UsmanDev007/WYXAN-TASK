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
  siteTitle?: string;
  onNavigate: (address: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
  onOpenSearch: () => void;
  onOpenHistory: () => void;
  onOpenPublish: () => void;
  onSelectUser: (user: User) => void;
}

// Google profile avatar colors
const AVATAR_COLORS: Record<string, string> = {
  alice: '#1a73e8',  // Google Blue
  aris: '#188038',   // Google Green
  maya: '#d93025',   // Google Red
  julian: '#f9ab00', // Google Yellow
};

export function BrowserChrome({
  currentAddress,
  canGoBack,
  canGoForward,
  isLoading,
  users,
  activeUser,
  siteTitle,
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

  // Keyboard shortcut Ctrl+L to focus address bar
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

  const userInitial = activeUser?.name?.charAt(0) || 'U';
  const avatarBg = (activeUser && AVATAR_COLORS[activeUser.handle]) || '#1a73e8';

  return (
    <header style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, width: '100%' }}>
      {/* 1. Chrome Tab Strip */}
      <div className="chrome-tab-strip">
        <div className="chrome-tab">
          <div className="chrome-tab-favicon">
            {isLoading ? (
              <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            )}
          </div>
          <span className="chrome-tab-title">
            {siteTitle || currentAddress || 'New Tab'}
          </span>
          <button className="chrome-tab-close" onClick={onRefresh} title="Reload tab">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <button className="chrome-new-tab-btn" onClick={onOpenPublish} title="Publish a new site (+)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* 2. Chrome Navigation Toolbar */}
      <div className="chrome-toolbar">
        {/* Nav Controls */}
        <div className="chrome-nav-group">
          <button
            className="chrome-btn"
            onClick={onGoBack}
            disabled={!canGoBack}
            title="Click to go back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <button
            className="chrome-btn"
            onClick={onGoForward}
            disabled={!canGoForward}
            title="Click to go forward"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <button
            className={`chrome-btn${isLoading ? ' spin' : ''}`}
            onClick={onRefresh}
            title="Reload this page"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>

        {/* 3. Google Chrome Omnibox */}
        <form onSubmit={handleSubmit} className="chrome-omnibox-form">
          <div className="chrome-omnibox">
            <div className="omnibox-lock" title="Secure Small Web Protocol">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              ref={addressInputRef}
              className="omnibox-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              onKeyDown={handleKeyDown}
              placeholder="Search or type address (e.g. tidepool.zz)..."
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <button type="submit" className="omnibox-go-btn" title="Go">
              Go
            </button>
          </div>
        </form>

        {/* 4. Action Buttons (Responsive: Icons on mobile, icon+label on desktop) */}
        <div className="chrome-actions-strip">
          <button className="chrome-pill-btn" onClick={onOpenSearch} title="Search the Small Web (Ctrl+K)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="btn-label">Search</span>
          </button>

          <button className="chrome-pill-btn" onClick={onOpenHistory} title="Browsing History (Ctrl+H)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/>
            </svg>
            <span className="btn-label">History</span>
          </button>

          <button className="chrome-pill-btn primary" onClick={onOpenPublish} title="Publish a new site">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="btn-label">Publish</span>
          </button>

          {/* 5. Google Account Profile Avatar */}
          <div className="google-profile-wrap" ref={dropdownRef}>
            <button
              className="google-avatar-btn"
              style={{ backgroundColor: avatarBg }}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              title={`Google Account: ${activeUser?.name || 'Switch user'}`}
            >
              {userInitial}
            </button>

            {showUserDropdown && (
              <div className="google-account-card">
                <div className="google-account-header">
                  <div className="google-account-header-avatar" style={{ backgroundColor: avatarBg }}>
                    {userInitial}
                  </div>
                  <div className="google-account-name">{activeUser?.name || 'Anonymous User'}</div>
                  <div className="google-account-email">@{activeUser?.handle || 'guest'} · Small Web Persona</div>
                </div>

                <div className="google-account-list">
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#5f6368', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Switch Account
                  </div>
                  {users.map((u) => {
                    const uInit = u.name?.charAt(0) || 'U';
                    const uBg = AVATAR_COLORS[u.handle] || '#1a73e8';
                    const isActive = activeUser?.handle === u.handle;
                    return (
                      <button
                        key={u.handle}
                        className={`google-account-item${isActive ? ' active' : ''}`}
                        onClick={() => {
                          onSelectUser(u);
                          setShowUserDropdown(false);
                        }}
                      >
                        <div className="google-item-avatar" style={{ backgroundColor: uBg }}>
                          {uInit}
                        </div>
                        <div className="google-item-info">
                          <div className="google-item-name">{u.name}</div>
                          <div className="google-item-handle">@{u.handle}</div>
                        </div>
                        {isActive && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
