import { useState } from 'react';
import { useRouter } from 'next/router';
import { Save, Play, Copy, Trash2, ArrowLeft, Check } from 'lucide-react';
import api from '../../services/api';

export default function WorkflowToolbar({ workflow, onSave, isSaving }) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRun = async () => {
    if (!workflow?._id) return;
    setIsRunning(true);
    try {
      const res = await api.post(`/workflows/${workflow._id}/execute`);
      if (res.data?.success) {
        router.push(`/executions/${res.data.data._id}`);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to trigger execution');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDuplicate = async () => {
    if (!workflow?._id) return;
    try {
      const res = await api.post(`/workflows/${workflow._id}/duplicate`);
      if (res.data?.success) {
        router.push(`/workflows/${res.data.data._id}`);
      }
    } catch (e) {
      alert('Failed to clone workflow');
    }
  };

  const handleDelete = async () => {
    if (!workflow?._id || !confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${workflow._id}`);
      router.push('/workflows');
    } catch (e) {
      alert('Failed to delete workflow');
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/workflows')}
          className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition"
          title="Back to workflows"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white truncate max-w-md">{workflow?.name || 'Untitled Workflow'}</h2>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
              v{workflow?.version || 1}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                workflow?.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {workflow?.status || 'draft'}
            </span>
          </div>
          {workflow?.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-lg">{workflow.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDuplicate}
          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
        >
          <Copy className="h-3.5 w-3.5" />
          Clone
        </button>

        <button
          onClick={handleDelete}
          className="p-2 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
          title="Delete workflow"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          onClick={async () => {
            await onSave();
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 2000);
          }}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50"
        >
          {savedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
          {isSaving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Flow'}
        </button>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          {isRunning ? 'Launching...' : 'Run Agentic Flow'}
        </button>
      </div>
    </div>
  );
}
