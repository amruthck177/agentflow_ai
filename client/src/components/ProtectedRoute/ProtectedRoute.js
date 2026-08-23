import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { token, setAuth, clearAuth } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const activeToken =
        token || (typeof window !== 'undefined' ? window.localStorage.getItem('agentflow-token') : null);

      if (!activeToken) {
        clearAuth();
        router.replace('/login');
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setAuth(activeToken, res.data.data.user);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid session');
        }
      } catch (err) {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('agentflow-token');
        }
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token, router, setAuth, clearAuth]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-cyan-400 font-mono text-xs">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-4 shadow-2xl backdrop-blur">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
          <span>Verifying Operator Session...</span>
        </div>
      </div>
    );
  }

  return children;
}
