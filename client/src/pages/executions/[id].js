import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';
import {
  Play,
  Pause,
  StopCircle,
  ArrowLeft,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExecution = useCallback(async () => {
    if (!id) return;
    try {
      const [resExec, resTimeline] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`),
      ]);
      if (resExec.data?.success) setExecution(resExec.data.data);
      if (resTimeline.data?.success) setLogs(resTimeline.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExecution();

    if (id) {
      joinExecutionRoom(id);
      const socket = getSocket();

      if (socket) {
        const handleLog = (newLog) => {
          setLogs((prev) => {
            if (prev.some((l) => l._id === newLog.id || l._id === newLog._id)) return prev;
            return [...prev, newLog];
          });
          if (newLog.level === 'success' || newLog.level === 'error') {
            fetchExecution();
          }
        };

        socket.on('execution:log', handleLog);
        socket.on('agent:planner', handleLog);
        socket.on('agent:execution', handleLog);
        socket.on('agent:validation', handleLog);
        socket.on('agent:recovery', handleLog);
        socket.on('agent:monitoring', handleLog);

        return () => {
          leaveExecutionRoom(id);
          socket.off('execution:log', handleLog);
          socket.off('agent:planner', handleLog);
          socket.off('agent:execution', handleLog);
          socket.off('agent:validation', handleLog);
          socket.off('agent:recovery', handleLog);
          socket.off('agent:monitoring', handleLog);
        };
      }
    }
  }, [id, fetchExecution]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/executions/${id}/pause`);
      if (res.data?.success) setExecution(res.data.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to pause');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/executions/${id}/resume`);
      if (res.data?.success) setExecution(res.data.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to resume');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/executions/${id}/cancel`);
      if (res.data?.success) setExecution(res.data.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-400 border border-purple-500/20">
            <Bot className="h-3 w-3" /> Planner
          </span>
        );
      case 'execution':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
            <Zap className="h-3 w-3" /> Execution
          </span>
        );
      case 'validation':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Validation
          </span>
        );
      case 'recovery':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" /> Recovery
          </span>
        );
      case 'monitoring':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
            <Activity className="h-3 w-3" /> Monitoring
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Execution Timeline">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-4">
              <Link
                href="/executions"
                className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-white">
                    {execution?.workflowId?.name || execution?.workflowSnapshot?.name || 'Execution'}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      execution?.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : execution?.status === 'RUNNING'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                        : execution?.status === 'FAILED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {execution?.status || 'PENDING'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                  <span className="font-mono">ID: {execution?._id}</span>
                  <span>•</span>
                  <span>LangGraph: {execution?.agentMeta?.langGraph || 'available'}</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Controls: Pause, Resume, Cancel */}
            <div className="flex items-center gap-2.5">
              {execution?.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition disabled:opacity-50"
                >
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5" />
                  Resume
                </button>
              )}

              {(execution?.status === 'RUNNING' || execution?.status === 'PAUSED') && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-50"
                >
                  <StopCircle className="h-3.5 w-3.5" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Live Multi-Agent Event Stream</h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Real-time Socket.IO Connected
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Subscribing to execution stream...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Waiting for agent chain to initiate execution...
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6">
                {logs.map((log, index) => (
                  <div key={log._id || index} className="relative group">
                    <div
                      className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 transition ${
                        log.level === 'error'
                          ? 'bg-rose-500 ring-4 ring-rose-500/20'
                          : log.level === 'success'
                          ? 'bg-emerald-400 ring-4 ring-emerald-400/20'
                          : log.level === 'warning'
                          ? 'bg-amber-400 ring-4 ring-amber-400/20'
                          : 'bg-cyan-400 ring-4 ring-cyan-400/20'
                      }`}
                    />

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-lg">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          {getAgentBadge(log.agent)}
                          {log.nodeId && (
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              Node: {log.nodeId}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-medium">{log.message}</p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800/80 overflow-x-auto">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
