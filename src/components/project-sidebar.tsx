"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countGraphNodes, type FolderGroup, type ProjectNav, type ProjectSection } from "@/lib/project";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Folder, GitBranch, Layers3, Search } from "lucide-react";
import { useMemo, useState } from "react";

function matchesQuery(name: string, query: string): boolean {
  if (!query) return true;
  return name.toLowerCase().includes(query);
}

function SectionButton({
  section,
  selectedGraphId,
  nodeCounts,
  onSelect,
}: {
  section: ProjectSection;
  selectedGraphId: number | null;
  nodeCounts: Record<string, number>;
  onSelect: (graphId: number) => void;
}) {
  const selected = section.graphId === selectedGraphId;
  const count = countGraphNodes(nodeCounts, section.graphId);
  return (
    <button
      type="button"
      onClick={() => onSelect(section.graphId)}
      className={cn(
        "flex w-full items-start justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
        selected
          ? "bg-white/10 text-white"
          : "text-zinc-300 hover:bg-white/5 hover:text-white",
      )}
    >
      <span className="min-w-0 flex-1 leading-snug">{section.name}</span>
      <span className="shrink-0 pt-0.5 text-[10px] text-zinc-500">{count}</span>
    </button>
  );
}

function FolderBlock({
  folder,
  defaultOpen,
  selectedGraphId,
  nodeCounts,
  onSelect,
  query,
}: {
  folder: FolderGroup;
  defaultOpen: boolean;
  selectedGraphId: number | null;
  nodeCounts: Record<string, number>;
  onSelect: (graphId: number) => void;
  query: string;
}) {
  const filtered = folder.sections.filter((section) =>
    matchesQuery(section.name, query),
  );
  const [open, setOpen] = useState(defaultOpen || Boolean(query));
  const showOpen = Boolean(query) || open;

  if (query && filtered.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium tracking-wide text-zinc-400 uppercase hover:bg-white/5 hover:text-zinc-200"
      >
        {showOpen ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronRight className="size-3.5" />
        )}
        <Folder className="size-3.5" />
        <span className="truncate">{folder.name}</span>
        <span className="ml-auto text-[10px] font-normal normal-case text-zinc-600">
          {filtered.length}
        </span>
      </button>
      {showOpen ? (
        <div className="ml-3 space-y-0.5 border-l border-white/8 pl-2">
          {filtered.map((section) => (
            <SectionButton
              key={section.id}
              section={section}
              selectedGraphId={selectedGraphId}
              nodeCounts={nodeCounts}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProjectSidebar({
  project,
  selectedGraphId,
  onSelect,
  footer,
}: {
  project: ProjectNav;
  selectedGraphId: number | null;
  onSelect: (graphId: number) => void;
  footer?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const sceneHits = useMemo(
    () => project.scenes.filter((scene) => matchesQuery(scene.name, normalized)),
    [project.scenes, normalized],
  );
  const unfiledHits = useMemo(
    () =>
      project.unfiledSubplots.filter((section) =>
        matchesQuery(section.name, normalized),
      ),
    [project.unfiledSubplots, normalized],
  );
  const looseHits = useMemo(
    () =>
      project.looseGraphs.filter((section) =>
        matchesQuery(section.name, normalized),
      ),
    [project.looseGraphs, normalized],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#121722] text-zinc-200">
      <div className="border-b border-white/8 px-4 py-4">
        <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
          Story
        </p>
        <h1 className="mt-1 text-lg leading-tight font-semibold text-white">
          {project.title}
        </h1>
        {project.description ? (
          <p className="mt-1 line-clamp-3 text-xs text-zinc-500">
            {project.description}
          </p>
        ) : null}
      </div>
      <div className="border-b border-white/8 px-3 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter scenes and subplots"
            className="h-8 border-white/10 bg-[#1a2030] pl-8 text-xs text-zinc-200 placeholder:text-zinc-500"
          />
        </div>
      </div>
      <ScrollArea className="h-0 min-h-0 flex-1">
        <div className="space-y-4 px-3 py-3 pb-12">
          <section>
            <div className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              <Layers3 className="size-3.5" />
              Scenes
            </div>
            {sceneHits.length === 0 ? (
              <p className="px-2 text-xs text-zinc-600">No scenes</p>
            ) : (
              sceneHits.map((section) => (
                <SectionButton
                  key={section.id}
                  section={section}
                  selectedGraphId={selectedGraphId}
                  nodeCounts={project.nodeCounts}
                  onSelect={onSelect}
                />
              ))
            )}
          </section>

          <section className="space-y-1">
            <div className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              <GitBranch className="size-3.5" />
              Subplots
            </div>
            {project.folders.map((folder) => (
              <FolderBlock
                key={folder.id}
                folder={folder}
                defaultOpen={/master script|demo/i.test(folder.name)}
                selectedGraphId={selectedGraphId}
                nodeCounts={project.nodeCounts}
                onSelect={onSelect}
                query={normalized}
              />
            ))}
            {unfiledHits.length > 0 ? (
              <div>
                <p className="px-2 py-1 text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
                  Unfiled
                </p>
                {unfiledHits.map((section) => (
                  <SectionButton
                    key={section.id}
                    section={section}
                    selectedGraphId={selectedGraphId}
                    nodeCounts={project.nodeCounts}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ) : null}
          </section>

          {looseHits.length > 0 ? (
            <section>
              <div className="mb-1 px-2 text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
                Graphs
              </div>
              {looseHits.map((section) => (
                <SectionButton
                  key={section.id}
                  section={section}
                  selectedGraphId={selectedGraphId}
                  nodeCounts={project.nodeCounts}
                  onSelect={onSelect}
                />
              ))}
            </section>
          ) : null}
        </div>
      </ScrollArea>
      {footer ? (
        <div className="border-t border-white/8 p-3">{footer}</div>
      ) : (
        <div className="border-t border-white/8 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-500"
            disabled
          >
            Browse the story graph
          </Button>
        </div>
      )}
    </div>
  );
}
