import { getSampleIndex } from "@/lib/load-sample";
import { mapGraph, toProjectNav } from "@/lib/project";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const project = await getSampleIndex();
    if (!project) {
      return NextResponse.json(
        {
          error:
            "No sample export found. Add data/story-export.json or the split part files.",
        },
        { status: 404 },
      );
    }
    const nav = toProjectNav(project);
    const graphId = nav.preferredGraphId;
    const graph =
      graphId != null ? mapGraph(project, graphId) : { nodes: [], edges: [] };
    return NextResponse.json({ nav, graphId, graph });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load sample export.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
