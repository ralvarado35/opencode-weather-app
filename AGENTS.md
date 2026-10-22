# AGENTS.md

Weather CLI app (Bun + OpenMeteo, Spanish UI), built and working. The README (in Spanish) is the spec; `references/file-system.md` specifies the `src/` folder structure.

## Commands

- Runtime is Bun (v1.4.x), not Node. Use `bun` instead of `node`/`npx`/`npm`.
- `bun install` — install dependencies
- `bun run start` — run the app (`src/index.ts`, dev loop)
- `bun run typecheck` — runs `bun check` (Bun's built-in typechecker)
- `bun run test` (or `bun test`) — runs the suite in `tests/` (85 tests, fully offline)
- `bun run build` (i.e. `bun run typecheck && bun test && bun build --compile src/index.ts --outfile out/weather`) — the final deliverable is a compiled executable binary; **the build aborts if typecheck or any test fails**; `out/` and `dist/` are gitignored

## Testing (`tests/`)

- Runner: `bun test` with no extra dependencies. `bunfig.toml` preloads `tests/preload.ts`, which sets `NO_COLOR=1` so assertions compare plain text.
- Layout mirrors `src/`: `tests/utils`, `tests/api`, `tests/storage`, `tests/presentation`, `tests/actions`, plus `tests/integration/cli.test.ts`, which spawns the real CLI with a temp `HOME`/`USERPROFILE` and scripted stdin — the only place that exercises real `input.ts`, `configFile.ts` and disk I/O.
- Helpers: `fixtures.ts` (city/config factories), `fetch.ts` (stubs `global.fetch`; no real API calls), `console.ts` (console capture), `cli.ts` (subprocess runner), `mocks.ts`.
- **Mocking gotcha:** Bun 1.4 shares one module registry across test files and `mock.module()` leaks between them, so only `presentation/input.ts` and `storage/configFile.ts` are mocked (in-memory) and no test needs their real form in-process. Import the affected `src/` modules via `await import()` after `mocks.ts`.

## Project conventions

- App UI language is Spanish (menu labels, prompts), and OpenMeteo geocoding calls use `language=es`. README is also in Spanish.
- Weather data comes from OpenMeteo — free API, no key or .env needed. Two-step flow per city: geocoding (`geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es`) → forecast (`api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m`).
- Source lives in `src/` with a layered layout — `actions/`, `presentation/`, `storage/`, `types/`, `api/`, `utils/` — as specified in `references/file-system.md`. Entrypoint is `src/index.ts` and `package.json` `"module"` points to it. Dependency direction (no cycles): `index → presentation/menu → actions → presentation/api/storage → types/utils`.

## TypeScript gotchas (tsconfig.json)

- `verbatimModuleSyntax` — type-only imports must use `import type { ... }`.
- `noUncheckedIndexedAccess` — indexing arrays/objects yields `T | undefined`; guard accesses.
- `allowImportingTsExtensions` — imports use `.ts` extensions (Bun convention).
- `strict` mode is on; `bun run typecheck` before finishing any change.
