'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBrowserHistory } from '@/lib/useBrowserHistory';
import { fetchSite, fetchUsers, fetchVisits, recordVisit, User, Visit } from '@/lib/api';
import { BrowserChrome } from '@/components/BrowserChrome';
import { PageViewport } from '@/components/PageViewport';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { SearchModal } from '@/components/SearchModal';
import { PublishModal } from '@/components/PublishModal';

export default function BrowserApp() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Panels
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishPrefill, setPublishPrefill] = useState('');

  // Linear tab history engine
  const {
    canGoBack,
    canGoForward,
    currentItem,
    pushAddress,
    goBack,
    goForward,
    recordCurrentScroll,
    getPreservedScroll,
  } = useBrowserHistory('tidepool.zz');

  // Load users on mount
  useEffect(() => {
    async function initUsers() {
      const u = await fetchUsers();
      setUsers(u);
      if (u.length > 0) {
        const initial = u[0];
        setActiveUser(initial);
        const v = await fetchVisits(initial.handle);
        setVisits(v);
      }
    }
    initUsers();
  }, []);

  // Reload history when user switches
  useEffect(() => {
    if (activeUser) {
      fetchVisits(activeUser.handle).then(setVisits);
    }
  }, [activeUser]);

  // Keyboard shortcuts: Ctrl+K = search, Ctrl+L = focus address (future)
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Primary navigation function
  const navigateTo = useCallback(
    async (targetAddress: string, source: Visit['source'] = 'typed') => {
      const address = targetAddress.toLowerCase().trim();
      if (!address) return;

      setIsLoading(true);
      try {
        const result = await fetchSite(address);
        const site = result.site;
        const isOffline = !!result.isOffline;
        const isNotFound = !isOffline && !site;

        pushAddress(address, site, isNotFound, isOffline);

        if (activeUser && !isOffline) {
          const recorded = await recordVisit({
            userId: activeUser.handle,
            userName: activeUser.name,
            address,
            source,
          });
          if (recorded) {
            setVisits((prev) => [recorded, ...prev]);
          }
        }
      } catch {
        pushAddress(targetAddress, null, true, true);
      } finally {
        setIsLoading(false);
      }
    },
    [activeUser, pushAddress],
  );

  // Initial navigation to tidepool.zz
  useEffect(() => {
    if (!currentItem) {
      navigateTo('tidepool.zz', 'typed');
    }
  }, [currentItem, navigateTo]);

  const handleGoBack = () => {
    if (canGoBack) {
      goBack();
      if (activeUser && currentItem && !currentItem.isOffline) {
        recordVisit({
          userId: activeUser.handle,
          userName: activeUser.name,
          address: currentItem.address,
          source: 'back_forward',
        }).then((r) => { if (r) setVisits((prev) => [r, ...prev]); });
      }
    }
  };

  const handleGoForward = () => {
    if (canGoForward) {
      goForward();
      if (activeUser && currentItem && !currentItem.isOffline) {
        recordVisit({
          userId: activeUser.handle,
          userName: activeUser.name,
          address: currentItem.address,
          source: 'back_forward',
        }).then((r) => { if (r) setVisits((prev) => [r, ...prev]); });
      }
    }
  };

  const handleRefresh = () => {
    if (currentItem?.address) {
      navigateTo(currentItem.address, 'typed');
    } else {
      navigateTo('tidepool.zz', 'typed');
    }
  };

  const handleOpenPublish = (prefill = '') => {
    setPublishPrefill(prefill);
    setIsPublishOpen(true);
  };

  // Status bar info
  const statusDotClass = isLoading ? 'status-dot loading' : currentItem?.isOffline ? 'status-dot error' : currentItem?.isNotFound ? 'status-dot error' : 'status-dot';
  const statusText = isLoading
    ? `Connecting to ${currentItem?.address || '…'}`
    : currentItem?.isOffline
    ? 'Backend offline'
    : currentItem?.isNotFound
    ? `No site at ${currentItem?.address}`
    : currentItem?.site
    ? `${currentItem.site.title} · by ${currentItem.site.authorName}`
    : 'The Small Web';

  return (
    <div className="browser-root">
      {/* 1. Browser Chrome */}
      <BrowserChrome
        currentAddress={currentItem?.address || ''}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
        users={users}
        activeUser={activeUser}
        onNavigate={(addr) => navigateTo(addr, 'typed')}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onRefresh={handleRefresh}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPublish={() => handleOpenPublish('')}
        onSelectUser={setActiveUser}
      />

      {/* 2. Page Viewport */}
      <div className="browser-viewport">
        <PageViewport
          address={currentItem?.address || ''}
          site={currentItem?.site || null}
          isLoading={isLoading}
          isNotFound={currentItem?.isNotFound || false}
          isOffline={currentItem?.isOffline || false}
          preservedScroll={getPreservedScroll()}
          onNavigateLink={(addr) => navigateTo(addr, 'link')}
          onOpenPublish={handleOpenPublish}
          onGoBack={handleGoBack}
          onRefresh={handleRefresh}
          onScrollChange={recordCurrentScroll}
        />
      </div>

      {/* 3. Status bar */}
      <div className="status-bar">
        <div className={statusDotClass} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {statusText}
        </span>
        {activeUser && (
          <>
            <span style={{ marginLeft: 'auto', opacity: 0.5 }}>·</span>
            <span style={{ marginLeft: 4 }}>
              Browsing as <strong style={{ color: 'var(--chrome-text)', fontWeight: 600 }}>{activeUser.name}</strong>
            </span>
          </>
        )}
      </div>

      {/* 4. History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        visits={visits}
        activeUser={activeUser}
        onJumpToVisit={(addr) => navigateTo(addr, 'history')}
      />

      {/* 5. Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateResult={(addr) => navigateTo(addr, 'search')}
      />

      {/* 6. Publish Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        prefillAddress={publishPrefill}
        users={users}
        activeUser={activeUser}
        onClose={() => setIsPublishOpen(false)}
        onPublished={(newAddr) => navigateTo(newAddr, 'typed')}
      />
    </div>
  );
}
