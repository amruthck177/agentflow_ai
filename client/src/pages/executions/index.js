import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { PlaySquare, CheckCircle2, XCircle, PauseCircle, RefreshCw, Eye } from 'lucide-react';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchExecutions = useCallback(async () => {
    try {
      const res = await api.get('/executions', {
        params: { status: statusFilter },
      });
      if (res.data?.success) {
        setExecutions(res.data.executions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5000);
    return () => clearInterval(interval);
  }, [fetchExecutions]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" />
            FAILED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20 animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            RUNNING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <PauseCircle className="h-3.5 w-3.5" />
            PAUSED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Execution Runs">
        <div className="space-y-6">
          {/* Header filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none"
              >
                <option value="all">All Execution Statuses</option>
                <option value="RUNNING">Running</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={fetchExecutions}
                className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Executions Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs animate-pulse">Loading execution runs...</div>
            ) : executions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <PlaySquare className="h-10 w-10 text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No execution runs recorded</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Run a workflow from the canvas or list page to start streaming agent events.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-6">Workflow</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Duration</th>
                    <th className="py-3.5 px-6">Retries</th>
                    <th className="py-3.5 px-6">Started At</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {executions.map((ex) => (
                    <tr key={ex._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-medium text-white">
                        <Link href={`/executions/${ex._id}`} className="hover:text-cyan-400 transition">
                          {ex.workflowId?.name || ex.workflowSnapshot?.name || 'Workflow Run'}
                        </Link>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(ex.status)}</td>
                      <td className="py-4 px-6 text-slate-400 font-mono">
                        {ex.duration ? `${(ex.duration / 1000).toFixed(2)}s` : '—'}
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-mono">{ex.retryCount || 0}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(ex.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/executions/${ex._id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition"
                        >
                          <Eye className="h-3 w-3" />
                          View Timeline
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
