import { useState, useEffect } from 'react';
import useWorkflowStore from '../../store/workflowStore';
import { Sliders, X, Trash2 } from 'lucide-react';

export default function NodeConfigPanel() {
  const { selectedNode, setSelectedNode, updateNodeData, activeWorkflow, updateActiveWorkflowNodes, updateActiveWorkflowEdges } =
    useWorkflowStore();

  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState('gmail');
  const [action, setAction] = useState('sendMail');
  const [instruction, setInstruction] = useState('');
  const [condition, setCondition] = useState('');
  const [recipient, setRecipient] = useState('');
  const [channel, setChannel] = useState('#general');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || selectedNode.label || '');
      setProvider(selectedNode.data?.provider || 'gmail');
      setAction(selectedNode.data?.action || 'sendMail');
      setInstruction(selectedNode.data?.instruction || selectedNode.data?.promptTemplate || '');
      setCondition(selectedNode.data?.condition || '');
      setRecipient(selectedNode.data?.to || '');
      setChannel(selectedNode.data?.channel || '#general');
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-80 rounded-xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col items-center justify-center text-center text-slate-500">
        <Sliders className="h-8 w-8 mb-2 opacity-40" />
        <div className="text-sm font-medium text-slate-400">No Node Selected</div>
        <div className="text-xs mt-1">Click on any node on the canvas to inspect and configure its parameters.</div>
      </div>
    );
  }

  const handleSave = () => {
    const dataUpdates = {
      label,
      ...(selectedNode.type === 'integration' && { provider, action, to: recipient, channel }),
      ...(selectedNode.type === 'ai' && { instruction }),
      ...(selectedNode.type === 'condition' && { condition }),
    };
    updateNodeData(selectedNode.id, dataUpdates);
  };

  const handleDelete = () => {
    if (!activeWorkflow) return;
    const remainingNodes = activeWorkflow.nodes.filter((n) => n.id !== selectedNode.id);
    const remainingEdges = activeWorkflow.edges.filter(
      (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
    );
    updateActiveWorkflowNodes(remainingNodes);
    updateActiveWorkflowEdges(remainingEdges);
    setSelectedNode(null);
  };

  return (
    <div className="w-80 rounded-xl border border-slate-800 bg-slate-900/95 p-5 flex flex-col justify-between shadow-2xl backdrop-blur">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-sm text-white">Node Inspector</span>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Node ID</label>
            <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
              {selectedNode.id}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Node Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Node Type</label>
            <div className="capitalize font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
              {selectedNode.type}
            </div>
          </div>

          {/* Integration Node Specific Fields */}
          {selectedNode.type === 'integration' && (
            <>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                >
                  <option value="gmail">Gmail</option>
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="google-sheets">Google Sheets</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Action</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                  placeholder="e.g. sendMail, postMessage"
                />
              </div>

              {provider === 'gmail' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Recipient Email</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                    placeholder="user@example.com"
                  />
                </div>
              )}

              {provider === 'slack' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Channel</label>
                  <input
                    type="text"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                    placeholder="#general"
                  />
                </div>
              )}
            </>
          )}

          {/* AI Node Specific Fields */}
          {selectedNode.type === 'ai' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">AI Prompt / Instruction</label>
              <textarea
                rows={3}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                placeholder="What should the AI do with incoming data?"
              />
            </div>
          )}

          {/* Condition Node Specific Fields */}
          {selectedNode.type === 'condition' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Expression</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500 font-mono text-[11px]"
                placeholder='status === "SUCCESS"'
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-2">
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-cyan-500 py-2 font-semibold text-slate-950 hover:bg-cyan-400 transition"
        >
          Apply Changes
        </button>
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 font-medium text-rose-400 hover:bg-rose-500/20 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Node
        </button>
      </div>
    </div>
  );
}
