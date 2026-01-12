import { useEffect } from 'react';
import { RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppraisalHistory } from '@/hooks/useAppraisalHistory';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';

export function AppraisalHistory() {
  const { isAuthenticated } = useAuth();
  const { items, loading, error, hasMore, refresh, loadMore } = useAppraisalHistory();

  // 認証後に履歴を取得
  useEffect(() => {
    if (isAuthenticated && items.length === 0) {
      refresh();
    }
  }, [isAuthenticated, items.length, refresh]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">査定履歴</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* エラー */}
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* 履歴リスト */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}

          {/* もっと読み込む */}
          {hasMore && (
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
              className="w-full"
            >
              {loading ? '読み込み中...' : 'もっと見る'}
            </Button>
          )}
        </div>
      ) : !loading ? (
        <p className="py-8 text-center text-sm text-gray-500">
          まだ査定履歴がありません
        </p>
      ) : null}
    </div>
  );
}

function HistoryItem({ item }: { item: ReturnType<typeof useAppraisalHistory>['items'][0] }) {
  const date = new Date(item.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center gap-3 rounded border p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
        <Package className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">
          {item.item_name || '商品名不明'}
        </p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <div className="text-right">
        {item.price ? (
          <p className="font-medium text-primary">
            {formatPrice(item.price.min_price)}〜
          </p>
        ) : (
          <Badge variant={item.classification === 'unique_item' ? 'warning' : 'default'}>
            {item.classification === 'unique_item' ? '一点物' : '査定不可'}
          </Badge>
        )}
      </div>
    </div>
  );
}
