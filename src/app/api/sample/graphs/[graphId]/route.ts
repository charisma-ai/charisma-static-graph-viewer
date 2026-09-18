import { getSampleIndex } from "@/lib/load-sample";
import { mapGraph } from "@/lib/project";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ graphId: string }> },
) {
  try {
    const { graphId: rawId } = await context.params;
    const graphId = Number(rawId);
    if (!Number.isFinite(graphId)) {
      return NextResponse.json({ error: "Invalid graph id." }, { status: 400 });
    }
    const project = await getSampleIndex();
    if (!project) {
      return NextResponse.json(
        { error: "No sample export found." },
        { status: 404 },
      );
    }
    return NextResponse.json(mapGraph(project, graphId));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load graph.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
