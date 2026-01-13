import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Eye, Search, BadgeJapaneseYen, Loader2 } from 'lucide-react';
import type { ThinkingEvent, ThinkingNode } from '@/types/appraisal';

interface AnalysisProgressProps {
  isLoading: boolean;
  thinkingEvents: ThinkingEvent[];
}

const nodeConfig: Record<ThinkingNode, { icon: typeof Eye; label: string; color: string }> = {
  vision: { icon: Eye, label: '画像解析', color: 'text-blue-400' },
  search: { icon: Search, label: '商品検索', color: 'text-green-400' },
  price: { icon: BadgeJapaneseYen, label: '価格調査', color: 'text-yellow-400' },
};

export function AnalysisProgress({ isLoading, thinkingEvents }: AnalysisProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しいイベントが追加されたら自動スクロール
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinkingEvents, isExpanded]);

  if (!isLoading && thinkingEvents.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      {/* ヘッダー */}
      <div className="mb-3 flex items-center gap-3">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        <span className="font-semibold">
          {isLoading ? '査定中...' : '分析完了'}
        </span>
      </div>

      {/* 折り畳みトグル */}
      <button
        className="mb-3 flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        AIの分析プロセスを{isExpanded ? '非表示' : '表示'}
      </button>

      {/* Thinking コンテンツ */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="max-h-64 overflow-y-auto rounded-lg bg-gray-800 p-3 font-mono text-sm"
        >
          {thinkingEvents.map((event, index) => (
            <ThinkingItem key={index} event={event} />
          ))}

          {/* 処理中のインジケーター */}
          {isLoading && (
            <div className="flex items-center gap-2 py-1 text-gray-400">
              <span className="text-base">⏳</span>
              <span className="flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* フッター */}
      {isLoading && (
        <p className="mt-3 text-center text-xs text-gray-400">
          処理には10-30秒程度かかります
        </p>
      )}
    </div>
  );
}

function ThinkingItem({ event }: { event: ThinkingEvent }) {
  const node = event.node;
  const config = node ? nodeConfig[node] : null;
  const Icon = config?.icon;

  // node_complete は表示しない（内部イベント）
  if (event.type === 'node_complete') {
    return null;
  }

  return (
    <div className="flex items-start gap-2 border-b border-gray-700 py-2 last:border-b-0">
      {/* アイコン */}
      <span className="flex-shrink-0 text-base">
        {Icon ? (
          <Icon className={`h-4 w-4 ${config?.color}`} />
        ) : (
          '🤖'
        )}
      </span>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* ノードラベル（node_start時のみ） */}
        {event.type === 'node_start' && config && (
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        )}
        {/* メッセージ */}
        <p className="break-words text-gray-300">
          {event.message}
        </p>
      </div>

      {/* タイムスタンプ */}
      <span className="flex-shrink-0 text-xs text-gray-500">
        {new Date(event.timestamp).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </span>
    </div>
  );
}
