export const DEFAULT_GLOBAL_TABLES = [
  "story",
  "storyVersion",
  "characters",
  "entities",
  "episodes",
  "intents",
  "media",
  "memories",
  "scenes",
  "subplots",
  "subplotConditionsCharacterSpokeLast",
  "subplotConditionsWithinGraph",
  "subplotFolders",
] as const;

export const DEFAULT_GRAPH_SCOPED_TABLES = [
  "graphs",
  "graphNodes",
  "graphEdges",
  "graphNodeActionProperties",
  "graphNodeCommentProperties",
  "graphNodeFunctionProperties",
  "graphNodeGateProperties",
  "graphNodeGenerationProperties",
  "graphNodeMediaProperties",
  "graphNodeMemoryProperties",
  "graphNodeReplyProperties",
  "graphNodeSubplotProperties",
  "graphNodeTriggerProperties",
  "graphNodeWildcardProperties",
  "graphNodeGroups",
  "graphNodeReplyImageLayers",
  "graphNodeReplyAudioTracks",
  "graphNodeReplyFeelingEffects",
  "graphNodeReplyMoodEffects",
  "graphNodeReplyRelationshipEffects",
  "graphNodeGateConditionFeelings",
  "graphNodeGateConditionMoods",
  "graphNodeGateConditionRelationships",
  "graphNodeGateConditionCounters",
  "graphNodeGateConditionLanguages",
  "graphNodeGateConditionMemoryDecisions",
  "graphNodeGateConditionMemorySets",
  "graphNodeGateConditionTagSets",
] as const;

export type SplitMeta = {
  sourceFile?: string;
  part?: number;
  totalParts?: number;
  otherPart?: number;
  note?: string;
  globalTables?: string[];
  graphScopedTables?: string[];
  graphIdsInThisPart?: number[];
  graphIdsInOtherPart?: number[];
};

export type LocalizedText = {
  id?: string;
  text: string;
};

export type StoryRecord = {
  id?: number;
  title?: string;
  description?: string;
};

export type CharacterRecord = {
  id: number;
  name: string;
};

export type SceneRecord = {
  id: number;
  name: string;
  index?: number;
  description?: string;
  graphId: number;
};

export type SubplotRecord = {
  id: number;
  name: string;
  graphId: number;
  folderId?: number | null;
  generated?: boolean;
};

export type SubplotFolderRecord = {
  id: number;
  name: string;
  parentFolderId?: number | null;
};

export type GraphRecord = {
  id: number;
};

export type GraphNodeRecord = {
  id: number;
  type: string;
  x: number;
  y: number;
  graphId: number;
};

export type GraphEdgeRecord = {
  id: number;
  playthroughs?: number;
  priority?: number;
  fromId: number;
  toId: number;
  graphId: number;
};

export type ReplyProperties = {
  graphNodeId: number;
  characterId?: number | null;
  repliesLocalised?: Record<string, LocalizedText[]>;
  keep?: boolean;
  delay?: number;
};

export type TriggerProperties = {
  graphNodeId: number;
  mode?: string;
  exact?: boolean;
  intentsGeneral?: string;
  customIntentIds?: number[];
  intentsSpecificLocalised?: Record<string, LocalizedText[]>;
};

export type WildcardProperties = {
  graphNodeId: number;
  overrideSubplots?: boolean;
  overrideImprovisation?: boolean;
};

export type CommentProperties = {
  graphNodeId: number;
  comment?: string | null;
};

export type MemoryProperties = {
  graphNodeId: number;
  memoryId?: number | null;
  saveValue?: string | null;
  counterChangeType?: string | null;
  counterChangeValue?: number | null;
};

export type ActionProperties = {
  graphNodeId: number;
  action?: string | null;
};

export type MediaProperties = {
  graphNodeId: number;
  url?: string | null;
  mediaId?: number | null;
};

export type SubplotNodeProperties = {
  graphNodeId: number;
  subplotId?: number | null;
};

export type MemoryRecord = {
  id: number;
  type?: string;
  prompt?: string;
};

export type MediaRecord = {
  id: number;
  filename?: string | null;
};

export type IntentRecord = {
  id: number;
  name: string;
};

export type StoryExport = {
  story?: StoryRecord | null;
  storyVersion?: unknown;
  characters?: CharacterRecord[];
  entities?: unknown[];
  episodes?: unknown[];
  intents?: IntentRecord[];
  media?: MediaRecord[];
  memories?: MemoryRecord[];
  scenes?: SceneRecord[];
  subplots?: SubplotRecord[];
  subplotFolders?: SubplotFolderRecord[];
  graphs?: GraphRecord[];
  graphNodes?: GraphNodeRecord[];
  graphEdges?: GraphEdgeRecord[];
  graphNodeActionProperties?: ActionProperties[];
  graphNodeCommentProperties?: CommentProperties[];
  graphNodeFunctionProperties?: unknown[];
  graphNodeGateProperties?: { graphNodeId: number }[];
  graphNodeGenerationProperties?: { graphNodeId: number }[];
  graphNodeMediaProperties?: MediaProperties[];
  graphNodeMemoryProperties?: MemoryProperties[];
  graphNodeReplyProperties?: ReplyProperties[];
  graphNodeSubplotProperties?: SubplotNodeProperties[];
  graphNodeTriggerProperties?: TriggerProperties[];
  graphNodeWildcardProperties?: WildcardProperties[];
  _splitMeta?: SplitMeta;
  [key: string]: unknown;
};

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSplitPart(data: unknown): data is StoryExport & {
  _splitMeta: SplitMeta;
} {
  return isRecord(data) && isRecord(data._splitMeta);
}

export function localizedList(
  record?: Record<string, LocalizedText[]> | null,
): LocalizedText[] {
  if (!record) return [];
  if (Array.isArray(record.en) && record.en.length > 0) return record.en;
  for (const value of Object.values(record)) {
    if (Array.isArray(value) && value.length > 0) return value;
  }
  return [];
}

export function validateExport(data: unknown): StoryExport {
  if (!isRecord(data)) {
    throw new ExportError("That file is not a JSON object.");
  }
  if (!Array.isArray(data.graphNodes) || !Array.isArray(data.graphEdges)) {
    throw new ExportError(
      "This JSON is missing graphNodes or graphEdges. Open a Charisma story export.",
    );
  }
  return data as StoryExport;
}

export function mergeStoryExports(
  first: StoryExport,
  second: StoryExport,
): StoryExport {
  const firstMeta = first._splitMeta;
  const secondMeta = second._splitMeta;
  const meta = firstMeta ?? secondMeta;
  const globalTables = meta?.globalTables ?? [...DEFAULT_GLOBAL_TABLES];
  const graphScoped = meta?.graphScopedTables ?? [
    ...DEFAULT_GRAPH_SCOPED_TABLES,
  ];

  if (firstMeta?.part != null && secondMeta?.part != null) {
    if (firstMeta.part === secondMeta.part) {
      throw new ExportError(
        `Both files are part ${firstMeta.part}. Choose the matching other half.`,
      );
    }
  }

  const result: StoryExport = {};

  for (const key of globalTables) {
    const fromFirst = first[key];
    const fromSecond = second[key];
    result[key] = fromFirst !== undefined ? fromFirst : fromSecond;
  }

  for (const key of graphScoped) {
    const fromFirst = first[key];
    const fromSecond = second[key];
    if (Array.isArray(fromFirst) && Array.isArray(fromSecond)) {
      result[key] = fromFirst.concat(fromSecond);
    } else if (Array.isArray(fromFirst)) {
      result[key] = fromFirst;
    } else if (Array.isArray(fromSecond)) {
      result[key] = fromSecond;
    } else {
      result[key] = fromFirst ?? fromSecond;
    }
  }

  return result;
}

function pick<T extends object, K extends keyof T>(
  value: T | null | undefined,
  keys: K[],
): Pick<T, K> | undefined {
  if (!value) return undefined;
  const next = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in value) next[key] = value[key];
  }
  return next;
}

export function slimExport(data: StoryExport): StoryExport {
  return {
    story: pick(data.story ?? undefined, ["id", "title", "description"]),
    characters: (data.characters ?? []).map((character) => ({
      id: character.id,
      name: character.name,
    })),
    intents: (data.intents ?? []).map((intent) => ({
      id: intent.id,
      name: intent.name,
    })),
    media: (data.media ?? []).map((item) => ({
      id: item.id,
      filename: item.filename ?? null,
    })),
    memories: (data.memories ?? []).map((memory) => ({
      id: memory.id,
      type: memory.type,
      prompt: memory.prompt,
    })),
    scenes: [...(data.scenes ?? [])].sort(
      (a, b) => (a.index ?? 0) - (b.index ?? 0),
    ),
    subplots: data.subplots ?? [],
    subplotFolders: data.subplotFolders ?? [],
    graphs: data.graphs ?? [],
    graphNodes: data.graphNodes ?? [],
    graphEdges: data.graphEdges ?? [],
    graphNodeReplyProperties: (data.graphNodeReplyProperties ?? []).map(
      (row) => ({
        graphNodeId: row.graphNodeId,
        characterId: row.characterId ?? null,
        repliesLocalised: row.repliesLocalised,
        keep: row.keep,
        delay: row.delay,
      }),
    ),
    graphNodeTriggerProperties: (data.graphNodeTriggerProperties ?? []).map(
      (row) => ({
        graphNodeId: row.graphNodeId,
        mode: row.mode,
        exact: row.exact,
        intentsGeneral: row.intentsGeneral,
        customIntentIds: row.customIntentIds,
        intentsSpecificLocalised: row.intentsSpecificLocalised,
      }),
    ),
    graphNodeWildcardProperties: data.graphNodeWildcardProperties ?? [],
    graphNodeCommentProperties: data.graphNodeCommentProperties ?? [],
    graphNodeMemoryProperties: data.graphNodeMemoryProperties ?? [],
    graphNodeActionProperties: data.graphNodeActionProperties ?? [],
    graphNodeMediaProperties: data.graphNodeMediaProperties ?? [],
    graphNodeSubplotProperties: data.graphNodeSubplotProperties ?? [],
    graphNodeGateProperties: data.graphNodeGateProperties ?? [],
    graphNodeGenerationProperties: data.graphNodeGenerationProperties ?? [],
  };
}

export function parseExportJson(text: string): StoryExport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw new ExportError("That file is not valid JSON.");
  }
  return validateExport(parsed);
}
