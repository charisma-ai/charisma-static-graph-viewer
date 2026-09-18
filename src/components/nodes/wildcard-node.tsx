import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { WildcardNodeData } from "@/lib/project";
import { Sparkle } from "lucide-react";

export function WildcardNode({ data, selected }: NodeProps) {
  const node = data as WildcardNodeData;
  return (
    <div
      className={`w-[210px] rounded-[10px] bg-[#323948] shadow-[0_10px_28px_rgba(0,0,0,0.38)] ring-1 ${
        selected ? "ring-white/40" : "ring-white/10"
      }`}
    >
      <div className="relative flex h-7 items-center justify-center gap-1.5 rounded-t-[10px] bg-[#3d4454]">
        <Handle
          type="target"
          position={Position.Left}
          className="!-left-[5px] !h-2.5 !w-2.5 !border-2 !border-[#323948] !bg-[#9aa3b5]"
        />
        <Sparkle className="size-3 text-white/80" />
        <span className="text-[11px] font-semibold tracking-[0.16em] text-white/90">
          WILDCARD
        </span>
        <Handle
          type="source"
          position={Position.Right}
          className="!-right-[5px] !h-2.5 !w-2.5 !border-2 !border-white !bg-white"
        />
      </div>
      <div className="px-3 py-2.5 text-[11px] text-[#d5dbe6]">
        <label className="inline-flex items-center gap-2">
          <span
            className={`size-3.5 rounded-[3px] border ${
              node.allowSubplots
                ? "border-teal-300 bg-teal-400"
                : "border-white/30 bg-transparent"
            }`}
          />
          Allow subplots?
        </label>
      </div>
    </div>
  );
}
