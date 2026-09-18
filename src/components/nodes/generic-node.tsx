import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { GenericNodeData } from "@/lib/project";

export function GenericNode({ data, selected }: NodeProps) {
  const node = data as GenericNodeData;
  const compact = node.typeLabel === "PASSTHROUGH";

  if (compact) {
    return (
      <div className="relative size-4">
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2.5 !w-2.5 !border-2 !border-[#1a2030] !bg-slate-400"
        />
        <div className="size-4 rounded-full bg-slate-500 ring-2 ring-[#1a2030]" />
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-white"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-[220px] rounded-[10px] bg-[#2c3344] shadow-[0_10px_28px_rgba(0,0,0,0.38)] ring-1 ${
        selected ? "ring-white/50" : "ring-white/10"
      } ${node.graphId ? "cursor-pointer" : ""}`}
    >
      <div
        className="relative flex h-7 items-center justify-center rounded-t-[10px] px-2"
        style={{ background: node.accent }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!-left-[5px] !h-2.5 !w-2.5 !border-2 !border-[#2c3344]"
          style={{ background: node.accent }}
        />
        <span className="truncate text-[10px] font-semibold tracking-[0.14em] text-[#1a2030]">
          {node.typeLabel}
        </span>
        <Handle
          type="source"
          position={Position.Right}
          className="!-right-[5px] !h-2.5 !w-2.5 !border-2 !border-white !bg-white"
        />
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-medium text-[#e7edf7]">{node.title}</p>
        {node.body ? (
          <p className="mt-1 max-h-24 overflow-hidden text-[11px] leading-snug text-[#b7c0d0]">
            {node.body}
          </p>
        ) : null}
      </div>
    </div>
  );
}
