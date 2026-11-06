import { useState, useCallback, useRef } from 'react';
import { HistoryItem, Site } from './types';

export function useBrowserHistory(initialAddress = 'tidepool.zz') {
  const [stack, setStack] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const scrollMapRef = useRef<Record<number, number>>({});

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex >= 0 && currentIndex < stack.length - 1;
  const currentItem = currentIndex >= 0 && currentIndex < stack.length ? stack[currentIndex] : null;

  // Save current scroll position before moving away
  const recordCurrentScroll = useCallback((scrollY: number) => {
    if (currentIndex >= 0) {
      scrollMapRef.current[currentIndex] = scrollY;
    }
  }, [currentIndex]);

  // Navigate to a new address (pruning forward stack if in middle)
  const pushAddress = useCallback(
    (address: string, site: Site | null, isNotFound: boolean, currentScrollY = 0) => {
      setStack((prev) => {
        // Save current scroll position
        if (currentIndex >= 0) {
          scrollMapRef.current[currentIndex] = currentScrollY;
        }

        // PRUNE FORWARD STACK: everything after currentIndex is dropped
        const pruned = prev.slice(0, currentIndex + 1);

        const newItem: HistoryItem = {
          address: address.toLowerCase().trim(),
          site,
          isNotFound,
          scrollPosition: 0,
        };

        const nextStack = [...pruned, newItem];
        const nextIndex = nextStack.length - 1;
        scrollMapRef.current[nextIndex] = 0;
        setCurrentIndex(nextIndex);
        return nextStack;
      });
    },
    [currentIndex],
  );

  // Navigate Back
  const goBack = useCallback(
    (currentScrollY = 0) => {
      if (canGoBack) {
        scrollMapRef.current[currentIndex] = currentScrollY;
        setCurrentIndex((prev) => prev - 1);
      }
    },
    [canGoBack, currentIndex],
  );

  // Navigate Forward
  const goForward = useCallback(
    (currentScrollY = 0) => {
      if (canGoForward) {
        scrollMapRef.current[currentIndex] = currentScrollY;
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [canGoForward, currentIndex],
  );

  // Get preserved scroll offset for current index
  const getPreservedScroll = useCallback(() => {
    return scrollMapRef.current[currentIndex] || 0;
  }, [currentIndex]);

  return {
    stack,
    currentIndex,
    canGoBack,
    canGoForward,
    currentItem,
    pushAddress,
    goBack,
    goForward,
    recordCurrentScroll,
    getPreservedScroll,
  };
}
