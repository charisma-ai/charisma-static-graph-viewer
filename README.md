# Charisma story graph viewer

A dark, pan-and-zoom viewer for [Charisma.ai](https://charisma.ai) story JSON exports. Open a project, pick a scene or subplot, and inspect character, player, and wildcard nodes on the canvas.

## Run locally

Use Node.js 20.19+ or 22.12+ (Node.js 24 LTS recommended).

```bash
npm install
npm run dev
```

Then open [http://localhost:43145](http://localhost:43145). The dev server binds `0.0.0.0:43145`.

## Build and deploy

```bash
npm run build
npm run preview
```

The build type-checks the app and writes a static site to `dist/`. Deploy the
contents of that directory to any static web host. No Node.js runtime, API,
database, or server-side rendering is required in production. Asset URLs are
relative, so the build can also be hosted under a subdirectory.

`npm run preview` (or `npm start`) serves the built site locally at
[http://localhost:43145](http://localhost:43145) for testing; it is not a
production server. Serve the files over HTTP(S), rather than opening the HTML
directly with a `file://` URL.

Run `npm run lint` and `npm run typecheck` for standalone checks.

### GitHub Pages

The [Pages workflow](.github/workflows/deploy-pages.yml) builds and deploys the
site on each push to `main`. It can also be run manually from the Actions tab.

One-time setup:

1. In the GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Commit and push the workflow to `main`, then check **Actions → Deploy to
	GitHub Pages** for the deployment result.

The default site URL for this repository is:
[https://charisma-ai.github.io/charisma-static-graph-viewer/](https://charisma-ai.github.io/charisma-static-graph-viewer/).
The workflow's deployment summary links to the actual published URL.

GitHub Actions runs `npm ci`, lint, and the production build, then uploads only
`dist/` as the Pages artifact. **Do not commit `dist/`**: it is generated and
gitignored. No separate `build/`, `docs/`, or `gh-pages` branch is needed, and
there is no server process to start on GitHub Pages.

Vite's `base: "./"` makes asset URLs relative, which supports the repository
subdirectory as well as a custom domain. The viewer has no URL-based routes,
so it needs no SPA fallback or custom 404 page. Story exports remain in browser
memory and are not included in the deployed artifact or uploaded by the app.

## Load a story

Click **Open Project** and choose a Charisma JSON export from your computer,
including 15MB+ files. The file is read, parsed, and displayed entirely in your
browser. It is never uploaded to a server, and switching scenes or subplots uses
the project already held in browser memory.

If the file has `_splitMeta`, the viewer asks for the other half and merges the
parts locally. You can also continue with just one part.

No bundled sample or server-side export configuration is needed. Projects are
not persisted: refreshing or closing the page clears the loaded project, so
choose the file again when you return.

### Split export rules

- `_splitMeta.globalTables` are shared. `story` and `storyVersion` are objects; the rest are arrays. Take either part.
- `_splitMeta.graphScopedTables` concatenate part 1 + part 2. Graphs are partitioned by `graphId` with no overlapping row ids.
- `_splitMeta` is dropped after merge.

## Stack

React, Vite, TypeScript, Tailwind CSS, shadcn/ui, and `@xyflow/react`.
Geist fonts are bundled locally with the static assets.
