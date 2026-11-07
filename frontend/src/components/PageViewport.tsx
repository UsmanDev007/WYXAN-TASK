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

    let processedHtml = site.htmlContent;
    // Ensure mobile viewport meta tag exists so site content scales responsively
    if (!processedHtml.includes('name="viewport"') && !processedHtml.includes("name='viewport'")) {
      const viewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
      if (processedHtml.includes('<head>')) {
        processedHtml = processedHtml.replace('<head>', `<head>${viewportTag}`);
      } else if (processedHtml.includes('<html>')) {
        processedHtml = processedHtml.replace('<html>', `<html><head>${viewportTag}</head>`);
      }
    }

    if (processedHtml.includes('</body>')) {
      return processedHtml.replace('</body>', `${bridgeScript}</body>`);
    }
    return processedHtml + bridgeScript;
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

  // 1. Google Chrome Loading State
  if (isLoading) {
    return (
      <div className="chrome-error-screen">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e8eaed', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 14, color: '#5f6368' }}>
            Connecting to <strong style={{ color: '#202124' }}>{address}</strong>...
          </div>
        </div>
      </div>
    );
  }

  // 2. Google Chrome Offline / Backend Down Screen
  if (isOffline) {
    return (
      <div className="chrome-error-screen">
        <div className="chrome-error-card">
          <div className="chrome-error-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          </div>
          <h2 className="chrome-error-title">No internet / Backend is offline</h2>
          <p className="chrome-error-desc">
            Could not connect to the Small Web API server at <code>http://localhost:3001/api</code>.
            Check your terminal to make sure the NestJS backend is running.
          </p>
          <div style={{ background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'monospace', marginBottom: 20 }}>
            cd backend &amp;&amp; pnpm run start:dev
          </div>
          <div className="chrome-error-actions">
            <button className="google-btn-primary" onClick={onRefresh}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Google Chrome 404 Nowhere Screen ("Site can't be reached")
  if (isNotFound || !site) {
    return (
      <div className="chrome-error-screen">
        <div className="chrome-error-card">
          <div className="chrome-error-icon alert">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="chrome-error-title">This site can’t be reached</h2>
          {address && <div className="chrome-error-address">{address}</div>}
          <p className="chrome-error-desc">
            The Small Web server found no page registered at <strong>{address}</strong>.
            You can be the first to publish a site at this address right now!
          </p>
          <div className="chrome-error-actions">
            <button className="google-btn-primary" onClick={() => onOpenPublish(address)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Publish site here
            </button>
            <button className="google-btn-secondary" onClick={onGoBack}>
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Sandboxed iframe
  return (
    <div className="chrome-viewport">
      <iframe
        ref={iframeRef}
        key={address}
        srcDoc={sandboxedHtml}
        title={site.title}
        sandbox="allow-scripts"
        onLoad={handleIframeLoad}
        className="chrome-iframe"
      />
    </div>
  );
}
