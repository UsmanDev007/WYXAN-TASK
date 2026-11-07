'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Site } from '@/lib/types';

interface PageViewportProps {
  address: string;
  site: Site | null;
  isLoading: boolean;
  isNotFound: boolean;
  isOffline?: boolean;
  preservedScroll: number;
  onNavigateLink: (targetAddress: string) => void;
  onOpenPublish: (prefillAddress?: string) => void;
  onGoBack: () => void;
  onRefresh: () => void;
  onScrollChange?: (scrollY: number) => void;
}

export function PageViewport({
  address,
  site,
  isLoading,
  isNotFound,
  isOffline,
  preservedScroll,
  onNavigateLink,
  onOpenPublish,
  onGoBack,
  onRefresh,
  onScrollChange,
}: PageViewportProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inject link-interception bridge into untrusted HTML
  const sandboxedHtml = useMemo(() => {
    if (!site?.htmlContent) return '';

    const bridgeScript = `
      <script>
        (function() {
          document.addEventListener('click', function(e) {
            var anchor = e.target.closest('a');
            if (anchor) {
              var href = anchor.getAttribute('href');
              if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                e.preventDefault();
                e.stopPropagation();
                var clean = href.replace(/^https?:\\/\\//i, '').replace(/^\\/+/i, '').split('?')[0].split('#')[0];
                window.parent.postMessage({ type: 'NAVIGATE', address: clean }, '*');
              }
            }
          }, true);
          window.addEventListener('scroll', function() {
            window.parent.postMessage({ type: 'SCROLL', scrollY: window.scrollY }, '*');
          }, { passive: true });
          window.addEventListener('message', function(evt) {
            if (evt.data && evt.data.type === 'RESTORE_SCROLL') {
              window.scrollTo({ top: evt.data.scrollY || 0, behavior: 'instant' });
            }
          });
        })();
      <\/script>
    `;

    if (site.htmlContent.includes('</body>')) {
      return site.htmlContent.replace('</body>', `${bridgeScript}</body>`);
    }
    return site.htmlContent + bridgeScript;
  }, [site?.htmlContent]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'NAVIGATE' && typeof event.data.address === 'string') {
        onNavigateLink(event.data.address);
      } else if (event.data.type === 'SCROLL' && typeof event.data.scrollY === 'number') {
        if (onScrollChange) {
          onScrollChange(event.data.scrollY);
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigateLink, onScrollChange]);

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      const win = iframeRef.current.contentWindow;
      win.postMessage({ type: 'RESTORE_SCROLL', scrollY: preservedScroll }, '*');
      setTimeout(() => {
        win.postMessage({ type: 'RESTORE_SCROLL', scrollY: preservedScroll }, '*');
      }, 80);
    }
  };

  // 1. Loading
  if (isLoading) {
    return (
      <div className="state-screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="spinner" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Connecting to <strong style={{ color: 'var(--ink)' }}>{address}</strong>…
          </span>
        </div>
      </div>
    );
  }

  // 2. Offline
  if (isOffline) {
    return (
      <div className="state-screen">
        <div className="state-card">
          <div className="state-icon orange">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          </div>
          <div className="state-eyebrow">Connection Notice</div>
          <h2 className="state-title">Backend API is Offline</h2>
          <p className="state-body">
            Could not reach the NestJS API at{' '}
            <code style={{ background: 'var(--paper)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              http://localhost:3001/api
            </code>
            . Please start the backend server to browse the small web.
          </p>
          <div className="state-code">
            <strong>Start backend in a new terminal:</strong>
            <code>cd backend && pnpm run start:dev</code>
          </div>
          <div className="state-actions">
            <button className="btn-primary" onClick={onRefresh}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Retry connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. 404 / Nowhere
  if (isNotFound || !site) {
    return (
      <div className="state-screen">
        <div className="state-card">
          <div className="state-icon red">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="11" x2="15" y2="11"/>
            </svg>
          </div>
          <div className="state-eyebrow">Error 404 · Nowhere</div>
          <h2 className="state-title">No site lives at this address</h2>
          {address && (
            <div className="state-addr">{address}</div>
          )}
          <p className="state-body">
            You followed a link or typed an address that has never existed, or may have dissolved into the ether.
          </p>
          <div className="state-actions">
            <button className="btn-primary" onClick={() => onOpenPublish(address)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Publish here
            </button>
            <button className="btn-secondary" onClick={onGoBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Sandboxed HTML content
  return (
    <div className="iframe-container">
      <iframe
        ref={iframeRef}
        key={address}
        srcDoc={sandboxedHtml}
        title={site.title}
        sandbox="allow-scripts"
        onLoad={handleIframeLoad}
        className="browser-iframe"
      />
    </div>
  );
}
