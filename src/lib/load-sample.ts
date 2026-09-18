import { promises as fs } from "node:fs";
import path from "node:path";
import {
  mergeStoryExports,
  parseExportJson,
  slimExport,
  type StoryExport,
} from "@/lib/export";
import { indexProject, type ProjectIndex } from "@/lib/project";

const STORE_DIR =
  "/cursor/stores/bc-d62ec737-1b4a-4496-9fc2-6b0c793a4426/internal/export";

async function readIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw error;
  }
}

async function loadMergedFromParts(
  part1Path: string,
  part2Path: string,
): Promise<StoryExport | null> {
  const [part1Text, part2Text] = await Promise.all([
    readIfExists(part1Path),
    readIfExists(part2Path),
  ]);
  if (!part1Text || !part2Text) return null;
  return slimExport(
    mergeStoryExports(parseExportJson(part1Text), parseExportJson(part2Text)),
  );
}

let cached: StoryExport | null | undefined;

export async function loadSampleExport(): Promise<StoryExport | null> {
  if (cached !== undefined) return cached;

  const cwd = process.cwd();
  const localMerged = await readIfExists(
    path.join(cwd, "data", "story-export.json"),
  );
  if (localMerged) {
    cached = slimExport(parseExportJson(localMerged));
    return cached;
  }

  const localParts = await loadMergedFromParts(
    path.join(cwd, "data", "story-export-part1.json"),
    path.join(cwd, "data", "story-export-part2.json"),
  );
  if (localParts) {
    cached = localParts;
    return cached;
  }

  const envPath = process.env.STORY_EXPORT_PATH;
  if (envPath) {
    const envText = await readIfExists(envPath);
    if (envText) {
      cached = slimExport(parseExportJson(envText));
      return cached;
    }
  }

  const storeParts = await loadMergedFromParts(
    path.join(STORE_DIR, "story-export-part1.json"),
    path.join(STORE_DIR, "story-export-part2.json"),
  );
  cached = storeParts;
  return cached;
}

let cachedIndex: ProjectIndex | null | undefined;

export async function getSampleIndex(): Promise<ProjectIndex | null> {
  if (cachedIndex !== undefined) return cachedIndex;
  const data = await loadSampleExport();
  cachedIndex = data ? indexProject(data) : null;
  return cachedIndex;
}
