import { useState, useCallback, useRef } from 'react';
import { analyzeImage, analyzeImageStream } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { AnalyzeResponse, ThinkingEvent } from '@/types/appraisal';

type AnalyzeState = 'idle' | 'loading' | 'success' | 'error';

export function useAnalyze() {
  const { user, signIn } = useAuth();
  const [state, setState] = useState<AnalyzeState>('idle');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thinkingEvents, setThinkingEvents] = useState<ThinkingEvent[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);

  // ストリーミング版の査定
  const analyze = useCallback(
    async (imageBase64: string, userComment?: string) => {
      setState('loading');
      setResult(null);
      setError(null);
      setThinkingEvents([]);

      // 未認証なら匿名サインイン
      if (!user) {
        await signIn();
      }

      return new Promise<AnalyzeResponse>((resolve, reject) => {
        const cancel = analyzeImageStream(
          imageBase64,
          {
            onEvent: (event) => {
              setThinkingEvents((prev) => [...prev, event]);
            },
            onComplete: (response) => {
              setResult(response);
              setState('success');
              cancelRef.current = null;
              resolve(response);
            },
            onError: (err) => {
              const message = err.message || '査定に失敗しました';
              setError(message);
              setState('error');
              cancelRef.current = null;
              reject(err);
            },
          },
          userComment
        );

        cancelRef.current = cancel;
      });
    },
    [user, signIn]
  );

  // 非ストリーミング版（後方互換性）
  const analyzeSync = useCallback(
    async (imageBase64: string, userComment?: string) => {
      setState('loading');
      setResult(null);
      setError(null);
      setThinkingEvents([]);

      try {
        if (!user) {
          await signIn();
        }

        const response = await analyzeImage(imageBase64, userComment);
        setResult(response);
        setState('success');
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : '査定に失敗しました';
        setError(message);
        setState('error');
        throw err;
      }
    },
    [user, signIn]
  );

  const reset = useCallback(() => {
    // 実行中の場合はキャンセル
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setState('idle');
    setResult(null);
    setError(null);
    setThinkingEvents([]);
  }, []);

  return {
    analyze,
    analyzeSync,
    reset,
    state,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    result,
    error,
    thinkingEvents,
  };
}
