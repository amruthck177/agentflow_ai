import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodePalette from '../../components/NodePalette/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import WorkflowToolbar from '../../components/WorkflowToolbar/WorkflowToolbar';
import api from '../../services/api';
import useWorkflowStore from '../../store/workflowStore';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const { activeWorkflow, setActiveWorkflow } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchWorkflow = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/workflows/${id}`);
        if (res.data?.success) {
          setActiveWorkflow(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [id, setActiveWorkflow]);

  const handleSave = async () => {
    if (!activeWorkflow || !id) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/workflows/${id}`, {
        name: activeWorkflow.name,
        description: activeWorkflow.description,
        nodes: activeWorkflow.nodes,
        edges: activeWorkflow.edges,
        status: activeWorkflow.status,
        tags: activeWorkflow.tags,
      });
      if (res.data?.success) {
        setActiveWorkflow(res.data.data);
      }
    } catch (e) {
      alert('Failed to save workflow changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title={activeWorkflow?.name || 'Workflow Editor'}>
        {loading ? (
          <div className="h-[600px] rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse flex items-center justify-center text-slate-500 text-sm">
            Loading workflow canvas...
          </div>
        ) : (
          <div className="space-y-4">
            <WorkflowToolbar workflow={activeWorkflow} onSave={handleSave} isSaving={isSaving} />

            <div className="flex gap-4">
              <NodePalette />
              <WorkflowCanvas
                key={activeWorkflow?._id}
                initialNodes={activeWorkflow?.nodes || []}
                initialEdges={activeWorkflow?.edges || []}
                onSave={handleSave}
              />
              <NodeConfigPanel />
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
