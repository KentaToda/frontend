import { Header } from '@/components/Header';
import { AppraisalForm } from '@/components/AppraisalForm';
import { AppraisalHistory } from '@/components/AppraisalHistory';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import { Loader2 } from 'lucide-react';

function App() {
  const { loading } = useAutoAuth();

  // 認証中はローディング表示
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-5 py-6">
      <Header />
      <main className="flex-1">
        <AppraisalForm />
        <AppraisalHistory />
      </main>
      <footer className="mt-10 border-t pt-5 text-center">
        <p className="text-xs text-gray-400">Ojoya</p>
      </footer>
    </div>
  );
}

export default App;
