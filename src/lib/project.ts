import {
  localizedList,
  type ActionProperties,
  type CommentProperties,
  type GraphEdgeRecord,
  type GraphNodeRecord,
  type MediaProperties,
  type MemoryProperties,
  type SceneRecord,
  type StoryExport,
  type SubplotFolderRecord,
  type SubplotNodeProperties,
  type SubplotRecord,
  type TriggerProperties,
  type WildcardProperties,
} from "@/lib/export";
import type { Edge, Node } from "@xyflow/react";

export type SectionKind = "scene" | "subplot" | "graph";

export type ProjectSection = {
  id: string;
  kind: SectionKind;
  name: string;
  graphId: number;
  folderId?: number | null;
};

export type FolderGroup = {
  id: number;
  name: string;
  sections: ProjectSection[];
};

export type ProjectIndex = {
  title: string;
  description?: string;
  characters: Map<number, string>;
  intents: Map<number, string>;
  memories: Map<number, string>;
  media: Map<number, string>;
  subplotsById: Map<number, SubplotRecord>;
  scenes: ProjectSection[];
  folders: FolderGroup[];
  unfiledSubplots: ProjectSection[];
  looseGraphs: ProjectSection[];
  nodesByGraph: Map<number, GraphNodeRecord[]>;
  edgesByGraph: Map<number, GraphEdgeRecord[]>;
  replies: Map<number, NonNullable<StoryExport["graphNodeReplyProperties"]>[number]>;
  triggers: Map<number, TriggerProperties>;
  wildcards: Map<number, WildcardProperties>;
  comments: Map<number, CommentProperties>;
  memoriesByNode: Map<number, MemoryProperties>;
  actions: Map<number, ActionProperties>;
  mediaByNode: Map<number, MediaProperties>;
  subplotNodes: Map<number, SubplotNodeProperties>;
};

function groupByGraph<T extends { graphId: number }>(
  rows: T[] | undefined,
): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const row of rows ?? []) {
    const list = map.get(row.graphId);
    if (list) list.push(row);
    else map.set(row.graphId, [row]);
  }
  return map;
}

function indexByNodeId<T extends { graphNodeId: number }>(
  rows: T[] | undefined,
): Map<number, T> {
  const map = new Map<number, T>();
  for (const row of rows ?? []) {
    map.set(row.graphNodeId, row);
  }
  return map;
}

export function indexProject(data: StoryExport): ProjectIndex {
  const characters = new Map<number, string>();
  for (const character of data.characters ?? []) {
    characters.set(character.id, character.name);
  }

  const intents = new Map<number, string>();
  for (const intent of data.intents ?? []) {
    intents.set(intent.id, intent.name);
  }

  const memories = new Map<number, string>();
  for (const memory of data.memories ?? []) {
    memories.set(memory.id, memory.prompt || `Memory ${memory.id}`);
  }

  const media = new Map<number, string>();
  for (const item of data.media ?? []) {
    media.set(item.id, item.filename || `Media ${item.id}`);
  }

  const subplotsById = new Map<number, SubplotRecord>();
  for (const subplot of data.subplots ?? []) {
    subplotsById.set(subplot.id, subplot);
  }

  const scenes: ProjectSection[] = (data.scenes ?? []).map((scene: SceneRecord) => ({
    id: `scene-${scene.id}`,
    kind: "scene",
    name: scene.name || `Scene ${scene.id}`,
    graphId: scene.graphId,
  }));

  const folders: FolderGroup[] = (data.subplotFolders ?? []).map(
    (folder: SubplotFolderRecord) => ({
      id: folder.id,
      name: folder.name,
      sections: [],
    }),
  );
  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));

  const unfiledSubplots: ProjectSection[] = [];
  for (const subplot of data.subplots ?? []) {
    const section: ProjectSection = {
      id: `subplot-${subplot.id}`,
      kind: "subplot",
      name: subplot.name || `Subplot ${subplot.id}`,
      graphId: subplot.graphId,
      folderId: subplot.folderId ?? null,
    };
    const folder = subplot.folderId != null ? folderMap.get(subplot.folderId) : undefined;
    if (folder) folder.sections.push(section);
    else unfiledSubplots.push(section);
  }

  const assignedGraphIds = new Set<number>([
    ...scenes.map((scene) => scene.graphId),
    ...(data.subplots ?? []).map((subplot) => subplot.graphId),
  ]);

  const looseGraphs: ProjectSection[] = (data.graphs ?? [])
    .filter((graph) => !assignedGraphIds.has(graph.id))
    .map((graph) => ({
      id: `graph-${graph.id}`,
      kind: "graph" as const,
      name: `Graph ${graph.id}`,
      graphId: graph.id,
    }));

  return {
    title: data.story?.title?.trim() || "Untitled story",
    description: data.story?.description || undefined,
    characters,
    intents,
    memories,
    media,
    subplotsById,
    scenes,
    folders,
    unfiledSubplots,
    looseGraphs,
    nodesByGraph: groupByGraph(data.graphNodes),
    edgesByGraph: groupByGraph(data.graphEdges),
    replies: indexByNodeId(data.graphNodeReplyProperties),
    triggers: indexByNodeId(data.graphNodeTriggerProperties),
    wildcards: indexByNodeId(data.graphNodeWildcardProperties),
    comments: indexByNodeId(data.graphNodeCommentProperties),
    memoriesByNode: indexByNodeId(data.graphNodeMemoryProperties),
    actions: indexByNodeId(data.graphNodeActionProperties),
    mediaByNode: indexByNodeId(data.graphNodeMediaProperties),
    subplotNodes: indexByNodeId(data.graphNodeSubplotProperties),
  };
}

export function preferredGraphId(project: ProjectIndex): number | null {
  const screenshot = project.folders
    .flatMap((folder) => folder.sections)
    .concat(project.unfiledSubplots)
    .find((section) => /big house/i.test(section.name));
  if (screenshot) return screenshot.graphId;
  if (project.scenes[0]) return project.scenes[0].graphId;
  if (project.unfiledSubplots[0]) return project.unfiledSubplots[0].graphId;
  for (const folder of project.folders) {
    if (folder.sections[0]) return folder.sections[0].graphId;
  }
  if (project.looseGraphs[0]) return project.looseGraphs[0].graphId;
  const firstGraph = project.nodesByGraph.keys().next();
  return firstGraph.done ? null : firstGraph.value;
}

export type CharacterNodeData = {
  kind: "character";
  speaker: string;
  dialogue: string;
};

export type PlayerNodeData = {
  kind: "player";
  phrases: string[];
  exact: boolean;
  useIntents: boolean;
  customIntents: string[];
};

export type WildcardNodeData = {
  kind: "wildcard";
  allowSubplots: boolean;
};

export type GenericNodeData = {
  kind: "generic";
  typeLabel: string;
  title: string;
  body?: string;
  accent: string;
  graphId?: number;
};

export type CanvasNodeData =
  | CharacterNodeData
  | PlayerNodeData
  | WildcardNodeData
  | GenericNodeData;

const GENERIC_ACCENTS: Record<string, string> = {
  comment: "#e2c36b",
  memory: "#c084fc",
  gate: "#fb923c",
  media: "#f472b6",
  action: "#38bdf8",
  subplot: "#a78bfa",
  passthrough: "#94a3b8",
  graph_entry: "#4ade80",
  graph_exit: "#f87171",
  generation: "#22d3ee",
};

function typeLabel(type: string): string {
  return type.replaceAll("_", " ").toUpperCase();
}

function usesGeneralIntents(trigger?: TriggerProperties): boolean {
  if (!trigger) return false;
  if (trigger.mode === "general") return true;
  const raw = (trigger.intentsGeneral ?? "").trim();
  return raw.length > 0 && raw !== "{}";
}

export function mapGraph(
  project: ProjectIndex,
  graphId: number,
): { nodes: Node<CanvasNodeData>[]; edges: Edge[] } {
  const graphNodes = project.nodesByGraph.get(graphId) ?? [];
  const graphEdges = project.edgesByGraph.get(graphId) ?? [];

  const nodes: Node<CanvasNodeData>[] = graphNodes.map((node) => {
    if (node.type === "reply") {
      const reply = project.replies.get(node.id);
      const characterId = reply?.characterId ?? null;
      const dialogue = localizedList(reply?.repliesLocalised)
        .map((item) => item.text)
        .filter(Boolean)
        .join("\n");
      if (characterId != null) {
        const speaker =
          project.characters.get(characterId) ?? `Character ${characterId}`;
        return {
          id: String(node.id),
          type: "character",
          position: { x: node.x, y: node.y },
          data: { kind: "character", speaker, dialogue },
        };
      }
      return {
        id: String(node.id),
        type: "player",
        position: { x: node.x, y: node.y },
        data: {
          kind: "player",
          phrases: dialogue ? [dialogue] : ["(empty player line)"],
          exact: false,
          useIntents: false,
          customIntents: [],
        },
      };
    }

    if (node.type === "trigger") {
      const trigger = project.triggers.get(node.id);
      const phrases = localizedList(trigger?.intentsSpecificLocalised)
        .map((item) => item.text)
        .filter((text) => text && text.trim().length > 0);
      const customIntents = (trigger?.customIntentIds ?? [])
        .map((id) => project.intents.get(id))
        .filter((name): name is string => Boolean(name));
      return {
        id: String(node.id),
        type: "player",
        position: { x: node.x, y: node.y },
        data: {
          kind: "player",
          phrases: phrases.length > 0 ? phrases : ["Enter some text..."],
          exact: Boolean(trigger?.exact),
          useIntents: usesGeneralIntents(trigger),
          customIntents,
        },
      };
    }

    if (node.type === "wildcard") {
      const wildcard = project.wildcards.get(node.id);
      return {
        id: String(node.id),
        type: "wildcard",
        position: { x: node.x, y: node.y },
        data: {
          kind: "wildcard",
          allowSubplots: Boolean(wildcard?.overrideSubplots),
        },
      };
    }

    let title = typeLabel(node.type);
    let body: string | undefined;

    if (node.type === "comment") {
      body = project.comments.get(node.id)?.comment || undefined;
    } else if (node.type === "memory") {
      const memory = project.memoriesByNode.get(node.id);
      title = memory?.memoryId
        ? project.memories.get(memory.memoryId) ?? "Memory"
        : "Memory";
      const bits = [
        memory?.saveValue ? `Save: ${memory.saveValue}` : null,
        memory?.counterChangeType
          ? `${memory.counterChangeType} ${memory.counterChangeValue ?? ""}`.trim()
          : null,
      ].filter(Boolean);
      body = bits.join(" · ") || undefined;
    } else if (node.type === "action") {
      body = project.actions.get(node.id)?.action || undefined;
    } else if (node.type === "media") {
      const media = project.mediaByNode.get(node.id);
      title =
        (media?.mediaId != null ? project.media.get(media.mediaId) : undefined) ||
        media?.url ||
        "Media";
    } else if (node.type === "subplot") {
      const subplotId = project.subplotNodes.get(node.id)?.subplotId;
      const subplot = subplotId != null ? project.subplotsById.get(subplotId) : undefined;
      title = subplot?.name ?? "Subplot";
      body = subplot ? "Open this graph" : undefined;
      return {
        id: String(node.id),
        type: "generic",
        position: { x: node.x, y: node.y },
        data: {
          kind: "generic",
          typeLabel: typeLabel(node.type),
          title,
          body,
          accent: GENERIC_ACCENTS.subplot,
          graphId: subplot?.graphId,
        },
      };
    } else if (node.type === "graph_entry") {
      title = "Start";
    } else if (node.type === "graph_exit") {
      title = "End";
    } else if (node.type === "passthrough") {
      title = "";
    }

    return {
      id: String(node.id),
      type: "generic",
      position: { x: node.x, y: node.y },
      data: {
        kind: "generic",
        typeLabel: typeLabel(node.type),
        title,
        body,
        accent: GENERIC_ACCENTS[node.type] ?? "#94a3b8",
      },
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: Edge[] = graphEdges
    .filter(
      (edge) =>
        nodeIds.has(String(edge.fromId)) && nodeIds.has(String(edge.toId)),
    )
    .map((edge) => ({
      id: String(edge.id),
      source: String(edge.fromId),
      target: String(edge.toId),
      label: String(edge.playthroughs ?? 0),
      type: "smoothstep",
      style: { stroke: "#8b95a8", strokeWidth: 1.4 },
      labelStyle: { fill: "#a8b2c4", fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: "#1a2030", fillOpacity: 0.72 },
      labelBgPadding: [3, 2] as [number, number],
      labelBgBorderRadius: 4,
    }));

  return { nodes, edges };
}

export type GraphView = {
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
};

export type ProjectNav = {
  title: string;
  description?: string;
  scenes: ProjectSection[];
  folders: FolderGroup[];
  unfiledSubplots: ProjectSection[];
  looseGraphs: ProjectSection[];
  nodeCounts: Record<string, number>;
  preferredGraphId: number | null;
};

export function toProjectNav(project: ProjectIndex): ProjectNav {
  const nodeCounts: Record<string, number> = {};
  for (const [graphId, nodes] of project.nodesByGraph) {
    nodeCounts[String(graphId)] = nodes.length;
  }
  return {
    title: project.title,
    description: project.description,
    scenes: project.scenes,
    folders: project.folders,
    unfiledSubplots: project.unfiledSubplots,
    looseGraphs: project.looseGraphs,
    nodeCounts,
    preferredGraphId: preferredGraphId(project),
  };
}

export function findSection(
  nav: Pick<
    ProjectNav,
    "scenes" | "folders" | "unfiledSubplots" | "looseGraphs"
  >,
  graphId: number,
): ProjectSection | undefined {
  const all = [
    ...nav.scenes,
    ...nav.folders.flatMap((folder) => folder.sections),
    ...nav.unfiledSubplots,
    ...nav.looseGraphs,
  ];
  return all.find((section) => section.graphId === graphId);
}

export function countGraphNodes(
  nodeCounts: Record<string, number>,
  graphId: number,
): number {
  return nodeCounts[String(graphId)] ?? 0;
}
