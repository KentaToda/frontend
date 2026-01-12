import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = '査定中...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-gray-600">{message}</p>
      <p className="text-xs text-gray-400">
        10〜30秒ほどかかる場合があります
      </p>
    </div>
  );
}
