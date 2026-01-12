import { useState, useCallback } from 'react';
import { analyzeImage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { AnalyzeResponse } from '@/types/appraisal';

type AnalyzeState = 'idle' | 'loading' | 'success' | 'error';

export function useAnalyze() {
  const { user, signIn } = useAuth();
  const [state, setState] = useState<AnalyzeState>('idle');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (imageBase64: string, userComment?: string) => {
      setState('loading');
      setResult(null);
      setError(null);

      try {
        // 未認証なら匿名サインイン
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
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    analyze,
    reset,
    state,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    result,
    error,
  };
}
