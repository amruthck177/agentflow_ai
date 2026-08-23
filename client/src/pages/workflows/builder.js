import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import api from '../../services/api';
import useWorkflowStore from '../../store/workflowStore';
import { Sparkles, ArrowRight, Save, Bot, Code2, Layers } from 'lucide-react';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { setActiveWorkflow, activeWorkflow } = useWorkflowStore();

  const [prompt, setPrompt] = useState(
    'Send an email via Gmail and post a Slack alert whenever a new customer payment fails in Stripe.'
  );
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'json'
  const [saving, setSaving] = useState(false);

  const samplePrompts = [
    'Send a Slack alert and Gmail email when a customer submits an invoice dispute.',
    'Append new lead records to Google Sheets and notify the sales team in Discord.',
    'Analyze customer support ticket with AI and route urgent requests to Discord.',
  ];

  const handleGenerate = async (p = prompt) => {
    if (!p) return;
    setGenerating(true);
    try {
      const res = await api.post('/workflows/generate', { prompt: p });
      if (res.data?.success) {
        const wf = res.data.data;
        setGeneratedResult(wf);
        setActiveWorkflow({
          name: wf.name || 'Generated Flow',
          description: wf.description,
          nodes: wf.nodes || [],
          edges: wf.edges || [],
          status: 'draft',
        });
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to generate workflow');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!activeWorkflow && !generatedResult) return;
    setSaving(true);
    try {
      const payload = {
        name: activeWorkflow?.name || generatedResult.name,
        description: activeWorkflow?.description || generatedResult.description,
        nodes: activeWorkflow?.nodes || generatedResult.nodes,
        edges: activeWorkflow?.edges || generatedResult.edges,
        status: 'draft',
        generatedFromPrompt: prompt,
      };

      const res = await api.post('/workflows', payload);
      if (res.data?.success) {
        router.push(`/workflows/${res.data.data._id}`);
      }
    } catch (e) {
      alert('Failed to save generated workflow');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="AI Workflow Generator">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Top Prompt Input Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Describe Your Automation</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter plain English instructions. Our multi-agent generator will synthesize full graph topologies, configure node logic, and structure execution flows.
            </p>

            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your automation flow in natural language..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={generating}
                className="absolute right-3 bottom-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition disabled:opacity-50"
              >
                <Bot className="h-4 w-4" />
                {generating ? 'Synthesizing...' : 'Generate Graph'}
              </button>
            </div>

            {/* Prompt presets */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Try presets:</span>
              {samplePrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(sp);
                    handleGenerate(sp);
                  }}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                >
                  {sp.substring(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {/* Generated Result Container */}
          {generatedResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
                    <button
                      onClick={() => setActiveTab('canvas')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                        activeTab === 'canvas' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Visual Graph
                    </button>
                    <button
                      onClick={() => setActiveTab('json')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                        activeTab === 'json' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      Graph JSON
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    Generator: <span className="font-mono text-cyan-400">{generatedResult.generator || 'ai'}</span>
                  </span>
                </div>

                <button
                  onClick={handleSaveAndOpen}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save & Open Editor'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {activeTab === 'canvas' ? (
                <WorkflowCanvas
                  initialNodes={generatedResult.nodes || []}
                  initialEdges={generatedResult.edges || []}
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-cyan-300 max-h-[500px] overflow-auto shadow-2xl">
                  <pre>{JSON.stringify(generatedResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
