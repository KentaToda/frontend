import { auth } from '@/lib/firebase';
import { detectPlatform } from '@/lib/utils';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AppraisalHistoryItem,
  UserProfile,
} from '@/types/appraisal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  requireAuth?: boolean;
}

// APIリクエストの基本関数（401リトライ付き）
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const { method = 'GET', body, requireAuth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 認証トークンを追加
  if (requireAuth && auth.currentUser) {
    const idToken = await auth.currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 401エラー時はトークンをリフレッシュしてリトライ
  if (response.status === 401 && !isRetry && auth.currentUser) {
    await auth.currentUser.getIdToken(true); // 強制リフレッシュ
    return apiRequest<T>(endpoint, options, true);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'API request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// 画像を査定
export async function analyzeImage(imageBase64: string, userComment?: string): Promise<AnalyzeResponse> {
  const request: AnalyzeRequest = {
    image_base64: imageBase64,
    user_comment: userComment,
    platform: detectPlatform(),
  };

  return apiRequest<AnalyzeResponse>('/api/v1/analyze', {
    method: 'POST',
    body: request,
    requireAuth: true,
  });
}

// 査定履歴を取得
export async function getAppraisalHistory(
  limit = 10,
  offset = 0
): Promise<AppraisalHistoryItem[]> {
  return apiRequest<AppraisalHistoryItem[]>(
    `/api/v1/appraisals?limit=${limit}&offset=${offset}`,
    { requireAuth: true }
  );
}

// 特定の査定を取得
export async function getAppraisal(id: string): Promise<AppraisalHistoryItem | null> {
  return apiRequest<AppraisalHistoryItem | null>(`/api/v1/appraisals/${id}`, {
    requireAuth: true,
  });
}

// ユーザープロファイルを取得
export async function getUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/v1/users/me', { requireAuth: true });
}
