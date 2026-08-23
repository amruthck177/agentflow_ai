import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    email: 'demo@agentflow.ai',
    password: 'password123',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('agentflow-token', data.data.token);
      }
      setAuth(data.data.token, data.data.user);
      router.push('/dashboard');
    } catch (apiError) {
      const message =
        apiError.response?.data?.message || 'Unable to authenticate. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Decorative Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[150px]" />

      {/* Subtle Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition">
              <Zap className="h-5 w-5 text-slate-950 fill-slate-950" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition">
              Agentflow<span className="text-cyan-400">_AI</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
            Operator Console Login
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to manage and orchestrate multi-agent operations
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-7 sm:p-8 shadow-2xl backdrop-blur-xl shadow-cyan-500/5">
          {/* Quick Fill Pills */}
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Quick 1-Click Credentials
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('demo@agentflow.ai', 'password123')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition"
              >
                <CheckCircle2 className="h-3 w-3" />
                Demo Operator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@agentflow.ai', 'password123')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40 transition"
              >
                <ShieldCheck className="h-3 w-3" />
                Admin Account
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  type="email"
                  placeholder="operator@agentflow.ai"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Authenticating Session...
                </>
              ) : (
                <>
                  Sign In to Console
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-400">
            Don’t have an operator workspace?{' '}
            <Link
              href="/register"
              className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
            >
              Create Account →
            </Link>
          </div>
        </div>

        {/* Security / Compliance Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>256-bit AES Token Encryption • Role-Based Access Control</span>
        </div>
      </div>
    </main>
  );
}
