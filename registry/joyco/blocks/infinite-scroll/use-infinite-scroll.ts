'use client';

import * as React from 'react';

type LoadPageResult<TItem> = {
  items: TItem[];
  totalCount?: number | null;
};

type LoadPageArgs = {
  offset: number;
  limit: number;
  page: number;
};

export type LoadPageFn<TItem> = (context: LoadPageArgs) => Promise<LoadPageResult<TItem>>;

export interface UseInfiniteScrollOptions<TItem> {
  loadPage: LoadPageFn<TItem>;
  pageSize?: number;
  bias?: number;
  initialPage?: number;
  mergeItems?: (previous: TItem[], incoming: TItem[]) => TItem[];
  autoAdvance?: boolean;
  observerOptions?: IntersectionObserverInit;
  enabled?: boolean;
  initialItems?: TItem[];
  initialTotalCount?: number | null;
  initialFetched?: number;
}

export interface UseInfiniteScrollResult<TItem> {
  items: TItem[];
  visibleItems: TItem[];
  visibleCount: number;
  pageSize: number;
  bias: number;
  requestedPage: number;
  loading: boolean;
  error: string | null;
  totalCount: number | null;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  advancePage: () => void;
  loadMore: () => void;
  retry: () => void;
  reset: () => void;
}

export function useInfiniteScroll<TItem>(options: UseInfiniteScrollOptions<TItem>): UseInfiniteScrollResult<TItem> {
  const {
    loadPage,
    pageSize: pageSizeProp = 20,
    bias: biasProp,
    initialPage = 1,
    mergeItems = (previous: TItem[], incoming: TItem[]) => [...previous, ...incoming],
    autoAdvance = true,
    observerOptions,
    enabled = true,
    initialItems: initialItemsProp,
    initialTotalCount,
    initialFetched,
  } = options;

  const pageSize = pageSizeProp;
  const bias = biasProp ?? pageSize;
  const initialLimit = pageSize + bias;

  const initialItemsRef = React.useRef<TItem[]>(initialItemsProp ?? []);
  const initialFetchedRef = React.useRef<number>(
    typeof initialFetched === 'number' ? initialFetched : initialItemsRef.current.length
  );
  const initialTotalCountRef = React.useRef<number | null>(
    typeof initialTotalCount === 'number' || initialTotalCount === null ? initialTotalCount : null
  );

  const [items, setItems] = React.useState<TItem[]>(() => initialItemsRef.current);
  const [requestedPage, setRequestedPage] = React.useState(() => {
    const initialCount = initialFetchedRef.current;
    if (initialCount > 0 && pageSize > 0) {
      return Math.max(initialPage, Math.ceil(initialCount / pageSize));
    }

    return initialPage;
  });
  const [totalCount, setTotalCount] = React.useState<number | null>(() => initialTotalCountRef.current);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const initialisedRef = React.useRef(initialItemsRef.current.length > 0);

  React.useEffect(() => {
    initialItemsRef.current = initialItemsProp ?? [];
  }, [initialItemsProp]);

  React.useEffect(() => {
    initialFetchedRef.current = typeof initialFetched === 'number' ? initialFetched : initialItemsRef.current.length;
  }, [initialFetched, initialItemsProp]);

  React.useEffect(() => {
    if (typeof initialTotalCount === 'number' || initialTotalCount === null) {
      initialTotalCountRef.current = initialTotalCount;
    }
  }, [initialTotalCount]);

  React.useEffect(() => {
    if (typeof initialItemsProp === 'undefined') {
      return;
    }

    const nextItems = initialItemsProp ?? [];
    const nextCount = typeof initialFetched === 'number' ? initialFetched : nextItems.length;

    setItems(nextItems);
    setRequestedPage(() => {
      if (nextItems.length === 0) {
        return initialPage;
      }

      return Math.max(initialPage, Math.ceil(Math.max(nextCount, 0) / pageSize));
    });

    if (typeof initialTotalCount === 'number' || initialTotalCount === null) {
      setTotalCount(initialTotalCount);
    }

    initialisedRef.current = nextItems.length > 0;
  }, [initialItemsProp, initialFetched, initialTotalCount, initialPage, pageSize]);

  const hasMore = totalCount === null || items.length < totalCount;
  const visibleCount = Math.min(requestedPage * pageSize, items.length);
  const visibleItems = React.useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  const loadChunk = React.useCallback(
    async (offset: number, limit: number) => {
      if (!enabled) {
        return;
      }

      if (loading) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const page = Math.floor(offset / pageSize) + 1;
        const result = await loadPage({ offset, limit, page });
        const incoming = Array.isArray(result.items) ? result.items : [];

        setItems((previous: TItem[]) => mergeItems(previous, incoming));

        if (typeof result.totalCount === 'number') {
          setTotalCount(result.totalCount);
        } else if (result.totalCount === null) {
          setTotalCount(null);
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unknown error.');
      } finally {
        setLoading(false);
      }
    },
    [enabled, loadPage, loading, mergeItems, pageSize]
  );

  const ensureBiasAhead = React.useCallback(() => {
    if (!enabled || loading || !hasMore) {
      return;
    }

    const required = requestedPage * pageSize + bias;

    if (items.length >= required) {
      return;
    }

    const oldPage = Math.max(0, requestedPage - 1);
    const nextOffset = oldPage * pageSize + bias;
    const offset = Math.max(nextOffset, items.length);

    void loadChunk(offset, pageSize);
  }, [bias, enabled, hasMore, items.length, loadChunk, loading, pageSize, requestedPage]);

  const advancePage = React.useCallback(() => {
    if (!enabled) {
      return;
    }

    setRequestedPage((current: number) => {
      const next = current + 1;

      if (totalCount !== null) {
        const maxPages = Math.ceil(totalCount / pageSize);

        if (next > maxPages) {
          return current;
        }
      }

      return next;
    });
  }, [enabled, pageSize, totalCount]);

  const reset = React.useCallback(() => {
    if (!enabled) {
      return;
    }

    const nextItems = initialItemsRef.current;
    const nextTotalCount = initialTotalCountRef.current ?? null;
    const nextFetched = typeof initialFetchedRef.current === 'number' ? initialFetchedRef.current : nextItems.length;

    setItems(nextItems);
    setRequestedPage(() => {
      if (nextItems.length === 0) {
        return initialPage;
      }

      return Math.max(initialPage, Math.ceil(Math.max(nextFetched, nextItems.length) / pageSize));
    });
    setTotalCount(nextTotalCount);
    setError(null);
    const hasInitialItems = nextItems.length > 0;
    initialisedRef.current = hasInitialItems;

    if (!hasInitialItems) {
      void loadChunk(0, initialLimit);
    } else {
      setTimeout(() => {
        ensureBiasAhead();
      }, 0);
    }
  }, [enabled, ensureBiasAhead, initialLimit, initialPage, loadChunk, pageSize]);

  const retry = React.useCallback(() => {
    if (!enabled) {
      return;
    }

    if (error) {
      setError(null);
    }

    ensureBiasAhead();
  }, [enabled, ensureBiasAhead, error]);

  const loadMore = React.useCallback(() => {
    advancePage();
  }, [advancePage]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    if (initialisedRef.current) {
      return;
    }

    initialisedRef.current = true;
    void loadChunk(0, initialLimit);
  }, [enabled, initialLimit, loadChunk]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    ensureBiasAhead();
  }, [enabled, ensureBiasAhead]);

  React.useEffect(() => {
    if (!enabled || !autoAdvance) {
      return;
    }

    if (!hasMore) {
      return;
    }

    const node = sentinelRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          advancePage();
        }
      });
    }, observerOptions ?? { rootMargin: '200px 0px' });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [advancePage, autoAdvance, enabled, hasMore, observerOptions]);

  return {
    items,
    visibleItems,
    visibleCount,
    pageSize,
    bias,
    requestedPage,
    loading,
    error,
    totalCount,
    hasMore,
    sentinelRef,
    advancePage,
    loadMore,
    retry,
    reset,
  };
}
