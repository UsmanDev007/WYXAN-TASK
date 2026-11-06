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
    getPreservedScroll,
  } = useBrowserHistory('tidepool.zz');

  // Load users & initial user visits
  useEffect(() => {
    async function initUsers() {
      const u = await fetchUsers();
      setUsers(u);
      if (u.length > 0) {
        const initialUser = u[0]; // Alice Walker
        setActiveUser(initialUser);
        const v = await fetchVisits(initialUser.handle);
        setVisits(v);
      }
    }
    initUsers();
  }, []);

  // When activeUser changes, reload their history
  useEffect(() => {
    if (activeUser) {
      fetchVisits(activeUser.handle).then(setVisits);
    }
  }, [activeUser]);

  // Primary navigation function
  const navigateTo = useCallback(
    async (targetAddress: string, source: Visit['source'] = 'typed') => {
      const address = targetAddress.toLowerCase().trim();
      if (!address) return;

      setIsLoading(true);

      try {
        const site = await fetchSite(address);
        const isNotFound = !site;

        // Record in tab history stack (pruning forward entries)
        pushAddress(address, site, isNotFound);

        // Record persistent visit in database if user is selected
        if (activeUser) {
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
      } catch (err) {
        pushAddress(address, null, true);
      } finally {
        setIsLoading(false);
      }
    },
    [activeUser, pushAddress],
  );

  // Initial landing page navigation
  useEffect(() => {
    if (!currentItem && users.length > 0) {
      navigateTo('tidepool.zz', 'typed');
    }
  }, [currentItem, users, navigateTo]);

  // Handle Back action
  const handleGoBack = () => {
    if (canGoBack) {
      goBack();
      // Record back_forward visit
      if (activeUser && currentItem) {
        recordVisit({
          userId: activeUser.handle,
          userName: activeUser.name,
          address: currentItem.address,
          source: 'back_forward',
        }).then((recorded) => {
          if (recorded) setVisits((prev) => [recorded, ...prev]);
        });
      }
    }
  };

  // Handle Forward action
  const handleGoForward = () => {
    if (canGoForward) {
      goForward();
      if (activeUser && currentItem) {
        recordVisit({
          userId: activeUser.handle,
          userName: activeUser.name,
          address: currentItem.address,
          source: 'back_forward',
        }).then((recorded) => {
          if (recorded) setVisits((prev) => [recorded, ...prev]);
        });
      }
    }
  };

  // Handle Refresh action
  const handleRefresh = () => {
    if (currentItem?.address) {
      navigateTo(currentItem.address, 'typed');
    }
  };

  // Open Publish Modal (optionally pre-filled with an address from a 404 page)
  const handleOpenPublish = (prefill = '') => {
    setPublishPrefill(prefill);
    setIsPublishOpen(true);
  };

  return (
    <main className="flex flex-col h-screen w-screen bg-paper text-ink overflow-hidden font-body select-none">
      {/* 1. Browser Chrome (Toolbar) */}
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

      {/* 2. Main Page Viewport */}
      <PageViewport
        address={currentItem?.address || ''}
        site={currentItem?.site || null}
        isLoading={isLoading}
        isNotFound={currentItem?.isNotFound || false}
        preservedScroll={getPreservedScroll()}
        onNavigateLink={(linkAddr) => navigateTo(linkAddr, 'link')}
        onOpenPublish={handleOpenPublish}
        onGoBack={handleGoBack}
        onRefresh={handleRefresh}
      />

      {/* 3. History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        visits={visits}
        activeUser={activeUser}
        onJumpToVisit={(addr) => navigateTo(addr, 'history')}
      />

      {/* 4. Full-Text Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateResult={(addr) => navigateTo(addr, 'search')}
      />

      {/* 5. Publish Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        prefillAddress={publishPrefill}
        users={users}
        activeUser={activeUser}
        onClose={() => setIsPublishOpen(false)}
        onPublished={(newAddr) => navigateTo(newAddr, 'typed')}
      />
    </main>
  );
}
