// 分類タイプ
export type Classification = 'mass_product' | 'unique_item' | 'unknown' | 'prohibited';

// 信頼度レベル
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// プラットフォーム
export type Platform = 'web' | 'ios' | 'android';

// 価格情報
export interface PriceInfo {
  min_price: number;
  max_price: number;
  currency: string;
  display_message: string;
}

// 信頼度情報
export interface ConfidenceInfo {
  level: ConfidenceLevel;
  reasoning: string;
}

// 査定リクエスト
export interface AnalyzeRequest {
  image_base64: string;
  user_comment?: string;
  platform?: Platform;
}

// 査定レスポンス
export interface AnalyzeResponse {
  appraisal_id: string | null;
  item_name: string | null;
  identified_product: string | null;
  visual_features: string[];
  classification: Classification;
  price: PriceInfo | null;
  confidence: ConfidenceInfo | null;
  price_factors: string[] | null;
  message: string | null;
  recommendation: string | null;
  retry_advice: string | null;
}

// 査定履歴アイテム
export interface AppraisalHistoryItem {
  id: string;
  created_at: string;
  item_name: string | null;
  classification: Classification;
  price: PriceInfo | null;
}

// ユーザープロファイル
export interface UserProfile {
  uid: string;
  created_at: string;
  total_appraisals: number;
  platform: Platform;
}
