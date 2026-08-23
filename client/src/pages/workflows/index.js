import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { Search, Plus, Play, Sparkles, GitBranch, Clock } from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows', {
        params: { search, status: statusFilter },
      });
      if (res.data?.success) {
        setWorkflows(res.data.workflows);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'New Custom Workflow',
        description: 'Visual workflow created manually on canvas',
        nodes: [
          { id: 'node_1', type: 'trigger', label: 'Trigger Event', position: { x: 250, y: 50 }, data: {} },
          { id: 'node_2', type: 'end', label: 'Complete', position: { x: 250, y: 250 }, data: {} },
        ],
        edges: [{ id: 'e1-2', source: 'node_1', target: 'node_2', animated: true }],
      });
      if (res.data?.success) {
        router.push(`/workflows/${res.data.data._id}`);
      }
    } catch (e) {
      alert('Failed to create workflow');
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Workflows">
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search workflows by name or tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/workflows/builder"
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition flex-1 sm:flex-initial"
              >
                <Sparkles className="h-4 w-4" />
                Prompt Generator
              </Link>

              <button
                onClick={handleCreateNew}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition flex-1 sm:flex-initial shadow-lg shadow-cyan-500/20"
              >
                <Plus className="h-4 w-4" />
                Create Manual
              </button>
            </div>
          </div>

          {/* Workflow Cards Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse" />
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 py-16 text-center">
              <GitBranch className="h-10 w-10 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No workflows found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Get started by creating your first automation workflow with our prompt generator or canvas builder.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/workflows/builder"
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950"
                >
                  Generate with AI
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  className="group relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition truncate">
                        <Link href={`/workflows/${wf._id}`}>{wf.name}</Link>
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          wf.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {wf.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                      {wf.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-cyan-400" />
                        {wf.nodes?.length || 0} nodes
                      </span>
                      <span>•</span>
                      <span>v{wf.version || 1}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(wf.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <Link
                      href={`/workflows/${wf._id}`}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      Open Canvas →
                    </Link>

                    <button
                      onClick={async () => {
                        try {
                          const res = await api.post(`/workflows/${wf._id}/execute`);
                          if (res.data?.success) {
                            router.push(`/executions/${res.data.data._id}`);
                          }
                        } catch (e) {
                          alert('Failed to trigger execution');
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Run
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
