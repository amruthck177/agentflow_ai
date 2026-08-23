import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import useWorkflowStore from '../../store/workflowStore';

export default function WorkflowCanvas({ initialNodes = [], initialEdges = [], onSave }) {
  const { setSelectedNode, updateActiveWorkflowNodes, updateActiveWorkflowEdges } = useWorkflowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(
    () => ({
      trigger: (props) => <CustomNode {...props} type="trigger" />,
      ai: (props) => <CustomNode {...props} type="ai" />,
      action: (props) => <CustomNode {...props} type="action" />,
      condition: (props) => <CustomNode {...props} type="condition" />,
      integration: (props) => <CustomNode {...props} type="integration" />,
      end: (props) => <CustomNode {...props} type="end" />,
    }),
    []
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#06b6d4', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
          },
          eds
        );
        updateActiveWorkflowEdges(newEdges);
        return newEdges;
      }),
    [setEdges, updateActiveWorkflowEdges]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      const { type, label } = JSON.parse(raw);
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 25,
      };

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label, description: `Configured as ${type}` },
      };

      setNodes((nds) => {
        const updated = nds.concat(newNode);
        updateActiveWorkflowNodes(updated);
        return updated;
      });

      setSelectedNode(newNode);
    },
    [setNodes, updateActiveWorkflowNodes, setSelectedNode]
  );

  return (
    <div className="flex-1 h-[650px] w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          setNodes((nds) => {
            updateActiveWorkflowNodes(nds);
            return nds;
          });
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          setEdges((eds) => {
            updateActiveWorkflowEdges(eds);
            return eds;
          });
        }}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 fill-slate-200" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger':
                return '#f59e0b';
              case 'ai':
                return '#a855f7';
              case 'integration':
                return '#06b6d4';
              case 'end':
                return '#10b981';
              default:
                return '#3b82f6';
            }
          }}
          className="!bg-slate-900 !border-slate-800 !rounded-lg"
          maskColor="rgba(2, 6, 23, 0.7)"
        />
        <Background color="#334155" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
