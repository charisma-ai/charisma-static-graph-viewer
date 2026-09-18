# Project guidance

- This is a static React + TypeScript site built with Vite and Tailwind CSS.
- Keep story exports in browser memory. Do not add uploads, API routes, or server-side file loading.
- The entry point is `src/main.tsx`; shared styles are in `src/globals.css`.
- Use the `@/` alias for imports from `src/`.
- Run `npm run lint` and `npm run build` to validate changes.
- Deploy only `dist/`; no application server is required.
