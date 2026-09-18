# Charisma story graph viewer

A dark, pan-and-zoom viewer for [Charisma.ai](https://charisma.ai) story JSON exports. Open a project, pick a scene or subplot, and inspect character, player, and wildcard nodes on the canvas.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:43145](http://localhost:43145). The dev server binds `0.0.0.0:43145`.

## Load a story

The app tries to load a bundled sample export on startup. It looks for files in this order:

1. `data/story-export.json` (already merged)
2. `data/story-export-part1.json` + `data/story-export-part2.json`
3. `STORY_EXPORT_PATH` pointing at a single JSON file
4. The split halves in the project store used by this workspace

Those JSON files are gitignored and must not be committed. Use **Open Project** to import any export from disk, including 15MB+ files. If the file has `_splitMeta`, the viewer asks for the other half and concatenates graph-scoped tables.

### Split export rules

- `_splitMeta.globalTables` are shared. `story` and `storyVersion` are objects; the rest are arrays. Take either part.
- `_splitMeta.graphScopedTables` concatenate part 1 + part 2. Graphs are partitioned by `graphId` with no overlapping row ids.
- `_splitMeta` is dropped after merge.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, and `@xyflow/react`.
