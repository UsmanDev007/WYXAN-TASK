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
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={handleKeyDown}>
      <div className="google-dialog">
        {/* Google-style Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10, borderBottom: '1px solid #dadce0', background: '#ffffff' }}>
          {/* Mini Google G */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 16 }}>
            <span style={{ color: '#4285f4' }}>G</span>
            <span style={{ color: '#ea4335' }}>o</span>
            <span style={{ color: '#fbbc05' }}>o</span>
            <span style={{ color: '#4285f4' }}>g</span>
            <span style={{ color: '#34a853' }}>l</span>
            <span style={{ color: '#ea4335' }}>e</span>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f1f3f4', borderRadius: 24, padding: '6px 14px', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search written prose across all Small Web sites..."
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#202124' }}
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: 2 }}
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            style={{ border: '1px solid #dadce0', background: '#ffffff', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#5f6368', cursor: 'pointer' }}
          >
            ESC
          </button>
        </div>

        {/* Results formatted like Google Search Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', maxHeight: 420 }}>
          {isSearching ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#5f6368', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #e8eaed', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Searching Google Small Web...
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#5f6368', fontSize: 14 }}>
              Your search - <strong style={{ color: '#202124' }}>{query}</strong> - did not match any documents.
              <p style={{ fontSize: 12, marginTop: 8, color: '#80868b' }}>
                Suggestions: Try words like "hydrophone", "lichen", "concrete", or "archive".
              </p>
            </div>
          ) : !query.trim() ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#5f6368' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#202124', marginBottom: 4 }}>
                Instant Full-Text Search
              </div>
              <div style={{ fontSize: 12, color: '#5f6368', maxWidth: 360, margin: '0 auto' }}>
                Searches directly into the raw HTML and written prose of every site published in the ecosystem.
              </div>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.address}
                onClick={() => { onNavigateResult(item.address); onClose(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: 6,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafd')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Google-style URL breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#202124' }}>
                  <span style={{ color: '#5f6368', fontSize: 11 }}>https://{item.address}</span>
                  <span style={{ color: '#dadce0' }}>›</span>
                  <span style={{ fontSize: 11, color: '#5f6368' }}>by {item.authorName}</span>
                </div>

                {/* Google-style blue title */}
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1a0dab', textDecoration: 'none' }}>
                  {item.title}
                </div>

                {/* Snippet */}
                <div style={{ fontSize: 12, color: '#4d5156', lineHeight: 1.5, marginTop: 2 }}>
                  {item.excerpt}
                </div>
              </button>
            ))
          )}
        </div>

        {results.length > 0 && (
          <div style={{ padding: '8px 20px', borderTop: '1px solid #dadce0', background: '#f8f9fa', fontSize: 11, color: '#5f6368', display: 'flex', justifyContent: 'space-between' }}>
            <span>About {results.length} result(s)</span>
            <span>Click any result to navigate</span>
          </div>
        )}
      </div>
    </div>
  );
}
