import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Play, GitFork, Network, Bot, CheckCircle } from 'lucide-react';

const ICONS = {
  trigger: Zap,
  ai: Bot,
  action: Play,
  condition: GitFork,
  integration: Network,
  end: CheckCircle,
};

const THEMES = {
  trigger: 'border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-amber-500/10',
  ai: 'border-purple-500/60 bg-purple-950/40 text-purple-300 shadow-purple-500/10',
  action: 'border-blue-500/60 bg-blue-950/40 text-blue-300 shadow-blue-500/10',
  condition: 'border-orange-500/60 bg-orange-950/40 text-orange-300 shadow-orange-500/10',
  integration: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300 shadow-cyan-500/10',
  end: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 shadow-emerald-500/10',
};

const CustomNode = ({ data, selected, type }) => {
  const Icon = ICONS[type] || Play;
  const theme = THEMES[type] || THEMES.action;

  return (
    <div
      className={`relative min-w-[200px] rounded-xl border-2 p-3.5 shadow-xl backdrop-blur transition-all ${theme} ${
        selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-105' : ''
      }`}
    >
      {/* Target Handle (input) */}
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !bg-slate-300 !border-2 !border-slate-900"
        />
      )}

      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-xs font-bold truncate text-white">{data.label || 'Node'}</div>
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{type}</div>
        </div>
      </div>

      {data.provider && (
        <div className="mt-2 text-[11px] font-mono px-2 py-0.5 rounded bg-black/30 border border-white/10 truncate">
          Provider: {data.provider}
        </div>
      )}

      {/* Source Handle (output) */}
      {type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !bg-cyan-400 !border-2 !border-slate-900"
        />
      )}
    </div>
  );
};

export default memo(CustomNode);
