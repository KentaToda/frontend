import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Platform } from '@/types/appraisal';

// Tailwind CSSクラスをマージするユーティリティ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 価格をフォーマット（¥1,000形式）
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

// プラットフォームを検出
export function detectPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  return 'web';
}

// モバイルデバイスかどうかを判定
export function isMobileDevice(): boolean {
  const platform = detectPlatform();
  return platform === 'ios' || platform === 'android';
}

// Base64エンコード（data:image/...;base64,プレフィックスを除去）
export function extractBase64Data(dataUrl: string): string {
  const base64Index = dataUrl.indexOf('base64,');
  if (base64Index !== -1) {
    return dataUrl.substring(base64Index + 7);
  }
  return dataUrl;
}

// ファイルサイズをフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
