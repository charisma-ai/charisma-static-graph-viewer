"use client";

import { nodeTypes } from "@/components/nodes";
import type { CanvasNodeData } from "@/lib/project";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";

function FitViewOnGraph({
  graphId,
  nodeCount,
  firstNodeId,
}: {
  graphId: number;
  nodeCount: number;
  firstNodeId?: string;
}) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (nodeCount === 0) return;
    const run = () =>
      fitView({ padding: 0.18, minZoom: 0.22, maxZoom: 1.05, duration: 180 });
    const frame = requestAnimationFrame(run);
    const timer = window.setTimeout(run, 120);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [graphId, nodeCount, firstNodeId, fitView]);
  return null;
}

export function GraphCanvas({
  graphId,
  nodes,
  edges,
  onOpenGraph,
}: {
  graphId: number;
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  onOpenGraph: (graphId: number) => void;
}) {
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<CanvasNodeData>) => {
      if (node.data.kind === "generic" && node.data.graphId) {
        onOpenGraph(node.data.graphId);
      }
    },
    [onOpenGraph],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onInit={(instance) => {
          instance.fitView({ padding: 0.18, minZoom: 0.28, maxZoom: 1.05 });
        }}
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.28, maxZoom: 1.05 }}
        minZoom={0.08}
        maxZoom={1.8}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        panOnScroll
        zoomOnScroll
        deleteKeyCode={null}
        proOptions={{ hideAttribution: false }}
        onlyRenderVisibleElements={false}
        className="charisma-flow h-full bg-[#1a2030]"
      >
        <FitViewOnGraph
          graphId={graphId}
          nodeCount={nodes.length}
          firstNodeId={nodes[0]?.id}
        />
        <Background
          id="grid"
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.15}
          color="#4a5568"
          bgColor="#1a2030"
        />
        <Controls
          showInteractive={false}
          className="!overflow-hidden !rounded-lg !border !border-white/10 !bg-[#1c2433] !shadow-lg"
        />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(10,14,22,0.72)"
          className="!overflow-hidden !rounded-lg !border !border-white/10 !bg-[#151b27]"
          nodeColor={(node) => {
            const data = node.data as CanvasNodeData;
            if (data.kind === "character") return "#6ec9b8";
            if (data.kind === "player") return "#5b8def";
            if (data.kind === "wildcard") return "#9aa3b5";
            return data.accent;
          }}
        />
      </ReactFlow>
    </div>
  );
}
