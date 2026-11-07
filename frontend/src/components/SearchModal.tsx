'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        setResults(await searchSites(query));
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={handleKeyDown}>
      <div className="modal">
        {/* Search input */}
        <div className="search-input-row">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search words written across all sites..."
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', padding: '2px 4px' }}
              title="Clear"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            style={{ padding: '2px 8px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)', cursor: 'pointer' }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="search-results">
          {isSearching ? (
            <div className="search-empty">
              <div className="loading-row" style={{ justifyContent: 'center' }}>
                <div className="spinner" />
                <span>Searching the small web…</span>
              </div>
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="search-empty">
              <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                No pages found for "{query}"
              </p>
              <p style={{ fontSize: 11 }}>
                Try words like "hydrophone", "lichen", "concrete", or "radio".
              </p>
            </div>
          ) : !query.trim() ? (
            <div className="search-empty">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Full-Text Web Search
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', maxWidth: 340, margin: '0 auto' }}>
                Queries search directly into the HTML body and written prose of every site in the database.
              </p>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.address}
                className="search-result-item"
                onClick={() => { onNavigateResult(item.address); onClose(); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="search-result-title">{item.title}</div>
                  <div className="search-result-addr">{item.address}</div>
                </div>
                <div className="search-result-excerpt">{item.excerpt}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', marginTop: 4 }}>
                  Author: {item.authorName} · Score: {item.matchScore}
                </div>
              </button>
            ))
          )}
        </div>

        {results.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--line-soft)', background: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{results.length} site(s) found</span>
            <span>Click to navigate</span>
          </div>
        )}
      </div>
    </div>
  );
}
