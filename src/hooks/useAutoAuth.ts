import { useEffect } from 'react';
import { useAuth } from './useAuth';

export function useAutoAuth() {
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    // ロード完了後、未認証なら自動で匿名サインイン
    if (!loading && !user) {
      signIn().catch((error) => {
        console.error('Auto sign-in failed:', error);
      });
    }
  }, [loading, user, signIn]);

  return { user, loading };
}
