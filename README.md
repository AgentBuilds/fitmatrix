# FitMatrix

> A hardware planning website that helps developers understand whether a local language model fits their machine. Users import GGUF metadata, enter RAM and VRAM budgets, and explore estimated memory changes across quantization, context length, and CPU offloading, with measured local results stored separately. Limit the MVP to one model architecture, clearly labeled estimates, and saved comparisons, requiring roughly 10 tasks.

_Bu loyiha AI Farm tomonidan avtonom tarzda qurilmoqda..._

## Run locally

Requires Node.js 22.12 or later (Node.js 24 recommended).

```sh
npm install --no-audit --no-fund --prefer-offline
npm run dev
```

Open http://127.0.0.1:3000. In PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

```sh
npm run build
npm start
npm test
```

Development uses Node's server watcher; refresh the browser after frontend edits. Production serves the built `dist/` frontend through Node's HTTP server; build before starting. Set `PORT` to change the port and `HOST` to change the listening address (default: local loopback).

The scaffold intentionally has no third-party runtime or build dependencies. Native browser modules and Node APIs keep installation portable and avoid dependence on cache access. The build validates JavaScript syntax and copies frontend assets to `dist/`.

Space Grotesk and IBM Plex Mono are vendored from Fontsource and served locally. Their SIL Open Font License notices are in `public/fonts/`. `scripts/vendor-fonts.js` is an optional maintainer download utility; it is never run during installation, building, or startup.

## Task 1 scope

The foundation includes a responsive workspace, locally bundled fonts, an API connection check, and `GET /api/health`. Its JSON contract is `{ "status": "ok", "service": "fitmatrix", "version": "0.1.0", "supportedArchitecture": "llama" }`. Unknown API routes return JSON with HTTP 404.

GGUF import, RAM/VRAM inputs, memory estimation, saved comparisons, and measured local results are upcoming tasks. No model data, estimates, or benchmark results are fabricated by this scaffold. The MVP supports the Llama architecture only.

## Structure

- `index.html`, `src/`, `public/`: frontend entry, styles, and static assets.
- `server/`: Node HTTP app and development/production entry point.
- `scripts/build.js`: native frontend build.
- `test/`: API/static-asset contract tests and frontend connection-state tests using Node's built-in test runner.
- `DESIGN_SYSTEM.md`: palette, typography, tokens, and interaction rules.
