import { useState, useEffect } from 'react';
import api from '../../services/api';
import { GitBranch, PlaySquare, CheckCircle2, Cpu, TrendingUp, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function MetricGrid() {
  const [stats, setStats] = useState({
    workflows: { total: 0, active: 0, draft: 0, paused: 0 },
    executions: { total: 0, completed: 0, failed: 0, running: 0, successRate: 100 },
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/workflows/dashboard');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalWfs = stats.workflows?.total || 0;
  const activeWfs = stats.workflows?.active || 0;
  const activePct = totalWfs > 0 ? Math.round((activeWfs / totalWfs) * 100) : 100;
  const successRate = stats.executions?.successRate ?? 100;

  const cards = [
    {
      title: 'Total Workflows',
      value: totalWfs,
      sub: `${activeWfs} active • ${stats.workflows?.draft || 0} drafts`,
      progress: activePct,
      badge: `${activePct}% active`,
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      icon: GitBranch,
      glow: 'from-cyan-500/20 to-transparent',
      borderColor: 'border-cyan-500/30',
      accentColor: 'bg-cyan-500',
    },
    {
      title: 'Workflow Executions',
      value: stats.executions?.total || 0,
      sub: `${stats.executions?.running || 0} active • ${stats.executions?.completed || 0} completed`,
      progress: stats.executions?.total ? 100 : 0,
      badge: stats.executions?.running > 0 ? 'Live Running' : 'Idle / Ready',
      badgeColor:
        stats.executions?.running > 0
          ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40 animate-pulse'
          : 'text-purple-300 bg-purple-500/10 border-purple-500/30',
      icon: PlaySquare,
      glow: 'from-purple-500/20 to-transparent',
      borderColor: 'border-purple-500/30',
      accentColor: 'bg-purple-500',
    },
    {
      title: 'Execution Success Rate',
      value: `${successRate}%`,
      sub: `${stats.executions?.completed || 0} passed • ${stats.executions?.failed || 0} escalated`,
      progress: successRate,
      badge: successRate >= 90 ? 'Healthy (SLA >99%)' : 'Degraded',
      badgeColor:
        successRate >= 90
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
          : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: CheckCircle2,
      glow: 'from-emerald-500/20 to-transparent',
      borderColor: 'border-emerald-500/30',
      accentColor: 'bg-emerald-500',
    },
    {
      title: 'Multi-Agent Substrate',
      value: '5 Agents',
      sub: 'Planner • Executor • Validator • Recovery • Monitor',
      progress: 100,
      badge: 'LangGraph Ready',
      badgeColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
      icon: Cpu,
      glow: 'from-indigo-500/20 to-transparent',
      borderColor: 'border-indigo-500/30',
      accentColor: 'bg-indigo-500',
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-3xl border ${card.borderColor} bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/5`}
          >
            {/* Gradient Top Glow */}
            <div
              className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${card.glow} blur-2xl group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-white">{card.value}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                {/* Mini Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${card.accentColor} transition-all duration-700`}
                    style={{ width: `${Math.max(card.progress, 5)}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-400 truncate">{card.sub}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
