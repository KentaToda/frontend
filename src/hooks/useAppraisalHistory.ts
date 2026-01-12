import { useState, useCallback } from 'react';
import { getAppraisalHistory } from '@/lib/api';
import type { AppraisalHistoryItem } from '@/types/appraisal';

const PAGE_SIZE = 10;

export function useAppraisalHistory() {
  const [items, setItems] = useState<AppraisalHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const offset = reset ? 0 : items.length;
      const data = await getAppraisalHistory(PAGE_SIZE, offset);

      if (reset) {
        setItems(data);
      } else {
        setItems((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      const message = err instanceof Error ? err.message : '履歴の取得に失敗しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [items.length]);

  const refresh = useCallback(() => {
    return fetch(true);
  }, [fetch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      return fetch(false);
    }
  }, [fetch, loading, hasMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}
