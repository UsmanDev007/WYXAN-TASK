'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Site } from '@/lib/types';
import { Compass, FileQuestion, PlusCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface PageViewportProps {
  address: string;
  site: Site | null;
  isLoading: boolean;
  isNotFound: boolean;
  preservedScroll: number;
  onNavigateLink: (targetAddress: string) => void;
  onOpenPublish: (prefillAddress?: string) => void;
  onGoBack: () => void;
  onRefresh: () => void;
}

export function PageViewport({
  address,
  site,
  isLoading,
  isNotFound,
  preservedScroll,
  onNavigateLink,
  onOpenPublish,
  onGoBack,
  onRefresh,
}: PageViewportProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentScrollY, setCurrentScrollY] = useState(0);

  // Securely prepare HTML content with safe link interception & scroll restoration
  const sandboxedHtml = useMemo(() => {
    if (!site?.htmlContent) return '';

    const bridgeScript = `
      <script>
        (function() {
          // Intercept all link clicks inside untrusted HTML
          document.addEventListener('click', function(e) {
            var anchor = e.target.closest('a');
            if (anchor) {
              var href = anchor.getAttribute('href');
              if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                e.preventDefault();
                e.stopPropagation();
                var cleanAddress = href.replace(/^https?:\\/\\//i, '').replace(/^\\/+/i, '');
                window.parent.postMessage({ type: 'NAVIGATE', address: cleanAddress }, '*');
              }
            }
          }, true);

          // Report scroll position to parent
          window.addEventListener('scroll', function() {
            window.parent.postMessage({ type: 'SCROLL', scrollY: window.scrollY }, '*');
          }, { passive: true });

          // Handle restore scroll command
          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'RESTORE_SCROLL') {
              window.scrollTo(0, event.data.scrollY || 0);
            }
          });
        })();
      </script>
    `;

    // Inject before </body> or append
    if (site.htmlContent.includes('</body>')) {
      return site.htmlContent.replace('</body>', `${bridgeScript}</body>`);
    }
    return site.htmlContent + bridgeScript;
  }, [site?.htmlContent]);

  // Listen to messages from the sandboxed iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'NAVIGATE' && typeof event.data.address === 'string') {
        onNavigateLink(event.data.address);
      } else if (event.data.type === 'SCROLL' && typeof event.data.scrollY === 'number') {
        setCurrentScrollY(event.data.scrollY);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigateLink]);

  // Restore scroll position once iframe finishes loading
  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'RESTORE_SCROLL', scrollY: preservedScroll },
          '*',
        );
      }, 50);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-card text-ink-soft select-none">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-active" />
          <span className="font-mono text-sm">Asking the small web for <strong className="text-ink">{address}</strong>...</span>
        </div>
      </div>
    );
  }

  // 2. Nowhere / 404 State
  if (isNotFound || !site) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-paper p-8 text-center select-none overflow-y-auto">
        <div className="max-w-md w-full bg-card border border-line rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-alert-tint text-alert flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-6 h-6" />
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-ink-faint block mb-1">
            Error 404 · Nowhere
          </span>
          <h2 className="font-display text-2xl font-bold text-ink mb-2">
            No site lives at this address
          </h2>
          <p className="font-mono text-sm text-alert bg-alert-tint py-1 px-3 rounded-md inline-block mb-4">
            {address}
          </p>
          <p className="text-ink-soft text-sm mb-6 leading-relaxed">
            You followed a link or typed an address that has never existed, or may have dissolved into the ether.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenPublish(address)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-ink-soft transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Publish here
            </button>
            <button
              onClick={onGoBack}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-line bg-card text-ink rounded-lg text-sm font-medium hover:bg-paper transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Sandboxed HTML
  return (
    <div className="flex-1 w-full h-full relative bg-white">
      <iframe
        ref={iframeRef}
        key={address}
        srcDoc={sandboxedHtml}
        title={site.title}
        // Strict containment: allow scripts for intra-page interactions, but prevent escaping, top-navigation, modals, and same-origin cookie leaks
        sandbox="allow-scripts"
        onLoad={handleIframeLoad}
        className="w-full h-full border-0 select-text"
      />
    </div>
  );
}
