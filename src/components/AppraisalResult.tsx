import { RefreshCw, ImageOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { formatPrice } from '@/lib/utils';
import type { AnalyzeResponse } from '@/types/appraisal';

interface AppraisalResultProps {
  result: AnalyzeResponse;
  onRetry?: () => void;
}

export function AppraisalResult({ result, onRetry }: AppraisalResultProps) {
  const { classification } = result;

  // 既製品（mass_product）の場合
  if (classification === 'mass_product') {
    return <MassProductResult result={result} />;
  }

  // 一点物（unique_item）の場合
  if (classification === 'unique_item') {
    return <UniqueItemResult result={result} />;
  }

  // 査定不可（unknown）の場合
  if (classification === 'unknown') {
    return <UnknownResult result={result} onRetry={onRetry} />;
  }

  // 禁止アイテム（prohibited）の場合
  return <ProhibitedResult result={result} onRetry={onRetry} />;
}

// 既製品の結果表示
function MassProductResult({ result }: { result: AnalyzeResponse }) {
  const productName = result.identified_product || result.item_name;

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* 商品名 */}
        <div>
          <span className="text-xs uppercase tracking-wide text-gray-500">商品名</span>
          <p className="mt-1 text-lg font-medium">{productName}</p>
        </div>

        {/* 価格帯 */}
        {result.price && (
          <div>
            <span className="text-xs uppercase tracking-wide text-gray-500">中古相場</span>
            <p className="mt-1 text-2xl font-semibold text-primary">
              {formatPrice(result.price.min_price)} 〜 {formatPrice(result.price.max_price)}
            </p>
            {result.price.display_message && (
              <p className="mt-1 text-sm text-gray-600">{result.price.display_message}</p>
            )}
          </div>
        )}

        {/* 価格変動要因 */}
        {result.price_factors && result.price_factors.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-wide text-gray-500">価格変動要因</span>
            <ul className="mt-2 space-y-1">
              {result.price_factors.map((factor, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 信頼度 */}
        {result.confidence && (
          <div>
            <div className="flex items-center gap-2">
              <ConfidenceBadge level={result.confidence.level} />
            </div>
            {result.confidence.reasoning && (
              <p className="mt-1 text-sm text-gray-600">{result.confidence.reasoning}</p>
            )}
          </div>
        )}

        {/* 特徴タグ */}
        {result.visual_features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.visual_features.map((feature, i) => (
              <Badge key={i} variant="default">
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 一点物の結果表示
function UniqueItemResult({ result }: { result: AnalyzeResponse }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        {/* 商品名 */}
        {result.item_name && (
          <div>
            <span className="text-xs uppercase tracking-wide text-gray-500">商品名</span>
            <p className="mt-1 text-lg font-medium">{result.item_name}</p>
          </div>
        )}

        {/* メッセージ */}
        <div className="rounded bg-amber-50 p-3">
          <p className="font-medium text-amber-800">{result.message}</p>
          {result.recommendation && (
            <p className="mt-2 text-sm text-amber-700">{result.recommendation}</p>
          )}
        </div>

        {/* 信頼度 */}
        {result.confidence && (
          <div>
            <ConfidenceBadge level={result.confidence.level} />
            {result.confidence.reasoning && (
              <p className="mt-1 text-sm text-gray-600">{result.confidence.reasoning}</p>
            )}
          </div>
        )}

        {/* 特徴タグ */}
        {result.visual_features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.visual_features.map((feature, i) => (
              <Badge key={i} variant="default">
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 査定不可の結果表示
function UnknownResult({
  result,
  onRetry,
}: {
  result: AnalyzeResponse;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center py-4 text-center">
          <ImageOff className="h-12 w-12 text-gray-400" />
          <p className="mt-3 font-medium text-gray-800">
            {result.message || '画像から商品を特定できませんでした'}
          </p>
          {result.retry_advice && (
            <p className="mt-2 text-sm text-gray-600">{result.retry_advice}</p>
          )}
        </div>

        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="h-4 w-4" />
            もう一度試す
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// 禁止アイテムの結果表示
function ProhibitedResult({
  result,
  onRetry,
}: {
  result: AnalyzeResponse;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="rounded bg-red-50 p-4 text-center">
          <p className="font-medium text-red-800">
            {result.message || 'この画像は査定対象外です'}
          </p>
          {result.retry_advice && (
            <p className="mt-2 text-sm text-red-600">{result.retry_advice}</p>
          )}
        </div>

        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            別の画像を選択
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
