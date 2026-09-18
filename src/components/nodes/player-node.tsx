"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { PlayerNodeData } from "@/lib/project";
import { Link2, Sparkles, Zap } from "lucide-react";

export function PlayerNode({ data, selected }: NodeProps) {
  const node = data as PlayerNodeData;
  const phrases = node.phrases.slice(0, 8);
  const extra = node.phrases.length - phrases.length;

  return (
    <div
      className={`w-[248px] rounded-[10px] bg-[#2c3344] shadow-[0_10px_28px_rgba(0,0,0,0.38)] ring-1 ${
        selected ? "ring-sky-400/80" : "ring-white/10"
      }`}
    >
      <div className="relative flex h-7 items-center justify-center gap-1.5 rounded-t-[10px] bg-gradient-to-r from-[#4d94f0] to-[#6d78e8]">
        <Handle
          type="target"
          position={Position.Left}
          className="!-left-[5px] !h-2.5 !w-2.5 !border-2 !border-[#2c3344] !bg-[#6ea0f2]"
        />
        <Zap className="size-3 text-white" />
        <span className="text-[11px] font-semibold tracking-[0.16em] text-white">
          PLAYER
        </span>
        <Handle
          type="source"
          position={Position.Right}
          className="!-right-[5px] !h-2.5 !w-2.5 !border-2 !border-white !bg-white"
        />
      </div>
      <div className="space-y-1.5 px-2 py-2">
        {phrases.map((phrase, index) => (
          <div
            key={`${index}-${phrase.slice(0, 24)}`}
            className="rounded-md border border-white/10 bg-[#1c2230] px-2 py-1.5 text-[11px] leading-snug text-[#dce3ee]"
          >
            {phrase}
          </div>
        ))}
        {extra > 0 ? (
          <div className="px-1 text-[10px] text-white/45">+{extra} more</div>
        ) : null}
        {node.customIntents.length > 0 ? (
          <div className="px-1 text-[10px] text-sky-300/80">
            Custom: {node.customIntents.join(", ")}
          </div>
        ) : null}
      </div>
      <div className="space-y-1.5 border-t border-white/8 px-2.5 py-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="inline-flex items-center gap-1 text-[#7db4ff]">
            <Link2 className="size-3" />
            Link a custom intent
          </span>
          <span className="inline-flex items-center gap-1 text-[#9aa7ff]">
            <Sparkles className="size-3" />
            Rephrase
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/55">
          <label className="inline-flex items-center gap-1">
            <span
              className={`size-3 rounded-[3px] border ${
                node.useIntents
                  ? "border-sky-400 bg-sky-400"
                  : "border-white/30 bg-transparent"
              }`}
            />
            Use intents
          </label>
          <label className="inline-flex items-center gap-1">
            <span
              className={`size-3 rounded-[3px] border ${
                node.exact
                  ? "border-sky-400 bg-sky-400"
                  : "border-white/30 bg-transparent"
              }`}
            />
            Exact match
          </label>
        </div>
      </div>
    </div>
  );
}
