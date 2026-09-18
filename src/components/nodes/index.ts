import { CharacterNode } from "@/components/nodes/character-node";
import { GenericNode } from "@/components/nodes/generic-node";
import { PlayerNode } from "@/components/nodes/player-node";
import { WildcardNode } from "@/components/nodes/wildcard-node";
import type { NodeTypes } from "@xyflow/react";

export const nodeTypes = {
  character: CharacterNode,
  player: PlayerNode,
  wildcard: WildcardNode,
  generic: GenericNode,
} satisfies NodeTypes;
