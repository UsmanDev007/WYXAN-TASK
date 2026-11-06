'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Globe, ArrowRight, CornerDownLeft } from 'lucide-react';
import { searchSites, SearchResult } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateResult: (address: string) => void;
}

export function SearchModal({ isOpen, onClose, onNavigateResult }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchSites(query);
        setResults(res);
      } catch (err) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink/30 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-card border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-line flex items-center gap-3 bg-white">
          <SearchIcon className="w-5 h-5 text-ink-faint shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words written across all sites..."
            className="flex-1 font-body text-base text-ink placeholder-ink-faint focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-ink-faint hover:text-ink transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-paper border border-line rounded text-xs font-mono text-ink-soft hover:bg-line-soft transition"
          >
            ESC
          </button>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-line-soft p-2">
          {isSearching ? (
            <div className="p-8 text-center font-mono text-sm text-ink-faint">
              Searching pages across the small web...
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="p-8 text-center text-ink-soft">
              <p className="font-display font-medium text-base mb-1">No pages found containing "{query}"</p>
              <p className="text-xs text-ink-faint">Try searching for other words like "hydrophone", "lichen", "concrete", or "radio".</p>
            </div>
          ) : !query.trim() ? (
            <div className="p-6 text-center text-ink-faint">
              <p className="font-mono text-xs uppercase tracking-wider mb-2">Full-Text Web Search</p>
              <p className="text-sm text-ink-soft max-w-sm mx-auto">
                Queries search directly into the HTML body and written prose of every site in the database.
              </p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.address}
                onClick={() => {
                  onNavigateResult(item.address);
                  onClose();
                }}
                className="p-3.5 hover:bg-paper rounded-xl cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-sm text-ink group-hover:text-active transition flex items-center gap-2">
                    {item.title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-active" />
                  </h3>
                  <div className="flex items-center gap-1 font-mono text-xs text-ink-faint">
                    <Globe className="w-3 h-3" />
                    <span>{item.address}</span>
                  </div>
                </div>

                <p className="text-xs text-ink-soft leading-relaxed font-body line-clamp-2 bg-paper/70 p-2 rounded-lg border border-line-soft group-hover:border-line transition">
                  {item.excerpt}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-ink-faint">
                  <span>Author: {item.authorName}</span>
                  <span>·</span>
                  <span>Match Score: {item.matchScore}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-2.5 border-t border-line bg-paper/50 flex items-center justify-between text-xs font-mono text-ink-faint px-4">
            <span>{results.length} site(s) found</span>
            <span className="flex items-center gap-1">
              Press <CornerDownLeft className="w-3 h-3" /> to navigate
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
