import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  XCircle,
  Bot,
  Zap,
  ShieldCheck,
  RefreshCw,
  Plus,
  GitBranch,
  Layers,
  Activity,
  Network,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [dashboardData, setDashboardData] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [triggeringId, setTriggeringId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const [resDash, resInteg] = await Promise.all([
        api.get('/workflows/dashboard'),
        api.get('/integrations'),
      ]);
      if (resDash.data?.success) setDashboardData(resDash.data.data);
      if (resInteg.data?.success) setIntegrations(resInteg.data.data || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickGenerate = async (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.post('/workflows/generate', { prompt: quickPrompt });
      if (res.data?.success) {
        const gen = res.data.data;
        const saved = await api.post('/workflows', {
          name: gen.name || 'Quick Flow',
          description: gen.description || quickPrompt,
          nodes: gen.nodes || [],
          edges: gen.edges || [],
          status: 'active',
          generatedFromPrompt: quickPrompt,
        });
        if (saved.data?.success) {
          router.push(`/workflows/${saved.data.data._id}`);
        }
      }
    } catch (err) {
      alert('Failed to generate workflow. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunWorkflow = async (workflowId) => {
    setTriggeringId(workflowId);
    try {
      const res = await api.post(`/workflows/${workflowId}/execute`);
      if (res.data?.success) {
        router.push(`/executions/${res.data.data._id}`);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to trigger execution');
    } finally {
      setTriggeringId(null);
    }
  };

  const agentPillars = [
    {
      name: 'Planner Agent',
      desc: 'Topological scheduling & confidence scoring',
      icon: Bot,
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
      badge: '98% Confidence',
    },
    {
      name: 'Execution Agent',
      desc: 'Multi-tool & AI model dispatching',
      icon: Zap,
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      badge: 'Substrate Active',
    },
    {
      name: 'Validation Agent',
      desc: 'Output contract & integrity verification',
      icon: ShieldCheck,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      badge: 'Strict Schema',
    },
    {
      name: 'Recovery Agent',
      desc: 'Exponential backoff & escalation triage',
      icon: RefreshCw,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      badge: 'Auto-Healing',
    },
    {
      name: 'Monitoring Agent',
      desc: 'Real-time WebSocket event streaming',
      icon: Activity,
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
      badge: 'Live Timeline',
    },
  ];

  return (
    <ProtectedRoute>
      <AppShell title="Operations Console">
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
          {/* Top Hero Section with Quick Prompt Generator */}
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 p-8 shadow-2xl backdrop-blur-xl">
            {/* Background Glow Accents */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Autonomous Orchestration Engine Online
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Welcome, {user?.name || 'Operator'}
                  </h1>
                  <p className="mt-1 text-xs text-slate-300 max-w-xl leading-relaxed">
                    Describe an automation flow in plain English or trigger multi-agent pipeline executions with live timeline verification.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/workflows"
                    className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:text-white transition"
                  >
                    <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                    All Workflows
                  </Link>

                  <Link
                    href="/workflows/builder"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Create Flow
                  </Link>
                </div>
              </div>

              {/* Instant Prompt Synthesis Bar */}
              <form onSubmit={handleQuickGenerate} className="mt-6">
                <div className="relative flex items-center">
                  <Sparkles className="absolute left-4 h-4 w-4 text-cyan-400" />
                  <input
                    type="text"
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    placeholder="E.g. Send Slack and Gmail notification whenever a new customer payment is completed..."
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 pl-11 pr-36 py-3.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !quickPrompt.trim()}
                    className="absolute right-2 flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition disabled:opacity-50 shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Synthesizing...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Generate & Open
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Metric Grid Component */}
          <MetricGrid />

          {/* Cooperating 5-Agent Pipeline Showcase */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Cooperating Multi-Agent Architecture</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">LangGraph Orchestration Substrate</span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
              {agentPillars.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border p-4 shadow-lg backdrop-blur flex flex-col justify-between transition-all hover:scale-[1.03] ${agent.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[9px] font-bold font-mono">
                          STEP 0{i + 1}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-white">{agent.name}</div>
                      <p className="text-[11px] text-slate-300/80 mt-1 leading-snug">{agent.desc}</p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-semibold">
                      <span>{agent.badge}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Panel: Workflows & Live Execution Audit Stream */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Recent Workflows & Controls */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-white">Active Operator Workflows</h3>
                  </div>
                  <Link
                    href="/workflows"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    View all workflows <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {!dashboardData?.recentWorkflows?.length ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No workflows created yet. Click &quot;Create Flow&quot; above to start.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentWorkflows.map((wf) => (
                      <div
                        key={wf._id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 hover:border-cyan-500/40 hover:bg-slate-950 transition-all shadow-md"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <Link
                              href={`/workflows/${wf._id}`}
                              className="font-bold text-xs text-white hover:text-cyan-400 truncate transition"
                            >
                              {wf.name}
                            </Link>
                            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                              v{wf.version || 1}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                wf.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {wf.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 truncate">
                            {wf.description || 'Configured with custom triggers and action nodes.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Link
                            href={`/workflows/${wf._id}`}
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition"
                          >
                            Open Canvas
                          </Link>

                          <button
                            onClick={() => handleRunWorkflow(wf._id)}
                            disabled={triggeringId === wf._id}
                            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/10 disabled:opacity-50"
                          >
                            {triggeringId === wf._id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3 fill-current" />
                            )}
                            Run
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Integrations Hub & Live Audit */}
            <div className="space-y-6">
              {/* Integration Status Hub */}
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-white">Integration Status</h3>
                  </div>
                  <Link
                    href="/integrations"
                    className="text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    Manage →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {['gmail', 'slack', 'discord', 'google-sheets'].map((provider) => {
                    const status = integrations.find((i) => i.provider === provider);
                    const isConnected = Boolean(status?.isConnected);
                    const labels = {
                      gmail: 'Gmail OAuth',
                      slack: 'Slack Bot',
                      discord: 'Discord Webhook',
                      'google-sheets': 'Google Sheets',
                    };

                    return (
                      <div
                        key={provider}
                        className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-3.5 py-2.5 text-xs"
                      >
                        <span className="font-semibold text-slate-200">{labels[provider]}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isConnected
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isConnected ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {isConnected ? 'Connected' : 'Offline'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Execution Activity Feed */}
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <h3 className="font-bold text-sm text-white">Execution Audit Feed</h3>
                  </div>
                  <Link
                    href="/executions"
                    className="text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    All Runs →
                  </Link>
                </div>

                {!dashboardData?.recentExecutions?.length ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No runs recorded yet. Trigger a workflow to view execution telemetry.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentExecutions.slice(0, 4).map((ex) => (
                      <Link
                        key={ex._id}
                        href={`/executions/${ex._id}`}
                        className="block rounded-xl border border-slate-800/70 bg-slate-950/60 p-3 hover:border-cyan-500/30 transition text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white truncate max-w-[140px]">
                            {ex.workflowId?.name || 'Pipeline Execution'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.2 text-[9px] font-bold uppercase ${
                              ex.status === 'COMPLETED'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : ex.status === 'FAILED'
                                ? 'text-rose-400 bg-rose-500/10'
                                : 'text-cyan-400 bg-cyan-500/10 animate-pulse'
                            }`}
                          >
                            {ex.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                          <span>
                            {ex.duration ? `${(ex.duration / 1000).toFixed(2)}s` : 'Processing'}
                          </span>
                          <span>{new Date(ex.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
