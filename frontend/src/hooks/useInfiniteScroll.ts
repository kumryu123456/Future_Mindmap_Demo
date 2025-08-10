import { useState, useEffect, useCallback, useRef } from 'react';

export interface InfiniteScrollConfig {
  threshold?: number; // 교차 감지 임계값 (0-1 비율)
  rootMargin?: string; // Intersection Observer rootMargin
  enabled?: boolean; // 무한 스크롤 활성화 여부
}

export interface InfiniteScrollState<T> {
  items: T[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  page: number;
  totalItems: number;
}

export interface UseInfiniteScrollReturn<T> extends InfiniteScrollState<T> {
  loadMore: () => Promise<void>;
  reset: () => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  observerRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll<T>({
  fetchFunction,
  pageSize = 20,
  initialPage = 1,
  config = {},
}: {
  fetchFunction: (page: number, pageSize: number) => Promise<{
    items: T[];
    totalItems: number;
    hasMore: boolean;
  }>;
  pageSize?: number;
  initialPage?: number;
  config?: InfiniteScrollConfig;
}): UseInfiniteScrollReturn<T> {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    enabled = true,
  } = config;

  const [state, setState] = useState<InfiniteScrollState<T>>({
    items: [],
    hasMore: true,
    loading: false,
    error: null,
    page: initialPage,
    totalItems: 0,
  });

  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !state.hasMore) {
      return;
    }

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchFunction(state.page, pageSize);
      
      // 안전한 처리: result가 유효하고 items가 배열인지 확인
      if (!result || !Array.isArray(result.items)) {
        console.error('Invalid fetchFunction result:', result);
        throw new Error('fetchFunction must return an object with items array');
      }
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...result.items],
        hasMore: result.hasMore ?? false,
        page: prev.page + 1,
        totalItems: result.totalItems ?? prev.items.length + result.items.length,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [fetchFunction, state.page, state.hasMore, pageSize]);

  const reset = useCallback(() => {
    setState({
      items: [],
      hasMore: true,
      loading: false,
      error: null,
      page: initialPage,
      totalItems: 0,
    });
    loadingRef.current = false;
  }, [initialPage]);

  const setItems = useCallback((updater: React.SetStateAction<T[]>) => {
    setState(prev => ({
      ...prev,
      items: typeof updater === 'function' ? updater(prev.items) : updater,
    }));
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!enabled || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && state.hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [enabled, loadMore, state.hasMore, rootMargin, threshold]);

  // Initial load
  useEffect(() => {
    if (state.items.length === 0 && !loadingRef.current) {
      loadMore();
    }
  }, [loadMore, state.items.length]);

  return {
    ...state,
    loadMore,
    reset,
    setItems,
    observerRef,
  };
}