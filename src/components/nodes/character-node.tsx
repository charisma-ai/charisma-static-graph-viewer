"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CharacterNodeData } from "@/lib/project";
import { Heart, MessageCircle, Star, Volume2 } from "lucide-react";

export function CharacterNode({ data, selected }: NodeProps) {
  const node = data as CharacterNodeData;
  return (
    <div
      className={`w-[248px] rounded-[10px] bg-[#2c3344] shadow-[0_10px_28px_rgba(0,0,0,0.38)] ring-1 ${
        selected ? "ring-teal-300/70" : "ring-white/10"
      }`}
    >
      <div className="relative flex h-7 items-center justify-center rounded-t-[10px] bg-gradient-to-b from-[#b7f0e2] to-[#6ec9b8]">
        <Handle
          type="target"
          position={Position.Left}
          className="!-left-[5px] !h-2.5 !w-2.5 !border-2 !border-[#2c3344] !bg-[#7dccbc]"
        />
        <span className="text-[11px] font-semibold tracking-[0.16em] text-[#16362f]">
          {node.speaker.toUpperCase()}
        </span>
        <Handle
          type="source"
          position={Position.Right}
          className="!-right-[5px] !h-2.5 !w-2.5 !border-2 !border-white !bg-white"
        />
      </div>
      <div className="relative px-3 py-2.5">
        <p className="max-h-[132px] overflow-hidden text-[12px] leading-[1.45] text-[#d7deea] whitespace-pre-wrap">
          {node.dialogue || "…"}
        </p>
        <Volume2 className="absolute right-2 bottom-2 size-3.5 text-white/35" />
      </div>
      <div className="flex items-center gap-1.5 border-t border-white/8 px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate rounded bg-[#1d2330] px-2 py-0.5 text-[10px] text-[#c9d1de]">
          {node.speaker}
        </span>
        <Heart className="size-3 text-white/35" />
        <MessageCircle className="size-3 text-white/35" />
        <Star className="size-3 text-white/35" />
      </div>
    </div>
  );
}
