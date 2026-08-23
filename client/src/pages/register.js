import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import {
  Zap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', form);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('agentflow-token', data.data.token);
      }
      setAuth(data.data.token, data.data.user);
      router.push('/dashboard');
    } catch (apiError) {
      const message =
        apiError.response?.data?.message ||
        apiError.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please check your information.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Decorative Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />

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
            Create Operator Workspace
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Set up your account to start orchestrating multi-agent AI workflows
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-7 sm:p-8 shadow-2xl backdrop-blur-xl shadow-cyan-500/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  type="text"
                  placeholder="Alex Rivera"
                  required
                />
              </div>
            </div>

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
                  placeholder="alex@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars (1 uppercase, 1 number)"
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
              <p className="mt-1 text-[11px] text-slate-500">
                Must contain 8+ characters, uppercase letter, and number
              </p>
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
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Account & Enter Console
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="mt-6 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
            >
              Sign In Instead →
            </Link>
          </div>
        </div>

        {/* Security / Compliance Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>bcrypt Cost 12 • Role-Based Separation • AES-256 Storage</span>
        </div>
      </div>
    </main>
  );
}
