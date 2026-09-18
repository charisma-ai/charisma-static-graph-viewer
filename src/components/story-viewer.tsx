"use client";

import { CanvasErrorBoundary } from "@/components/canvas-error-boundary";
import { GraphCanvas } from "@/components/graph-canvas";
import { OpenProjectButton } from "@/components/open-project-button";
import { ProjectSidebar } from "@/components/project-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoryExport } from "@/lib/export";
import {
  findSection,
  indexProject,
  mapGraph,
  toProjectNav,
  type GraphView,
  type ProjectIndex,
  type ProjectNav,
} from "@/lib/project";
import { ReactFlowProvider } from "@xyflow/react";
import { AlertCircle, FolderOpen, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type LoadState =
  | { status: "loading"; message: string }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ready" };

type SamplePayload = {
  nav: ProjectNav;
  graphId: number | null;
  graph: GraphView;
};

export function StoryViewer() {
  const [nav, setNav] = useState<ProjectNav | null>(null);
  const [graph, setGraph] = useState<GraphView>({ nodes: [], edges: [] });
  const [selectedGraphId, setSelectedGraphId] = useState<number | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading",
    message: "Loading sample…",
  });
  const [graphLoading, setGraphLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const localIndex = useRef<ProjectIndex | null>(null);
  const usingSample = useRef(true);

  const applyLocalProject = useCallback((data: StoryExport, label: string) => {
    const indexed = indexProject(data);
    const nextNav = toProjectNav(indexed);
    localIndex.current = indexed;
    usingSample.current = false;
    setNav(nextNav);
    setSelectedGraphId(nextNav.preferredGraphId);
    setGraph(
      nextNav.preferredGraphId != null
        ? mapGraph(indexed, nextNav.preferredGraphId)
        : { nodes: [], edges: [] },
    );
    setSourceLabel(label);
    setLoadState({ status: "ready" });
  }, []);

  const selectGraph = useCallback(async (graphId: number) => {
    setSelectedGraphId(graphId);
    setMobileOpen(false);
    if (localIndex.current) {
      setGraph(mapGraph(localIndex.current, graphId));
      return;
    }
    if (!usingSample.current) return;
    setGraphLoading(true);
    try {
      const response = await fetch(`/api/sample/graphs/${graphId}`);
      if (!response.ok) {
        throw new Error("Could not load that graph.");
      }
      const payload = (await response.json()) as GraphView;
      setGraph(payload);
    } catch (error) {
      setLoadState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Could not load that graph.",
      });
    } finally {
      setGraphLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSample() {
      setLoadState({ status: "loading", message: "Loading sample…" });
      try {
        const response = await fetch("/api/sample");
        if (cancelled) return;
        if (response.status === 404) {
          setLoadState({ status: "empty" });
          return;
        }
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error || "Sample export could not be loaded.");
        }
        const data = (await response.json()) as SamplePayload;
        if (cancelled || !usingSample.current) return;
        setNav(data.nav);
        setSelectedGraphId(data.graphId);
        setSourceLabel("sample export");
        setLoadState({ status: "ready" });
        setGraphLoading(true);
        setGraph({ nodes: [], edges: [] });
        queueMicrotask(() => {
          if (cancelled || !usingSample.current) return;
          setGraph(data.graph ?? { nodes: [], edges: [] });
          setGraphLoading(false);
        });
      } catch (error) {
        if (cancelled) return;
        setLoadState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not load the bundled sample export.",
        });
      }
    }
    void loadSample();
    return () => {
      cancelled = true;
    };
  }, []);

  const section =
    nav && selectedGraphId != null ? findSection(nav, selectedGraphId) : undefined;

  const sidebar = nav ? (
    <ProjectSidebar
      project={nav}
      selectedGraphId={selectedGraphId}
      onSelect={(graphId) => void selectGraph(graphId)}
      footer={
        <p className="px-1 text-[11px] leading-snug text-zinc-500">
          {sourceLabel ? `Loaded from ${sourceLabel}` : "No project loaded"}
        </p>
      }
    />
  ) : (
    <div className="flex h-full flex-col bg-[#121722] px-4 py-5 text-zinc-400">
      <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
        Story
      </p>
      <h1 className="mt-1 text-lg font-semibold text-white">Charisma export</h1>
      <p className="mt-3 text-sm leading-relaxed">
        Open a Charisma.ai story export to browse scenes, subplots, and the node
        graph.
      </p>
    </div>
  );

  return (
    <div className="flex h-dvh min-h-0 bg-[#1a2030] text-zinc-100">
      {desktopOpen ? (
        <aside className="hidden h-full w-[300px] shrink-0 border-r border-white/8 md:block">
          {sidebar}
        </aside>
      ) : null}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[min(100%,300px)] border-white/10 bg-[#121722] p-0 sm:max-w-[300px]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Project sections</SheetTitle>
          </SheetHeader>
          {sidebar}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-white/8 bg-[#151b27] px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open project sections"
          >
            <Menu className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={() => setDesktopOpen((value) => !value)}
            aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {desktopOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {section?.name ?? nav?.title ?? "Charisma graph viewer"}
            </p>
            <p className="truncate text-[11px] text-zinc-500">
              {loadState.status === "ready"
                ? `${graph.nodes.length} nodes · ${graph.edges.length} edges`
                : "Pan, zoom, and inspect a story export"}
            </p>
          </div>
          <OpenProjectButton
            onLoaded={applyLocalProject}
            onError={(message) => setLoadState({ status: "error", message })}
          />
        </header>

        <main className="relative min-h-0 flex-1">
          {loadState.status === "loading" ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
              <Skeleton className="h-10 w-64 bg-white/10" />
              <Skeleton className="h-40 w-full max-w-xl bg-white/8" />
              <p className="text-sm text-zinc-400">{loadState.message}</p>
            </div>
          ) : null}

          {loadState.status === "empty" ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <FolderOpen className="size-10 text-zinc-500" />
              <h2 className="text-lg font-semibold">No project loaded</h2>
              <p className="max-w-md text-sm text-zinc-400">
                Place a sample export in <code>data/</code> or click Open
                Project to import a Charisma JSON file.
              </p>
            </div>
          ) : null}

          {loadState.status === "error" && !nav ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="size-10 text-red-400" />
              <h2 className="text-lg font-semibold">Could not load project</h2>
              <p className="max-w-md text-sm text-zinc-400">{loadState.message}</p>
              <p className="text-xs text-zinc-500">
                Use Open Project to import a story export instead.
              </p>
            </div>
          ) : null}

          {loadState.status === "error" && nav ? (
            <div className="absolute top-3 right-3 z-20 max-w-sm rounded-md border border-red-500/30 bg-[#2a1b1b] px-3 py-2 text-xs text-red-100">
              {loadState.message}
            </div>
          ) : null}

          {graphLoading ? (
            <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-[#151b27]/90 px-3 py-1 text-xs text-zinc-300">
              Loading graph…
            </div>
          ) : null}

          {nav && selectedGraphId != null && loadState.status !== "loading" ? (
            graph.nodes.length === 0 && !graphLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <h2 className="text-lg font-semibold">This graph is empty</h2>
                <p className="text-sm text-zinc-400">
                  The selected section has no nodes in this export.
                </p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <CanvasErrorBoundary>
                  <ReactFlowProvider>
                    <GraphCanvas
                      graphId={selectedGraphId}
                      nodes={graph.nodes}
                      edges={graph.edges}
                      onOpenGraph={(graphId) => void selectGraph(graphId)}
                    />
                  </ReactFlowProvider>
                </CanvasErrorBoundary>
              </div>
            )
          ) : null}

          {nav && selectedGraphId == null && loadState.status === "ready" ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <h2 className="text-lg font-semibold">Select a section</h2>
              <p className="text-sm text-zinc-400">
                Choose a scene or subplot from the sidebar to render its graph.
              </p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
