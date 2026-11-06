'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  History,
  PlusCircle,
  Globe,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
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

  useEffect(() => {
    setInputVal(currentAddress);
  }, [currentAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onNavigate(inputVal.trim());
    }
  };

  return (
    <header className="h-14 border-b border-line bg-card flex items-center justify-between px-3 gap-2 select-none z-10 relative">
      {/* 1. Navigation Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          title="Back"
          className="p-1.5 rounded-lg text-ink hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          title="Forward"
          className="p-1.5 rounded-lg text-ink hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onRefresh}
          title="Reload page"
          className={`p-1.5 rounded-lg text-ink hover:bg-paper transition ${
            isLoading ? 'animate-spin text-active' : ''
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Address Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-2">
        <div className="relative flex items-center">
          <div className="absolute left-3 text-ink-faint pointer-events-none">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type an address (e.g. tidepool.zz)..."
            className="w-full bg-paper border border-line-soft rounded-lg pl-8 pr-16 py-1.5 font-mono text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-active focus:bg-white transition"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-2 py-0.5 bg-card border border-line rounded text-[11px] font-mono text-ink-soft hover:text-ink hover:border-ink-faint transition"
          >
            Go
          </button>
        </div>
      </form>

      {/* 3. Action Buttons & User Switcher */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenSearch}
          title="Search the web (by content)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-ink-soft hover:text-ink hover:bg-paper border border-transparent hover:border-line transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
        </button>

        <button
          onClick={onOpenHistory}
          title="Retrace History"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-ink-soft hover:text-ink hover:bg-paper border border-transparent hover:border-line transition"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>

        <button
          onClick={onOpenPublish}
          title="Publish a site"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-ink text-paper hover:bg-ink-soft transition shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Publish</span>
        </button>

        <div className="h-4 w-px bg-line mx-1" />

        {/* User Identity Picker */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-line bg-paper hover:bg-white transition text-xs font-mono text-ink"
          >
            <UserIcon className="w-3.5 h-3.5 text-active" />
            <span className="max-w-[80px] sm:max-w-[110px] truncate">
              {activeUser ? activeUser.name : 'Browsing as'}
            </span>
            <ChevronDown className="w-3 h-3 text-ink-faint" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-line rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-line-soft">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">
                  Browsing Identity
                </p>
                <p className="text-xs text-ink-soft">Visits and publishing belong to:</p>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {users.map((u) => (
                  <button
                    key={u.handle}
                    onClick={() => {
                      onSelectUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-paper transition ${
                      activeUser?.handle === u.handle
                        ? 'font-semibold text-active bg-active-tint/50'
                        : 'text-ink'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="font-mono text-[11px] text-ink-faint">@{u.handle}</div>
                    </div>
                    {activeUser?.handle === u.handle && (
                      <span className="w-2 h-2 rounded-full bg-active" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
