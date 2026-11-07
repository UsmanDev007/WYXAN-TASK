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

  // Keyboard shortcut Ctrl+K to open search
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
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
  const statusDotClass = isLoading
    ? 'chrome-status-dot loading'
    : currentItem?.isOffline || currentItem?.isNotFound
    ? 'chrome-status-dot error'
    : 'chrome-status-dot';

  const statusText = isLoading
    ? `Waiting for ${currentItem?.address || 'site'}...`
    : currentItem?.isOffline
    ? 'API Offline'
    : currentItem?.isNotFound
    ? `Not found: ${currentItem?.address}`
    : currentItem?.site
    ? `${currentItem.site.title} — Published by ${currentItem.site.authorName}`
    : 'Google Chrome Small Web';

  return (
    <div className="chrome-window">
      {/* 1. Chrome Tab Strip & Navigation Toolbar */}
      <BrowserChrome
        currentAddress={currentItem?.address || ''}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
        users={users}
        activeUser={activeUser}
        siteTitle={currentItem?.site?.title}
        onNavigate={(addr) => navigateTo(addr, 'typed')}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onRefresh={handleRefresh}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPublish={() => handleOpenPublish('')}
        onSelectUser={setActiveUser}
      />

      {/* 2. Sandboxed Page Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
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

      {/* 3. Chrome Status Bar */}
      <footer className="chrome-status-bar">
        <div className={statusDotClass} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {statusText}
        </span>
        {activeUser && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Signed in as</span>
            <strong style={{ color: '#202124' }}>{activeUser.name}</strong>
          </span>
        )}
      </footer>

      {/* 4. History Drawer (Chrome Side Panel) */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        visits={visits}
        activeUser={activeUser}
        onJumpToVisit={(addr) => navigateTo(addr, 'history')}
      />

      {/* 5. Google Search Modal */}
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
