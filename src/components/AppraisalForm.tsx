import { useState, useCallback } from 'react';
import { ImagePicker } from '@/components/ImagePicker';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AppraisalResult } from '@/components/AppraisalResult';
import { Button } from '@/components/ui/button';
import { useAnalyze } from '@/hooks/useAnalyze';

export function AppraisalForm() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const { analyze, reset, isLoading, isSuccess, isError, result, error } = useAnalyze();

  const handleImageSelect = useCallback((base64: string) => {
    setImageBase64(base64);
    reset();
  }, [reset]);

  const handleImageClear = useCallback(() => {
    setImageBase64(null);
    reset();
  }, [reset]);

  const handleSubmit = useCallback(async () => {
    if (!imageBase64) return;
    await analyze(imageBase64);
  }, [imageBase64, analyze]);

  const handleRetry = useCallback(() => {
    handleImageClear();
  }, [handleImageClear]);

  return (
    <div className="space-y-5">
      {/* 画像選択 */}
      <ImagePicker
        onImageSelect={handleImageSelect}
        onImageClear={handleImageClear}
        disabled={isLoading}
      />

      {/* 査定ボタン */}
      {!isLoading && !isSuccess && (
        <Button
          onClick={handleSubmit}
          disabled={!imageBase64 || isLoading}
          className="w-full"
        >
          査定する
        </Button>
      )}

      {/* ローディング */}
      {isLoading && <LoadingSpinner />}

      {/* エラー */}
      {isError && error && (
        <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 結果表示 */}
      {isSuccess && result && (
        <AppraisalResult result={result} onRetry={handleRetry} />
      )}
    </div>
  );
}
