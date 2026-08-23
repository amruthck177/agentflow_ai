import { create } from 'zustand';

const useWorkflowStore = create((set, get) => ({
  workflows: [],
  activeWorkflow: null,
  selectedNode: null,
  executions: [],
  activeExecution: null,
  executionLogs: [],
  loading: false,
  error: null,

  setWorkflows: (workflows) => set({ workflows }),
  setActiveWorkflow: (workflow) => set({ activeWorkflow: workflow }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setExecutions: (executions) => set({ executions }),
  setActiveExecution: (activeExecution) => set({ activeExecution }),
  setExecutionLogs: (logs) => set({ executionLogs: logs }),
  addExecutionLog: (log) =>
    set((state) => ({ executionLogs: [...state.executionLogs, log] })),

  updateActiveWorkflowNodes: (nodes) =>
    set((state) => ({
      activeWorkflow: state.activeWorkflow
        ? { ...state.activeWorkflow, nodes }
        : null,
    })),

  updateActiveWorkflowEdges: (edges) =>
    set((state) => ({
      activeWorkflow: state.activeWorkflow
        ? { ...state.activeWorkflow, edges }
        : null,
    })),

  updateNodeData: (nodeId, data) =>
    set((state) => {
      if (!state.activeWorkflow) return state;
      const updatedNodes = state.activeWorkflow.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data }, label: data.label || n.label } : n
      );
      return {
        activeWorkflow: { ...state.activeWorkflow, nodes: updatedNodes },
        selectedNode:
          state.selectedNode?.id === nodeId
            ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...data }, label: data.label || state.selectedNode.label }
            : state.selectedNode,
      };
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useWorkflowStore;
