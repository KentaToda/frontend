import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, isMobileDevice, formatFileSize } from '@/lib/utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImagePickerProps {
  onImageSelect: (base64: string) => void;
  onImageClear: () => void;
  disabled?: boolean;
}

export function ImagePicker({ onImageSelect, onImageClear, disabled }: ImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'JPEG、PNG、WebP形式の画像を選択してください';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `ファイルサイズが大きすぎます（最大${formatFileSize(MAX_FILE_SIZE)}）`;
    }
    return null;
  }, []);

  const processFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        // data:image/...;base64,... 形式のままコールバック（バックエンドがこの形式を期待）
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    },
    [validateFile, onImageSelect]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // 同じファイルを再選択できるようにリセット
      e.target.value = '';
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setError(null);
    onImageClear();
  }, [onImageClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    []
  );

  return (
    <div className="space-y-3">
      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* アップロードエリア */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="画像をアップロード"
        className={cn(
          'relative min-h-[200px] rounded border border-dashed p-5 text-center transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          preview ? 'border-solid border-gray-300' : 'border-gray-300',
          dragOver && 'border-primary bg-blue-50',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary hover:bg-gray-50'
        )}
        onClick={() => !disabled && !preview && fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="プレビュー"
              className="max-h-[300px] max-w-full rounded"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="text-gray-600">
              クリックまたはドラッグ&ドロップで画像を選択
            </p>
            <p className="text-xs text-gray-400">
              JPEG, PNG, WebP（最大10MB）
            </p>
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* アクションボタン */}
      <div className="flex gap-2">
        {preview ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={disabled}
            className="flex-1"
          >
            <X className="h-4 w-4" />
            クリア
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-1"
            >
              <Upload className="h-4 w-4" />
              ファイルを選択
            </Button>
            {isMobileDevice() && (
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled}
                className="flex-1"
              >
                <Camera className="h-4 w-4" />
                カメラ
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
