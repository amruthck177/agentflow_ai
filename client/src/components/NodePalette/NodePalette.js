import { Zap, Play, GitFork, Network, Bot, CheckCircle } from 'lucide-react';

const NODE_TYPES = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Manual or webhook event trigger',
    icon: Zap,
    color: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
  },
  {
    type: 'ai',
    label: 'AI Reasoning',
    description: 'LLM reasoning or extraction step',
    icon: Bot,
    color: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
  },
  {
    type: 'action',
    label: 'Action / Transform',
    description: 'Transform data or format messages',
    icon: Play,
    color: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  },
  {
    type: 'condition',
    label: 'Condition / Branch',
    description: 'Boolean condition branch',
    icon: GitFork,
    color: 'border-orange-500/50 bg-orange-500/10 text-orange-300',
  },
  {
    type: 'integration',
    label: 'Integration',
    description: 'Gmail, Slack, Discord, Google Sheets',
    icon: Network,
    color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
  },
  {
    type: 'end',
    label: 'End Node',
    description: 'Marks workflow completion',
    icon: CheckCircle,
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  },
];

export default function NodePalette() {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col gap-3">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Node Palette</div>
      <div className="text-xs text-slate-500">Drag & drop nodes onto the canvas</div>

      <div className="space-y-2.5">
        {NODE_TYPES.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type, node.label)}
              className={`flex items-start gap-3 rounded-lg border p-2.5 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition select-none ${node.color}`}
            >
              <Icon className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold">{node.label}</div>
                <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{node.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
